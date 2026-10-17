/* V1.5.0 · mapa oficial: selector preciso sin hotspots estimados */
(()=>{
'use strict';
const api=window.CongElCalafateTerritoriosV150;
const root=document.querySelector('.cec-t15');
if(!api||!root)return;
const hot=document.getElementById('t15Hotspots');
if(hot){hot.innerHTML='';hot.style.display='none';}
const style=document.createElement('style');
style.id='cec-v150-map-grid-style';
style.textContent=`
.cec-territory-grid-wrap{padding:12px 14px;border-bottom:1px solid #e5eef1;background:#fbfdfe}.cec-territory-grid-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px}.cec-territory-grid-head strong{font-size:12px;color:#365d6e}.cec-territory-grid-head small{font-size:10px;color:#82959d;text-align:right}.cec-territory-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:5px}.cec-tgrid{height:29px;border:1px solid #d9e4e8;border-radius:8px;background:#f0f4f6;color:#516a75;font-size:10px;font-weight:900;padding:0}.cec-tgrid.partial{background:#fff1d5;border-color:#efd7a3;color:#94620b}.cec-tgrid.done{background:#e3f5ec;border-color:#b9dfcf;color:#17704d}.cec-tgrid.selected{outline:2px solid #0b5fa5;outline-offset:1px;background:#e5f1fb;color:#0b5fa5}.cec-map-legend{border-top:0!important}.cec-map-note{padding-top:2px!important}.cec-map-stage:after{content:'Mapa oficial · use zoom e deslice para revisar calles y referencias';position:absolute;left:10px;bottom:10px;background:rgba(255,255,255,.9);border:1px solid #dce6ea;border-radius:9px;padding:5px 8px;font-size:9px;color:#5d747e;pointer-events:none}@media(max-width:520px){.cec-territory-grid{grid-template-columns:repeat(9,minmax(0,1fr));gap:4px}.cec-tgrid{height:28px;font-size:9px}}
`;
document.head.appendChild(style);
const mapCard=document.querySelector('.cec-map-card');
const mapScroll=document.getElementById('t15MapScroll');
const wrap=document.createElement('div');
wrap.className='cec-territory-grid-wrap';
wrap.innerHTML='<div class="cec-territory-grid-head"><strong>Elegir territorio</strong><small>El número seleccionado corresponde al plano original</small></div><div id="cecTerritoryGrid" class="cec-territory-grid"></div>';
if(mapCard&&mapScroll)mapCard.insertBefore(wrap,mapScroll);
const grid=document.getElementById('cecTerritoryGrid');
function state(){try{return JSON.parse(localStorage.getItem('cec_territory_official_v150')||'{}')||{};}catch(_){return{};}}
function metric(n){
 const d=api.data[String(n)],t=state()[String(n)]||{},done=t.done||{};if(!d)return{d:0,t:0};
 const keys=[];
 if(d.type==='tramos')d.items.forEach(x=>keys.push(x+'::territorio'));
 else d.items.forEach(x=>['N','E','S','O'].forEach(s=>keys.push(x+'::'+s)));
 return{d:keys.filter(k=>done[k]).length,t:keys.length};
}
function selected(){const s=document.getElementById('t15Select');return s?String(s.value):'1';}
function paint(){
 if(!grid)return;
 const sel=selected();
 Array.from(grid.children).forEach(b=>{const m=metric(b.dataset.n);b.className='cec-tgrid'+(m.t&&m.d===m.t?' done':m.d?' partial':'')+(b.dataset.n===sel?' selected':'');});
}
if(grid){
 grid.innerHTML=Array.from({length:102},(_,i)=>`<button class="cec-tgrid" data-n="${i+1}" aria-label="Territorio ${i+1}">${i+1}</button>`).join('');
 grid.querySelectorAll('button').forEach(b=>b.onclick=()=>{api.select(b.dataset.n,false);paint();document.querySelector('.cec-territory-panel')?.scrollIntoView({behavior:'smooth',block:'start'});});
}
const legend=document.querySelector('.cec-map-legend');
if(legend)legend.innerHTML='<span>Sin iniciar</span><span class="lpart">En curso</span><span class="ldone">Completado</span><span style="margin-left:auto">Los colores se aplican al selector, no alteran el plano original.</span>';
const note=document.querySelector('.cec-map-note');
if(note)note.textContent='Plano original disponible en la carpeta 2026. El archivo conserva internamente el rótulo “Mapa de territorio 2023”. Se muestra sin redibujar límites ni calles.';
const obs=new MutationObserver(paint);
['t15Title','t15Pct','t15Badge'].forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el,{childList:true,characterData:true,subtree:true,attributes:true});});
paint();
window.CongElCalafateTerritoriosMapGridV150={version:'1.5.0',paint};
})();
