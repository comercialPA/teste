
;(function(){
  'use strict';

  const VERSION='1.4.0';
  const LOCATIONS={
    'carrito-anonima':{label:'La Anónima',subtitle:'Centro',sheetId:'1K4BowT0kvU1zlbMw0M9cFA8ToMp9CaTHSqag64x7UWc'},
    'carrito-anfiteatro':{label:'Anfiteatro',subtitle:'Predicación pública',sheetId:'1SfJQfHRblwVM891QvDnu6fbZewb_l1gx0iYoHIU5YNg'},
    'carrito-terminal':{label:'Terminal de Ómnibus',subtitle:'Predicación pública',sheetId:'1tnW0uSGdfcsO2ldEyyUpLAMO2mI9ttABnzmgSQc2OUE'}
  };
  const DAY_ORDER=['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const DAY_LABEL={lunes:'Lunes',martes:'Martes',miercoles:'Miércoles',jueves:'Jueves',viernes:'Viernes',sabado:'Sábado',domingo:'Domingo'};
  const OVERRIDES_KEY='cec_carritos_v140_overrides';
  const RECENT_KEY='cec_carritos_v140_recent';
  const CACHE_PREFIX='cec_carritos_v140_csv_';

  let currentLocation='carrito-anonima';
  let currentDay=todayKey();
  let currentData=null;
  let currentPicker=null;

  function $(sel,root=document){return root.querySelector(sel);}
  function $$(sel,root=document){return Array.from(root.querySelectorAll(sel));}
  function norm(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function key(v){return norm(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function todayKey(){const d=new Date().getDay();return({1:'lunes',2:'martes',3:'miercoles',4:'jueves',5:'viernes',6:'sabado',0:'domingo'})[d]||'lunes';}
  function safeJson(text,fallback){try{return JSON.parse(text);}catch(_){return fallback;}}
  function getOverrides(){return safeJson(localStorage.getItem(OVERRIDES_KEY)||'{}',{});}
  function setOverrides(v){localStorage.setItem(OVERRIDES_KEY,JSON.stringify(v));}
  function getRecent(){return safeJson(localStorage.getItem(RECENT_KEY)||'[]',[]);}
  function rememberName(name){const n=norm(name);if(!n)return;const arr=[n,...getRecent().filter(x=>key(x)!==key(n))].slice(0,8);localStorage.setItem(RECENT_KEY,JSON.stringify(arr));}

  function parseCsv(text){
    const rows=[];let row=[],cell='',quoted=false;text=String(text||'').replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){if(ch==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(ch==='"')quoted=false;else cell+=ch;}
      else{if(ch==='"')quoted=true;else if(ch===','){row.push(cell);cell='';}else if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=ch;}
    }
    if(cell!==''||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}return rows;
  }

  function dayFromText(v){const k=key(v);if(k.includes('lunes'))return'lunes';if(k.includes('martes'))return'martes';if(k.includes('miercoles'))return'miercoles';if(k.includes('jueves'))return'jueves';if(k.includes('viernes'))return'viernes';if(k.includes('sabado'))return'sabado';if(k.includes('domingo'))return'domingo';return'';}

  function parseCarritoCsv(csv,resourceId){
    const rows=parseCsv(csv);
    let headerIndex=rows.findIndex(r=>key(r[0])==='hora'&&r.some(c=>key(c).startsWith('publicador 1')));
    if(headerIndex<0)headerIndex=rows.findIndex(r=>r.some(c=>key(c)==='hora'));
    if(headerIndex<0)throw new Error('No se encontró la estructura de horarios.');
    const header=rows[headerIndex]||[],dayRow=rows[Math.max(0,headerIndex-1)]||[],groups=[];
    for(let c=0;c<header.length;c++)if(key(header[c]).startsWith('publicador 1')){
      let rawDay=norm(dayRow[c]);
      if(!rawDay)for(let p=c;p>=Math.max(0,c-2);p--)if(norm(dayRow[p])){rawDay=norm(dayRow[p]);break;}
      const dk=dayFromText(rawDay)||DAY_ORDER[groups.length]||('dia'+groups.length);
      groups.push({day:dk,label:DAY_LABEL[dk]||rawDay||`Día ${groups.length+1}`,cols:[c,c+1,c+2]});
    }
    if(!groups.length)throw new Error('No se encontraron días en la escala.');
    const shiftsByDay={};groups.forEach(g=>shiftsByDay[g.day]=[]);
    for(let r=headerIndex+1;r<rows.length;r++){
      const time=norm(rows[r]?.[0]);if(!time){if(r>headerIndex+7)break;continue;}if(!/\d{1,2}:?\d{0,2}/.test(time))continue;
      groups.forEach(g=>{const slots=g.cols.map((col,idx)=>{const value=norm(rows[r]?.[col])||'LIBRE';return{slot:idx+1,value,free:key(value)==='libre',optional:idx===2};});shiftsByDay[g.day].push({time,slots,row:r+1});});
    }
    const namesMap=new Map();
    Object.values(shiftsByDay).flat().forEach(shift=>shift.slots.forEach(s=>{if(!s.free&&norm(s.value).length>2)namesMap.set(key(s.value),norm(s.value));}));
    const startNames=Math.min(rows.length,Math.max(headerIndex+25,45));
    for(let r=startNames;r<rows.length;r++){
      const candidate=norm(rows[r]?.[1]),k=key(candidate);
      if(!candidate||k==='libre'||candidate.length<3)continue;
      if(/pautas|predicacion publica|lugar dnde|publicador/i.test(candidate))continue;
      namesMap.set(k,candidate);
    }
    const names=Array.from(namesMap.values()).sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
    const pickup=norm(rows[4]?.[1]||'');
    return{resourceId,location:LOCATIONS[resourceId],groups,shiftsByDay,names,pickup,loadedAt:new Date().toISOString()};
  }

  function injectStyles(){
    if($('#cecCarritosStyle'))return;const style=document.createElement('style');style.id='cecCarritosStyle';style.textContent=`
#cecCarritosScreen{position:fixed;inset:0;z-index:5000;background:#f4f8fa;color:#173042;display:none;overflow:auto;-webkit-overflow-scrolling:touch;padding-bottom:28px}#cecCarritosScreen.open{display:block}
.cec-c-head{position:sticky;top:0;z-index:5;background:#0b4f6c;color:#fff;display:flex;align-items:center;gap:10px;padding:10px 12px;min-height:58px;box-shadow:0 2px 10px rgba(0,0,0,.08)}.cec-c-back{width:44px;height:44px;border:0;border-radius:14px;background:rgba(255,255,255,.12);color:#fff;font-size:28px;line-height:1}.cec-c-head-title{min-width:0;flex:1}.cec-c-head-title small{display:block;font-size:10px;letter-spacing:.1em;opacity:.75;font-weight:800}.cec-c-head-title strong{display:block;font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cec-c-refresh{height:42px;border:0;border-radius:13px;background:#fff;color:#0b4f6c;padding:0 13px;font-weight:800}
.cec-c-wrap{max-width:760px;margin:0 auto;padding:14px}.cec-c-summary{background:linear-gradient(135deg,#0b4f6c,#14759a);color:#fff;border-radius:24px;padding:18px;margin-bottom:13px;box-shadow:0 12px 28px rgba(11,79,108,.17)}.cec-c-summary .ey{font-size:11px;letter-spacing:.12em;font-weight:900;opacity:.78}.cec-c-summary h2{font-size:24px;margin:4px 0 3px}.cec-c-summary p{margin:0;opacity:.82;font-size:13px}
.cec-c-locations,.cec-c-days{display:flex;gap:8px;overflow:auto;padding:3px 1px 10px;scrollbar-width:none}.cec-c-locations::-webkit-scrollbar,.cec-c-days::-webkit-scrollbar{display:none}.cec-chip{border:1px solid #d4e2e8;background:#fff;color:#315164;border-radius:999px;padding:10px 14px;font-size:13px;font-weight:800;white-space:nowrap;min-height:42px}.cec-chip.active{background:#0b4f6c;color:#fff;border-color:#0b4f6c}
.cec-c-tools{display:flex;gap:8px;margin:2px 0 12px}.cec-c-search{flex:1;min-width:0;border:1px solid #d5e2e8;background:#fff;border-radius:15px;padding:0 13px;height:46px;font-size:16px}.cec-c-toggle{border:1px solid #d5e2e8;background:#fff;border-radius:15px;padding:0 12px;font-weight:800;color:#315164}.cec-c-toggle.active{background:#e6f4f8;border-color:#88bcca;color:#0b4f6c}.cec-c-status{font-size:12px;color:#647b88;padding:0 3px 9px}.cec-c-status.error{color:#9b2d30}.cec-c-status.ok{color:#246a4d}
.cec-shifts{display:grid;gap:10px}.cec-shift{background:#fff;border:1px solid #dae6eb;border-radius:20px;padding:14px}.cec-shift-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.cec-shift-time{font-size:18px;font-weight:900;color:#143d52}.cec-shift-count{font-size:11px;font-weight:900;border-radius:999px;padding:6px 9px;background:#edf4f7;color:#57707d}.cec-shift-count.has-free{background:#e7f6ee;color:#26724e}.cec-slots{display:grid;gap:8px}.cec-slot{min-height:50px;border-radius:15px;border:1px solid #e1eaee;display:flex;align-items:center;gap:10px;padding:9px 11px;background:#fbfdfe}.cec-slot-num{width:30px;height:30px;border-radius:10px;background:#edf3f6;display:grid;place-items:center;font-weight:900;color:#607784;flex:0 0 auto}.cec-slot-body{min-width:0;flex:1}.cec-slot-body strong{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cec-slot-body small{display:block;color:#7b8f99;font-size:11px;margin-top:2px}.cec-slot-free{border-style:dashed;border-color:#9ecbbc;background:#f2fbf7}.cec-slot-free .cec-slot-num{background:#dff3e9;color:#26724e}.cec-claim{border:0;border-radius:12px;background:#0b6b4f;color:white;font-weight:900;padding:10px 12px;min-height:40px}.cec-local-tag{font-size:10px;background:#fff2ce;color:#725a16;border-radius:999px;padding:4px 7px;font-weight:800}.cec-clear-local{border:0;background:transparent;color:#8a5555;font-size:18px;padding:6px}
.cec-empty{background:#fff;border:1px dashed #cbdce3;border-radius:18px;padding:24px;text-align:center;color:#647b88}.cec-c-footnote{font-size:11px;color:#718792;line-height:1.45;margin:14px 3px 0}.cec-picker{position:fixed;inset:0;z-index:6000;background:rgba(9,35,48,.56);display:none;align-items:flex-end}.cec-picker.open{display:flex}.cec-picker-sheet{background:#fff;width:100%;max-height:86%;border-radius:25px 25px 0 0;padding:15px;display:flex;flex-direction:column;gap:10px}.cec-picker-head{display:flex;align-items:center;gap:10px}.cec-picker-head div{min-width:0;flex:1}.cec-picker-head small{color:#6a808c}.cec-picker-head strong{display:block;font-size:19px}.cec-picker-close{width:44px;height:44px;border:0;border-radius:13px;background:#eef3f5;font-size:24px}.cec-picker-search{height:48px;border:1px solid #cbdde4;border-radius:15px;padding:0 14px;font-size:16px}.cec-name-list{overflow:auto;display:grid;gap:7px;padding-bottom:10px}.cec-name{border:1px solid #dce7eb;background:#fff;border-radius:14px;text-align:left;padding:12px 13px;font-size:14px;font-weight:750;color:#243e4c}.cec-name.recent:after{content:'Reciente';float:right;font-size:10px;color:#6b7f8a;font-weight:700}.cec-picker-meta{font-size:12px;color:#6d828e}
.cec-home-carritos{width:100%;border:0;text-align:left;background:linear-gradient(135deg,#0b4f6c,#14759a);color:#fff;border-radius:20px;padding:15px;display:flex;align-items:center;gap:12px;box-shadow:0 10px 24px rgba(11,79,108,.14)}.cec-home-carritos .ic{width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.13);display:grid;place-items:center;font-size:22px}.cec-home-carritos strong{display:block;font-size:15px}.cec-home-carritos small{display:block;opacity:.78;margin-top:2px}.cec-home-carritos .arr{margin-left:auto;font-size:24px}@media(min-width:650px){.cec-picker{align-items:center;justify-content:center}.cec-picker-sheet{max-width:520px;border-radius:25px;max-height:80%}}
`;
    document.head.appendChild(style);
  }

  function injectUi(){
    if($('#cecCarritosScreen'))return;
    const screen=document.createElement('section');screen.id='cecCarritosScreen';screen.setAttribute('aria-label','Carritos');screen.innerHTML=`
<header class="cec-c-head"><button type="button" class="cec-c-back" aria-label="Volver">‹</button><div class="cec-c-head-title"><small>CARRITOS · ESCALA</small><strong>Predicación pública</strong></div><button type="button" class="cec-c-refresh">Actualizar</button></header>
<div class="cec-c-wrap"><section class="cec-c-summary"><div class="ey">ORGANIZACIÓN</div><h2 id="cecCarritosLocationTitle">Carritos</h2><p id="cecCarritosPickup">Elegí un lugar para ver los turnos.</p></section><div id="cecCarritosLocations" class="cec-c-locations"></div><div id="cecCarritosDays" class="cec-c-days"></div><div class="cec-c-tools"><input id="cecCarritosSearch" class="cec-c-search" type="search" placeholder="Buscar nombre u horario..."><button id="cecOnlyFree" type="button" class="cec-c-toggle">Solo libres</button></div><div id="cecCarritosStatus" class="cec-c-status">Preparando escala...</div><div id="cecCarritosShifts" class="cec-shifts"></div><p class="cec-c-footnote">La escala se lee de la planilla original. Los nombres añadidos desde esta versión quedan guardados en este teléfono y se muestran junto a la escala actual.</p></div>`;document.body.appendChild(screen);
    const picker=document.createElement('div');picker.id='cecCarritosPicker';picker.className='cec-picker';picker.innerHTML=`<div class="cec-picker-sheet" role="dialog" aria-modal="true" aria-labelledby="cecPickerTitle"><div class="cec-picker-head"><div><small id="cecPickerMeta">Vaga</small><strong id="cecPickerTitle">¿Quién se ofrece?</strong></div><button type="button" class="cec-picker-close" aria-label="Cerrar">×</button></div><input id="cecPickerSearch" class="cec-picker-search" type="search" placeholder="Buscar publicador..." autocomplete="off"><div id="cecPickerCount" class="cec-picker-meta"></div><div id="cecPickerNames" class="cec-name-list"></div></div>`;document.body.appendChild(picker);
    $('.cec-c-back',screen).addEventListener('click',closeCarritos);$('.cec-c-refresh',screen).addEventListener('click',()=>loadLocation(currentLocation,true));$('#cecCarritosSearch').addEventListener('input',renderShifts);$('#cecOnlyFree').addEventListener('click',e=>{e.currentTarget.classList.toggle('active');renderShifts();});$('.cec-picker-close',picker).addEventListener('click',closePicker);picker.addEventListener('click',e=>{if(e.target===picker)closePicker();});$('#cecPickerSearch').addEventListener('input',renderNameList);
  }

  function injectEntrypoints(){
    const grid=$('#quickGrid');if(grid&&!$('#cecHomeCarritos')){const b=document.createElement('button');b.type='button';b.id='cecHomeCarritos';b.className='cec-home-carritos';b.innerHTML='<span class="ic">▦</span><span><strong>Carritos · ocupar turnos</strong><small>Ver La Anónima, Anfiteatro y Terminal</small></span><span class="arr">›</span>';b.addEventListener('click',()=>openCarritos('carrito-anonima'));grid.prepend(b);}
    const title=$('.territory-resources-title');if(title&&!$('#cecTerritoryCarritos')){const b=document.createElement('button');b.type='button';b.id='cecTerritoryCarritos';b.className='cec-home-carritos';b.style.margin='0 0 16px';b.innerHTML='<span class="ic">▦</span><span><strong>Escala de carritos</strong><small>Turnos, vacantes y lista de publicadores</small></span><span class="arr">›</span>';b.addEventListener('click',()=>openCarritos('carrito-anonima'));title.parentNode.insertBefore(b,title);}
    const about=$('.about-card strong');if(about)about.textContent='Aplicación v1.4.0 · carritos como app, no como planilla';const aboutP=$('.about-card p');if(aboutP)aboutP.textContent='Carritos ahora se visualiza como una agenda de turnos con vacantes y selección de publicadores. Las planillas quedan como fuente de datos.';
  }

  function openCarritos(resourceId){if(!LOCATIONS[resourceId])resourceId='carrito-anonima';currentLocation=resourceId;$('#cecCarritosScreen').classList.add('open');document.body.style.overflow='hidden';renderLocationChips();renderDayChips();if(location.hash!=='#carritos')history.pushState({cecCarritos:true},'','#carritos');loadLocation(resourceId,false);}
  function closeCarritos(){if(location.hash==='#carritos'){history.back();return;}hideCarritos();}
  function hideCarritos(){$('#cecCarritosScreen')?.classList.remove('open');document.body.style.overflow='';closePicker();}
  function renderLocationChips(){const root=$('#cecCarritosLocations');if(!root)return;root.innerHTML=Object.entries(LOCATIONS).map(([id,c])=>`<button type="button" class="cec-chip ${id===currentLocation?'active':''}" data-cec-location="${id}">${esc(c.label)}</button>`).join('');$$('[data-cec-location]',root).forEach(b=>b.addEventListener('click',()=>{currentLocation=b.dataset.cecLocation;renderLocationChips();loadLocation(currentLocation,false);}));}
  function renderDayChips(){const root=$('#cecCarritosDays');if(!root)return;root.innerHTML=DAY_ORDER.map(d=>`<button type="button" class="cec-chip ${d===currentDay?'active':''}" data-cec-day="${d}">${DAY_LABEL[d]}</button>`).join('');$$('[data-cec-day]',root).forEach(b=>b.addEventListener('click',()=>{currentDay=b.dataset.cecDay;renderDayChips();renderShifts();}));}

  function loadLocation(resourceId,force){
    const cfg=LOCATIONS[resourceId];if(!cfg)return;currentData=null;$('#cecCarritosLocationTitle').textContent=cfg.label;$('#cecCarritosPickup').textContent=cfg.subtitle;setStatus(force?'Actualizando escala...':'Cargando escala...','');$('#cecCarritosShifts').innerHTML='<div class="cec-empty">Leyendo horarios y nombres...</div>';
    if(!force){const cached=localStorage.getItem(CACHE_PREFIX+resourceId);if(cached)try{receiveCsv(resourceId,cached,true);}catch(_){}}
    if(window.AndroidBridge&&typeof window.AndroidBridge.loadSheet==='function')window.AndroidBridge.loadSheet(resourceId,cfg.sheetId);else if(!currentData)setStatus('La actualización automática está disponible en el APK Android.','error');
  }

  function receiveCsv(resourceId,csv,fromCache){
    if(!LOCATIONS[resourceId])return false;
    try{const data=parseCarritoCsv(csv,resourceId);if(!fromCache)localStorage.setItem(CACHE_PREFIX+resourceId,csv);if(resourceId===currentLocation&&$('#cecCarritosScreen')?.classList.contains('open')){currentData=data;const availableDays=data.groups.map(g=>g.day);if(!availableDays.includes(currentDay))currentDay=availableDays[0]||'lunes';renderDayChips();$('#cecCarritosPickup').textContent=data.pickup?`Retiro del carrito: ${data.pickup}`:LOCATIONS[resourceId].subtitle;setStatus(fromCache?'Mostrando la última copia guardada; actualizando...':`Actualizado · ${data.names.length} publicadores disponibles`,'ok');renderShifts();}return true;}catch(err){if(resourceId===currentLocation)setStatus('No se pudo interpretar esta escala. '+norm(err.message),'error');return true;}
  }

  function overrideId(resourceId,day,time,slot){return[resourceId,day,key(time),slot].join('|');}
  function effectiveSlot(day,time,slotObj){const ovs=getOverrides(),id=overrideId(currentLocation,day,time,slotObj.slot),ov=ovs[id];if(ov&&ov.name)return{...slotObj,value:ov.name,free:false,local:true,overrideId:id};return{...slotObj,local:false,overrideId:id};}
  function renderShifts(){
    const root=$('#cecCarritosShifts');if(!root)return;if(!currentData){root.innerHTML='<div class="cec-empty">Cargando escala...</div>';return;}
    const query=key($('#cecCarritosSearch')?.value||''),onlyFree=$('#cecOnlyFree')?.classList.contains('active');let shifts=(currentData.shiftsByDay[currentDay]||[]).map(s=>({...s,slots:s.slots.map(x=>effectiveSlot(currentDay,s.time,x))}));if(onlyFree)shifts=shifts.filter(s=>s.slots.some(x=>x.free));if(query)shifts=shifts.filter(s=>key(s.time).includes(query)||s.slots.some(x=>key(x.value).includes(query)));if(!shifts.length){root.innerHTML='<div class="cec-empty">No hay turnos que coincidan con este filtro.</div>';return;}
    root.innerHTML=shifts.map(shift=>{const free=shift.slots.filter(s=>s.free).length;return`<article class="cec-shift"><div class="cec-shift-top"><span class="cec-shift-time">${esc(shift.time)}</span><span class="cec-shift-count ${free?'has-free':''}">${free?free+' '+(free===1?'vacante':'vacantes'):'Completo'}</span></div><div class="cec-slots">${shift.slots.map(s=>renderSlot(shift,s)).join('')}</div></article>`;}).join('');$$('[data-claim]',root).forEach(b=>b.addEventListener('click',()=>openPicker(b.dataset.day,b.dataset.time,Number(b.dataset.slot))));$$('[data-clear-local]',root).forEach(b=>b.addEventListener('click',()=>clearLocal(b.dataset.clearLocal)));
  }
  function renderSlot(shift,s){const optional=s.optional?' · opcional':'';if(s.free)return`<div class="cec-slot cec-slot-free"><span class="cec-slot-num">${s.slot}</span><div class="cec-slot-body"><strong>Vacante disponible</strong><small>Publicador ${s.slot}${optional}</small></div><button type="button" class="cec-claim" data-claim="1" data-day="${currentDay}" data-time="${esc(shift.time)}" data-slot="${s.slot}">Ocupar</button></div>`;return`<div class="cec-slot"><span class="cec-slot-num">${s.slot}</span><div class="cec-slot-body"><strong>${esc(s.value)}</strong><small>Publicador ${s.slot}${optional} ${s.local?'<span class="cec-local-tag">este teléfono</span>':''}</small></div>${s.local?`<button type="button" class="cec-clear-local" data-clear-local="${esc(s.overrideId)}" aria-label="Quitar asignación local">×</button>`:''}</div>`;}

  function openPicker(day,time,slot){if(!currentData)return;currentPicker={day,time,slot};$('#cecPickerMeta').textContent=`${DAY_LABEL[day]||day} · ${time} · lugar ${slot}`;$('#cecPickerSearch').value='';$('#cecCarritosPicker').classList.add('open');renderNameList();setTimeout(()=>$('#cecPickerSearch')?.focus(),80);}
  function closePicker(){$('#cecCarritosPicker')?.classList.remove('open');currentPicker=null;}
  function renderNameList(){const root=$('#cecPickerNames');if(!root||!currentData)return;const q=key($('#cecPickerSearch')?.value||''),recent=getRecent(),recentKeys=new Set(recent.map(key));let names=currentData.names.filter(n=>!q||key(n).includes(q));names.sort((a,b)=>{const ar=recentKeys.has(key(a))?0:1,br=recentKeys.has(key(b))?0:1;return ar-br||a.localeCompare(b,'es',{sensitivity:'base'});});$('#cecPickerCount').textContent=`${names.length} ${names.length===1?'nombre':'nombres'}`;root.innerHTML=names.slice(0,160).map(n=>`<button type="button" class="cec-name ${recentKeys.has(key(n))?'recent':''}" data-name="${esc(n)}">${esc(n)}</button>`).join('')||'<div class="cec-empty">No se encontró ese nombre.</div>';$$('[data-name]',root).forEach(b=>b.addEventListener('click',()=>claimLocal(b.dataset.name)));}
  function claimLocal(name){if(!currentPicker||!currentData)return;const canonical=currentData.names.find(n=>key(n)===key(name));if(!canonical){setStatus('Ese nombre no pertenece a la lista válida de publicadores.','error');return;}const{day,time,slot}=currentPicker,remoteShift=(currentData.shiftsByDay[day]||[]).find(s=>key(s.time)===key(time)),remoteSlot=remoteShift?.slots.find(s=>s.slot===slot);if(remoteSlot&&!remoteSlot.free){closePicker();setStatus(`La vacante ya figura ocupada por ${remoteSlot.value}.`,'error');renderShifts();return;}const ovs=getOverrides(),id=overrideId(currentLocation,day,time,slot);ovs[id]={name:canonical,savedAt:new Date().toISOString()};setOverrides(ovs);rememberName(canonical);closePicker();setStatus(`${canonical} quedó anotado en ${DAY_LABEL[day]} ${time}.`,'ok');renderShifts();}
  function clearLocal(id){const ovs=getOverrides();if(ovs[id]){delete ovs[id];setOverrides(ovs);setStatus('Asignación local eliminada.','ok');renderShifts();}}
  function setStatus(text,kind){const el=$('#cecCarritosStatus');if(!el)return;el.textContent=text||'';el.className='cec-c-status'+(kind?' '+kind:'');}

  const originalReceive=window.__cecReceiveSheet;window.__cecReceiveSheet=function(resourceId,base64){if(LOCATIONS[resourceId]){try{const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),csv=new TextDecoder('utf-8').decode(bytes);receiveCsv(resourceId,csv,false);}catch(_){setStatus('No se pudieron interpretar los datos del carrito.','error');}return;}if(typeof originalReceive==='function')return originalReceive.apply(this,arguments);};
  const originalError=window.__cecSheetError;window.__cecSheetError=function(resourceId,message){if(LOCATIONS[resourceId]){if(resourceId===currentLocation)setStatus(message||'No se pudo actualizar la escala.','error');return;}if(typeof originalError==='function')return originalError.apply(this,arguments);};
  document.addEventListener('click',function(e){const target=e.target.closest&&e.target.closest('[data-resource]');if(!target)return;const id=target.getAttribute('data-resource');if(!LOCATIONS[id])return;e.preventDefault();e.stopImmediatePropagation();openCarritos(id);},true);
  window.addEventListener('popstate',()=>{if(location.hash!=='#carritos'&&$('#cecCarritosScreen')?.classList.contains('open'))hideCarritos();});
  injectStyles();injectUi();injectEntrypoints();setTimeout(injectEntrypoints,500);window.CongElCalafateCarritos={version:VERSION,open:openCarritos,parse:parseCarritoCsv};
})();
