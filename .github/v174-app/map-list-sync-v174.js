/* Cong El Calafate · V1.7.4 · Vinculación mapa ↔ lista verificable */
(()=>{
'use strict';
const STATE='cec_territory_official_v150',DRAW='cec_territory_individual_drawings_v162';
const $=s=>document.querySelector(s);
const data=window.CongTerritoryOfficialData?.data||{};
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'');
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return {}}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const api={active:true,suppressMapReload:false,version:'1.7.4',autolink:0,manual:0,uncertain:0};
window.CongElCalafateV174=api;
const BASE_1={
 'Mz 106':[67.1,29.65,84.6,35.95],
 'Mz 105':[67.25,38.2,84.8,45.7],
 'Mz 104':[67.25,48.1,84.8,55.5],
 'Mz 109':[67.25,58.45,84.8,64.8],
 'Mz 110':[67.2,67.2,85.1,73.55],
 'Mz 110a':[67.25,74.9,85.1,80.0]
}; // Coordenadas porcentuales trazadas sobre Territorio 1.pdf original
let pending=false,lastId='';
function valid(n,k){const d=data[String(n)],item=String(k).split('::')[0],side=String(k).split('::')[1];
 return !!(d&&(d.items||[]).includes(item)&&(d.type==='tramos'?side==='territorio':['N','E','S','O'].includes(side)))}
function drawInfo(n){const all=read(DRAW),arr=Array.isArray(all[n])?all[n]:[];return {all,arr,stroke:arr[arr.length-1]}}
function infer(n,st){
 if(n!=='1'||!Array.isArray(st.points)||st.points.length<4)return [];
 let boxes=[];
 for(const [item,[x1,y1,x2,y2]] of Object.entries(BASE_1)){
   const hits={N:[],E:[],S:[],O:[]},pts=st.points;
   pts.forEach((p,i)=>{
     const x=+p.x,y=+p.y;
     if(x<x1-5.5||x>x2+5.5||y<y1-5.5||y>y2+5.5)return;
     const ds={N:Math.abs(y-y1),S:Math.abs(y-y2),O:Math.abs(x-x1),E:Math.abs(x-x2)};
     const sorted=Object.keys(ds).sort((a,b)=>ds[a]-ds[b]);const side=sorted[0];
     if(ds[side]<4.1)hits[side].push(p);
   });
   const selected=[];
   for(const [side,pts] of Object.entries(hits)){
     if(pts.length<Math.max(3,Math.floor(st.points.length*.055)))continue;
     const spread=side==='N'||side==='S'
       ?Math.max(...pts.map(p=>p.x))-Math.min(...pts.map(p=>p.x))
       :Math.max(...pts.map(p=>p.y))-Math.min(...pts.map(p=>p.y));
     if(spread>=Math.max(2.1,(side==='N'||side==='S'?x2-x1:y2-y1)*.22))selected.push(item+'::'+side);
   }
   const total=selected.reduce((acc,k)=>acc+hits[k.split('::')[1]].length,0);
   if(selected.length)boxes.push({item,keys:selected,hits:total});
 }
 boxes.sort((a,b)=>b.hits-a.hits);
 if(!boxes.length)return [];
 if(boxes[1]&&boxes[1].hits>boxes[0].hits*.68)return []; // no inferir dos manzanas en calles compartidas
 return boxes[0].keys.filter(k=>valid(n,k));
}
function refresh(n){
 try{
  const original=window.CongElCalafateTerritoriosV150;
  api.suppressMapReload=true;
  original?.select?.(String(n),false);
  api.suppressMapReload=false;
  const d=data[n],t=read(STATE)[n]?.done||{},keys=d?.type==='tramos'?(d.items||[]).map(x=>x+'::territorio'):(d?.items||[]).flatMap(x=>['N','E','S','O'].map(s=>x+'::'+s));
  const done=keys.filter(k=>t[k]).length,total=keys.length,pct=total?Math.round(100*done/total):0;
  const set=(id,value)=>{const el=$(id);if(el)el.textContent=value};
  set('#cecV162ProgressText',done+' de '+total+' lados/tramos');set('#cecV162Pct',pct+'%');
  const p=$('#cecV162ProgressBar');if(p)p.style.width=pct+'%';
  window.CongElCalafateTerritoriosReportV162?.refresh?.();
  document.dispatchEvent(new CustomEvent('cec:territory-progress',{detail:{n,done,total,pct}}));
 }finally{api.suppressMapReload=false}
}
function toast(message){
 let el=$('#cecV174Toast');if(!el){el=document.createElement('div');el.id='cecV174Toast';el.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(83px + env(safe-area-inset-bottom));border-radius:15px;padding:12px 16px;background:#073d4b;color:white;box-shadow:0 6px 22px #0003;font:700 12px system-ui;z-index:99998;text-align:center;pointer-events:none';document.body.appendChild(el)}
 el.textContent=message;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,3200)
}
function reconcile(n,st,keys){
 if(!st||!keys?.length)return false;
 keys=Array.from(new Set(keys.filter(k=>valid(n,k))));
 if(!keys.length)return false;
 const {all,arr}=drawInfo(n),record=arr.find(x=>String(x.id)===String(st.id));if(!record)return false;
 const state=read(STATE),territory=state[n]||(state[n]={});
 const done=territory.done||(territory.done={});const labels=territory.labels||(territory.labels={});
 const added=[],linked=new Set(record.keys||[]);
 keys.forEach(k=>{linked.add(k);if(!done[k]){done[k]=true;added.push(k)};if(!labels[k])labels[k]='Marcado en el plano individual'});
 record.keys=[...linked];record.newlyMarked=[...new Set([...(record.newlyMarked||[]),...added])];
 territory.updatedAt=new Date().toISOString();save(STATE,state);save(DRAW,all);
 $('#cecV162Resolve.open .cec-v162-close')?.click();
 window.CongElCalafateTerritoriosV164?.clearPending?.(false);
 const pending=window.CongElCalafateV174Pending;
 if(pending&&pending.n===n)window.CongElCalafateV174Pending=null;
 refresh(n);
 const count=record.keys.length;toast((added.length?'Marcado en la lista: ':'Ya registrado: ')+count+' lado'+(count===1?'':'s')+' / tramo'+(count===1?'':'s'));
 api.autolink++;
 return true
}
function handleStroke(){
 if(pending)return;pending=true;
 setTimeout(()=>{
  try{
   const n=String($('#t15Select')?.value||'1'),{stroke}=drawInfo(n);
   if(!stroke)return;
   const code=n+':'+stroke.id;
   if(lastId===code)return;lastId=code;
   if(stroke.keys?.length){refresh(n);return;}
   const current=window.CongElCalafateV174Pending;
   if(current&&current.n===n&&Date.now()-current.at<110000&&valid(n,current.k)){
    reconcile(n,stroke,[current.k]);return;
   }
   const keys=infer(n,stroke);
   if(keys.length){reconcile(n,stroke,keys);return}
   api.uncertain++;
   // Mantener el cuadro oficial para seleccionar una manzana y su lado sin adivinar.
   // Resolver oficial abierto por el trazado: no adivinar calles ni lados sin geometría.
   toast('Elegí el lado correcto en la lista de confirmación');
  }catch(e){console.warn('V174 mapa/lista:',e);toast('No se pudo identificar. Seleccioná el tramo en la lista.')}
  finally{pending=false}
 },260)
}
function syncConfirmed(){
 const n=String($('#t15Select')?.value||'1'),{arr}=drawInfo(n),state=read(STATE);
 let changed=false,done=state[n]?.done||{};
 arr.forEach(st=>(st.keys||[]).forEach(k=>{if(valid(n,k)&&!done[k]){done[k]=true;changed=true}}));
 if(changed){state[n]=state[n]||{};state[n].done=done;save(STATE,state);refresh(n)}
}
function start(){
 document.addEventListener('pointerup',e=>{if(e.target?.closest?.('#cecV162Svg'))handleStroke()},true);
 document.addEventListener('click',e=>{const id=e.target?.id;
   if(id==='cecV162Apply'){api.manual++;setTimeout(()=>{syncConfirmed();refresh(String($('#t15Select')?.value||'1'))},130);}
 },true);
 document.addEventListener('change',e=>{if(e.target?.id==='t15Select')setTimeout(syncConfirmed,500)},true);
 setTimeout(syncConfirmed,1300);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();