(()=>{
  'use strict';

  const PROFILE_KEY='rg26_profile_v1';
  const $=id=>document.getElementById(id);
  const photoCache=new Map();
  let exportMode='download';

  const FRAME={
    portrait:{
      w:870,h:1297,
      hole:{x:72,y:81,w:726,h:961},
      label:{x:18,y:1065,w:834,h:180},
      css:{left:'8.276%',top:'6.245%',width:'83.448%',height:'74.095%'}
    },
    landscape:{
      w:1101,h:1040,
      hole:{x:76,y:92,w:949,h:655},
      label:{x:19,y:770,w:1063,h:245},
      css:{left:'6.903%',top:'8.846%',width:'86.194%',height:'62.981%'}
    }
  };

  function profileId(){
    try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')?.profileId||'';}catch(_){return '';}
  }

  async function getPhoto(photoId){
    if(photoCache.has(photoId))return photoCache.get(photoId);
    const response=await fetch('/api/rpc',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      cache:'no-store',
      body:JSON.stringify({fn:'apiGetPhoto',args:[photoId,profileId()]})
    });
    const data=await response.json().catch(()=>({ok:false}));
    if(!response.ok||!data.ok)throw new Error(data.error||'No pudimos cargar esta foto.');
    photoCache.set(photoId,data.result);
    return data.result;
  }

  function currentPhotoId(){return String($('lightbox')?.dataset?.photoId||'').trim();}
  function orientationFrom(w,h){return Number(w)>=Number(h)?'landscape':'portrait';}

  function ensurePreview(){
    const media=document.querySelector('.lightbox-media');
    const image=$('lightboxImage');
    if(!media||!image)return;
    let stage=$('eventFrameStage');
    if(!stage){
      stage=document.createElement('div');
      stage.id='eventFrameStage';
      stage.className='event-frame-stage';
      media.insertBefore(stage,image);
      stage.appendChild(image);
      const paper=document.createElement('div');paper.className='event-frame-paper';stage.insertBefore(paper,image);
      const border=document.createElement('div');border.className='event-frame-hole-border';stage.appendChild(border);
      const label=document.createElement('div');label.className='event-frame-label';label.innerHTML='<strong>FELICES PARA SIEMPRE</strong><span>ASAMBLEA DEL 2026 DE LOS TESTIGOS DE JEHOVÁ</span>';stage.appendChild(label);
      image.addEventListener('load',updatePreviewOrientation);
    }
    updatePreviewOrientation();
  }

  function updatePreviewOrientation(){
    const image=$('lightboxImage'),stage=$('eventFrameStage');
    if(!image||!stage)return;
    const w=image.naturalWidth||Number(image.getAttribute('width'))||1;
    const h=image.naturalHeight||Number(image.getAttribute('height'))||1;
    const orientation=orientationFrom(w,h);
    const cfg=FRAME[orientation];
    stage.dataset.orientation=orientation;
    stage.style.setProperty('--hole-left',cfg.css.left);
    stage.style.setProperty('--hole-top',cfg.css.top);
    stage.style.setProperty('--hole-width',cfg.css.width);
    stage.style.setProperty('--hole-height',cfg.css.height);
  }

  function ensureChoiceModal(){
    if($('frameExportModal'))return;
    const modal=document.createElement('div');
    modal.id='frameExportModal';
    modal.className='modal frame-export-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML=`
      <div class="sheet frame-export-sheet">
        <div class="sheet-head"><h3 id="frameExportTitle">Descargar foto</h3><button type="button" class="close-btn" id="btnFrameExportClose">×</button></div>
        <div class="sheet-body">
          <div class="frame-export-copy">
            <strong id="frameExportQuestion">¿Cómo querés descargarla?</strong>
            <span>La versión con marco se genera en alta calidad sin modificar la foto original.</span>
          </div>
          <div class="frame-export-actions">
            <button type="button" id="btnExportWithFrame" class="btn btn-primary">Con marco</button>
            <button type="button" id="btnExportWithoutFrame" class="btn btn-light">Sin marco</button>
            <button type="button" id="btnExportCancel" class="btn btn-light">Cancelar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    $('btnFrameExportClose').addEventListener('click',closeChoice);
    $('btnExportCancel').addEventListener('click',closeChoice);
    $('btnExportWithFrame').addEventListener('click',()=>runExport(true));
    $('btnExportWithoutFrame').addEventListener('click',()=>runExport(false));
    modal.addEventListener('click',e=>{if(e.target===modal)closeChoice();});
  }

  function openChoice(mode){
    if(!currentPhotoId())return;
    ensureChoiceModal();
    exportMode=mode;
    const share=mode==='share';
    $('frameExportTitle').textContent=share?'Compartir foto':'Descargar foto';
    $('frameExportQuestion').textContent=share?'¿Cómo querés compartirla?':'¿Cómo querés descargarla?';
    $('btnExportWithFrame').textContent=share?'Compartir con marco':'Descargar con marco';
    $('btnExportWithoutFrame').textContent=share?'Compartir sin marco':'Descargar sin marco';
    $('frameExportModal').classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeChoice(){
    $('frameExportModal')?.classList.remove('open');
    if(!$('lightbox')?.classList.contains('open')&&!document.querySelector('.modal.open'))document.body.classList.remove('no-scroll');
  }

  function setBusy(busy,label='Preparando…'){
    for(const id of ['btnExportWithFrame','btnExportWithoutFrame','btnExportCancel']){const btn=$(id);if(btn)btn.disabled=busy;}
    const close=$('btnFrameExportClose');if(close)close.disabled=busy;
    const primary=$('btnExportWithFrame');
    if(primary){
      if(busy){primary.dataset.oldText=primary.textContent;primary.textContent=label;}
      else if(primary.dataset.oldText){primary.textContent=primary.dataset.oldText;delete primary.dataset.oldText;}
    }
  }

  function toast(message,type=''){
    const host=$('toastStack')||document.body;
    const div=document.createElement('div');
    div.className='toast '+type;
    div.textContent=message;
    host.appendChild(div);
    setTimeout(()=>div.remove(),4600);
  }

  function sourceUrl(photo){
    const raw=photo?.downloadUrl||photo?.thumbnailUrl||'';
    try{const u=new URL(raw,location.origin);u.searchParams.delete('download');return u.href;}catch(_){return raw;}
  }

  async function fetchOriginal(photo){
    const url=sourceUrl(photo);
    if(!url)throw new Error('No encontramos el archivo original.');
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error(`No pudimos cargar la foto (${response.status}).`);
    return response.blob();
  }

  function roundedRect(ctx,x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  }

  function drawCover(ctx,img,x,y,w,h){
    const sw=img.width,sh=img.height;
    const sourceRatio=sw/sh,targetRatio=w/h;
    let sx=0,sy=0,cw=sw,ch=sh;
    if(sourceRatio>targetRatio){cw=sh*targetRatio;sx=(sw-cw)/2;}
    else{ch=sw/targetRatio;sy=(sh-ch)/2;}
    ctx.drawImage(img,sx,sy,cw,ch,x,y,w,h);
  }

  function paperTexture(ctx,w,h){
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#f7f4ec');g.addColorStop(.48,'#f1eee6');g.addColorStop(1,'#ebe7dd');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    let seed=20261012;
    const count=Math.min(1100,Math.round((w*h)/15000));
    for(let i=0;i<count;i++){
      seed=(seed*1664525+1013904223)>>>0;const x=(seed/4294967296)*w;
      seed=(seed*1664525+1013904223)>>>0;const y=(seed/4294967296)*h;
      seed=(seed*1664525+1013904223)>>>0;const a=.018+(seed/4294967296)*.028;
      ctx.fillStyle=`rgba(92,76,54,${a})`;ctx.fillRect(x,y,Math.max(1,w/2200),Math.max(1,h/2200));
    }
  }

  function fitFont(ctx,text,maxWidth,startPx,minPx,weight='400'){
    let size=startPx;
    while(size>minPx){ctx.font=`${weight} ${size}px Arial, Helvetica, sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;size-=2;}
    return size;
  }

  async function renderFramedBlob(photo){
    const blob=await fetchOriginal(photo);
    const bitmap=await createImageBitmap(blob);
    const orientation=orientationFrom(photo?.width||bitmap.width,photo?.height||bitmap.height);
    const cfg=FRAME[orientation];
    const memory=Number(navigator.deviceMemory||8);
    const longSide=memory&&memory<=4?3072:4096;
    const scale=longSide/Math.max(cfg.w,cfg.h);
    const W=Math.round(cfg.w*scale),H=Math.round(cfg.h*scale);
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx){bitmap.close?.();throw new Error('Este dispositivo no pudo generar la imagen.');}

    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);
    const inset=Math.max(2,Math.round(W*.006));
    roundedRect(ctx,inset,inset,W-inset*2,H-inset*2,Math.round(Math.min(W,H)*.028));
    ctx.save();ctx.clip();paperTexture(ctx,W,H);ctx.restore();
    ctx.strokeStyle='rgba(120,112,98,.32)';ctx.lineWidth=Math.max(1,W*.002);roundedRect(ctx,inset,inset,W-inset*2,H-inset*2,Math.round(Math.min(W,H)*.028));ctx.stroke();

    const hx=cfg.hole.x*scale,hy=cfg.hole.y*scale,hw=cfg.hole.w*scale,hh=cfg.hole.h*scale;
    ctx.fillStyle='#d7d2c8';ctx.fillRect(hx-W*.006,hy-H*.005,hw+W*.012,hh+H*.01);
    drawCover(ctx,bitmap,hx,hy,hw,hh);
    ctx.strokeStyle='rgba(54,50,44,.55)';ctx.lineWidth=Math.max(2,W*.0024);ctx.strokeRect(hx,hy,hw,hh);
    ctx.strokeStyle='rgba(255,255,255,.68)';ctx.lineWidth=Math.max(1,W*.0014);ctx.strokeRect(hx+W*.003,hy+H*.003,hw-W*.006,hh-H*.006);

    const lx=cfg.label.x*scale,ly=cfg.label.y*scale,lw=cfg.label.w*scale,lh=cfg.label.h*scale;
    const lg=ctx.createLinearGradient(lx,ly,lx+lw,ly);
    lg.addColorStop(0,'#cfd9fb');lg.addColorStop(.46,'#f0f1fb');lg.addColorStop(1,'#f3e0bd');
    ctx.fillStyle=lg;ctx.fillRect(lx,ly,lw,lh);
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#07112e';
    const title='FELICES PARA SIEMPRE';
    const sub='ASAMBLEA DEL 2026 DE LOS TESTIGOS DE JEHOVÁ';
    const titleStart=orientation==='portrait'?lh*.43:lh*.42;
    const titleSize=fitFont(ctx,title,lw*.94,titleStart,18*scale,'400');
    ctx.font=`400 ${titleSize}px Arial, Helvetica, sans-serif`;
    ctx.fillText(title,lx+lw/2,ly+lh*(orientation==='portrait'?.43:.42));
    const subStart=orientation==='portrait'?lh*.17:lh*.16;
    const subSize=fitFont(ctx,sub,lw*.92,subStart,9*scale,'700');
    ctx.font=`700 ${subSize}px Arial, Helvetica, sans-serif`;
    ctx.fillText(sub,lx+lw/2,ly+lh*(orientation==='portrait'?.75:.73));

    bitmap.close?.();
    return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('No pudimos generar la foto con marco.')),'image/jpeg',.95));
  }

  function filename(photo,withFrame,ext='jpg'){
    const id=String(photo?.id||'foto').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,36)||'foto';
    return `recuerdo-${withFrame?'con-marco':'sin-marco'}-${id}.${ext}`;
  }

  function downloadBlob(blob,name){
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }

  async function downloadOriginal(photo){
    try{
      const blob=await fetchOriginal(photo);
      const type=blob.type||photo?.mimeType||'image/jpeg';
      const ext=type.includes('png')?'png':type.includes('webp')?'webp':type.includes('heic')||type.includes('heif')?'heic':'jpg';
      downloadBlob(blob,filename(photo,false,ext));
    }catch(err){if(photo?.downloadUrl)window.open(photo.downloadUrl,'_blank');else throw err;}
  }

  function shareUrl(photo){
    const base=location.origin+location.pathname;
    return `${base}?foto=${encodeURIComponent(photo.id)}`;
  }

  async function shareBlob(photo,blob,withFrame){
    const type=blob.type||'image/jpeg';
    const file=new File([blob],filename(photo,withFrame,'jpg'),{type});
    const text=`Foto compartida por ${photo.uploaderName||''} · ${photo.congregation||''}`.trim();
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:'Asamblea Río Gallegos 2026',text});
      return;
    }
    if(withFrame){downloadBlob(blob,file.name);toast('Tu celular no permite compartir el archivo directamente. Descargamos la foto con marco.','success');return;}
    if(navigator.share){await navigator.share({title:'Asamblea Río Gallegos 2026',text,url:shareUrl(photo)});return;}
    downloadBlob(blob,file.name);toast('Foto descargada.','success');
  }

  async function runExport(withFrame){
    const id=currentPhotoId();if(!id)return;
    setBusy(true,withFrame?'Generando marco…':'Preparando…');
    try{
      const photo=await getPhoto(id);
      if(exportMode==='download'){
        if(withFrame){const blob=await renderFramedBlob(photo);downloadBlob(blob,filename(photo,true));toast('Foto con marco lista.','success');}
        else await downloadOriginal(photo);
      }else{
        if(withFrame){const blob=await renderFramedBlob(photo);await shareBlob(photo,blob,true);}
        else{const blob=await fetchOriginal(photo);await shareBlob(photo,blob,false);}
      }
      closeChoice();
    }catch(err){if(err?.name!=='AbortError')toast(err?.message||'No pudimos completar esta acción.','error');}
    finally{setBusy(false);}
  }

  function intercept(btn,mode){
    if(!btn||btn.dataset.frameExportBound==='1')return;
    btn.dataset.frameExportBound='1';
    btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openChoice(mode);},true);
  }

  function bindActions(){
    intercept($('btnLightboxDownload'),'download');
    intercept($('btnLightboxShare'),'share');
  }

  function init(){
    ensurePreview();ensureChoiceModal();bindActions();
    const lb=$('lightbox');
    if(lb){
      new MutationObserver(()=>{if(lb.classList.contains('open')){ensurePreview();setTimeout(updatePreviewOrientation,50);}}).observe(lb,{attributes:true,attributeFilter:['class','data-photo-id']});
    }
    new MutationObserver(bindActions).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
