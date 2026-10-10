(()=>{
  'use strict';

  const $=id=>document.getElementById(id);
  let activePhotoId='';
  let touchStartX=0;
  let touchStartY=0;
  let touchStartAt=0;
  let hintTimer=null;

  function overlayOpen(){
    return !!document.querySelector('.modal.open') || !!$('lightbox')?.classList.contains('open');
  }

  function syncScrollLock(){
    if(!overlayOpen()) document.body.classList.remove('no-scroll');
  }

  function visibleCards(){
    return Array.from(document.querySelectorAll('#gallery .photo-card')).filter(card=>card.isConnected);
  }

  function currentCardId(){
    const cards=visibleCards();
    if(activePhotoId && cards.some(card=>card.dataset.id===activePhotoId)) return activePhotoId;

    const lbSrc=$('lightboxImage')?.currentSrc || $('lightboxImage')?.src || '';
    if(lbSrc){
      const match=cards.find(card=>{
        const img=card.querySelector('img');
        return img && ((img.currentSrc||img.src||'')===lbSrc);
      });
      if(match){
        activePhotoId=match.dataset.id||'';
        return activePhotoId;
      }
    }
    return '';
  }

  function navigateLightbox(step){
    const lightbox=$('lightbox');
    if(!lightbox?.classList.contains('open')) return;
    const cards=visibleCards();
    if(cards.length<2) return;

    const id=currentCardId();
    let index=cards.findIndex(card=>card.dataset.id===id);
    if(index<0) index=0;
    const next=(index+step+cards.length)%cards.length;
    const nextCard=cards[next];
    if(!nextCard) return;

    const img=$('lightboxImage');
    img?.classList.add('swipe-changing');
    activePhotoId=nextCard.dataset.id||'';

    setTimeout(()=>{
      nextCard.click();
      setTimeout(()=>img?.classList.remove('swipe-changing'),110);
    },70);
  }

  function ensureLightboxControls(){
    const media=document.querySelector('.lightbox-media');
    if(!media) return;

    if(!media.querySelector('.lightbox-swipe-btn.prev')){
      const prev=document.createElement('button');
      prev.type='button';
      prev.className='lightbox-swipe-btn prev';
      prev.setAttribute('aria-label','Foto anterior');
      prev.textContent='‹';
      prev.addEventListener('click',e=>{e.stopPropagation();navigateLightbox(-1);});
      media.appendChild(prev);
    }

    if(!media.querySelector('.lightbox-swipe-btn.next')){
      const next=document.createElement('button');
      next.type='button';
      next.className='lightbox-swipe-btn next';
      next.setAttribute('aria-label','Foto siguiente');
      next.textContent='›';
      next.addEventListener('click',e=>{e.stopPropagation();navigateLightbox(1);});
      media.appendChild(next);
    }

    if(!media.querySelector('.lightbox-swipe-hint')){
      const hint=document.createElement('div');
      hint.className='lightbox-swipe-hint';
      hint.textContent='Deslizá ← → para cambiar de foto';
      media.appendChild(hint);
    }
  }

  function showSwipeHint(){
    const hint=document.querySelector('.lightbox-swipe-hint');
    if(!hint || sessionStorage.getItem('rg26_swipe_hint_seen')==='1') return;
    hint.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer=setTimeout(()=>{
      hint.classList.remove('show');
      sessionStorage.setItem('rg26_swipe_hint_seen','1');
    },2400);
  }

  function bindSwipe(){
    const media=document.querySelector('.lightbox-media');
    if(!media || media.dataset.swipeBound==='1') return;
    media.dataset.swipeBound='1';

    media.addEventListener('touchstart',e=>{
      if(e.touches.length!==1) return;
      const t=e.touches[0];
      touchStartX=t.clientX;
      touchStartY=t.clientY;
      touchStartAt=Date.now();
    },{passive:true});

    media.addEventListener('touchend',e=>{
      if(!e.changedTouches.length) return;
      const t=e.changedTouches[0];
      const dx=t.clientX-touchStartX;
      const dy=t.clientY-touchStartY;
      const dt=Math.max(1,Date.now()-touchStartAt);
      const horizontal=Math.abs(dx)>=48 && Math.abs(dx)>Math.abs(dy)*1.18;
      const flick=Math.abs(dx)/dt>.28 && Math.abs(dx)>=34 && Math.abs(dx)>Math.abs(dy);
      if(horizontal || flick) navigateLightbox(dx<0?1:-1);
    },{passive:true});
  }

  function init(){
    ensureLightboxControls();
    bindSwipe();
    syncScrollLock();

    document.addEventListener('click',e=>{
      const card=e.target.closest?.('.photo-card');
      if(card?.dataset.id) activePhotoId=card.dataset.id;

      if(e.target.closest?.('#btnLightboxClose,[data-close],.nav-btn,#btnHeroGallery')){
        setTimeout(syncScrollLock,0);
        setTimeout(syncScrollLock,180);
      }
    },true);

    document.addEventListener('touchstart',e=>{
      if(e.target.closest?.('#gallerySection,.content-wrap,.gallery') && !overlayOpen()) syncScrollLock();
    },{capture:true,passive:true});

    document.addEventListener('keydown',e=>{
      if(!$('lightbox')?.classList.contains('open')) return;
      if(e.key==='ArrowLeft'){e.preventDefault();navigateLightbox(-1);}
      if(e.key==='ArrowRight'){e.preventDefault();navigateLightbox(1);}
    });

    const lightbox=$('lightbox');
    const watched=[...document.querySelectorAll('.modal'),lightbox].filter(Boolean);
    const observer=new MutationObserver(()=>{
      syncScrollLock();
      if(lightbox?.classList.contains('open')){
        ensureLightboxControls();
        bindSwipe();
        currentCardId();
        showSwipeHint();
      }
    });
    watched.forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['class']}));

    window.addEventListener('pageshow',()=>setTimeout(syncScrollLock,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(syncScrollLock,0);});

    setTimeout(syncScrollLock,250);
    setTimeout(syncScrollLock,900);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
