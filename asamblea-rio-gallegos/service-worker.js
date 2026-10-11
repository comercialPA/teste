const CACHE='rg26-v1.1.6';
const SHELL=[
  '/',
  '/manifest.webmanifest',
  '/app-loader.js',
  '/app-1.css',
  '/app-2.css',
  '/app-3.css',
  '/app-4.css',
  '/app-5.css',
  '/app-6.css',
  '/app-7.css',
  '/app-8.css',
  '/app-9.css',
  '/app-10.css',
  '/app-11.css',
  '/app-gesture-fix.js',
  '/app-update-manager.js',
  '/app-tour.js',
  '/app-social.js',
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

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch(_){data={body:event.data?.text?.()||''};}
  const title=data.title||'Recuerdos';
  const options={
    body:data.body||'Tenés una nueva notificación.',
    icon:data.icon||'/icons/icon-192.png',
    badge:data.badge||'/icons/icon-192.png',
    tag:data.tag||'rg26-notification',
    renotify:true,
    data:{url:data.url||'/',photoId:data.photoId||''}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'/';
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){
      try{
        const current=new URL(client.url);
        const next=new URL(target,self.location.origin);
        if(current.origin===next.origin){
          await client.focus();
          if('navigate' in client)await client.navigate(next.href);
          return;
        }
      }catch(_){}
    }
    if(self.clients.openWindow)return self.clients.openWindow(target);
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')) return;
  if(url.pathname==='/version.json'){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put('/',copy)).catch(()=>{});
          return res;
        })
        .catch(()=>caches.match('/'))
    );
    return;
  }

  if(url.pathname==='/app-loader.js'||url.pathname==='/app-update-manager.js'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});return res;})
        .catch(()=>caches.match(req))
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
