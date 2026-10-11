(()=>{
  'use strict';

  const CURRENT_VERSION='1.1.7';
  const VERSION_URL='/version.json';
  const PROFILE_KEY='rg26_profile_v1';
  const PERSISTENT_NAME_KEY='rg26_assistant_name_persistent_v1';
  const INSTALLED_VERSION_KEY='rg26_installed_version';
  const PENDING_UPDATE_KEY='rg26_pending_update';

  const $=id=>document.getElementById(id);

  function readProfile(){
    try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(e){return null;}
  }

  function persistAssistantName(){
    try{
      const profile=readProfile();
      if(profile?.name) localStorage.setItem(PERSISTENT_NAME_KEY,String(profile.name).trim());
      const input=$('profileName');
      if(input?.value?.trim()) localStorage.setItem(PERSISTENT_NAME_KEY,input.value.trim());
    }catch(e){}
  }

  function restoreAssistantName(){
    try{
      persistAssistantName();
      const saved=(localStorage.getItem(PERSISTENT_NAME_KEY)||'').trim();
      const input=$('profileName');
      if(saved && input && !input.value.trim()) input.value=saved;
      if(input && input.dataset.persistNameBound!=='1'){
        input.dataset.persistNameBound='1';
        input.addEventListener('input',()=>{
          const value=input.value.trim();
          if(value) localStorage.setItem(PERSISTENT_NAME_KEY,value);
        });
      }
      const createBtn=$('btnCreateProfile');
      if(createBtn && createBtn.dataset.persistNameBound!=='1'){
        createBtn.dataset.persistNameBound='1';
        createBtn.addEventListener('click',()=>setTimeout(persistAssistantName,700));
      }
    }catch(e){}
  }

  function versionParts(v){
    return String(v||'0').split('.').map(n=>Number(n)||0);
  }

  function versionNewer(a,b){
    const aa=versionParts(a),bb=versionParts(b);
    const n=Math.max(aa.length,bb.length);
    for(let i=0;i<n;i++){
      const x=aa[i]||0,y=bb[i]||0;
      if(x>y)return true;
      if(x<y)return false;
    }
    return false;
  }

  function ensureUpdateUi(){
    let bar=$('appUpdateBar');
    if(bar)return bar;
    bar=document.createElement('div');
    bar.id='appUpdateBar';
    bar.className='app-update-bar';
    bar.hidden=true;
    bar.innerHTML=`
      <div class="app-update-copy">
        <strong id="appUpdateTitle">Nueva versión disponible</strong>
        <span id="appUpdateVersion"></span>
      </div>
      <button id="btnAppUpdate" type="button">Actualizar</button>`;
    document.body.appendChild(bar);
    $('btnAppUpdate').addEventListener('click',runUpdate);
    return bar;
  }

  function showUpdate(version,message){
    const bar=ensureUpdateUi();
    $('appUpdateTitle').textContent=message||'Nueva versión disponible';
    $('appUpdateVersion').textContent=`V${version}`;
    bar.dataset.targetVersion=version;
    bar.hidden=false;
    requestAnimationFrame(()=>bar.classList.add('show'));
  }

  function hideUpdate(){
    const bar=$('appUpdateBar');
    if(!bar)return;
    bar.classList.remove('show');
    setTimeout(()=>bar.hidden=true,180);
  }

  async function fetchLatestVersion(){
    const response=await fetch(`${VERSION_URL}?t=${Date.now()}`,{
      cache:'no-store',
      headers:{'Cache-Control':'no-cache'}
    });
    if(!response.ok)throw new Error(`version HTTP ${response.status}`);
    return response.json();
  }

  async function clearTechnicalCache(){
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(key=>caches.delete(key)));
    }
  }

  async function refreshServiceWorker(){
    if(!('serviceWorker' in navigator))return;
    const registrations=await navigator.serviceWorker.getRegistrations();
    for(const reg of registrations){
      try{
        await reg.update();
        if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
      }catch(e){}
    }
  }

  async function runUpdate(){
    const bar=ensureUpdateUi();
    const btn=$('btnAppUpdate');
    const target=bar.dataset.targetVersion||CURRENT_VERSION;
    if(btn){btn.disabled=true;btn.textContent='Actualizando…';}

    persistAssistantName();
    try{
      localStorage.setItem(PENDING_UPDATE_KEY,target);
      await clearTechnicalCache();
      await refreshServiceWorker();
      const url=new URL(location.href);
      url.searchParams.set('updated',target);
      url.searchParams.set('_',Date.now().toString());
      location.replace(url.toString());
    }catch(e){
      if(btn){btn.disabled=false;btn.textContent='Actualizar';}
      console.error('[UPDATE]',e);
      location.reload();
    }
  }

  async function checkForUpdate(){
    try{
      restoreAssistantName();

      const pending=localStorage.getItem(PENDING_UPDATE_KEY)||'';
      if(pending===CURRENT_VERSION){
        localStorage.setItem(INSTALLED_VERSION_KEY,CURRENT_VERSION);
        localStorage.removeItem(PENDING_UPDATE_KEY);
      }

      const data=await fetchLatestVersion();
      const latest=String(data?.version||'').trim();
      if(!latest)return;

      const installed=localStorage.getItem(INSTALLED_VERSION_KEY)||'';
      const remoteIsNewer=versionNewer(latest,CURRENT_VERSION);

      if(remoteIsNewer){
        showUpdate(latest,data?.message||'Nueva versión disponible');
        return;
      }

      if(!installed||installed!==CURRENT_VERSION){
        localStorage.setItem(INSTALLED_VERSION_KEY,CURRENT_VERSION);
      }
      hideUpdate();
    }catch(e){
      console.warn('[UPDATE CHECK]',e);
    }
  }

  window.RG26_APP_VERSION=CURRENT_VERSION;
  window.RG26_checkForUpdate=checkForUpdate;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
    restoreAssistantName();
    setTimeout(checkForUpdate,900);
  },{once:true});
  else{
    restoreAssistantName();
    setTimeout(checkForUpdate,900);
  }

  window.addEventListener('focus',()=>setTimeout(checkForUpdate,250));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(checkForUpdate,250);});
  setInterval(checkForUpdate,5*60*1000);
})();
