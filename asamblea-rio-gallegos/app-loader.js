(async()=>{
  const APP_VERSION='1.2.5';
  const BUILD='125';
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

  const setupStorageGuard=()=>{
    const UPLOAD_IDS=['btnHeroUpload','navUpload','btnChooseFiles','fileInput','btnStartUpload'];
    let blocked=false;
    let checking=false;

    const addStyle=()=>{
      if(document.getElementById('rg26StorageGuardStyle'))return;
      const style=document.createElement('style');
      style.id='rg26StorageGuardStyle';
      style.textContent=`
        .storage-status-banner{display:flex;align-items:flex-start;gap:12px;margin:0 0 18px;padding:14px 16px;border-radius:18px;border:1px solid rgba(186,143,58,.28);background:linear-gradient(145deg,rgba(255,249,232,.98),rgba(250,244,226,.95));box-shadow:0 10px 30px rgba(44,36,21,.08);color:#25343a}
        .storage-status-banner[hidden]{display:none!important}
        .storage-status-icon{flex:0 0 auto;width:34px;height:34px;border-radius:12px;display:grid;place-items:center;background:#ead39a;color:#18262c;font-weight:900}
        .storage-status-copy{display:grid;gap:4px;min-width:0}
        .storage-status-copy strong{font-size:12px;line-height:1.3}
        .storage-status-copy span{font-size:10px;line-height:1.45;color:#6f7b80}
        body.rg26-storage-paused #navUpload,body.rg26-storage-paused #btnHeroUpload{opacity:.48;filter:grayscale(.2)}
        body.rg26-storage-paused #dropZone{opacity:.58;pointer-events:none}
        .storage-mini-toast{position:fixed;z-index:15000;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(90vw,460px);padding:11px 14px;border-radius:16px;background:rgba(7,19,29,.96);color:#fff;font-size:11px;font-weight:700;text-align:center;box-shadow:0 18px 45px rgba(0,0,0,.28)}
      `;
      document.head.appendChild(style);
    };

    const ensureBanner=()=>{
      let bar=document.getElementById('storageStatusBanner');
      if(bar)return bar;
      bar=document.createElement('div');
      bar.id='storageStatusBanner';
      bar.className='storage-status-banner';
      bar.hidden=true;
      bar.innerHTML='<div class="storage-status-icon">!</div><div class="storage-status-copy"><strong>Galería temporalmente en pausa</strong><span>Las fotos siguen guardadas. El acceso al almacenamiento está suspendido temporalmente y la carga de nuevas fotos queda pausada para proteger los archivos.</span></div>';
      const main=document.getElementById('gallerySection');
      if(main)main.insertBefore(bar,main.firstChild);
      else document.body.prepend(bar);
      return bar;
    };

    const showMiniToast=(text)=>{
      document.querySelector('.storage-mini-toast')?.remove();
      const el=document.createElement('div');
      el.className='storage-mini-toast';
      el.textContent=text;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),3600);
    };

    const setUploadDisabled=(disabled)=>{
      for(const id of UPLOAD_IDS){
        const el=document.getElementById(id);
        if(!el)continue;
        if(disabled){
          if(el.dataset.rg26StoragePrevDisabled===undefined)el.dataset.rg26StoragePrevDisabled=el.disabled?'1':'0';
          el.disabled=true;
          el.setAttribute('aria-disabled','true');
        }else if(el.dataset.rg26StoragePrevDisabled!==undefined){
          el.disabled=el.dataset.rg26StoragePrevDisabled==='1';
          delete el.dataset.rg26StoragePrevDisabled;
          el.removeAttribute('aria-disabled');
        }
      }
    };

    const renderBlockedState=(status={})=>{
      addStyle();
      const bar=ensureBanner();
      bar.hidden=false;
      document.body.classList.add('rg26-storage-paused');
      setUploadDisabled(true);
      const empty=document.getElementById('emptyState');
      if(empty){
        empty.hidden=false;
        empty.textContent='Las fotos siguen guardadas, pero el almacenamiento está temporalmente suspendido. Volvé a intentar más tarde.';
      }
      const subtitle=document.getElementById('gallerySubtitle');
      if(subtitle)subtitle.textContent='Acceso temporalmente pausado. No se perdió ninguna foto.';
      const photos=document.getElementById('statPhotos');
      if(photos)photos.textContent=status.recordCount?String(status.recordCount):'—';
      const loadMore=document.getElementById('btnLoadMore');
      if(loadMore)loadMore.hidden=true;
    };

    const clearBlockedState=()=>{
      document.getElementById('storageStatusBanner')?.setAttribute('hidden','');
      document.body.classList.remove('rg26-storage-paused');
      setUploadDisabled(false);
    };

    const setBlocked=(next,status={})=>{
      const was=blocked;
      blocked=!!next;
      window.RG26_STORAGE_BLOCKED=blocked;
      if(blocked)renderBlockedState(status);else clearBlockedState();
      if(was&&!blocked){
        showMiniToast('El almacenamiento volvió a estar disponible. Actualizando la galería…');
        setTimeout(()=>location.reload(),900);
      }
    };

    const check=async()=>{
      if(checking)return;
      checking=true;
      try{
        const response=await fetch(`/api/storage-status?t=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
        const data=await response.json().catch(()=>null);
        if(response.ok&&data?.ok){
          if(data.available===false)setBlocked(true,data);
          else if(data.available===true)setBlocked(false,data);
        }
      }catch(err){
        console.warn('[STORAGE STATUS]',err);
      }finally{
        checking=false;
      }
    };

    document.addEventListener('click',event=>{
      if(!blocked)return;
      const target=event.target?.closest?.('#btnHeroUpload,#navUpload,#btnChooseFiles,#btnStartUpload,#dropZone');
      if(!target)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      showMiniToast('La carga de fotos está pausada temporalmente. Tus fotos existentes siguen guardadas.');
    },true);

    addStyle();
    ensureBanner();
    check();
    setInterval(check,60*1000);
    window.addEventListener('focus',()=>setTimeout(check,200));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(check,200);});
    window.RG26_checkStorage=check;
  };

  const setupMediaOptimizer=()=>{
    const gallery=document.getElementById('gallery');
    if(!gallery)return;
    const rewrite=()=>{
      gallery.querySelectorAll('.photo-card[data-id] img').forEach(img=>{
        if(img.dataset.rg26MediaOptimized)return;
        const src=String(img.getAttribute('src')||'');
        const card=img.closest('.photo-card[data-id]');
        const id=String(card?.dataset?.id||'').trim();
        if(!id)return;
        if(src.includes('/files/')&&src.includes('blob.vercel-storage.com')){
          img.dataset.rg26MediaOptimized='1';
          img.dataset.rg26OriginalThumb=src;
          img.src=`/api/image-preview?id=${encodeURIComponent(id)}&w=720`;
        }else{
          img.dataset.rg26MediaOptimized='native';
        }
      });
    };
    const observer=new MutationObserver(rewrite);
    observer.observe(gallery,{childList:true,subtree:true});
    rewrite();
  };

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
    setupStorageGuard();
    document.title='Asamblea Río Gallegos · 10, 11 y 12 de octubre de 2026 · Recuerdos';
    for(const href of ['/app-4.css?v=108','/app-5.css?v=110','/app-6.css?v=111','/app-7.css?v=112','/app-8.css?v=113','/app-9.css?v=114','/app-10.css?v=115','/app-11.css?v=117','/app-12.css?v=121','/app-13.css?v=122',`/app-14.css?v=${BUILD}`]){
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

    setupMediaOptimizer();
    await loadScript(`/app-gesture-fix.js?v=${BUILD}`);
    await loadScript(`/app-update-manager.js?v=${BUILD}`);
    await loadScript(`/app-social.js?v=${BUILD}`);
    await loadScript(`/app-fullres.js?v=${BUILD}`);
    await loadScript(`/app-camera.js?v=${BUILD}`);
    await loadScript(`/app-frame.js?v=${BUILD}`);
    await loadScript(`/app-tour.js?v=${BUILD}`);

    pinEventDate();
    ensureBrandVersion();
    setTimeout(()=>{pinEventDate();ensureBrandVersion();observer?.disconnect();},12000);
  }catch(err){console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:20px;z-index:9999;background:#fff;padding:24px;border-radius:18px;font-family:sans-serif">No se pudo iniciar la galería. Actualizá la página.</div>');}
})();
