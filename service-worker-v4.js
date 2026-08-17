const CACHE="thuyloi-vinhlong-v4.0.1";
const CORE=["./manifest.webmanifest","./assets/css/app-v3.css","./assets/css/app-v4.css","./assets/js/layer-catalog.js","./assets/js/data.js","./assets/js/app-v4.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE&&(key.startsWith("tlbt-webgis-")||key.startsWith("thuyloi-vinhlong-"))).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin===location.origin&&event.request.mode==="navigate"){
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>response).catch(()=>caches.match("./index.html")));
    return;
  }
  if(url.origin===location.origin){
    event.respondWith(caches.match(event.request).then(hit=>{
      const network=fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response});
      return hit||network;
    }));
    return;
  }
  if(/cdn\.jsdelivr\.net|tile\.openstreetmap\.org|arcgisonline\.com|basemaps\.cartocdn\.com/.test(url.hostname)){
    event.respondWith(caches.match(event.request).then(hit=>fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>hit||Response.error())));
  }
});