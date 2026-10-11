(()=>{
  'use strict';

  const TOUR_SEEN_KEY='rg26_tour_seen_v1';
  const TOUR_TEASER_KEY='rg26_tour_teaser_v117';
  let stepIndex=0;
  let active=false;
  let resizeTimer=null;

  const $=id=>document.getElementById(id);

  const steps=[
    {
      target:'.brand',
      kicker:'Bienvenido',
      title:'Tus recuerdos, en un solo lugar',
      text:'Este recorrido te muestra cómo usar la galería en menos de un minuto. Podés volver a abrirlo cuando quieras desde el botón “? Cómo usar”.'
    },
    {
      target:'#btnProfile',
      kicker:'Paso 1',
      title:'Tu perfil',
      text:'Primero identificáte con tu nombre y congregación. Tu nombre queda guardado en este dispositivo y no se borra cuando actualizás el app.'
    },
    {
      target:'#btnHeroUpload',
      kicker:'Paso 2',
      title:'Subí tus fotos',
      text:'Tocá “Subir fotos”, elegí varias imágenes de una sola vez y, si querés, agregá una leyenda. Las fotos quedan asociadas a tu perfil.'
    },
    {
      target:'#btnHeroGallery',
      kicker:'Paso 3',
      title:'Entrá a la galería',
      text:'Desde “Ver galería” podés recorrer todas las fotos. Tocá una imagen para verla en pantalla completa, deslizá a izquierda o derecha y usá “Descargar” o “Compartir foto” para guardarla o enviarla directamente a WhatsApp, Instagram u otras apps compatibles.'
    },
    {
      target:'.panel.filters',
      kicker:'Paso 4',
      title:'Buscá y filtrá',
      text:'Usá el buscador para encontrar por nombre, congregación o leyenda. También podés filtrar directamente por congregación.'
    },
    {
      target:'#navFavorites',
      kicker:'Paso 5',
      title:'Guardá tus favoritas',
      text:'Favoritas es una lista privada de este dispositivo. Marcá las fotos que querés guardar para encontrarlas rápidamente después.'
    },
    {
      target:'#btnNotifications',
      kicker:'Paso 6',
      title:'Me gusta y notificaciones',
      text:'Al abrir una foto podés tocar “Me gusta”. El hermano que la publicó recibe un aviso. Desde la campana podés ver tus notificaciones y activar avisos para recibirlos también cuando el app esté cerrado.'
    },
    {
      target:'#navMine',
      kicker:'Paso 7',
      title:'Tus propias fotos',
      text:'En “Mis fotos” ves todas las fotos asociadas a tu perfil. Solo vos podés eliminar tus propias fotos desde el app.'
    },
    {
      target:'#btnHeroShare',
      kicker:'Paso 8',
      title:'Compartí el app',
      text:'Abrí “Compartir app” para mostrar el QR o copiar el link y enviarlo por WhatsApp a otros hermanos.'
    },
    {
      target:'#btnHelpTour',
      kicker:'Listo',
      title:'Ya sabés usar Recuerdos',
      text:'Cuando aparezca una versión nueva, tocá “Actualizar”: el app limpia el caché técnico y conserva tu perfil, nombre y datos locales. Para repetir este recorrido, tocá “? Cómo usar”.'
    }
  ];

  function ensureHelpButton(){
    const actions=document.querySelector('.top-actions');
    if(!actions || $('btnHelpTour'))return;
    const btn=document.createElement('button');
    btn.id='btnHelpTour';
    btn.type='button';
    btn.className='ghost-round tour-help-btn';
    btn.setAttribute('aria-label','Cómo usar el app');
    btn.setAttribute('title','Cómo usar el app');
    btn.innerHTML='<span class="tour-help-icon" aria-hidden="true">?</span><span class="tour-help-label">Cómo usar</span>';
    btn.addEventListener('click',()=>startTour(0));
    actions.insertBefore(btn,actions.firstChild);
  }

  function ensureSharePhotoButton(){
    const actions=document.querySelector('.lightbox-actions');
    if(!actions || $('btnLightboxSharePhoto'))return;
    const btn=document.createElement('button');
    btn.id='btnLightboxSharePhoto';
    btn.type='button';
    btn.className='btn btn-secondary';
    btn.textContent='Compartir foto';
    btn.addEventListener('click',()=>$('btnLightboxShare')?.click());
    const download=$('btnLightboxDownload');
    if(download)actions.insertBefore(btn,download);
    else actions.appendChild(btn);
  }

  function ensureUi(){
    if($('appTour'))return;
    const root=document.createElement('div');
    root.id='appTour';
    root.className='app-tour';
    root.hidden=true;
    root.innerHTML=`
      <div class="tour-spotlight" id="tourSpotlight"></div>
      <section class="tour-card" id="tourCard" role="dialog" aria-modal="true" aria-labelledby="tourTitle">
        <div class="tour-card-top">
          <span class="tour-kicker" id="tourKicker"></span>
          <button type="button" class="tour-close" id="btnTourClose" aria-label="Cerrar recorrido">×</button>
        </div>
        <h3 id="tourTitle"></h3>
        <p id="tourText"></p>
        <div class="tour-progress" id="tourProgress" aria-label="Progreso del recorrido"></div>
        <div class="tour-actions">
          <button type="button" class="tour-skip" id="btnTourSkip">Saltar</button>
          <div class="tour-nav-actions">
            <button type="button" class="tour-secondary" id="btnTourPrev">Anterior</button>
            <button type="button" class="tour-primary" id="btnTourNext">Siguiente</button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(root);
    $('btnTourClose').addEventListener('click',finishTour);
    $('btnTourSkip').addEventListener('click',finishTour);
    $('btnTourPrev').addEventListener('click',()=>showStep(stepIndex-1));
    $('btnTourNext').addEventListener('click',()=>{
      if(stepIndex>=steps.length-1)finishTour(); else showStep(stepIndex+1);
    });
  }

  function targetFor(step){
    try{return document.querySelector(step.target);}catch(e){return null;}
  }

  function setSpotlight(target){
    const spot=$('tourSpotlight');
    if(!spot)return;
    if(!target){
      spot.style.opacity='0';
      return;
    }
    const r=target.getBoundingClientRect();
    const pad=8;
    const left=Math.max(8,r.left-pad);
    const top=Math.max(8,r.top-pad);
    const width=Math.min(innerWidth-left-8,r.width+pad*2);
    const height=Math.min(innerHeight-top-8,r.height+pad*2);
    spot.style.opacity='1';
    spot.style.left=`${left}px`;
    spot.style.top=`${top}px`;
    spot.style.width=`${Math.max(36,width)}px`;
    spot.style.height=`${Math.max(36,height)}px`;
  }

  function placeCard(target){
    const card=$('tourCard');
    if(!card)return;
    card.classList.remove('tour-card-topside');
    if(innerWidth<=719){
      card.style.left='14px';
      card.style.right='14px';
      card.style.top='auto';
      card.style.bottom='calc(88px + env(safe-area-inset-bottom))';
      return;
    }
    const r=target?.getBoundingClientRect();
    card.style.right='auto';
    card.style.bottom='auto';
    const cardW=Math.min(390,innerWidth-32);
    const left=r ? Math.min(innerWidth-cardW-18,Math.max(18,r.left)) : (innerWidth-cardW)/2;
    const below=r ? r.bottom+18 : 120;
    const estimatedH=290;
    const useAbove=below+estimatedH>innerHeight-20 && r && r.top>estimatedH+24;
    card.style.width=`${cardW}px`;
    card.style.left=`${left}px`;
    if(useAbove){
      card.style.top=`${Math.max(18,r.top-estimatedH-18)}px`;
      card.classList.add('tour-card-topside');
    }else{
      card.style.top=`${Math.min(innerHeight-estimatedH-18,Math.max(18,below))}px`;
    }
  }

  function buildProgress(){
    const wrap=$('tourProgress');
    if(!wrap)return;
    wrap.innerHTML='';
    steps.forEach((_,i)=>{
      const dot=document.createElement('span');
      dot.className=i===stepIndex?'active':(i<stepIndex?'done':'');
      wrap.appendChild(dot);
    });
  }

  async function showStep(index){
    if(!active)return;
    stepIndex=Math.max(0,Math.min(steps.length-1,index));
    const step=steps[stepIndex];
    const target=targetFor(step);

    if(target){
      target.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
      await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?40:360));
    }

    $('tourKicker').textContent=step.kicker;
    $('tourTitle').textContent=step.title;
    $('tourText').textContent=step.text;
    $('btnTourPrev').hidden=stepIndex===0;
    $('btnTourSkip').textContent=stepIndex===steps.length-1?'Cerrar':'Saltar';
    $('btnTourNext').textContent=stepIndex===steps.length-1?'Finalizar':'Siguiente';
    buildProgress();
    setSpotlight(target);
    placeCard(target);
  }

  function startTour(index=0){
    ensureHelpButton();
    ensureUi();
    const root=$('appTour');
    active=true;
    stepIndex=Math.max(0,Math.min(steps.length-1,index));
    root.hidden=false;
    requestAnimationFrame(()=>root.classList.add('show'));
    document.documentElement.classList.add('tour-running');
    showStep(stepIndex);
  }

  function finishTour(){
    if(!active)return;
    active=false;
    localStorage.setItem(TOUR_SEEN_KEY,'1');
    const root=$('appTour');
    root?.classList.remove('show');
    document.documentElement.classList.remove('tour-running');
    setTimeout(()=>{if(root)root.hidden=true;},180);
  }

  function showTeaserOnce(){
    if(localStorage.getItem(TOUR_TEASER_KEY)==='1')return;
    localStorage.setItem(TOUR_TEASER_KEY,'1');
    const teaser=document.createElement('div');
    teaser.className='tour-teaser';
    teaser.innerHTML='<div><strong>Nuevo · Me gusta y notificaciones</strong><span>El tour ahora también explica las funciones sociales.</span></div><button type="button">Ver tour</button>';
    document.body.appendChild(teaser);
    teaser.querySelector('button').addEventListener('click',()=>{teaser.remove();startTour(0);});
    requestAnimationFrame(()=>teaser.classList.add('show'));
    setTimeout(()=>{teaser.classList.remove('show');setTimeout(()=>teaser.remove(),220);},9000);
  }

  function reposition(){
    if(!active)return;
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      const target=targetFor(steps[stepIndex]);
      setSpotlight(target);
      placeCard(target);
    },80);
  }

  function init(){
    ensureHelpButton();
    ensureSharePhotoButton();
    ensureUi();
    window.RG26_startTour=startTour;
    window.addEventListener('resize',reposition,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(reposition,250),{passive:true});
    window.addEventListener('scroll',reposition,{passive:true});
    document.addEventListener('keydown',e=>{
      if(!active)return;
      if(e.key==='Escape')finishTour();
      if(e.key==='ArrowRight' && stepIndex<steps.length-1)showStep(stepIndex+1);
      if(e.key==='ArrowLeft' && stepIndex>0)showStep(stepIndex-1);
    });
    setTimeout(showTeaserOnce,1800);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
