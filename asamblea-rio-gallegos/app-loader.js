(async()=>{
  try{
    const files=['/app-chunk-1.txt','/app-chunk-2.txt','/app-chunk-3.txt','/app-chunk-4.txt','/app-chunk-5.txt','/app-chunk-6.txt'];
    const parts=await Promise.all(files.map(async f=>{const r=await fetch(f,{cache:'no-cache'});if(!r.ok)throw new Error('No se pudo cargar '+f);return r.text();}));
    const s=document.createElement('script');s.text=parts.join('');document.body.appendChild(s);if(document.readyState!=='loading')document.dispatchEvent(new Event('DOMContentLoaded'));
  }catch(err){console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:20px;z-index:9999;background:#fff;padding:24px;border-radius:18px;font-family:sans-serif">No se pudo iniciar la galería. Actualizá la página.</div>');}
})();
