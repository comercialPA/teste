const CACHE='rg26-v1.0.9';
const SHELL=[
  '/',
  '/manifest.webmanifest',
  '/app-loader.js',
  '/app-1.css',
  '/app-2.css',
  '/app-3.css',
  '/app-4.css',
  '/app-chunk-1.txt',
  '/app-chunk-2.txt',
  '/app-chunk-3.txt',
  '/app-chunk-4.txt',
  '/app-chunk-5.txt',
  '/app-chunk-6.txt',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')) return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req)
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put('/',copy)).catch(()=>{});
          return res;
        })
        .catch(()=>caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        if(res && res.ok && ['style','script','image','manifest'].includes(req.destination)){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return res;
      });
    })
  );
});
