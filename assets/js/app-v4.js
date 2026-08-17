(() => {
  "use strict";

  const C = window.TL_LAYER_CATALOG;
  const B = window.TLBT_DATA;
  const $ = id => document.getElementById(id);
  const INTERNAL_FIELDS = new Set(["layer_id","fid","label","_fid","_layer_id","_layer_name","_geometry","_category_id","_category_label","_color","_label"]);
  const RESEARCH_META = {
    facilities:{key:"bt-facilities",name:"Bến Tre · công trình mẫu",count:B.facilities.length,color:"#0f8b75",icon:"gate",source:"research"},
    stations:{key:"bt-stations",name:"Bến Tre · trạm chuỗi mặn",count:B.stations.length,color:"#0b7ca6",icon:"water",source:"research"},
    districts:{key:"bt-districts",name:"Bến Tre · ranh nghiên cứu",count:B.districts.features.length,color:"#5aa897",icon:"region",source:"research"}
  };
  const OFFICIAL_KEYS = new Set(C.layers.map(x=>x.key));
  const RESEARCH_KEYS = new Set(Object.values(RESEARCH_META).map(x=>x.key));
  const state = {
    activeOfficial:new Set(C.layers.map(x=>x.key)),
    activeResearch:new Set([RESEARCH_META.facilities.key, RESEARCH_META.stations.key]),
    query:"", sourceFilter:"all", layerFilter:"all", loaded:new Map(), researchGroups:new Map(), researchRefs:new Map(),
    entries:[], selected:null, measure:false, measurePoints:[], cursorLatLng:null, salinityYear:2016
  };

  const map = L.map("map", {zoomControl:false, attributionControl:true, preferCanvas:true, minZoom:7, maxZoom:20}).setView([10.02,106.20],9);
  const baseLayers = {
    osm:L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:20,attribution:"&copy; OpenStreetMap contributors"}),
    satellite:L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:20,attribution:"Tiles &copy; Esri"}),
    light:L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:20,attribution:"&copy; OpenStreetMap &copy; CARTO"})
  };
  let currentBase = baseLayers.osm.addTo(map);
  const measureLayer = L.layerGroup().addTo(map);
  map.attributionControl.setPrefix(false);

  init();

  function init(){
    renderLayerList();
    populateFilters();
    renderResearchInventory();
    renderAbout();
    bindUI();
    buildResearchLayers();
    updateSalinityUI();
    loadOfficialLayers();
    updateNetwork();
  }

  function bindUI(){
    document.querySelectorAll(".nav-tab").forEach(b=>b.addEventListener("click",()=>switchPanel(b.dataset.panel)));
    document.querySelectorAll(".base-button").forEach(b=>b.addEventListener("click",()=>setBase(b.dataset.base,b)));
    document.querySelectorAll(".area-pill[data-area]").forEach(b=>b.addEventListener("click",()=>focusArea(b.dataset.area)));
    $("searchInput").addEventListener("input",e=>{state.query=e.target.value.trim();renderSearch()});
    $("clearSearch").addEventListener("click",()=>{$("searchInput").value="";state.query="";renderSearch()});
    $("sourceFilter").addEventListener("change",e=>{state.sourceFilter=e.target.value;renderSearch()});
    $("layerFilter").addEventListener("change",e=>{state.layerFilter=e.target.value;renderSearch()});
    $("toggleAllLayers").addEventListener("click",toggleAllLayers);
    $("fitAllButton").addEventListener("click",fitAll);$("homeButton").addEventListener("click",fitAll);
    $("zoomInButton").addEventListener("click",()=>map.zoomIn());$("zoomOutButton").addEventListener("click",()=>map.zoomOut());
    $("locateButton").addEventListener("click",locateUser);$("fullscreenButton").addEventListener("click",toggleFullscreen);
    $("menuButton").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
    $("closeDrawer").addEventListener("click",closeDrawer);$("zoomDetailButton").addEventListener("click",zoomSelected);$("copyDetailButton").addEventListener("click",copySelected);
    $("measureButton").addEventListener("click",()=>{state.measure=!state.measure;$("measureButton").classList.toggle("active",state.measure);$("measureResult").textContent=state.measure?"Chế độ đo đang bật. Nhấp các điểm trên bản đồ.":"Đã tắt chế độ đo."});
    $("clearMeasureButton").addEventListener("click",clearMeasure);$("copyCoordButton").addEventListener("click",copyCursorCoord);$("reloadDataButton").addEventListener("click",loadOfficialLayers);
    $("salinityYear").addEventListener("input",e=>{state.salinityYear=Number(e.target.value);updateSalinityUI();renderResearchStations()});
    [$("aboutButton"),$("aboutButtonTop")].forEach(b=>b?.addEventListener("click",()=>$("aboutDialog").showModal()));
    document.querySelectorAll(".dialog-close").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
    map.on("mousemove",e=>{state.cursorLatLng=e.latlng;$("coordinateReadout").textContent=`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`});
    map.on("click",onMapClick);
    window.addEventListener("online",updateNetwork);window.addEventListener("offline",updateNetwork);window.addEventListener("resize",()=>map.invalidateSize());
  }

  function renderLayerList(){
    const official = C.layers.map(l=>`<label class="layer-row" data-layer-row="${l.key}"><span class="layer-symbol" style="background:${l.color}">${iconSVG(l.icon)}</span><span class="layer-meta"><b>${esc(l.name)}</b><span>${l.geometry==="Point"?"Điểm":"Tuyến"} · ID ${l.id}</span></span><span class="layer-count">${l.count}</span><input class="layer-toggle" data-layer="${l.key}" data-source="official" type="checkbox" checked aria-label="Bật tắt ${escAttr(l.name)}"></label>`).join("");
    $("layerList").innerHTML=official;
    $("researchLayerList").innerHTML=[RESEARCH_META.facilities,RESEARCH_META.stations,RESEARCH_META.districts].map(m=>`<label class="research-layer-row"><span class="layer-symbol" style="background:${m.color}">${iconSVG(m.icon)}</span><span class="layer-meta"><b>${esc(m.name)}</b><span>${m.key===RESEARCH_META.districts.key?"Hình học khái quát phục dựng":"Dữ liệu nghiên cứu / điểm tham chiếu"}</span></span><span class="research-badge">${m.count}</span><input data-layer="${m.key}" data-source="research" type="checkbox" ${state.activeResearch.has(m.key)?"checked":""}></label>`).join("");
    document.querySelectorAll("input[data-layer]").forEach(input=>input.addEventListener("change",()=>setLayerVisible(input.dataset.layer,input.dataset.source,input.checked)));
  }

  function populateFilters(){
    $("layerFilter").insertAdjacentHTML("beforeend",C.layers.map(l=>`<option value="${l.key}">${esc(l.name)} (${l.count})</option>`).join(""));
    $("layerFilter").insertAdjacentHTML("beforeend",`<optgroup label="Bến Tre · nghiên cứu"><option value="${RESEARCH_META.facilities.key}">Công trình mẫu (${B.facilities.length})</option><option value="${RESEARCH_META.stations.key}">Trạm chuỗi mặn (${B.stations.length})</option></optgroup>`);
  }

  function renderResearchInventory(){
    const core=B.inventory.slice(0,11);
    $("inventoryGrid").innerHTML=core.map(row=>`<div class="inventory-card"><b>${Number(row[2]).toLocaleString("vi-VN")}</b><span>${esc(row[0])}</span><em>${row[1]} trường thuộc tính</em></div>`).join("");
  }

  function renderAbout(){
    $("aboutDataset").innerHTML=C.layers.map(l=>`<div class="about-card"><b>${l.count}</b><span>${esc(l.name)}</span></div>`).join("");
    $("aboutResearch").innerHTML=B.inventory.slice(0,11).map(row=>`<div class="about-card"><b>${Number(row[2]).toLocaleString("vi-VN")}</b><span>${esc(row[0])}</span></div>`).join("");
  }

  function switchPanel(id){document.querySelectorAll(".nav-tab").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));document.querySelectorAll(".side-panel").forEach(p=>p.classList.toggle("active",p.id===id))}
  function setBase(key,button){if(currentBase)map.removeLayer(currentBase);currentBase=baseLayers[key].addTo(map);document.querySelectorAll(".base-button").forEach(b=>b.classList.toggle("active",b===button))}

  async function loadOfficialLayers(){
    $("dataStatus").className="status-pill loading";$("dataStatus").textContent="ĐANG NẠP";$("loadReport").innerHTML="";
    state.entries=state.entries.filter(e=>e.source==="research");
    for(const [,rec] of state.loaded){if(map.hasLayer(rec.group))map.removeLayer(rec.group)}state.loaded.clear();
    let loadedCount=0, failed=0;
    await Promise.all(C.layers.map(async meta=>{
      try{
        const res=await fetch(meta.url,{cache:"force-cache"});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json();
        const group=buildOfficialGeoLayer(meta,data);state.loaded.set(meta.key,{meta,data,group});if(state.activeOfficial.has(meta.key))group.addTo(map);
        data.features.forEach((feature,index)=>state.entries.push(makeOfficialEntry(meta,feature,index)));
        loadedCount+=data.features.length;reportLoad(meta,true,data.features.length);
      }catch(err){failed++;reportLoad(meta,false,err.message)}
    }));
    $("metricOfficial").textContent=loadedCount.toLocaleString("vi-VN");
    updateMetrics();renderSearch();
    if(failed){$("dataStatus").className="status-pill error";$("dataStatus").textContent=`LỖI ${failed} LỚP`}else{$("dataStatus").className="status-pill ready";$("dataStatus").textContent="321 + BẾN TRE";fitAll()}
  }

  function reportLoad(meta,ok,value){const el=document.createElement("div");el.className=`load-item ${ok?"ok":"fail"}`;el.innerHTML=`<b>${esc(meta.name)}</b><span>${ok?`${value}/${meta.count} ✓`:`Lỗi: ${esc(value)}`}</span>`;$("loadReport").appendChild(el)}

  function buildOfficialGeoLayer(meta,data){
    return L.geoJSON(data,{pointToLayer:(feature,latlng)=>L.marker(latlng,{icon:markerIcon(meta),title:featureTitle(feature,meta)}),style:()=>({color:meta.color,weight:meta.key==="sat-lo"?5:meta.key==="de"?4:3,opacity:.88,dashArray:meta.key==="sat-lo"?"8 5":meta.key==="de"?"12 4":null,lineCap:"round",lineJoin:"round"}),onEachFeature:(feature,layer)=>{
      layer.bindPopup(()=>officialPopupHTML(meta,feature),{maxWidth:400,className:"infra-popup"});
      layer.bindTooltip(featureTitle(feature,meta),{sticky:true,direction:"top",className:"feature-tooltip",opacity:.96});
      layer.on("click",()=>openOfficialDetail(meta,feature,layer));
    }});
  }

  function markerIcon(meta){return L.divIcon({className:"",html:`<span class="feature-marker" style="background:${meta.color}">${iconSVG(meta.icon)}</span>`,iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-14]})}

  function buildResearchLayers(){
    state.entries=state.entries.filter(e=>e.source!=="research");state.researchRefs.clear();
    const facilities=L.layerGroup();
    B.facilities.forEach(f=>{
      const meta=researchFacilityMeta(f.type), icon=L.divIcon({className:"",html:`<span class="research-marker" style="background:${meta.color}">${iconSVG(meta.icon)}</span>`,iconSize:[27,27],iconAnchor:[13,13],popupAnchor:[0,-12]});
      const layer=L.marker([f.lat,f.lon],{icon,title:f.name}).bindTooltip(f.name,{sticky:true,className:"feature-tooltip"});
      layer.bindPopup(()=>researchFacilityPopup(f),{maxWidth:390,className:"infra-popup"});layer.on("click",()=>openResearchFacility(f,layer));layer.addTo(facilities);state.researchRefs.set(`facility:${f.id}`,layer);
      state.entries.push(makeResearchFacilityEntry(f));
    });
    state.researchGroups.set(RESEARCH_META.facilities.key,facilities);if(state.activeResearch.has(RESEARCH_META.facilities.key))facilities.addTo(map);

    const districts=L.geoJSON(B.districts,{style:()=>({color:"#5aa897",weight:1.3,fillColor:"#a9dbcf",fillOpacity:.055,dashArray:"5 5"}),onEachFeature:(feature,layer)=>layer.bindTooltip(feature.properties.name,{permanent:false,className:"research-district-label"})});
    state.researchGroups.set(RESEARCH_META.districts.key,districts);if(state.activeResearch.has(RESEARCH_META.districts.key))districts.addTo(map);

    const stations=L.layerGroup();state.researchGroups.set(RESEARCH_META.stations.key,stations);renderResearchStations();
    $("metricResearch").textContent=(B.facilities.length+B.stations.length).toLocaleString("vi-VN");
    appendResearchReport();updateMetrics();renderSearch();
  }

  function appendResearchReport(){
    const report=$("loadReport");if(!report)return;
    const rows=[["Bến Tre · công trình mẫu",B.facilities.length],["Bến Tre · trạm chuỗi mặn",B.stations.length],["Bến Tre · ranh nghiên cứu",B.districts.features.length]];
    rows.forEach(([name,count])=>{const el=document.createElement("div");el.className="load-item ok";el.innerHTML=`<b>${esc(name)}</b><span>${count} · local ✓</span>`;report.appendChild(el)});
  }

  function renderResearchStations(){
    const group=state.researchGroups.get(RESEARCH_META.stations.key);if(!group)return;group.clearLayers();
    state.researchRefs.forEach((v,k)=>{if(k.startsWith("station:"))state.researchRefs.delete(k)});
    const idx=state.salinityYear-1997;
    B.stations.forEach(s=>{
      const value=s.values[idx], color=salinityColor(value);
      const icon=L.divIcon({className:"",html:`<span class="research-station-marker" style="background:${color}">${Number.isFinite(value)?Math.round(value):"·"}</span>`,iconSize:[22,22],iconAnchor:[11,11],popupAnchor:[0,-10]});
      const layer=L.marker([s.lat,s.lon],{icon,title:`${s.name} · ${state.salinityYear}`}).bindTooltip(`${s.name} · ${Number.isFinite(value)?value+" g/L":"chưa có số liệu"}`,{sticky:true,className:"feature-tooltip"});
      layer.bindPopup(()=>researchStationPopup(s),{maxWidth:390,className:"infra-popup"});layer.on("click",()=>openResearchStation(s,layer));layer.addTo(group);state.researchRefs.set(`station:${s.id}`,layer);
    });
    if(state.activeResearch.has(RESEARCH_META.stations.key)&&!map.hasLayer(group))group.addTo(map);if(!state.activeResearch.has(RESEARCH_META.stations.key)&&map.hasLayer(group))map.removeLayer(group);
  }

  function setLayerVisible(key,source,visible){
    if(source==="official"){
      const rec=state.loaded.get(key);visible?state.activeOfficial.add(key):state.activeOfficial.delete(key);if(rec){visible?rec.group.addTo(map):map.removeLayer(rec.group)}
    }else{
      const group=state.researchGroups.get(key);visible?state.activeResearch.add(key):state.activeResearch.delete(key);if(group){visible?group.addTo(map):map.removeLayer(group)}
    }
    updateMetrics();
  }

  function toggleAllLayers(){
    const allCount=C.layers.length+RESEARCH_KEYS.size, activeCount=state.activeOfficial.size+state.activeResearch.size, show=activeCount!==allCount;
    state.activeOfficial=new Set(show?C.layers.map(l=>l.key):[]);state.activeResearch=new Set(show?[...RESEARCH_KEYS]:[]);
    document.querySelectorAll("input[data-layer]").forEach(i=>i.checked=show);
    for(const [,rec] of state.loaded){show?rec.group.addTo(map):map.removeLayer(rec.group)}for(const [,group] of state.researchGroups){show?group.addTo(map):map.removeLayer(group)}
    $("toggleAllLayers").textContent=show?"Ẩn tất cả":"Hiện tất cả";updateMetrics();
  }

  function updateMetrics(){
    const visibleOfficial=state.entries.filter(e=>e.source==="official"&&state.activeOfficial.has(e.meta.key)).length;
    const visibleResearch=state.entries.filter(e=>e.source==="research"&&((e.kind==="facility"&&state.activeResearch.has(RESEARCH_META.facilities.key))||(e.kind==="station"&&state.activeResearch.has(RESEARCH_META.stations.key)))).length;
    $("metricVisible").textContent=(visibleOfficial+visibleResearch).toLocaleString("vi-VN");$("metricLayers").textContent=`${state.activeOfficial.size+state.activeResearch.size}/12`;
  }

  function makeOfficialEntry(meta,feature,index){const p=feature.properties||{},title=featureTitle(feature,meta),search=normalize([meta.name,title,...Object.entries(p).filter(([k])=>!INTERNAL_FIELDS.has(k)).flatMap(([k,v])=>[k,v])].join(" "));return {source:"official",kind:"official",meta,feature,index,title,search}}
  function makeResearchFacilityEntry(f){const meta=researchFacilityMeta(f.type);return {source:"research",kind:"facility",meta,facility:f,title:f.name,search:normalize([f.name,f.code,f.type,f.district,f.status,f.note,"Bến Tre nghiên cứu 2020"].join(" "))}}
  function makeResearchStationEntry(s){return {source:"research",kind:"station",meta:RESEARCH_META.stations,station:s,title:s.name,search:normalize([s.name,s.river,s.source,"Bến Tre mặn thủy văn"].join(" "))}}

  function renderSearch(){
    const q=normalize(state.query);let filtered=state.entries.filter(e=>{
      if(state.sourceFilter!=="all"&&e.source!==state.sourceFilter)return false;
      const key=e.source==="official"?e.meta.key:(e.kind==="facility"?RESEARCH_META.facilities.key:RESEARCH_META.stations.key);
      if(state.layerFilter!=="all"&&key!==state.layerFilter)return false;
      return !q||e.search.includes(q);
    });
    filtered=filtered.slice(0,q?120:0);$("resultCount").textContent=q?String(filtered.length):"0";
    if(!q){$("searchResults").innerHTML='<div class="empty-hint">Nhập từ khóa ở thanh tìm kiếm phía trên.</div>';return}
    if(!filtered.length){$("searchResults").innerHTML='<div class="empty-hint">Không tìm thấy đối tượng phù hợp.</div>';return}
    $("searchResults").innerHTML=filtered.map((e,i)=>{
      const m=e.meta, subtitle=e.source==="official"?resultSubtitle(e):e.kind==="facility"?`${e.facility.type} · ${e.facility.district}`:`${e.station.river} · chuỗi 1997–2016`;
      return `<button class="result-card ${e.source==="research"?"research-result":""}" data-i="${i}" type="button"><span class="result-icon" style="background:${m.color}">${iconSVG(m.icon)}</span><span class="result-copy"><b>${esc(e.title)}</b><span>${esc(subtitle)}</span><span class="source-chip ${e.source}">${e.source==="official"?"SNAPSHOT 321":"BẾN TRE 2020"}</span></span><em>${e.source==="official"?m.id:"R"}</em></button>`
    }).join("");
    $("searchResults").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>focusEntry(filtered[Number(b.dataset.i)])));
    if(innerWidth<900)switchPanel("resultsPanel");
  }

  function resultSubtitle(entry){const p=entry.feature.properties||{};return firstValue(p,["Địa chỉ","Địa điểm","Vị trí","Vị trí Km","Địa danh","Tình trạng hoạt động","Tình trạng","Mức độ"])||entry.meta.name}

  function focusEntry(entry){
    if(entry.source==="official"){
      const rec=state.loaded.get(entry.meta.key);if(!rec)return;if(!state.activeOfficial.has(entry.meta.key)){state.activeOfficial.add(entry.meta.key);rec.group.addTo(map);const cb=document.querySelector(`[data-source="official"][data-layer="${CSS.escape(entry.meta.key)}"]`);if(cb)cb.checked=true;updateMetrics()}
      const layer=findLeafletLayer(rec.group,entry.feature);if(layer){if(layer.getLatLng)map.setView(layer.getLatLng(),15);else if(layer.getBounds)map.fitBounds(layer.getBounds(),{padding:[45,45],maxZoom:16});layer.openPopup?.();openOfficialDetail(entry.meta,entry.feature,layer)}
    }else if(entry.kind==="facility"){
      ensureResearchVisible(RESEARCH_META.facilities.key);const layer=state.researchRefs.get(`facility:${entry.facility.id}`);if(layer){map.setView(layer.getLatLng(),15);layer.openPopup();openResearchFacility(entry.facility,layer)}
    }else{
      ensureResearchVisible(RESEARCH_META.stations.key);const layer=state.researchRefs.get(`station:${entry.station.id}`);if(layer){map.setView(layer.getLatLng(),15);layer.openPopup();openResearchStation(entry.station,layer)}
    }
    if(innerWidth<900)$("sidebar").classList.remove("open");
  }

  function ensureResearchVisible(key){state.activeResearch.add(key);const group=state.researchGroups.get(key);if(group&&!map.hasLayer(group))group.addTo(map);const cb=document.querySelector(`[data-source="research"][data-layer="${CSS.escape(key)}"]`);if(cb)cb.checked=true;updateMetrics()}
  function findLeafletLayer(group,feature){let found=null;group.eachLayer(layer=>{if(layer.feature===feature)found=layer});return found}

  function officialPopupHTML(meta,feature){const p=feature.properties||{},rows=publicEntries(p).map(([k,v])=>`<div class="popup-row"><dt>${esc(k)}</dt><dd>${formatValue(v)}</dd></div>`).join("");return `<article class="popup-card"><header class="popup-head" style="background:${meta.color}"><span class="popup-icon">${iconSVG(meta.icon)}</span><div><b>${esc(featureTitle(feature,meta))}</b><span>${esc(meta.name)} · snapshot hạ tầng</span></div></header><dl class="popup-body">${rows}</dl><footer class="popup-foot"><span>ID lớp ${meta.id} · FID ${esc(String(p.fid??feature.id??"—"))}</span><span>${esc(geometrySummary(feature))}</span></footer></article>`}

  function researchFacilityPopup(f){const meta=researchFacilityMeta(f.type);return `<article class="popup-card"><header class="popup-head" style="background:${meta.color}"><span class="popup-icon">${iconSVG(meta.icon)}</span><div><b>${esc(f.name)}</b><span>Bến Tre · dữ liệu nghiên cứu / vị trí phục dựng</span></div></header><dl class="popup-body">${popupRow("Mã",f.code)}${popupRow("Loại",f.type)}${popupRow("Địa bàn",f.district)}${popupRow("Năm xây dựng",f.yearBuilt)}${popupRow("Trạng thái",f.status)}${popupRow("Chiều rộng cửa",f.gateWidth?`${f.gateWidth} m`:null)}${popupRow("Số cửa",f.gateCount)}${popupRow("Ghi chú",f.note)}</dl><footer class="popup-foot"><span>${esc(f.source)}</span><span>Điểm tham chiếu</span></footer></article>`}

  function researchStationPopup(s){const idx=state.salinityYear-1997,value=s.values[idx];return `<article class="popup-card"><header class="popup-head" style="background:${salinityColor(value)}"><span class="popup-icon">${iconSVG("water")}</span><div><b>${esc(s.name)}</b><span>Bến Tre · chuỗi mặn cực đại</span></div></header><dl class="popup-body">${popupRow("Sông",s.river)}${popupRow(`Độ mặn ${state.salinityYear}`,Number.isFinite(value)?`${value} g/L`:null)}${popupRow("Nguồn số liệu",s.source)}${popupRow("Vị trí",s.geometrySource)}${popupRow("Chất lượng",s.quality)}</dl><div style="padding:0 10px 10px">${sparklineSVG(s.values)}</div><footer class="popup-foot"><span>1997–2016</span><span>${Number.isFinite(value)?`${value} g/L`:"Chưa có số liệu"}</span></footer></article>`}

  function openOfficialDetail(meta,feature,layer){
    state.selected={source:"official",meta,feature,layer};$("detailEyebrow").textContent=`${meta.name.toUpperCase()} · LAYER ${meta.id}`;$("detailTitle").textContent=featureTitle(feature,meta);setDetailIcon(meta.color,meta.icon);
    const rows=publicEntries(feature.properties||{}).map(([k,v])=>`<div class="popup-row"><dt>${esc(k)}</dt><dd>${formatValue(v)}</dd></div>`).join("");
    $("detailBody").innerHTML=`<div class="detail-source"><span class="source-dot"></span>Dữ liệu nguồn: <b>hatang.vinhlong.gov.vn</b><br>Snapshot: <code>${C.sourceCommit.slice(0,12)}</code> · Lớp ${meta.id}</div><div class="detail-quality"><div class="quality-card"><b>Loại nguồn</b><span>Snapshot lớp hạ tầng</span></div><div class="quality-card"><b>Hình học</b><span>${esc(geometrySummary(feature))}</span></div></div><div class="detail-section-title">Thuộc tính công khai</div><dl class="detail-table">${rows}</dl><div class="detail-section-title">Tọa độ / hình học</div><div class="geometry-card">${esc(coordinateSummary(feature))}</div>`;
    openDrawer();
  }

  function openResearchFacility(f,layer){
    const meta=researchFacilityMeta(f.type);state.selected={source:"research",kind:"facility",meta,facility:f,layer};$("detailEyebrow").textContent=`BẾN TRE · ${f.type.toUpperCase()}`;$("detailTitle").textContent=f.name;setDetailIcon(meta.color,meta.icon);
    $("detailBody").innerHTML=`<div class="research-detail-hero"><b>DỮ LIỆU NGHIÊN CỨU BẾN TRE</b><p>Thuộc tính và số liệu phục vụ khôi phục WebGIS. Tọa độ của các điểm công trình trong lớp này là vị trí tham chiếu phục dựng, không phải bản sao PostGIS nghiệp vụ.</p></div><div class="detail-quality"><div class="quality-card"><b>Nguồn</b><span>${esc(f.source)}</span></div><div class="quality-card"><b>Chất lượng</b><span>${esc(f.quality)}</span></div></div><dl class="detail-table">${popupRow("Mã",f.code)}${popupRow("Loại",f.type)}${popupRow("Địa bàn",f.district)}${popupRow("Năm xây dựng",f.yearBuilt)}${popupRow("Trạng thái",f.status)}${popupRow("Chiều rộng cửa",f.gateWidth?`${f.gateWidth} m`:null)}${popupRow("Số cửa",f.gateCount)}${popupRow("Ghi chú",f.note)}${popupRow("Kinh độ",Number(f.lon).toFixed(6))}${popupRow("Vĩ độ",Number(f.lat).toFixed(6))}</dl>`;
    openDrawer();
  }

  function openResearchStation(s,layer){
    const idx=state.salinityYear-1997,value=s.values[idx];state.selected={source:"research",kind:"station",meta:RESEARCH_META.stations,station:s,layer};$("detailEyebrow").textContent="BẾN TRE · TRẠM CHUỖI MẶN";$("detailTitle").textContent=s.name;setDetailIcon(salinityColor(value),"water");
    $("detailBody").innerHTML=`<div class="research-detail-hero"><b>${state.salinityYear}: ${Number.isFinite(value)?value+" g/L":"CHƯA CÓ SỐ LIỆU"}</b><p>Chuỗi mặn cực đại 1997–2016 từ Bảng 1 của báo cáo nghiên cứu; tọa độ trên bản đồ là điểm tham chiếu phục dựng.</p></div>${sparklineSVG(s.values)}<div class="detail-section-title">Thông tin trạm</div><dl class="detail-table">${popupRow("Tên trạm",s.name)}${popupRow("Sông",s.river)}${popupRow("Nguồn",s.source)}${popupRow("Vị trí",s.geometrySource)}${popupRow("Chất lượng",s.quality)}${popupRow("Kinh độ",Number(s.lon).toFixed(6))}${popupRow("Vĩ độ",Number(s.lat).toFixed(6))}</dl>`;
    openDrawer();
  }

  function setDetailIcon(color,icon){$("detailIcon").style.background=color;$("detailIcon").innerHTML=iconSVG(icon)}
  function openDrawer(){$("detailActions").hidden=false;$("appShell").classList.add("drawer-open");setTimeout(()=>map.invalidateSize(),230)}
  function closeDrawer(){$("appShell").classList.remove("drawer-open");setTimeout(()=>map.invalidateSize(),230)}
  function zoomSelected(){if(!state.selected)return;const l=state.selected.layer;if(l.getLatLng)map.setView(l.getLatLng(),16);else if(l.getBounds)map.fitBounds(l.getBounds(),{padding:[55,55],maxZoom:17})}

  async function copySelected(){
    if(!state.selected)return;let text="";
    if(state.selected.source==="official"){
      const {meta,feature}=state.selected,p=feature.properties||{};text=[featureTitle(feature,meta),`Lớp: ${meta.name} (${meta.id})`,...publicEntries(p).map(([k,v])=>`${k}: ${plainValue(v)}`),geometrySummary(feature),coordinateSummary(feature),`Nguồn: ${C.sourcePortal}`].join("\n");
    }else if(state.selected.kind==="facility"){
      const f=state.selected.facility;text=[f.name,`Loại: ${f.type}`,`Mã: ${f.code}`,`Địa bàn: ${f.district}`,`Trạng thái: ${f.status}`,`Tọa độ: ${f.lat}, ${f.lon}`,`Nguồn: ${f.source}`,`Chất lượng: ${f.quality}`].join("\n");
    }else{
      const s=state.selected.station,idx=state.salinityYear-1997;text=[s.name,`Sông: ${s.river}`,`Độ mặn ${state.salinityYear}: ${Number.isFinite(s.values[idx])?s.values[idx]+" g/L":"Chưa có số liệu"}`,`Nguồn: ${s.source}`,`Vị trí: ${s.geometrySource}`].join("\n");
    }
    await copyText(text);flashButton($("copyDetailButton"),"Đã sao chép");
  }

  function updateSalinityUI(){
    $("salinityYearOutput").textContent=state.salinityYear;const idx=state.salinityYear-1997,vals=B.stations.map(s=>s.values[idx]).filter(Number.isFinite),over4=vals.filter(v=>v>=4).length,max=vals.length?Math.max(...vals):null;
    $("hydroAvailable").textContent=vals.length;$("hydroOver4").textContent=over4;$("hydroMax").textContent=max===null?"—":`${max.toLocaleString("vi-VN")} g/L`;
    $("salinityStationList").innerHTML=B.stations.map(s=>{const v=s.values[idx];return `<button class="station-row" data-station="${s.id}" type="button"><i class="station-dot" style="background:${salinityColor(v)}"></i><span><b>${esc(s.name)}</b><span>${esc(s.river)}</span></span><strong>${Number.isFinite(v)?v.toLocaleString("vi-VN"):"—"} <small>g/L</small></strong></button>`}).join("");
    $("salinityStationList").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const s=B.stations.find(x=>x.id===b.dataset.station);if(s)focusEntry(makeResearchStationEntry(s))}));
  }

  function focusArea(area){
    if(area==="all"){fitAll();toast("Toàn bộ nguồn dữ liệu đang hiển thị")}
    else if(area==="snapshot"){fitOfficial();toast("Đã zoom tới phạm vi snapshot 321 đối tượng")}
    else if(area==="bentre"){fitBenTre();toast("Khu vực Bến Tre · dữ liệu nghiên cứu 2020")}
    else if(area==="travinh"){toast("Chưa có lớp hình học Trà Vinh riêng trong các nguồn hiện tại; hệ thống không tự gán dữ liệu")}
  }

  function fitAll(){const groups=[];for(const [key,rec] of state.loaded)if(state.activeOfficial.has(key))groups.push(rec.group);for(const [key,group] of state.researchGroups)if(state.activeResearch.has(key))groups.push(group);fitGroups(groups)}
  function fitOfficial(){fitGroups([...state.loaded.values()].map(x=>x.group))}
  function fitBenTre(){const boundary=L.latLngBounds(B.provinceBoundary.map(x=>[x[0],x[1]]));if(boundary.isValid())map.fitBounds(boundary,{padding:[30,30]})}
  function fitGroups(groups){let all=null;groups.forEach(group=>{const b=group.getBounds?.();if(b?.isValid())all=all?all.extend(b):b});if(all)map.fitBounds(all,{padding:[35,35]})}

  function locateUser(){if(!navigator.geolocation)return alert("Trình duyệt không hỗ trợ định vị.");navigator.geolocation.getCurrentPosition(pos=>{const ll=[pos.coords.latitude,pos.coords.longitude];L.circleMarker(ll,{radius:8,color:"#fff",weight:3,fillColor:"#0b74b5",fillOpacity:1}).addTo(map).bindPopup(`Vị trí thiết bị<br>Độ chính xác ±${Math.round(pos.coords.accuracy)} m`).openPopup();map.setView(ll,15)},()=>alert("Không thể lấy vị trí thiết bị."),{enableHighAccuracy:true,timeout:10000})}
  function toggleFullscreen(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()}
  function onMapClick(e){if(!state.measure)return;state.measurePoints.push(e.latlng);L.circleMarker(e.latlng,{radius:4,color:"#fff",weight:2,fillColor:"#c89a2b",fillOpacity:1}).addTo(measureLayer);if(state.measurePoints.length>1){L.polyline(state.measurePoints,{color:"#c89a2b",weight:3,dashArray:"5 4"}).addTo(measureLayer);let total=0;for(let i=1;i<state.measurePoints.length;i++)total+=state.measurePoints[i-1].distanceTo(state.measurePoints[i]);$("measureResult").textContent=`${state.measurePoints.length} điểm · ${total>=1000?(total/1000).toLocaleString("vi-VN",{maximumFractionDigits:3})+" km":Math.round(total)+" m"}`}}
  function clearMeasure(){state.measurePoints=[];measureLayer.clearLayers();$("measureResult").textContent="Chọn hai hoặc nhiều điểm trên bản đồ để đo chiều dài."}
  async function copyCursorCoord(){if(!state.cursorLatLng)return toast("Di chuyển chuột trên bản đồ trước khi sao chép tọa độ");await copyText(`${state.cursorLatLng.lat.toFixed(6)}, ${state.cursorLatLng.lng.toFixed(6)}`);flashButton($("copyCoordButton"),"Đã sao chép")}
  function updateNetwork(){if(navigator.onLine){if(!$("dataStatus").classList.contains("loading"))$("dataStatus").classList.add("ready")}else{$("dataStatus").className="status-pill error";$("dataStatus").textContent="OFFLINE"}}

  function featureTitle(feature,meta){const p=feature.properties||{};return firstValue(p,["Tên trạm","Tên đập","Tên cống","Tên kênh","Tên kè","Tên đê","Địa danh","Tên công trình","Tên","label"])||`${meta.name} #${p.fid??feature.id??"—"}`}
  function firstValue(p,keys){for(const k of keys){const v=p[k];if(v!==null&&v!==undefined&&String(v).trim())return String(v).replace(/\s+/g," ").trim()}return ""}
  function publicEntries(p){return Object.entries(p).filter(([k])=>!INTERNAL_FIELDS.has(k))}
  function popupRow(k,v){return `<div class="popup-row"><dt>${esc(k)}</dt><dd>${formatValue(v)}</dd></div>`}
  function formatValue(v){if(v===null||v===undefined||String(v).trim()==="")return '<span style="color:#94a3ad;font-weight:500">Chưa cập nhật</span>';return esc(String(v)).replace(/\n/g,"<br>")}
  function plainValue(v){return v===null||v===undefined||String(v).trim()===""?"Chưa cập nhật":String(v).replace(/\s+/g," ").trim()}
  function geometrySummary(feature){const g=feature.geometry;if(!g)return "Không có hình học";if(g.type==="Point")return "Điểm";const coords=g.type==="LineString"?g.coordinates:g.type==="MultiLineString"?g.coordinates.flat():[];if(coords.length>1){let m=0;for(let i=1;i<coords.length;i++)m+=haversine(coords[i-1],coords[i]);return `${g.type==="LineString"?"Tuyến":"Đa tuyến"} · ${m>=1000?(m/1000).toLocaleString("vi-VN",{maximumFractionDigits:3})+" km":Math.round(m)+" m"} · ${coords.length} đỉnh`}return g.type}
  function coordinateSummary(feature){const g=feature.geometry;if(!g)return "";if(g.type==="Point")return `Kinh độ ${Number(g.coordinates[0]).toFixed(6)} · Vĩ độ ${Number(g.coordinates[1]).toFixed(6)}`;const coords=g.type==="LineString"?g.coordinates:g.type==="MultiLineString"?g.coordinates.flat():[];if(!coords.length)return "";const a=coords[0],b=coords[coords.length-1];return `Đầu ${Number(a[1]).toFixed(6)}, ${Number(a[0]).toFixed(6)} · Cuối ${Number(b[1]).toFixed(6)}, ${Number(b[0]).toFixed(6)}`}
  function haversine(a,b){const R=6371000,toRad=x=>x*Math.PI/180,dLat=toRad(b[1]-a[1]),dLon=toRad(b[0]-a[0]),lat1=toRad(a[1]),lat2=toRad(b[1]);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
  function normalize(s){return String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase().replace(/\s+/g," ").trim()}
  function salinityColor(v){if(!Number.isFinite(v))return "#8da0ad";if(v<4)return "#2686c0";if(v<16)return "#d89b26";if(v<24)return "#ec7b39";return "#c83e4d"}
  function researchFacilityMeta(type){const map={"Cống cố định":["#d86632","gate"],"Cống tạm":["#ee9b3a","gate"],"Trạm bơm":["#5b5bd6","pump"],"Đập":["#7c5b32","dam"],"Kênh":["#1689c9","canal"],"Điểm sạt lở":["#c53b45","landslide"]},v=map[type]||["#0f8b75","water"];return {key:RESEARCH_META.facilities.key,name:`Bến Tre · ${type}`,color:v[0],icon:v[1],source:"research"}}
  function sparklineSVG(values){const w=300,h=72,p=8,valid=values.map((v,i)=>Number.isFinite(v)?[i,v]:null).filter(Boolean),max=Math.max(32,...valid.map(x=>x[1])),x=i=>p+i*(w-2*p)/(values.length-1),y=v=>h-p-v*(h-2*p)/max,pts=valid.map(([i,v])=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" "),threshold=y(4);return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" role="img" aria-label="Chuỗi độ mặn cực đại 1997 đến 2016"><line class="threshold" x1="${p}" y1="${threshold}" x2="${w-p}" y2="${threshold}"/><polyline points="${pts}"/><text x="${p}" y="${h-2}">1997</text><text x="${w-29}" y="${h-2}">2016</text><text x="${w-28}" y="${Math.max(7,threshold-2)}">4 g/L</text></svg>`}
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
  function escAttr(s){return esc(s)}
  async function copyText(text){try{await navigator.clipboard.writeText(text)}catch{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}}
  function flashButton(btn,text){const old=btn.textContent;btn.textContent=text;setTimeout(()=>btn.textContent=old,1200)}
  function toast(text){const el=$("toast");el.textContent=text;el.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove("show"),2200)}
  function iconSVG(name){const paths={
    kttv:'<path d="M6 19a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 17.5 9a4.5 4.5 0 0 1 .5 9H6Z"/><path d="m8 22 1-2m4 2 1-2m4 2 1-2"/>',
    pump:'<path d="M4 18V8h10v10"/><path d="M7 8V5h4v3m3 3h4l2 2v5h-6"/><circle cx="9" cy="14" r="2"/>',
    dam:'<path d="M5 21 8 5h8l3 16"/><path d="M7 12h10M4 21h16"/>',
    gate:'<path d="M4 20V7h16v13M8 7V4h8v3"/><path d="M8 20v-8h8v8M12 12v8"/>',
    water:'<path d="M12 3s6 7 6 12a6 6 0 1 1-12 0c0-5 6-12 6-12Z"/><path d="M9 16c1 1 2 1.5 4 1"/>',
    canal:'<path d="M3 8c4 0 4 2 8 2s4-2 8-2M3 14c4 0 4 2 8 2s4-2 8-2"/>',
    revetment:'<path d="M4 19h16M6 15h12M8 11h8M10 7h4"/><path d="m5 19 5-12m9 12L14 7"/>',
    levee:'<path d="M3 19h18L15 7H9L3 19Z"/><path d="M7 15h10"/>',
    landslide:'<path d="M4 20h16L13 4 4 20Z"/><path d="m9 15 2-3 2 2 2-4m-3 8h.01"/>',
    region:'<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z"/><path d="M9 4v14m6-12v14"/>'
  };return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.water}</svg>`}
})();