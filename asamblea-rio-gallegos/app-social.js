(()=>{
  'use strict';

  const PROFILE_KEY='rg26_profile_v1';
  const $=id=>document.getElementById(id);
  let socialConfig=null;
  let currentPhotoId='';
  let pollTimer=null;
  let likeBusy=false;

  function profile(){
    try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(_){return null;}
  }

  async function api(action,payload={}){
    const response=await fetch('/api/social',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      cache:'no-store',
      body:JSON.stringify({action,payload})
    });
    const data=await response.json().catch(()=>({ok:false,error:'Respuesta inválida del servidor.'}));
    if(!response.ok||!data.ok)throw new Error(data.error||`Error HTTP ${response.status}`);
    return data.result;
  }

  function notify(message,type='info'){
    let stack=$('toastStack');
    if(!stack){
      stack=document.createElement('div');stack.id='toastStack';stack.className='toast-stack';document.body.appendChild(stack);
    }
    const el=document.createElement('div');
    el.className=`toast social-toast ${type}`;
    el.textContent=message;
    stack.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220);},3000);
  }

  function ensureUi(){
    const top=document.querySelector('.top-actions');
    if(top&&!$('btnNotifications')){
      const btn=document.createElement('button');
      btn.id='btnNotifications';
      btn.type='button';
      btn.className='ghost-round social-bell-btn';
      btn.setAttribute('aria-label','Notificaciones');
      btn.title='Notificaciones';
      btn.innerHTML=`<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"/><path d="M10 20h4"/></svg><span id="socialUnreadBadge" class="social-unread-badge" hidden>0</span>`;
      const profileBtn=$('btnProfile');
      if(profileBtn)top.insertBefore(btn,profileBtn);else top.appendChild(btn);
      btn.addEventListener('click',openNotifications);
    }

    const actions=document.querySelector('.lightbox-actions');
    if(actions&&!$('btnLightboxLike')){
      const btn=document.createElement('button');
      btn.id='btnLightboxLike';
      btn.type='button';
      btn.className='btn btn-secondary social-like-btn';
      btn.textContent='♡ Me gusta';
      const deleteBtn=$('btnLightboxDelete');
      if(deleteBtn)actions.insertBefore(btn,deleteBtn);else actions.appendChild(btn);
      btn.addEventListener('click',toggleLike);
    }

    if(!$('socialNotificationsModal')){
      const modal=document.createElement('div');
      modal.id='socialNotificationsModal';
      modal.className='social-notifications-modal';
      modal.hidden=true;
      modal.innerHTML=`
        <div class="social-notifications-sheet" role="dialog" aria-modal="true" aria-labelledby="socialNotificationsTitle">
          <div class="social-notifications-head">
            <div><small>RECUERDOS</small><h3 id="socialNotificationsTitle">Notificaciones</h3></div>
            <button id="btnCloseNotifications" type="button" aria-label="Cerrar">×</button>
          </div>
          <div class="social-push-card" id="socialPushCard">
            <div><strong>Enterate cuando les guste una foto tuya</strong><span id="socialPushStatus">Podés activar avisos en este dispositivo.</span></div>
            <button id="btnEnablePush" type="button">Activar</button>
          </div>
          <div id="socialNotificationsList" class="social-notifications-list"></div>
          <div id="socialNotificationsEmpty" class="social-notifications-empty">Todavía no tenés notificaciones.</div>
        </div>`;
      document.body.appendChild(modal);
      $('btnCloseNotifications').addEventListener('click',closeNotifications);
      $('btnEnablePush').addEventListener('click',()=>syncPush(true));
      modal.addEventListener('click',e=>{if(e.target===modal)closeNotifications();});
    }
  }

  function currentId(){
    const lb=$('lightbox');
    const id=String(lb?.dataset?.photoId||currentPhotoId||'').trim();
    return id;
  }

  async function refreshLike(){
    ensureUi();
    const id=currentId();
    const btn=$('btnLightboxLike');
    if(!btn||!id)return;
    currentPhotoId=id;
    btn.disabled=true;
    btn.textContent='♡ Me gusta';
    try{
      const p=profile();
      const state=await api('state',{photoId:id,profileId:p?.profileId||''});
      renderLike(state);
    }catch(e){
      btn.textContent='♡ Me gusta';
      btn.disabled=false;
      console.warn('[SOCIAL LIKE STATE]',e);
    }
  }

  function renderLike(state){
    const btn=$('btnLightboxLike');
    if(!btn)return;
    const count=Math.max(0,Number(state?.count||0));
    btn.dataset.liked=state?.liked?'1':'0';
    btn.classList.toggle('liked',!!state?.liked);
    btn.classList.toggle('own-photo',!!state?.isOwn);
    btn.disabled=!!state?.isOwn;
    if(state?.isOwn){
      btn.textContent=count===1?'♥ 1 Me gusta':`♥ ${count} Me gusta`;
      btn.title='Esta es tu foto';
    }else{
      btn.textContent=`${state?.liked?'♥':'♡'} Me gusta${count?` · ${count}`:''}`;
      btn.title=state?.liked?'Quitar Me gusta':'Me gusta';
    }
  }

  async function toggleLike(){
    if(likeBusy)return;
    const p=profile();
    if(!p?.profileId||!p?.ownerSecret){
      $('btnProfile')?.click();
      notify('Primero creá o recuperá tu perfil para indicar Me gusta.');
      return;
    }
    const id=currentId();
    if(!id)return;
    likeBusy=true;
    const btn=$('btnLightboxLike');
    if(btn)btn.disabled=true;
    try{
      const result=await api('like',{photoId:id,profileId:p.profileId,ownerSecret:p.ownerSecret});
      renderLike({liked:result.liked,count:result.count,isOwn:false});
      notify(result.liked?'Marcaste Me gusta.':'Quitaste tu Me gusta.',result.liked?'success':'info');
    }catch(e){
      notify(e.message||'No pudimos actualizar el Me gusta.','error');
      await refreshLike();
    }finally{
      likeBusy=false;
      if(btn&&!btn.classList.contains('own-photo'))btn.disabled=false;
    }
  }

  function setUnread(count){
    const badge=$('socialUnreadBadge');
    if(!badge)return;
    const n=Math.max(0,Number(count||0));
    badge.textContent=n>99?'99+':String(n);
    badge.hidden=n===0;
    $('btnNotifications')?.classList.toggle('has-unread',n>0);
  }

  async function refreshNotifications(render=false){
    const p=profile();
    if(!p?.profileId||!p?.ownerSecret){setUnread(0);if(render)renderNotifications([]);return;}
    try{
      const result=await api('notifications',{profileId:p.profileId,ownerSecret:p.ownerSecret});
      setUnread(result.unread||0);
      if(render)renderNotifications(result.items||[]);
      return result;
    }catch(e){
      console.warn('[SOCIAL NOTIFICATIONS]',e);
      if(render)renderNotifications([],e.message);
    }
  }

  function renderNotifications(items,error=''){
    const list=$('socialNotificationsList');
    const empty=$('socialNotificationsEmpty');
    if(!list||!empty)return;
    list.innerHTML='';
    if(error){empty.textContent=error;empty.hidden=false;return;}
    empty.textContent='Todavía no tenés notificaciones.';
    empty.hidden=items.length>0;
    for(const item of items){
      const row=document.createElement('button');
      row.type='button';
      row.className='social-notification-row'+(item.readAt?'':' unread');
      const date=item.createdAt?new Date(item.createdAt):null;
      const when=date&&!Number.isNaN(date.getTime())?date.toLocaleString('es-AR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
      row.innerHTML=`<span class="social-notification-heart">♥</span><span class="social-notification-copy"><strong>${escapeHtml(item.fromName||'A alguien')} indicó que le gusta tu foto</strong><small>${escapeHtml(when)}</small></span><span class="social-notification-arrow">›</span>`;
      row.addEventListener('click',()=>{
        closeNotifications();
        if(item.url)location.href=item.url;
      });
      list.appendChild(row);
    }
  }

  async function openNotifications(){
    ensureUi();
    const modal=$('socialNotificationsModal');
    if(!modal)return;
    modal.hidden=false;
    requestAnimationFrame(()=>modal.classList.add('open'));
    document.body.classList.add('no-scroll');
    updatePushUi();
    const result=await refreshNotifications(true);
    const p=profile();
    if(result?.unread&&p?.profileId&&p?.ownerSecret){
      setTimeout(async()=>{
        try{await api('markRead',{profileId:p.profileId,ownerSecret:p.ownerSecret});setUnread(0);}catch(_){}
      },650);
    }
  }

  function closeNotifications(){
    const modal=$('socialNotificationsModal');
    if(!modal)return;
    modal.classList.remove('open');
    setTimeout(()=>{modal.hidden=true;if(!$('lightbox')?.classList.contains('open')&&!document.querySelector('.modal.open'))document.body.classList.remove('no-scroll');},180);
  }

  async function getConfig(){
    if(socialConfig)return socialConfig;
    socialConfig=await api('config',{});
    return socialConfig;
  }

  function updatePushUi(){
    const btn=$('btnEnablePush');
    const status=$('socialPushStatus');
    if(!btn||!status)return;
    if(!('Notification'in window)||!('serviceWorker'in navigator)||!('PushManager'in window)){
      btn.hidden=true;status.textContent='Este navegador no admite notificaciones push.';return;
    }
    if(Notification.permission==='denied'){
      btn.hidden=true;status.textContent='Las notificaciones están bloqueadas en los ajustes del navegador.';return;
    }
    if(Notification.permission==='granted'){
      btn.textContent='Activadas';btn.disabled=true;status.textContent='Vas a recibir avisos cuando les guste una foto tuya.';return;
    }
    btn.hidden=false;btn.disabled=false;btn.textContent='Activar';status.textContent='Podés activar avisos en este dispositivo.';
  }

  async function syncPush(requestPermission){
    const p=profile();
    if(!p?.profileId||!p?.ownerSecret){
      $('btnProfile')?.click();notify('Primero necesitás tu perfil.');return;
    }
    if(!('Notification'in window)||!('serviceWorker'in navigator)||!('PushManager'in window)){
      notify('Este navegador no admite notificaciones push.','error');return;
    }
    try{
      let permission=Notification.permission;
      if(permission==='default'&&requestPermission)permission=await Notification.requestPermission();
      if(permission!=='granted'){updatePushUi();return;}
      const config=await getConfig();
      if(!config?.pushAvailable||!config?.vapidPublicKey)throw new Error('Notificaciones push todavía no configuradas.');
      const registration=await navigator.serviceWorker.ready;
      let subscription=await registration.pushManager.getSubscription();
      if(!subscription){
        subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey=urlBase64ToUint8Array(config.vapidPublicKey)});
      }
      await api('subscribe',{profileId:p.profileId,ownerSecret:p.ownerSecret,subscription:subscription.toJSON()});
      updatePushUi();
      if(requestPermission)notify('Notificaciones activadas.','success');
    }catch(e){
      console.warn('[SOCIAL PUSH SUBSCRIBE]',e);
      notify(e.message||'No pudimos activar las notificaciones.','error');
      updatePushUi();
    }
  }

  function urlBase64ToUint8Array(base64String){
    const padding='='.repeat((4-base64String.length%4)%4);
    const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(base64);
    return Uint8Array.from([...raw].map(ch=>ch.charCodeAt(0)));
  }

  function bindLightbox(){
    document.addEventListener('click',e=>{
      const card=e.target.closest?.('.photo-card');
      if(card?.dataset.id)currentPhotoId=card.dataset.id;
    },true);
    const lb=$('lightbox');
    if(!lb)return;
    const observer=new MutationObserver(()=>{
      if(lb.classList.contains('open')){
        currentPhotoId=String(lb.dataset.photoId||currentPhotoId||'');
        setTimeout(refreshLike,30);
      }
    });
    observer.observe(lb,{attributes:true,attributeFilter:['class','data-photo-id']});
  }

  function startPolling(){
    clearInterval(pollTimer);
    pollTimer=setInterval(()=>{if(!document.hidden)refreshNotifications(false);},60000);
    window.addEventListener('focus',()=>refreshNotifications(false));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshNotifications(false);});
  }

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  async function init(){
    ensureUi();
    bindLightbox();
    updatePushUi();
    await refreshNotifications(false);
    if(Notification?.permission==='granted')syncPush(false).catch(()=>{});
    startPolling();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250),{once:true});
  else setTimeout(init,250);
})();
