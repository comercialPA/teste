/* Congregación El Calafate · V1.7.1 behavior refinements */
(()=>{
'use strict';
const VERSION='1.7.1';
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
function refresh(){addTerritoryShortcut();improveMapScroll();const about=$('.about-card strong');if(about)about.textContent='Aplicación v1.7.1 · Visual System 2026';}
function observe(){let queued=false;const mo=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})});mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});refresh();setInterval(()=>{addTerritoryShortcut();improveMapScroll()},2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.CongElCalafateVisualV171={version:VERSION,globalMetric,refresh};
})();
