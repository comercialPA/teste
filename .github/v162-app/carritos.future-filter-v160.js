/* V1.6.0 · agenda útil: oculta días/horarios pasados por defecto */
;(function(){
'use strict';
const VERSION='1.6.0';
const DAY_INDEX={lunes:0,martes:1,miercoles:2,jueves:3,viernes:4,sabado:5,domingo:6};
const DAY_SHORT={lunes:'Lun',martes:'Mar',miercoles:'Mié',jueves:'Jue',viernes:'Vie',sabado:'Sáb',domingo:'Dom'};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let showAll=false,scheduled=false,autoSwitching=false;

function injectStyle(){
 if($('#cecV160CarritosStyle'))return;
 const s=document.createElement('style');s.id='cecV160CarritosStyle';s.textContent=`
 #cecShowPast{white-space:nowrap}.cec-day-date{display:block;font-size:9px;opacity:.68;margin-top:2px;font-weight:750}.cec-chip.cec-day-today{box-shadow:inset 0 0 0 2px rgba(11,79,108,.12)}.cec-chip.active .cec-day-date{opacity:.8}.cec-v160-hidden{display:none!important}.cec-next-note{background:#fff;border:1px dashed #c9dae1;border-radius:16px;padding:18px;text-align:center;color:#647d88;font-size:12px;line-height:1.45}
 @media(max-width:430px){.cec-c-tools{flex-wrap:wrap}.cec-c-search{flex:1 1 100%}.cec-c-toggle{flex:1}.cec-c-toggle#cecShowPast{flex:1}}
 `;document.head.appendChild(s);
}
function installButton(){
 const tools=$('.cec-c-tools');if(!tools||$('#cecShowPast'))return;
 const b=document.createElement('button');b.type='button';b.id='cecShowPast';b.className='cec-c-toggle';b.textContent='Mostrar todos';b.onclick=()=>{showAll=!showAll;b.classList.toggle('active',showAll);b.textContent=showAll?'Ver próximos':'Mostrar todos';schedulePatch();};
 tools.appendChild(b);
}
function mondayOf(date){
 const d=new Date(date);d.setHours(0,0,0,0);const day=d.getDay(),diff=(day+6)%7;d.setDate(d.getDate()-diff);return d;
}
function dateForDay(day){
 const m=mondayOf(new Date()),d=new Date(m);d.setDate(m.getDate()+(DAY_INDEX[day]??0));return d;
}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function pastDay(day){
 const d=dateForDay(day),today=new Date();today.setHours(0,0,0,0);return d<today;
}
function todayDayKey(){
 const keys=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];return keys[new Date().getDay()];
}
function endMinutes(text){
 const m=[...String(text||'').matchAll(/(\d{1,2})(?::(\d{2}))?/g)];if(!m.length)return null;
 const z=m[m.length-1],h=Number(z[1]),min=Number(z[2]||0);if(h>23||min>59)return null;return h*60+min;
}
function formatDate(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');}
function patchDays(){
 const root=$('#cecCarritosDays');if(!root)return;
 const now=new Date(),today=todayDayKey();
 $$('[data-cec-day]',root).forEach(b=>{
   const day=b.dataset.cecDay,d=dateForDay(day),isToday=day===today;
   b.classList.toggle('cec-day-today',isToday);
   b.classList.toggle('cec-v160-hidden',!showAll&&pastDay(day));
   const label=DAY_SHORT[day]||day;
   b.innerHTML=`${isToday?'Hoy · ':''}${label}<span class="cec-day-date">${formatDate(d)}</span>`;
 });
 if(!showAll){
   const active=$('[data-cec-day].active',root);
   if(active?.classList.contains('cec-v160-hidden'))switchToFirstVisibleDay(root);
 }
}
function switchToFirstVisibleDay(root=$('#cecCarritosDays'),afterToday=false){
 if(autoSwitching||!root)return false;
 const todayIdx=DAY_INDEX[todayDayKey()];
 const candidates=$$('[data-cec-day]',root).filter(b=>!b.classList.contains('cec-v160-hidden')).filter(b=>!afterToday||(DAY_INDEX[b.dataset.cecDay]??0)>todayIdx);
 if(!candidates.length)return false;
 autoSwitching=true;candidates[0].click();setTimeout(()=>{autoSwitching=false;schedulePatch();},80);return true;
}
function patchShifts(){
 const root=$('#cecCarritosShifts'),days=$('#cecCarritosDays');if(!root||!days)return;
 $('#cecFutureEmpty')?.remove();
 const active=$('[data-cec-day].active',days),day=active?.dataset.cecDay||'',today=todayDayKey(),now=new Date(),mins=now.getHours()*60+now.getMinutes();
 const arts=$$('.cec-shift',root);
 let visible=0;
 arts.forEach(a=>{
   let hide=false;
   if(!showAll&&day===today){
     const t=$('.cec-shift-time',a)?.textContent||'',end=endMinutes(t);hide=end!==null&&end<=mins;
   }
   a.classList.toggle('cec-v160-hidden',hide);if(!hide)visible++;
 });
 if(!showAll&&day===today&&arts.length&&visible===0){
   if(switchToFirstVisibleDay(days,true))return;
   const note=document.createElement('div');note.id='cecFutureEmpty';note.className='cec-next-note';note.innerHTML='<strong>No quedan turnos futuros visibles esta semana.</strong><br>Use “Mostrar todos” para consultar días y horarios anteriores.';root.appendChild(note);
 }
}
function patch(){
 scheduled=false;injectStyle();installButton();patchDays();patchShifts();
 const screen=$('#cecCarritosScreen');if(screen?.classList.contains('open')&&!showAll){
   const days=$('#cecCarritosDays'),active=$('[data-cec-day].active',days);
   if(active?.classList.contains('cec-v160-hidden'))switchToFirstVisibleDay(days);
 }
}
function schedulePatch(){if(scheduled)return;scheduled=true;requestAnimationFrame(patch);}
function observe(){
 const target=$('#cecCarritosScreen');if(!target)return setTimeout(observe,100);
 const obs=new MutationObserver(()=>schedulePatch());obs.observe(target,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});schedulePatch();
}
injectStyle();observe();setInterval(schedulePatch,60000);
const patchAbout=()=>{const strong=$('.about-card strong');if(strong)strong.textContent='Aplicación v1.6.0 · agenda de carritos y control de territorios';const p=$('.about-card p');if(p)p.textContent='Por defecto se muestran solamente días y horarios todavía útiles. “Mostrar todos” permite consultar la escala completa.';};setTimeout(patchAbout,800);
window.CongElCalafateCarritosV160={version:VERSION,refresh:schedulePatch,get showAll(){return showAll;}};
})();
