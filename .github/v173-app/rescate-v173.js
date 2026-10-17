/* Congregación El Calafate · V1.7.3 · Estabilidad y diagnóstico de interacción
   Sin MutationObserver global; actualizaciones bajo demanda y señales nativas.
*/
(()=>{
'use strict';
const V='1.7.3';
const $=s=>document.querySelector(s);
let lastPulse=Date.now(),stallCount=0,maxDelay=0,touches=0,lastTouch=0,lastNav='',exceptions=[];
const recent=(x)=>{exceptions.push(String(x).slice(0,260));if(exceptions.length>10)exceptions.shift()};
window.addEventListener('error',e=>recent('ERROR '+(e.message||'')+' @ '+(e.filename||'')+':'+(e.lineno||'')));
window.addEventListener('unhandledrejection',e=>recent('PROMISE '+String(e.reason||'')));
document.addEventListener('pointerdown',()=>{touches++;lastTouch=Date.now()},{capture:true,passive:true});
function view(){return $('.view.active')?.id||'sin-pantalla'}
function sendPulse(){let now=Date.now(),delay=Math.max(0,now-lastPulse-5000);lastPulse=now;maxDelay=Math.max(maxDelay,delay);if(delay>4000)stallCount++;try{
  if(window.AndroidBridge&&typeof AndroidBridge.heartbeat==='function')AndroidBridge.heartbeat('pantalla='+view()+'; ralentizaciones='+stallCount+'; eventos_táctiles='+touches+'; última_navegación='+lastNav);
}catch(e){recent('native heartbeat: '+e.message)}}
function info(){
const age=lastTouch?Math.floor((Date.now()-lastTouch)/1000)+' s':'sin toques';
return ['','--- INTERACCIÓN / ESTABILIDAD (V1.7.3) ---','Último toque: '+age,'Toques registrados: '+touches,'Demoras de UI detectadas (>4 s): '+stallCount,'Demora máxima: '+Math.round(maxDelay)+' ms','Última navegación: '+(lastNav||'ninguna'),'Pantalla visible: '+view(),'Modo dibujo: '+!!$('#cecV162Svg.drawing'),'Mapa ampliado: '+!!$('#cecV162Viewport.p170-pan-mode'),'Errores capturados: '+exceptions.length,...exceptions.map(x=>'- '+x),'Nota: 8/8 comprobaciones correctas NO garantizan respuesta táctil.'].join('\n');
}
function extendReport(){
 const t=$('#cecDiagText');if(!t)return;
 t.value=t.value.replace(/\n--- INTERACCIÓN \/ ESTABILIDAD \(V1\.7\.3\) ---[\s\S]*$/,'')+info();
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('#cecDiagCopy,#cecDiagDownload,#cecDiagRefresh'))extendReport();
 const nav=e.target.closest?.('.nav-item');
 if(nav)lastNav=nav.dataset.target||'indefinida';
},{capture:true});
function sync(){const title=$('.about-card strong');if(title&&title.textContent!=='Aplicación v1.7.3 · estabilidad y navegación')title.textContent='Aplicación v1.7.3 · estabilidad y navegación';}
function start(){
 sync();sendPulse();
 setInterval(()=>{if(!document.hidden)sendPulse()},5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastPulse=Date.now();sendPulse()}});
 document.addEventListener('click',()=>setTimeout(sync,180));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.CongElCalafateRescateV173={version:V,info,extendReport};
})();