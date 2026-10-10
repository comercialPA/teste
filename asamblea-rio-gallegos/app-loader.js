(async()=>{
  const DATE_LABEL='10 · 11 · 12 · OCTUBRE · 2026';
  const APP_NAME='Comparta sus momentos';
  const pinEventDate=()=>{
    const el=document.getElementById('eventDateLabel');
    if(el && el.textContent!==DATE_LABEL) el.textContent=DATE_LABEL;
  };
  const pinBrandName=()=>{
    const el=document.querySelector('.brand-copy b');
    if(el && el.textContent!==APP_NAME) el.textContent=APP_NAME;
    document.title='Comparta sus momentos · Asamblea Río Gallegos · 10, 11 y 12 de octubre de 2026';
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
  const setupPwa=()=>{
    ensureLink('manifest','/manifest.webmanifest?v=113');
    ensureLink('apple-touch-icon','/icons/apple-touch-icon.png?v=113',{sizes:'180x180'});
    ensureLink('icon','/icons/icon-192.png?v=113',{type:'image/png',sizes:'192x192'});
    ensureMeta('mobile-web-app-capable','yes');
    ensureMeta('apple-mobile-web-app-capable','yes');
    ensureMeta('apple-mobile-web-app-status-bar-style','black-translucent');
    ensureMeta('apple-mobile-web-app-title','Sus momentos');
    if('serviceWorker' in navigator){
      const register=()=>navigator.serviceWorker.register('/service-worker.js?v=113',{scope:'/'}).catch(err=>console.warn('[PWA] Service worker',err));
      if(document.readyState==='complete') register(); else window.addEventListener('load',register,{once:true});
    }
  };
  try{
    setupPwa();
    pinBrandName();
    for(const href of ['/app-4.css?v=108','/app-5.css?v=110','/app-6.css?v=111','/app-7.css?v=112']){
      const css=document.createElement('link');css.rel='stylesheet';css.href=href;document.head.appendChild(css);
    }
    pinEventDate();
    const dateEl=document.getElementById('eventDateLabel');
    const brandEl=document.querySelector('.brand-copy b');
    let observer=null;
    let brandObserver=null;
    if(dateEl){observer=new MutationObserver(pinEventDate);observer.observe(dateEl,{childList:true,characterData:true,subtree:true});}
    if(brandEl){brandObserver=new MutationObserver(pinBrandName);brandObserver.observe(brandEl,{childList:true,characterData:true,subtree:true});}
    const files=['/app-chunk-1.txt','/app-chunk-2.txt','/app-chunk-3.txt','/app-chunk-4.txt','/app-chunk-5.txt','/app-chunk-6.txt'];
    const parts=await Promise.all(files.map(async f=>{const r=await fetch(`${f}?v=113`,{cache:'no-store'});if(!r.ok)throw new Error('No se pudo cargar '+f);return r.text();}));
    const s=document.createElement('script');s.text=parts.join('');document.body.appendChild(s);if(document.readyState!=='loading')document.dispatchEvent(new Event('DOMContentLoaded'));
    const fix=document.createElement('script');fix.src='/app-gesture-fix.js?v=113';fix.defer=true;document.body.appendChild(fix);
    const updater=document.createElement('script');updater.src='/app-update-manager.js?v=113';updater.defer=true;document.body.appendChild(updater);
    pinEventDate();
    pinBrandName();
    setTimeout(()=>{pinEventDate();pinBrandName();observer?.disconnect();brandObserver?.disconnect();},12000);
  }catch(err){console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:20px;z-index:9999;background:#fff;padding:24px;border-radius:18px;font-family:sans-serif">No se pudo iniciar la galería. Actualizá la página.</div>');}
})();
