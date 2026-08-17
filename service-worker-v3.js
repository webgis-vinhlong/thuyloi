const CACHE="tlbt-webgis-v3";
const CORE=["./","./index.html","./assets/css/app-v3.css?v=3.0.0","./assets/js/layer-catalog.js?v=3.0.0","./assets/js/app-v3.js?v=3.0.0","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match("./index.html"))));
    return;
  }
  if(/cdn\.jsdelivr\.net|tile\.openstreetmap\.org|arcgisonline\.com|basemaps\.cartocdn\.com/.test(u.hostname)){
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request);try{const r=await fetch(e.request);if(r&&r.ok)c.put(e.request,r.clone());return r}catch{return hit||Response.error()}}));
  }
});
