(()=>{
  'use strict';
  const PROFILE_KEY='rg26_profile_v1';
  const $=id=>document.getElementById(id);
  let requestSeq=0;

  function profileId(){
    try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')?.profileId||'';}catch(_){return '';}
  }

  async function getPhoto(photoId){
    const response=await fetch('/api/rpc',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      cache:'no-store',
      body:JSON.stringify({fn:'apiGetPhoto',args:[photoId,profileId()]})
    });
    const data=await response.json().catch(()=>({ok:false}));
    if(!response.ok||!data.ok)throw new Error(data.error||'No pudimos cargar la foto en alta calidad.');
    return data.result;
  }

  function publicOriginalUrl(downloadUrl){
    try{
      const url=new URL(downloadUrl,location.origin);
      url.searchParams.delete('download');
      return url.href;
    }catch(_){return downloadUrl||'';}
  }

  async function upgradeLightbox(){
    const lb=$('lightbox'),target=$('lightboxImage');
    const photoId=String(lb?.dataset?.photoId||'').trim();
    if(!lb?.classList.contains('open')||!target||!photoId)return;
    if(target.dataset.fullPhotoId===photoId)return;
    const seq=++requestSeq;
    try{
      const photo=await getPhoto(photoId);
      const fullUrl=publicOriginalUrl(photo?.downloadUrl||'');
      if(!fullUrl)return;
      const preload=new Image();
      preload.decoding='async';
      preload.onload=()=>{
        if(seq!==requestSeq)return;
        if(!$('lightbox')?.classList.contains('open'))return;
        if(String($('lightbox')?.dataset?.photoId||'')!==photoId)return;
        target.src=fullUrl;
        target.dataset.fullPhotoId=photoId;
      };
      preload.src=fullUrl;
    }catch(err){console.warn('[FULL RES]',err);}
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
