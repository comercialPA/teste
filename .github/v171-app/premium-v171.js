/* Congregación El Calafate · V1.7.1 behavior refinements */
(()=>{
'use strict';
const VERSION='1.7.2';
const STATE_KEY='cec_territory_official_v150';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'')||f}catch(_){return f}};
function iconPin(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg>'}
function sideKeys(d){const out=[];if(!d)return out;if(d.type==='tramos')(d.items||[]).forEach(x=>out.push(x+'::territorio'));else(d.items||[]).forEach(x=>['N','E','S','O'].forEach(s=>out.push(x+'::'+s)));return out}
function globalMetric(){const data=window.CongTerritoryOfficialData?.data||{},state=read(STATE_KEY,{});let total=0,done=0;for(let n=1;n<=102;n++){const keys=sideKeys(data[String(n)]);total+=keys.length;const d=state[String(n)]?.done||{};done+=keys.filter(k=>!!d[k]).length}return{total,done,pct:total?Math.round(done*100/total):0}}
function navigate(target){const b=$(`.nav-item[data-target="${target}"]`);if(b)b.click();else{$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===target));window.scrollTo({top:0,behavior:'smooth'})}}
function addTerritoryShortcut(){const home=$('#inicio'),g=$('.p170-greeting',home);if(!home||!g)return;let b=$('#p171TerritoryShortcut');const m=globalMetric();if(!b){b=document.createElement('button');b.type='button';b.id='p171TerritoryShortcut';b.className='p171-territory-shortcut';const sys=$('.p170-system-card',g);if(sys)sys.insertAdjacentElement('afterend',b);else g.appendChild(b);b.addEventListener('click',()=>{navigate('territorios');setTimeout(()=>{const picker=$('.cec-territory-grid-wrap')||$('#t15Select')||$('#cecTerritoryGrid');picker?.scrollIntoView({behavior:'smooth',block:'start'})},260)})}
b.style.setProperty('--p171-pct',m.pct+'%');b.innerHTML=`<span class="p171-territory-icon">${iconPin()}</span><span class="p171-territory-copy"><small>Acceso directo</small><strong>Marcar territorio realizado</strong><span>Elegir territorio, marcar calles/tramos y actualizar el termómetro.</span></span><span class="p171-territory-meter"><strong>${m.pct}%</strong><i></i></span>`}
function improveMapScroll(){const vp=$('#cecV162Viewport');if(!vp)return;if(!$('#p171MapScrollHint')){const h=document.createElement('div');h.id='p171MapScrollHint';h.className='p171-map-scroll-hint';h.textContent='Deslice verticalmente para continuar la página · use Mover para desplazar el plano';vp.insertAdjacentElement('beforebegin',h)}const svg=$('#cecV162Svg');const drawing=!!svg?.classList.contains('drawing');vp.classList.toggle('p170-drawing',drawing);if(drawing)vp.classList.remove('p170-pan-mode')}
function refresh(){addTerritoryShortcut();improveMapScroll();const about=$('.about-card strong');if(about)about.textContent='Aplicación v1.7.2 · Visual System 2026';}
function observe(){let queued=false;const mo=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})});mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});refresh();setInterval(()=>{addTerritoryShortcut();improveMapScroll()},2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.CongElCalafateVisualV171={version:VERSION,globalMetric,refresh};
})();



/* Congregación El Calafate · V1.7.2: mapa restaurado, ES-AR y calendario sin feriados */
(()=>{
'use strict';
const VERSION='1.7.2',$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const calendarUrl='https://calendar.google.com/calendar/embed?src=congcalafate%40gmail.com&ctz=America%2FArgentina%2FRio_Gallegos&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0';
function calendarOnly(){
  try{
    const r=typeof resources!=='undefined'&&resources.find(x=>x.id==='calendario');
    if(r){r.url=calendarUrl;r.title='Calendario de la congregación';r.desc='Solo el calendario congregacional, sin los feriados automáticos de Google.';}
    if(typeof currentResource!=='undefined'&&currentResource&&currentResource.id==='calendario'){
      const a=$('#dialogOpen');if(a)a.href=calendarUrl;
      const h=$('#dialogTitle');if(h)h.textContent='Calendario de la congregación';
    }
  }catch(e){console.warn('Calendario V1.7.2:',e)}
}
function localize(){
  const screen=$('#cecCarritosScreen');
  if(screen){
    const walker=document.createTreeWalker(screen,NodeFilter.SHOW_TEXT);
    let n;while((n=walker.nextNode())){
      const t=n.nodeValue,next=t.replace(/\bvagas\b/g,'vacantes').replace(/\bVaga\b/g,'Vacante').replace(/\bHoje\b/g,'Hoy');
      if(t!==next)n.nodeValue=next;
    }
  }
  const meta=$('#cecPickerMeta');if(meta&&meta.textContent==='Vaga')meta.textContent='Vacante';
}
function ensureTerritories(){
  const page=$('#territorios'),head=$('.page-head',page),card=$('.territory-control-card',page);
  if(!page||!head||!card)return;
  card.style.setProperty('display','block','important');
  if(card.hasAttribute('hidden'))card.removeAttribute('hidden');
  if(!$('#cecV172Actions')){
    const actions=document.createElement('div');actions.id='cecV172Actions';actions.className='cec-v172-actions';
    actions.innerHTML='<button id="cecV172MapGo" type="button" class="cec-v172-action"><span class="v172-icon">⌖</span><span class="v172-copy"><strong>ABRIR MAPA PARA MARCAR</strong><small>Elegí un territorio y marcá los lados o tramos realizados</small></span><span class="v172-arrow">›</span></button><button id="cecV172ThermoGo" type="button" class="cec-v172-action secondary"><span class="v172-icon">▥</span><span class="v172-copy"><strong>Informe y termómetro</strong><small>Consultá el progreso de los 102 territorios</small></span><span class="v172-arrow">›</span></button>';
    ($('.p170-territory-overview',page)||head).insertAdjacentElement('afterend',actions);
  }
  const mapCard=$('.cec-map-card',card);
  if(mapCard&&!$('#cecV172GeneralMap')){
    const d=document.createElement('details');d.id='cecV172GeneralMap';d.className='cec-v172-map';
    d.innerHTML='<summary><span style="font-size:23px;color:#087cf0">▧</span><span><strong>Plano general oficial · 102 territorios</strong><small>Disponible sin conexión · tocá para desplegarlo</small></span><span style="margin-left:auto;color:#087cf0">⌄</span></summary><div class="v172-general-tools"><button type="button" data-v172-zoom="out">− Alejar</button><span id="cecV172Zoom">100%</span><button type="button" data-v172-zoom="in">+ Acercar</button></div><div class="v172-general-frame"><img id="cecV172GeneralImg" src="territory-map-2026.png" alt="Plano oficial de El Calafate con 102 territorios" loading="lazy"></div><p>Para marcar un lado o tramo, primero elegí el número en el selector de arriba. El plano individual te permite registrar lo realizado.</p>';
    mapCard.insertAdjacentElement('afterend',d);
  }
  const version=$('.about-card strong');if(version&&version.textContent!=='Aplicación v1.7.2 · Visual System 2026')version.textContent='Aplicación v1.7.2 · Visual System 2026';
}
function navigate(){const b=$('.nav-item[data-target="territorios"]');if(b)b.click();}
function openMap(){
  navigate();setTimeout(()=>{ensureTerritories();const target=$('.cec-t15-top')||$('#t15Select')||$('.territory-control-card');if(target){target.scrollIntoView({behavior:'smooth',block:'start'});target.classList.add('cec-v172-flash');setTimeout(()=>target.classList.remove('cec-v172-flash'),1250)}},300);
}
function progress(){navigate();setTimeout(()=>{const b=$('#cecV162OpenReport');if(b)b.click();else $('#cecV172Actions')?.scrollIntoView({block:'start',behavior:'smooth'})},300);}
let zoom=1;
function changeZoom(way){zoom=Math.min(4,Math.max(1,zoom+(way==='in'?.5:-.5)));const image=$('#cecV172GeneralImg');if(image)image.style.width=Math.round(zoom*100)+'%';const text=$('#cecV172Zoom');if(text)text.textContent=Math.round(zoom*100)+'%';}
document.addEventListener('click',e=>{
  const z=e.target.closest?.('[data-v172-zoom]');if(z){e.preventDefault();changeZoom(z.dataset.v172Zoom);return;}
  const home=e.target.closest?.('#p171TerritoryShortcut'),map=e.target.closest?.('#cecV172MapGo'),thermo=e.target.closest?.('#cecV172ThermoGo');
  if(home||map){e.preventDefault();e.stopImmediatePropagation();openMap();}
  else if(thermo){e.preventDefault();e.stopImmediatePropagation();progress();}
},true);
let queued=false;
function refresh(){calendarOnly();ensureTerritories();localize();}
function start(){
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.CongElCalafateVisualV172={version:VERSION,refresh,openMap,progress,calendarUrl};
})();
