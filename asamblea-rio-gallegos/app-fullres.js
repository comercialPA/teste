(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let requestSeq=0;

  function previewUrl(photoId){
    return `/api/image-preview?id=${encodeURIComponent(photoId)}&w=1600`;
  }

  async function upgradeLightbox(){
    const lb=$('lightbox'),target=$('lightboxImage');
    const photoId=String(lb?.dataset?.photoId||'').trim();
    if(!lb?.classList.contains('open')||!target||!photoId)return;
    if(target.dataset.fullPhotoId===photoId)return;
    const seq=++requestSeq;
    const preload=new Image();
    preload.decoding='async';
    preload.onload=()=>{
      if(seq!==requestSeq)return;
      if(!$('lightbox')?.classList.contains('open'))return;
      if(String($('lightbox')?.dataset?.photoId||'')!==photoId)return;
      target.src=preload.src;
      target.dataset.fullPhotoId=photoId;
    };
    preload.onerror=()=>console.warn('[PREVIEW] No pudimos cargar la vista ampliada.');
    preload.src=previewUrl(photoId);
  }

  function init(){
    const lb=$('lightbox');
    if(!lb)return;
    const observer=new MutationObserver(()=>{
      if(lb.classList.contains('open'))setTimeout(upgradeLightbox,30);
      else{requestSeq++;const img=$('lightboxImage');if(img)delete img.dataset.fullPhotoId;}
    });
    observer.observe(lb,{attributes:true,attributeFilter:['class','data-photo-id']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
