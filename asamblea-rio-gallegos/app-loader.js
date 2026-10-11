(async()=>{
  const APP_VERSION='1.2.1';
  const BUILD='121';
  const DATE_LABEL='10 · 11 · 12 · OCTUBRE · 2026';
  const pinEventDate=()=>{
    const el=document.getElementById('eventDateLabel');
    if(el && el.textContent!==DATE_LABEL) el.textContent=DATE_LABEL;
  };
  const ensureBrandVersion=()=>{
    const brand=document.querySelector('.brand-copy');
    if(!brand)return;
    let el=document.getElementById('brandVersion');
    if(!el){
      el=document.createElement('span');
      el.id='brandVersion';
      el.className='brand-version';
      brand.appendChild(el);
    }
    el.textContent=`v${APP_VERSION}`;
  };
  const ensureLink=(rel,href,attrs={})=>{
    let el=document.querySelector(`link[rel="${rel}"]`);
    if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el);}
    el.href=href;
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
    return el;
  };
  const ensureMeta=(name,content)=>{
    let el=document.querySelector(`meta[name="${name}"]`);
    if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el);}
    el.content=content;
  };
  const loadScript=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=src;script.defer=true;script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar '+src));document.body.appendChild(script);
  });
  const setupPwa=()=>{
    ensureLink('manifest',`/manifest.webmanifest?v=${BUILD}`);
    ensureLink('apple-touch-icon',`/icons/apple-touch-icon.png?v=${BUILD}`,{sizes:'180x180'});
    ensureLink('icon',`/icons/icon-192.png?v=${BUILD}`,{type:'image/png',sizes:'192x192'});
    ensureMeta('mobile-web-app-capable','yes');
    ensureMeta('apple-mobile-web-app-capable','yes');
    ensureMeta('apple-mobile-web-app-status-bar-style','black-translucent');
    ensureMeta('apple-mobile-web-app-title','Recuerdos');
    if('serviceWorker' in navigator){
      const register=()=>navigator.serviceWorker.register(`/service-worker.js?v=${BUILD}`,{scope:'/'}).catch(err=>console.warn('[PWA] Service worker',err));
      if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
    }
  };
  try{
    setupPwa();
    document.title='Asamblea Río Gallegos · 10, 11 y 12 de octubre de 2026 · Recuerdos';
    for(const href of ['/app-4.css?v=108','/app-5.css?v=110','/app-6.css?v=111','/app-7.css?v=112','/app-8.css?v=113','/app-9.css?v=114','/app-10.css?v=115','/app-11.css?v=117',`/app-12.css?v=${BUILD}`]){
      const css=document.createElement('link');css.rel='stylesheet';css.href=href;document.head.appendChild(css);
    }
    pinEventDate();
    ensureBrandVersion();
    const dateEl=document.getElementById('eventDateLabel');
    let observer=null;
    if(dateEl){observer=new MutationObserver(pinEventDate);observer.observe(dateEl,{childList:true,characterData:true,subtree:true});}
    const files=['/app-chunk-1.txt','/app-chunk-2.txt','/app-chunk-3.txt','/app-chunk-4.txt','/app-chunk-5.txt','/app-chunk-6.txt'];
    const parts=await Promise.all(files.map(async f=>{const r=await fetch(`${f}?v=${BUILD}`,{cache:'no-store'});if(!r.ok)throw new Error('No se pudo cargar '+f);return r.text();}));
    const s=document.createElement('script');s.text=parts.join('');document.body.appendChild(s);if(document.readyState!=='loading')document.dispatchEvent(new Event('DOMContentLoaded'));

    await loadScript(`/app-gesture-fix.js?v=${BUILD}`);
    await loadScript(`/app-update-manager.js?v=${BUILD}`);
    await loadScript(`/app-social.js?v=${BUILD}`);
    await loadScript(`/app-fullres.js?v=${BUILD}`);
    await loadScript(`/app-tour.js?v=${BUILD}`);

    pinEventDate();
    ensureBrandVersion();
    setTimeout(()=>{pinEventDate();ensureBrandVersion();observer?.disconnect();},12000);
  }catch(err){console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:20px;z-index:9999;background:#fff;padding:24px;border-radius:18px;font-family:sans-serif">No se pudo iniciar la galería. Actualizá la página.</div>');}
})();
