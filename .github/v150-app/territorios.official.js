/* V1.5.0 · Territorios oficiales interactivos · fuente: planos originales */
(()=>{
'use strict';
const CEC_TERRITORY_V150=true;
const OFFICIAL=window.CongTerritoryOfficialData||{};
const DATA=OFFICIAL.data||{};
const HOT=OFFICIAL.hotspots||{};
const SOURCE_REFS=OFFICIAL.refs||{};
const STATE_KEY='cec_territory_official_v150';
const OLD_KEY='cec_territory_control_v1';
const MAP_ASSET='territory-map-2026.png';
const SOURCE_FOLDER='https://drive.google.com/drive/folders/1HBsAoYwTSjm5hyrltsPDbI3ayuGhxK1m';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=loadState(),current='1',zoom=1,expanded=null;

function loadState(){
  let out={};
  try{out=JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{};}catch(_){out={};}
  if(!localStorage.getItem(STATE_KEY)){
    try{
      const old=JSON.parse(localStorage.getItem(OLD_KEY)||'{}')||{};
      Object.entries(old).forEach(([n,t])=>{
        out[n]=out[n]||{};
        out[n].driver=t.driver||'';
        out[n].date=t.date||'';
        out[n].notes=t.notes||'';
        out[n].extras=(t.streets||[]).map(x=>({name:x.name||'Tramo anterior',done:!!x.done}));
      });
    }catch(_){}
    save(out);
  }
  return out;
}
function save(v=state){localStorage.setItem(STATE_KEY,JSON.stringify(v));}
function ts(n=current){
  if(!state[n]) state[n]={driver:'',date:'',notes:'',done:{},labels:{},extras:[],updatedAt:''};
  const t=state[n];
  t.done=t.done||{}; t.labels=t.labels||{}; t.extras=Array.isArray(t.extras)?t.extras:[];
  return t;
}
function touch(t=ts()){t.updatedAt=new Date().toISOString();save();}
function sideKey(item,side){return item+'::'+side;}
function metrics(n=current){
  const d=DATA[n],t=ts(n); if(!d)return{done:0,total:0,pct:0};
  let keys=[];
  if(d.type==='tramos') keys=d.items.map(x=>sideKey(x,'territorio'));
  else d.items.forEach(x=>['N','E','S','O'].forEach(s=>keys.push(sideKey(x,s))));
  const done=keys.filter(k=>!!t.done[k]).length,total=keys.length;
  return{done,total,pct:total?Math.round(done*100/total):0};
}
function installStyle(){
  if(document.getElementById('cec-v150-style'))return;
  const s=document.createElement('style');
  s.id='cec-v150-style';
  s.textContent=`
.territory-control-card.cec-v150{padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
.cec-t15{display:grid;gap:14px}
.cec-t15-top,.cec-map-card,.cec-territory-panel{background:#fff;border:1px solid #dbe7ec;border-radius:24px;box-shadow:0 8px 24px rgba(18,61,78,.06)}
.cec-t15-top,.cec-territory-panel{padding:16px}
.cec-t15-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.cec-t15-head h2{margin:2px 0 0;font-size:22px;color:#133d52}
.cec-t15-badge{padding:7px 11px;border-radius:999px;font-weight:800;font-size:12px;background:#eef3f5;color:#5a707a;white-space:nowrap}.cec-t15-badge[data-state="active"]{background:#fff2d8;color:#8a5b00}.cec-t15-badge[data-state="done"]{background:#dff4e8;color:#176b45}
.cec-t15-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.cec-t15-fields label:first-child{grid-column:1/-1}.cec-t15-fields label span,.cec-t15-notes span{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;color:#6e8792;margin:0 0 5px}.cec-t15-fields input,.cec-t15-fields select,.cec-t15-notes textarea{width:100%;border:1px solid #d9e5ea;border-radius:13px;padding:11px 12px;background:#fbfdfe;color:#15394a;font:inherit;box-sizing:border-box}
.cec-t15-progress{margin-top:12px}.cec-t15-progress-meta{display:flex;justify-content:space-between;font-size:12px;color:#58727e;margin-bottom:6px}.cec-t15-track{height:9px;background:#edf3f5;border-radius:99px;overflow:hidden}.cec-t15-track i{display:block;height:100%;width:0;background:#147a5b;border-radius:99px;transition:.25s}
.cec-map-card{overflow:hidden}.cec-map-tools{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-bottom:1px solid #e4edf1}.cec-map-tools strong{color:#153f54}.cec-map-tools small{display:block;color:#78909a;margin-top:2px}.cec-zoom{display:flex;gap:6px}.cec-zoom button{width:38px;height:38px;border:1px solid #d4e2e8;background:#f7fafb;border-radius:12px;font-weight:900;font-size:20px;color:#24536a}
.cec-map-scroll{height:390px;overflow:auto;background:#f3f7f8;overscroll-behavior:contain}.cec-map-stage{position:relative;width:100%;min-width:100%;transition:width .2s}.cec-map-stage img{display:block;width:100%;height:auto;user-select:none}
.cec-hot{position:absolute;transform:translate(-50%,-50%);min-width:29px;height:29px;padding:0 5px;border:2px solid rgba(255,255,255,.95);border-radius:999px;background:#667c86;color:#fff;font-size:11px;font-weight:900;box-shadow:0 2px 5px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center}.cec-hot.partial{background:#d08a18}.cec-hot.done{background:#16835d}.cec-hot.selected{background:#0b5fa5;outline:3px solid rgba(11,95,165,.23);z-index:3}
.cec-map-legend{display:flex;gap:12px;flex-wrap:wrap;padding:9px 14px;border-top:1px solid #e5eef1;font-size:11px;color:#667d87}.cec-map-legend span:before{content:'';display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px;background:#667c86}.cec-map-legend .lpart:before{background:#d08a18}.cec-map-legend .ldone:before{background:#16835d}.cec-map-note{padding:0 14px 12px;font-size:11px;color:#78909a}
.cec-territory-title{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}.cec-territory-title h3{margin:0;color:#163d51;font-size:18px}.cec-territory-title span{font-size:12px;color:#78909a}
.cec-ref-box{background:#f5faf8;border:1px solid #d9ece4;border-radius:16px;padding:10px 12px;margin:10px 0}.cec-ref-box strong{font-size:12px;color:#1e664e}.cec-ref-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.cec-ref-chips span{padding:5px 8px;border-radius:999px;background:#fff;border:1px solid #d7e9e2;font-size:11px;color:#41675a}
.cec-mz-list{display:grid;gap:8px}.cec-mz{border:1px solid #dce7ec;border-radius:16px;overflow:hidden;background:#fbfdfe}.cec-mz-head{width:100%;border:0;background:transparent;padding:12px;display:flex;align-items:center;justify-content:space-between;text-align:left;color:#15394a;font-weight:800}.cec-mz-head span{display:flex;align-items:center;gap:9px}.cec-mz-head em{font-style:normal;font-size:11px;color:#6b838e;font-weight:700}.cec-mz-body{padding:0 10px 10px;display:none}.cec-mz.open .cec-mz-body{display:grid;gap:7px}
.cec-side{display:grid;grid-template-columns:42px 1fr auto;gap:8px;align-items:center;border:1px solid #e0e9ed;border-radius:13px;padding:8px;background:#fff}.cec-side.done{background:#eef9f4;border-color:#b9e3d2}.cec-side b{font-size:12px;color:#49636e}.cec-side input[type=text]{min-width:0;border:0;background:transparent;outline:0;color:#284b5a;font-size:12px;padding:7px}.cec-side button{border:0;border-radius:10px;padding:8px 10px;background:#eaf1f4;color:#47616c;font-weight:800}.cec-side.done button{background:#16835d;color:#fff}
.cec-tramo{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid #dce7ec;border-radius:14px;padding:11px;background:#fbfdfe}.cec-tramo.done{background:#eef9f4;border-color:#b9e3d2}.cec-tramo strong{color:#173e52;font-size:13px}.cec-tramo small{display:block;color:#758c96;margin-top:2px}.cec-tramo button{border:0;border-radius:11px;padding:9px 11px;background:#eaf1f4;color:#47616c;font-weight:800}.cec-tramo.done button{background:#16835d;color:#fff}
.cec-extra{margin-top:12px;border-top:1px solid #e6eef1;padding-top:12px}.cec-extra-add{display:grid;grid-template-columns:1fr auto;gap:8px}.cec-extra-add input{border:1px solid #d9e5ea;border-radius:12px;padding:10px}.cec-extra-add button{border:0;border-radius:12px;background:#164f68;color:#fff;font-weight:800;padding:0 13px}.cec-extra-list{display:grid;gap:6px;margin-top:8px}.cec-extra-row{display:flex;gap:8px;align-items:center;border:1px solid #e1e9ed;border-radius:12px;padding:8px 10px}.cec-extra-row span{flex:1;font-size:12px;color:#3e5c69}.cec-extra-row button{border:0;background:transparent;font-weight:900;color:#7c919a}
.cec-t15-notes{display:block;margin-top:12px}.cec-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.cec-actions button,.cec-source-btn{border:1px solid #d5e2e8;background:#f8fbfc;border-radius:12px;padding:9px 11px;font-weight:800;color:#345a6b;text-decoration:none;font-size:12px}.cec-actions .danger{color:#9a3b3b;background:#fff7f7;border-color:#efd5d5}.cec-local-note{font-size:11px;color:#78909a;margin:9px 2px 0}
@media(max-width:520px){.cec-map-scroll{height:340px}.cec-t15-fields{grid-template-columns:1fr}.cec-t15-fields label:first-child{grid-column:auto}.cec-side{grid-template-columns:38px 1fr auto}}
`;
  document.head.appendChild(s);
}
function mount(){
  const card=document.querySelector('.territory-control-card'); if(!card)return;
  installStyle(); card.classList.add('cec-v150');
  card.innerHTML=`<div class="cec-t15">
    <section class="cec-t15-top">
      <div class="cec-t15-head"><div><p class="section-kicker">MAPA OFICIAL · CONTROL POR LADO</p><h2>Territorios 1–102</h2></div><span id="t15Badge" class="cec-t15-badge">Sin iniciar</span></div>
      <div class="cec-t15-fields"><label><span>Territorio</span><select id="t15Select"></select></label><label><span>Conductor</span><input id="t15Driver" autocomplete="off" placeholder="Nombre"></label><label><span>Fecha</span><input id="t15Date" type="date"></label></div>
      <div class="cec-t15-progress"><div class="cec-t15-progress-meta"><span id="t15ProgressLabel"></span><strong id="t15Pct">0%</strong></div><div class="cec-t15-track"><i id="t15Bar"></i></div></div>
    </section>
    <section class="cec-map-card">
      <div class="cec-map-tools"><div><strong>Mapa de territorios</strong><small>Fuente original de la congregación · archivo disponible en 2026</small></div><div class="cec-zoom"><button id="t15Minus" aria-label="Alejar">−</button><button id="t15Plus" aria-label="Acercar">+</button></div></div>
      <div id="t15MapScroll" class="cec-map-scroll"><div id="t15MapStage" class="cec-map-stage"><img src="${MAP_ASSET}" alt="Mapa oficial de territorios de El Calafate"><div id="t15Hotspots"></div></div></div>
      <div class="cec-map-legend"><span>Sin iniciar</span><span class="lpart">En curso</span><span class="ldone">Completado</span></div>
      <div class="cec-map-note">El archivo disponible en la carpeta 2026 conserva dentro del plano el rótulo “Mapa de territorio 2023”. No se altera el original.</div>
    </section>
    <section class="cec-territory-panel">
      <div class="cec-territory-title"><h3 id="t15Title">Territorio 1</h3><span id="t15Count"></span></div>
      <div id="t15Refs"></div><div id="t15Items"></div>
      <div class="cec-extra"><strong style="font-size:12px;color:#345a6b">Lado/tramo especial</strong><div class="cec-extra-add"><input id="t15ExtraInput" placeholder="Ej.: lado de calle sin nombre / vivienda aislada"><button id="t15ExtraAdd">Añadir</button></div><div id="t15ExtraList" class="cec-extra-list"></div></div>
      <label class="cec-t15-notes"><span>Observaciones</span><textarea id="t15Notes" rows="3" placeholder="Referencias, viviendas pendientes, horario para volver..."></textarea></label>
      <div class="cec-actions"><a class="cec-source-btn" href="${SOURCE_FOLDER}">Ver originales</a><button id="t15MarkAll">Marcar todo</button><button id="t15Unmark">Desmarcar</button><button id="t15Reset" class="danger">Reiniciar territorio</button></div>
      <p class="cec-local-note">Guardado en este teléfono. En calles que limitan con otro territorio, se registra únicamente el lado perteneciente al territorio seleccionado.</p>
    </section>
  </div>`;
  const sel=document.getElementById('t15Select');
  sel.innerHTML=Array.from({length:102},(_,i)=>`<option value="${i+1}">Territorio ${i+1}</option>`).join('');
  sel.value=current;
  sel.addEventListener('change',()=>select(sel.value,true));
  document.getElementById('t15Driver').addEventListener('input',e=>{const t=ts();t.driver=e.target.value;touch(t)});
  document.getElementById('t15Date').addEventListener('change',e=>{const t=ts();t.date=e.target.value;touch(t)});
  document.getElementById('t15Notes').addEventListener('input',e=>{const t=ts();t.notes=e.target.value;touch(t)});
  document.getElementById('t15Plus').onclick=()=>setZoom(zoom+.25);
  document.getElementById('t15Minus').onclick=()=>setZoom(zoom-.25);
  document.getElementById('t15ExtraAdd').onclick=addExtra;
  document.getElementById('t15MarkAll').onclick=()=>markAll(true);
  document.getElementById('t15Unmark').onclick=()=>markAll(false);
  document.getElementById('t15Reset').onclick=reset;
  renderHot(); select(current,false);
  const oldTitle=document.querySelector('.territory-resources-title .section-kicker');
  if(oldTitle)oldTitle.textContent='Documentos, planillas y otros recursos';
}
function renderHot(){
  const root=document.getElementById('t15Hotspots');
  root.innerHTML=Object.entries(HOT).map(([n,p])=>`<button class="cec-hot" data-territory="${n}" style="left:${p.x}%;top:${p.y}%">${n}</button>`).join('');
  root.querySelectorAll('button').forEach(b=>b.onclick=()=>select(b.dataset.territory,true));
  updateHot();
}
function updateHot(){
  document.querySelectorAll('.cec-hot').forEach(b=>{
    const m=metrics(b.dataset.territory);
    b.className='cec-hot'+(m.pct===100?' done':m.done?' partial':'')+(b.dataset.territory===current?' selected':'');
  });
}
function setZoom(v){zoom=Math.max(1,Math.min(3,v));const stage=document.getElementById('t15MapStage');if(stage)stage.style.width=(zoom*100)+'%';}
function focusMap(){
  const b=document.querySelector(`.cec-hot[data-territory="${current}"]`),sc=document.getElementById('t15MapScroll');
  if(!b||!sc)return;
  setTimeout(()=>sc.scrollTo({left:Math.max(0,b.offsetLeft-sc.clientWidth/2),top:Math.max(0,b.offsetTop-sc.clientHeight/2),behavior:'smooth'}),80);
}
function select(n,focus){
  current=String(n); expanded=null;
  document.getElementById('t15Select').value=current;
  const t=ts();
  document.getElementById('t15Driver').value=t.driver||'';
  document.getElementById('t15Date').value=t.date||'';
  document.getElementById('t15Notes').value=t.notes||'';
  render();
  if(focus){setZoom(1.75);focusMap();}
}
function render(){
  const d=DATA[current],m=metrics();
  document.getElementById('t15Title').textContent='Territorio '+current;
  document.getElementById('t15Count').textContent=d.type==='tramos'?`${d.items.length} tramos oficiales`:`${d.items.length} manzanas · ${m.total} lados`;
  document.getElementById('t15ProgressLabel').textContent=`${m.done} de ${m.total} lados/tramos`;
  document.getElementById('t15Pct').textContent=m.pct+'%';
  document.getElementById('t15Bar').style.width=m.pct+'%';
  const badge=document.getElementById('t15Badge');
  badge.textContent=m.pct===100?'Completado':m.done?'En curso':'Sin iniciar';
  badge.dataset.state=m.pct===100?'done':m.done?'active':'empty';
  renderRefs(); renderItems(); renderExtras(); updateHot();
}
function renderRefs(){
  const root=document.getElementById('t15Refs'),r=SOURCE_REFS[current]||[];
  root.innerHTML=`<div class="cec-ref-box"><strong>Referencias del original</strong><div class="cec-ref-chips">${r.length?r.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Las referencias se conservan visibles en el plano oficial.</span>'}</div></div>`;
}
function renderItems(){
  const root=document.getElementById('t15Items'),d=DATA[current],t=ts();
  if(d.type==='tramos'){
    root.className='cec-mz-list';
    root.innerHTML=d.items.map(item=>{
      const k=sideKey(item,'territorio'),done=!!t.done[k];
      return `<div class="cec-tramo ${done?'done':''}"><div><strong>${esc(item)}</strong><small>Marcar únicamente el lado que pertenece al Territorio 100.</small></div><button data-tramo="${esc(item)}">${done?'✓ Hecho':'Marcar'}</button></div>`;
    }).join('');
    root.querySelectorAll('[data-tramo]').forEach(b=>b.onclick=()=>toggle(sideKey(b.dataset.tramo,'territorio')));
    return;
  }
  root.className='cec-mz-list';
  root.innerHTML=d.items.map((item,idx)=>{
    let done=0;['N','E','S','O'].forEach(s=>done+=t.done[sideKey(item,s)]?1:0);
    const open=expanded===idx;
    return `<div class="cec-mz ${open?'open':''}"><button class="cec-mz-head" data-open="${idx}"><span>${esc(item)} <em>${done}/4 lados</em></span><b>${open?'⌃':'⌄'}</b></button><div class="cec-mz-body">${['N','E','S','O'].map(s=>sideRow(item,s)).join('')}</div></div>`;
  }).join('');
  root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.open);expanded=expanded===i?null:i;renderItems();});
  root.querySelectorAll('[data-side-toggle]').forEach(b=>b.onclick=()=>toggle(b.dataset.sideToggle));
  root.querySelectorAll('[data-label-key]').forEach(inp=>inp.onchange=()=>{t.labels[inp.dataset.labelKey]=inp.value.trim();touch(t)});
}
function sideRow(item,s){
  const t=ts(),k=sideKey(item,s),done=!!t.done[k],label=t.labels[k]||'',names={N:'Norte',E:'Este',S:'Sur',O:'Oeste'};
  return `<div class="cec-side ${done?'done':''}"><b>${names[s]}</b><input type="text" data-label-key="${esc(k)}" value="${esc(label)}" placeholder="Calle / referencia de este lado"><button data-side-toggle="${esc(k)}">${done?'✓':'Marcar'}</button></div>`;
}
function toggle(k){const t=ts();t.done[k]=!t.done[k];touch(t);render();}
function markAll(v){
  const d=DATA[current],t=ts();
  if(d.type==='tramos')d.items.forEach(x=>t.done[sideKey(x,'territorio')]=v);
  else d.items.forEach(x=>['N','E','S','O'].forEach(s=>t.done[sideKey(x,s)]=v));
  touch(t);render();
}
function addExtra(){
  const input=document.getElementById('t15ExtraInput'),name=(input.value||'').trim().replace(/\s+/g,' ');
  if(!name)return;
  const t=ts();t.extras.push({name,done:false});input.value='';touch(t);renderExtras();
}
function renderExtras(){
  const root=document.getElementById('t15ExtraList'),t=ts();
  root.innerHTML=t.extras.map((x,i)=>`<div class="cec-extra-row"><input type="checkbox" data-extra-check="${i}" ${x.done?'checked':''}><span>${esc(x.name)}</span><button data-extra-remove="${i}">×</button></div>`).join('');
  root.querySelectorAll('[data-extra-check]').forEach(x=>x.onchange=()=>{t.extras[+x.dataset.extraCheck].done=x.checked;touch(t)});
  root.querySelectorAll('[data-extra-remove]').forEach(x=>x.onclick=()=>{t.extras.splice(+x.dataset.extraRemove,1);touch(t);renderExtras()});
}
function reset(){
  if(!confirm(`¿Reiniciar el Territorio ${current}? Se borrará el progreso de lados/tramos guardado en este teléfono.`))return;
  const keep={driver:ts().driver||'',date:ts().date||''};
  state[current]={driver:keep.driver,date:keep.date,notes:'',done:{},labels:{},extras:[],updatedAt:new Date().toISOString()};
  save(); select(current,false);
}
mount();
window.CongElCalafateTerritoriosV150={version:'1.5.0',data:DATA,hotspots:HOT,select};
})();
