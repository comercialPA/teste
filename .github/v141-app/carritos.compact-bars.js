
;(function(){
  'use strict';

  const VERSION='1.4.1';
  const LOCATIONS={
    'carrito-anonima':{label:'La Anónima',subtitle:'Centro',sheetId:'1K4BowT0kvU1zlbMw0M9cFA8ToMp9CaTHSqag64x7UWc'},
    'carrito-anfiteatro':{label:'Anfiteatro',subtitle:'Predicación pública',sheetId:'1SfJQfHRblwVM891QvDnu6fbZewb_l1gx0iYoHIU5YNg'},
    'carrito-terminal':{label:'Terminal de Ómnibus',subtitle:'Predicación pública',sheetId:'1tnW0uSGdfcsO2ldEyyUpLAMO2mI9ttABnzmgSQc2OUE'}
  };
  const DAY_LABEL={lunes:'Lunes',martes:'Martes',miercoles:'Miércoles',jueves:'Jueves',viernes:'Viernes',sabado:'Sábado',domingo:'Domingo'};
  const summaries={};
  let activeId='carrito-anonima';

  function $(s,r=document){return r.querySelector(s);}
  function $$(s,r=document){return Array.from(r.querySelectorAll(s));}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function todayKey(){const d=new Date().getDay();return({1:'lunes',2:'martes',3:'miercoles',4:'jueves',5:'viernes',6:'sabado',0:'domingo'})[d]||'lunes';}
  function parseStart(time){const m=String(time||'').match(/(\d{1,2}):(\d{2})/);if(!m)return null;return Number(m[1])*60+Number(m[2]);}
  function nowMinutes(){const d=new Date();return d.getHours()*60+d.getMinutes();}

  function ensureStyles(){
    if($('#cecV141Style'))return;
    const s=document.createElement('style');s.id='cecV141Style';s.textContent=`
      #cecCarritosLocations{display:none!important}
      .cec-c-summary{display:none!important}
      #cecV141Overview{display:grid;gap:8px;margin:0 0 10px}
      .cec-v141-bar{width:100%;border:1px solid #d7e4e9;background:#fff;border-radius:16px;padding:11px 12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;text-align:left;color:#173042;min-height:66px;box-shadow:0 3px 10px rgba(28,73,91,.05)}
      .cec-v141-bar.active{border-color:#76aebe;background:#f7fbfc;box-shadow:0 6px 16px rgba(11,79,108,.09)}
      .cec-v141-main{min-width:0;display:flex;align-items:center;gap:10px}
      .cec-v141-icon{width:38px;height:38px;border-radius:12px;background:#eaf3f6;color:#0b4f6c;display:grid;place-items:center;font-weight:900;font-size:17px;flex:0 0 auto}
      .cec-v141-bar.active .cec-v141-icon{background:#0b4f6c;color:#fff}
      .cec-v141-copy{min-width:0}.cec-v141-copy strong{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cec-v141-copy small{display:block;color:#758994;font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cec-v141-side{display:flex;align-items:center;gap:8px}.cec-v141-count{min-width:54px;text-align:center;border-radius:12px;padding:7px 8px;background:#eef4f6;color:#536d7a;font-size:10px;font-weight:800;line-height:1.1}.cec-v141-count b{display:block;font-size:15px;color:#264c60;margin-bottom:2px}.cec-v141-count.free{background:#e9f7ef;color:#307457}.cec-v141-count.free b{color:#176c48}.cec-v141-count.full{background:#eef3f5;color:#61727b}
      .cec-v141-chevron{font-size:20px;color:#6c818d;line-height:1;transform:rotate(-90deg)}.cec-v141-bar.active .cec-v141-chevron{transform:rotate(0deg);color:#0b4f6c}
      .cec-v141-subline{grid-column:1/-1;display:none;border-top:1px solid #e8eff2;padding-top:8px;margin-top:1px;font-size:11px;color:#657b87;gap:10px;flex-wrap:wrap}.cec-v141-bar.active .cec-v141-subline{display:flex}
      .cec-v141-stat{display:inline-flex;align-items:center;gap:4px}.cec-v141-dot{width:6px;height:6px;border-radius:50%;background:#89a2ad}.cec-v141-dot.free{background:#3a956b}.cec-v141-dot.busy{background:#5b7180}
      @media(max-width:380px){.cec-v141-count{min-width:48px;padding:6px}.cec-v141-side{gap:5px}.cec-v141-copy strong{font-size:14px}}
    `;document.head.appendChild(s);
  }

  function ensureOverview(){
    const days=$('#cecCarritosDays');if(!days||$('#cecV141Overview'))return;
    const root=document.createElement('div');root.id='cecV141Overview';root.setAttribute('aria-label','Resumen de carritos');days.parentNode.insertBefore(root,days);
    renderOverview();
  }

  function summarize(data){
    const day=todayKey(),shifts=data?.shiftsByDay?.[day]||[];
    let free=0,busy=0;
    shifts.forEach(sh=>sh.slots.forEach(slot=>slot.free?free++:busy++));
    const now=nowMinutes();
    let next=shifts.find(sh=>{const st=parseStart(sh.time);return st!=null&&st>=now;});
    if(!next)next=shifts[0]||null;
    return{free,busy,total:free+busy,next:next?next.time:'Sin turnos',pickup:data?.pickup||'',day:DAY_LABEL[day]||day};
  }

  function barHtml(id){
    const cfg=LOCATIONS[id],sum=summaries[id];
    const isActive=id===activeId;
    const free=sum?sum.free:null,busy=sum?sum.busy:null;
    const status=free==null?'Cargando':free===0?'Completo':`${free} libre${free===1?'':'s'}`;
    const countClass=free===0?'full':'free';
    const next=sum?`Próx. ${sum.next}`:'Leyendo escala...';
    const pickup=sum?.pickup?` · ${sum.pickup}`:'';
    return `<button type="button" class="cec-v141-bar ${isActive?'active':''}" data-v141-location="${id}" aria-expanded="${isActive?'true':'false'}">
      <span class="cec-v141-main"><span class="cec-v141-icon">▦</span><span class="cec-v141-copy"><strong>${esc(cfg.label)}</strong><small>${esc(next)}</small></span></span>
      <span class="cec-v141-side"><span class="cec-v141-count ${countClass}"><b>${free==null?'…':free}</b>${free==null?'vagas':free===0?'completo':'vagas'}</span><span class="cec-v141-chevron">⌄</span></span>
      <span class="cec-v141-subline"><span class="cec-v141-stat"><i class="cec-v141-dot free"></i>${esc(status)}</span><span class="cec-v141-stat"><i class="cec-v141-dot busy"></i>${busy==null?'…':busy} ocupada${busy===1?'':'s'}</span><span class="cec-v141-stat">${sum?esc(sum.day):'Hoje'}${esc(pickup)}</span></span>
    </button>`;
  }

  function renderOverview(){
    const root=$('#cecV141Overview');if(!root)return;
    root.innerHTML=Object.keys(LOCATIONS).map(barHtml).join('');
    $$('[data-v141-location]',root).forEach(b=>b.addEventListener('click',()=>selectLocation(b.dataset.v141Location)));
  }

  function selectLocation(id){
    if(!LOCATIONS[id])return;activeId=id;renderOverview();
    if(window.CongElCalafateCarritos&&typeof window.CongElCalafateCarritos.open==='function')window.CongElCalafateCarritos.open(id);
  }

  function decodeCsv(base64){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));return new TextDecoder('utf-8').decode(bytes);}
  function consume(resourceId,base64){
    if(!LOCATIONS[resourceId])return;
    try{
      const csv=decodeCsv(base64);
      const parser=window.CongElCalafateCarritos&&window.CongElCalafateCarritos.parse;
      if(typeof parser!=='function')return;
      const data=parser(csv,resourceId);summaries[resourceId]=summarize(data);renderOverview();
    }catch(_){/* keep header usable even if one source fails */}
  }

  function refreshAll(){
    if(!(window.AndroidBridge&&typeof window.AndroidBridge.loadSheet==='function'))return;
    Object.entries(LOCATIONS).forEach(([id,c])=>window.AndroidBridge.loadSheet(id,c.sheetId));
  }

  function installReceiver(){
    const prev=window.__cecReceiveSheet;
    window.__cecReceiveSheet=function(resourceId,base64){const result=typeof prev==='function'?prev.apply(this,arguments):undefined;consume(resourceId,base64);return result;};
  }

  function observeScreen(){
    const screen=$('#cecCarritosScreen');if(!screen)return;
    const obs=new MutationObserver(()=>{if(screen.classList.contains('open')){ensureOverview();const active=$('#cecCarritosLocations .cec-chip.active');if(active?.dataset?.cecLocation)activeId=active.dataset.cecLocation;renderOverview();refreshAll();}});
    obs.observe(screen,{attributes:true,attributeFilter:['class']});
  }

  function patchVersionText(){
    const run=()=>{const strong=$('.about-card strong');if(strong)strong.textContent='Aplicación v1.4.1 · carritos compactos y comparables';const p=$('.about-card p');if(p)p.textContent='Los tres carritos aparecen como barras compactas con vacantes, ocupados y próximo turno. Solo el carrito seleccionado despliega la agenda completa.';};
    run();setTimeout(run,700);
  }

  ensureStyles();ensureOverview();installReceiver();observeScreen();patchVersionText();refreshAll();
  window.CongElCalafateCarritosCompact={version:VERSION,refresh:refreshAll};
})();
