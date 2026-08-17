(() => {
  "use strict";
  const C = window.TL_LAYER_CATALOG;
  const $ = id => document.getElementById(id);
  const INTERNAL_FIELDS = new Set(["layer_id", "fid", "label", "_fid", "_layer_id", "_layer_name", "_geometry", "_category_id", "_category_label", "_color", "_label"]);
  const state = {active:new Set(C.layers.map(x=>x.key)), query:"", layerFilter:"all", loaded:new Map(), entries:[], selected:null, measure:false, measurePoints:[], cursorLatLng:null};
  const map = L.map("map", {zoomControl:false, attributionControl:true, preferCanvas:true, minZoom:7, maxZoom:20}).setView([10.08, 105.98], 10);
  const baseLayers = {
    osm:L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:20,attribution:"&copy; OpenStreetMap contributors"}),
    satellite:L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:20,attribution:"Tiles &copy; Esri"}),
    light:L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:20,attribution:"&copy; OpenStreetMap &copy; CARTO"})
  };
  let currentBase = baseLayers.osm.addTo(map);
  const measureLayer = L.layerGroup().addTo(map);
  map.attributionControl.setPrefix(false);

  init();
  function init(){renderLayerList();populateLayerFilter();renderAbout();bindUI();loadAllLayers();updateNetwork()}

  function bindUI(){
    document.querySelectorAll(".nav-tab").forEach(b=>b.addEventListener("click",()=>switchPanel(b.dataset.panel)));
    document.querySelectorAll(".base-button").forEach(b=>b.addEventListener("click",()=>setBase(b.dataset.base,b)));
    $("searchInput").addEventListener("input",e=>{state.query=e.target.value.trim();renderSearch()});
    $("clearSearch").addEventListener("click",()=>{$("searchInput").value="";state.query="";renderSearch()});
    $("layerFilter").addEventListener("change",e=>{state.layerFilter=e.target.value;renderSearch()});
    $("toggleAllLayers").addEventListener("click",toggleAllLayers);
    $("fitAllButton").addEventListener("click",fitAll);$("homeButton").addEventListener("click",fitAll);
    $("zoomInButton").addEventListener("click",()=>map.zoomIn());$("zoomOutButton").addEventListener("click",()=>map.zoomOut());
    $("locateButton").addEventListener("click",locateUser);$("fullscreenButton").addEventListener("click",toggleFullscreen);
    $("menuButton").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
    $("closeDrawer").addEventListener("click",closeDrawer);$("zoomDetailButton").addEventListener("click",zoomSelected);$("copyDetailButton").addEventListener("click",copySelected);
    $("measureButton").addEventListener("click",()=>{state.measure=!state.measure;$("measureButton").classList.toggle("active",state.measure);$("measureResult").textContent=state.measure?"Chế độ đo đang bật. Nhấp các điểm trên bản đồ.":"Đã tắt chế độ đo."});
    $("clearMeasureButton").addEventListener("click",clearMeasure);$("copyCoordButton").addEventListener("click",copyCursorCoord);$("reloadDataButton").addEventListener("click",loadAllLayers);
    [$("aboutButton"),$("aboutButtonTop")].forEach(b=>b?.addEventListener("click",()=>$("aboutDialog").showModal()));document.querySelectorAll(".dialog-close").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
    map.on("mousemove",e=>{state.cursorLatLng=e.latlng;$("coordinateReadout").textContent=`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`});map.on("click",onMapClick);
    window.addEventListener("online",updateNetwork);window.addEventListener("offline",updateNetwork);window.addEventListener("resize",()=>map.invalidateSize());
  }

  function renderLayerList(){
    $("layerList").innerHTML=C.layers.map(l=>`<label class="layer-row" data-layer-row="${l.key}"><span class="layer-symbol" style="background:${l.color}">${iconSVG(l.icon)}</span><span class="layer-meta"><b>${esc(l.name)}</b><span>${l.geometry==="Point"?"Điểm":"Tuyến"} · ID ${l.id}</span></span><span class="layer-count" data-count="${l.key}">${l.count}</span><input class="layer-toggle" data-layer="${l.key}" type="checkbox" checked aria-label="Bật tắt ${escAttr(l.name)}"></label>`).join("");
    $("layerList").querySelectorAll("input[data-layer]").forEach(input=>input.addEventListener("change",()=>setLayerVisible(input.dataset.layer,input.checked)));
  }
  function populateLayerFilter(){$("layerFilter").insertAdjacentHTML("beforeend",C.layers.map(l=>`<option value="${l.key}">${esc(l.name)} (${l.count})</option>`).join(""))}
  function renderAbout(){$("aboutDataset").innerHTML=C.layers.map(l=>`<div class="about-card"><b>${l.count}</b><span>${esc(l.name)}</span></div>`).join("")}
  function switchPanel(id){document.querySelectorAll(".nav-tab").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));document.querySelectorAll(".side-panel").forEach(p=>p.classList.toggle("active",p.id===id))}
  function setBase(key,button){if(currentBase)map.removeLayer(currentBase);currentBase=baseLayers[key].addTo(map);document.querySelectorAll(".base-button").forEach(b=>b.classList.toggle("active",b===button))}

  async function loadAllLayers(){
    $("dataStatus").className="status-pill loading";$("dataStatus").textContent="ĐANG NẠP";$("loadReport").innerHTML="";state.entries=[];
    for(const [,rec] of state.loaded){if(map.hasLayer(rec.group))map.removeLayer(rec.group)}state.loaded.clear();
    let loadedCount=0, failed=0;
    await Promise.all(C.layers.map(async meta=>{
      try{
        const res=await fetch(meta.url,{cache:"force-cache"});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json();
        const group=buildGeoLayer(meta,data);state.loaded.set(meta.key,{meta,data,group});if(state.active.has(meta.key))group.addTo(map);
        data.features.forEach((feature,index)=>state.entries.push(makeEntry(meta,feature,index)));
        loadedCount+=data.features.length;reportLoad(meta,true,data.features.length);
      }catch(err){failed++;reportLoad(meta,false,err.message)}
    }));
    $("metricLoaded").textContent=loadedCount.toLocaleString("vi-VN");updateMetrics();renderSearch();
    if(failed){$("dataStatus").className="status-pill error";$("dataStatus").textContent=`LỖI ${failed} LỚP`}else{$("dataStatus").className="status-pill ready";$("dataStatus").textContent="321 ĐỐI TƯỢNG";fitAll()}
  }
  function reportLoad(meta,ok,value){const el=document.createElement("div");el.className=`load-item ${ok?"ok":"fail"}`;el.innerHTML=`<b>${esc(meta.name)}</b><span>${ok?`${value}/${meta.count} ✓`:`Lỗi: ${esc(value)}`}</span>`;$("loadReport").appendChild(el)}
  function buildGeoLayer(meta,data){
    return L.geoJSON(data,{pointToLayer:(feature,latlng)=>L.marker(latlng,{icon:markerIcon(meta),title:featureTitle(feature,meta)}),style:()=>({color:meta.color,weight:meta.key==="sat-lo"?5:meta.key==="de"?4:3,opacity:.88,dashArray:meta.key==="sat-lo"?"8 5":meta.key==="de"?"12 4":null,lineCap:"round",lineJoin:"round"}),onEachFeature:(feature,layer)=>{
      layer.bindPopup(()=>popupHTML(meta,feature),{maxWidth:380,className:"infra-popup"});layer.bindTooltip(featureTitle(feature,meta),{sticky:true,direction:"top",className:"feature-tooltip",opacity:.96});
      layer.on("click",()=>openDetail(meta,feature,layer));
    }});
  }
  function markerIcon(meta){return L.divIcon({className:"",html:`<span class="feature-marker" style="background:${meta.color}">${iconSVG(meta.icon)}</span>`,iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-14]})}
  function setLayerVisible(key,visible){const rec=state.loaded.get(key);visible?state.active.add(key):state.active.delete(key);if(rec){visible?rec.group.addTo(map):map.removeLayer(rec.group)}updateMetrics()}
  function toggleAllLayers(){const show=state.active.size!==C.layers.length;state.active=new Set(show?C.layers.map(l=>l.key):[]);document.querySelectorAll("input[data-layer]").forEach(i=>i.checked=show);for(const [,rec] of state.loaded){show?rec.group.addTo(map):map.removeLayer(rec.group)}$("toggleAllLayers").textContent=show?"Ẩn tất cả":"Hiện tất cả";updateMetrics()}
  function updateMetrics(){const visible=state.entries.filter(e=>state.active.has(e.meta.key)).length;$("metricVisible").textContent=visible.toLocaleString("vi-VN");$("metricLayers").textContent=`${state.active.size}/9`}

  function makeEntry(meta,feature,index){const p=feature.properties||{},title=featureTitle(feature,meta),search=normalize([meta.name,title,...Object.entries(p).filter(([k])=>!INTERNAL_FIELDS.has(k)).flatMap(([k,v])=>[k,v])].join(" "));return {meta,feature,index,title,search}}
  function renderSearch(){
    const q=normalize(state.query), filtered=state.entries.filter(e=>(state.layerFilter==="all"||e.meta.key===state.layerFilter)&&(!q||e.search.includes(q))).slice(0,q?100:0);$("resultCount").textContent=q?String(filtered.length):"0";
    if(!q){$("searchResults").innerHTML='<div class="empty-hint">Nhập từ khóa ở thanh tìm kiếm phía trên.</div>';return}
    if(!filtered.length){$("searchResults").innerHTML='<div class="empty-hint">Không tìm thấy đối tượng phù hợp.</div>';return}
    $("searchResults").innerHTML=filtered.map((e,i)=>`<button class="result-card" data-i="${i}" type="button"><span class="result-icon" style="background:${e.meta.color}">${iconSVG(e.meta.icon)}</span><span class="result-copy"><b>${esc(e.title)}</b><span>${esc(resultSubtitle(e))}</span></span><em>${e.meta.count}</em></button>`).join("");
    $("searchResults").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>focusEntry(filtered[Number(b.dataset.i)])));
    if(innerWidth<900)switchPanel("resultsPanel");
  }
  function resultSubtitle(entry){const p=entry.feature.properties||{};return firstValue(p,["Địa chỉ","Địa điểm","Vị trí","Vị trí Km","Địa danh","Tình trạng hoạt động","Tình trạng","Mức độ"])||entry.meta.name}
  function focusEntry(entry){const rec=state.loaded.get(entry.meta.key);if(!rec)return;if(!state.active.has(entry.meta.key)){state.active.add(entry.meta.key);rec.group.addTo(map);const cb=document.querySelector(`[data-layer="${CSS.escape(entry.meta.key)}"]`);if(cb)cb.checked=true;updateMetrics()}const layer=findLeafletLayer(rec.group,entry.feature);if(layer){if(layer.getLatLng)map.setView(layer.getLatLng(),15);else if(layer.getBounds)map.fitBounds(layer.getBounds(),{padding:[45,45],maxZoom:16});layer.openPopup?.();openDetail(entry.meta,entry.feature,layer)}if(innerWidth<900)$("sidebar").classList.remove("open")}
  function findLeafletLayer(group,feature){let found=null;group.eachLayer(layer=>{if(layer.feature===feature)found=layer});return found}

  function popupHTML(meta,feature){const p=feature.properties||{},rows=publicEntries(p).map(([k,v])=>`<div class="popup-row"><dt>${esc(k)}</dt><dd>${formatValue(v)}</dd></div>`).join("");return `<article class="popup-card"><header class="popup-head" style="background:${meta.color}"><span class="popup-icon">${iconSVG(meta.icon)}</span><div><b>${esc(featureTitle(feature,meta))}</b><span>${esc(meta.name)} · ${meta.geometry==="Point"?"đối tượng điểm":"đối tượng tuyến"}</span></div></header><dl class="popup-body">${rows}</dl><footer class="popup-foot"><span>ID lớp ${meta.id} · FID ${esc(String(p.fid??feature.id??"—"))}</span><span>${esc(geometrySummary(feature))}</span></footer></article>`}
  function openDetail(meta,feature,layer){state.selected={meta,feature,layer};$("detailEyebrow").textContent=`${meta.name.toUpperCase()} · LAYER ${meta.id}`;$("detailTitle").textContent=featureTitle(feature,meta);$("detailIcon").style.background=meta.color;$("detailIcon").innerHTML=iconSVG(meta.icon);const rows=publicEntries(feature.properties||{}).map(([k,v])=>`<div class="popup-row"><dt>${esc(k)}</dt><dd>${formatValue(v)}</dd></div>`).join("");$("detailBody").innerHTML=`<div class="detail-source"><span class="source-dot"></span>Dữ liệu gốc: <b>hatang.vinhlong.gov.vn</b><br>Snapshot: <code>${C.sourceCommit.slice(0,12)}</code> · Lớp ${meta.id}</div><div class="detail-section-title">Thuộc tính công khai</div><dl class="detail-table">${rows}</dl><div class="detail-section-title">Hình học</div><div class="geometry-card">${esc(geometrySummary(feature))}<br>${esc(coordinateSummary(feature))}</div>`;$("detailActions").hidden=false;$("appShell").classList.add("drawer-open");setTimeout(()=>map.invalidateSize(),230)}
  function closeDrawer(){$("appShell").classList.remove("drawer-open");setTimeout(()=>map.invalidateSize(),230)}
  function zoomSelected(){if(!state.selected)return;const l=state.selected.layer;if(l.getLatLng)map.setView(l.getLatLng(),16);else if(l.getBounds)map.fitBounds(l.getBounds(),{padding:[55,55],maxZoom:17})}
  async function copySelected(){if(!state.selected)return;const {meta,feature}=state.selected,p=feature.properties||{};const text=[featureTitle(feature,meta),`Lớp: ${meta.name} (${meta.id})`,...publicEntries(p).map(([k,v])=>`${k}: ${plainValue(v)}`),geometrySummary(feature),coordinateSummary(feature),`Nguồn: ${C.sourcePortal}`].join("\n");await copyText(text);flashButton($("copyDetailButton"),"Đã sao chép")}

  function fitAll(){const bounds=[];for(const [key,rec] of state.loaded){if(state.active.has(key)){const b=rec.group.getBounds();if(b.isValid())bounds.push(b)}}if(!bounds.length)return;let all=bounds[0];for(let i=1;i<bounds.length;i++)all=all.extend(bounds[i]);map.fitBounds(all,{padding:[35,35]})}
  function locateUser(){if(!navigator.geolocation)return alert("Trình duyệt không hỗ trợ định vị.");navigator.geolocation.getCurrentPosition(pos=>{const ll=[pos.coords.latitude,pos.coords.longitude];L.circleMarker(ll,{radius:8,color:"#fff",weight:3,fillColor:"#0b74b5",fillOpacity:1}).addTo(map).bindPopup(`Vị trí thiết bị<br>Độ chính xác ±${Math.round(pos.coords.accuracy)} m`).openPopup();map.setView(ll,15)},()=>alert("Không thể lấy vị trí thiết bị."),{enableHighAccuracy:true,timeout:10000})}
  function toggleFullscreen(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()}
  function onMapClick(e){if(!state.measure)return;state.measurePoints.push(e.latlng);measureLayer.clearLayers();L.polyline(state.measurePoints,{color:"#0b74b5",weight:3,dashArray:"7 5"}).addTo(measureLayer);state.measurePoints.forEach((p,i)=>L.circleMarker(p,{radius:5,color:"#fff",weight:2,fillColor:"#0b74b5",fillOpacity:1}).addTo(measureLayer).bindTooltip(String(i+1),{permanent:true,direction:"top"}));let total=0;for(let i=1;i<state.measurePoints.length;i++)total+=state.measurePoints[i-1].distanceTo(state.measurePoints[i]);$("measureResult").textContent=state.measurePoints.length<2?"Đã chọn điểm 1. Chọn điểm tiếp theo.":`Tổng chiều dài: ${total>=1000?(total/1000).toLocaleString("vi-VN",{maximumFractionDigits:3})+" km":Math.round(total).toLocaleString("vi-VN")+" m"} · ${state.measurePoints.length} điểm`}
  function clearMeasure(){state.measurePoints=[];measureLayer.clearLayers();$("measureResult").textContent="Chọn hai hoặc nhiều điểm trên bản đồ để đo chiều dài."}
  async function copyCursorCoord(){if(!state.cursorLatLng)return;await copyText(`${state.cursorLatLng.lat.toFixed(6)}, ${state.cursorLatLng.lng.toFixed(6)}`);flashButton($("copyCoordButton"),"Đã sao chép")}
  function updateNetwork(){if(!navigator.onLine){$("dataStatus").className="status-pill error";$("dataStatus").textContent="OFFLINE"}}

  function featureTitle(feature,meta){const p=feature.properties||{};return firstValue(p,["Tên trạm","Tên đập","Tên cống","Tên kênh","Tên kè","Tên đê","Địa danh","Tên công trình","Tên","label"])||`${meta.name} #${p.fid??feature.id??"—"}`}
  function firstValue(p,keys){for(const k of keys){const v=p[k];if(v!==null&&v!==undefined&&String(v).trim())return String(v).replace(/\s+/g," ").trim()}return ""}
  function publicEntries(p){return Object.entries(p).filter(([k])=>!INTERNAL_FIELDS.has(k))}
  function formatValue(v){if(v===null||v===undefined||String(v).trim()==="")return '<span style="color:#94a3ad;font-weight:500">Chưa cập nhật</span>';return esc(String(v)).replace(/\n/g,"<br>")}
  function plainValue(v){return v===null||v===undefined||String(v).trim()===""?"Chưa cập nhật":String(v).replace(/\s+/g," ").trim()}
  function geometrySummary(feature){const g=feature.geometry;if(!g)return "Không có hình học";if(g.type==="Point")return "Điểm";const coords=g.type==="LineString"?g.coordinates:g.type==="MultiLineString"?g.coordinates.flat():[];if(coords.length>1){let m=0;for(let i=1;i<coords.length;i++)m+=haversine(coords[i-1],coords[i]);return `${g.type==="LineString"?"Tuyến":"Đa tuyến"} · ${m>=1000?(m/1000).toLocaleString("vi-VN",{maximumFractionDigits:3})+" km":Math.round(m)+" m"} · ${coords.length} đỉnh`}return g.type}
  function coordinateSummary(feature){const g=feature.geometry;if(!g)return "";if(g.type==="Point")return `Kinh độ ${Number(g.coordinates[0]).toFixed(6)} · Vĩ độ ${Number(g.coordinates[1]).toFixed(6)}`;const coords=g.type==="LineString"?g.coordinates:g.type==="MultiLineString"?g.coordinates.flat():[];if(!coords.length)return "";const a=coords[0],b=coords[coords.length-1];return `Đầu ${Number(a[1]).toFixed(6)}, ${Number(a[0]).toFixed(6)} · Cuối ${Number(b[1]).toFixed(6)}, ${Number(b[0]).toFixed(6)}`}
  function haversine(a,b){const R=6371000,toRad=x=>x*Math.PI/180,dLat=toRad(b[1]-a[1]),dLon=toRad(b[0]-a[0]),lat1=toRad(a[1]),lat2=toRad(b[1]);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
  function normalize(s){return String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase().replace(/\s+/g," ").trim()}
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
  function escAttr(s){return esc(s)}
  async function copyText(text){try{await navigator.clipboard.writeText(text)}catch{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}}
  function flashButton(btn,text){const old=btn.textContent;btn.textContent=text;setTimeout(()=>btn.textContent=old,1200)}
  function iconSVG(name){const paths={
    kttv:'<path d="M6 19a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 17.5 9a4.5 4.5 0 0 1 .5 9H6Z"/><path d="m8 22 1-2m4 2 1-2m4 2 1-2"/>',
    pump:'<path d="M4 18V8h10v10"/><path d="M7 8V5h4v3m3 3h4l2 2v5h-6"/><circle cx="9" cy="14" r="2"/>',
    dam:'<path d="M5 21 8 5h8l3 16"/><path d="M7 12h10M4 21h16"/>',
    gate:'<path d="M4 20V7h16v13M8 7V4h8v3"/><path d="M8 20v-8h8v8M12 12v8"/>',
    water:'<path d="M12 3s6 7 6 12a6 6 0 1 1-12 0c0-5 6-12 6-12Z"/><path d="M9 16c1 1 2 1.5 4 1"/>',
    canal:'<path d="M3 8c4 0 4 2 8 2s4-2 8-2M3 14c4 0 4 2 8 2s4-2 8-2"/>',
    revetment:'<path d="M4 19h16M6 15h12M8 11h8M10 7h4"/><path d="m5 19 5-12m9 12L14 7"/>',
    levee:'<path d="M3 19h18L15 7H9L3 19Z"/><path d="M7 15h10"/>',
    landslide:'<path d="M4 20h16L13 4 4 20Z"/><path d="m9 15 2-3 2 2 2-4m-3 8h.01"/>'
  };return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.water}</svg>`}
})();
