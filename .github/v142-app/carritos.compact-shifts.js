
;(function(){
  'use strict';
  const VERSION='1.4.2';
  let busy=false;

  function $(s,r=document){return r.querySelector(s);}
  function $$(s,r=document){return Array.from(r.querySelectorAll(s));}

  function injectStyles(){
    if($('#cecV142Style'))return;
    const s=document.createElement('style');s.id='cecV142Style';s.textContent=`
      .cec-shifts{gap:8px!important}
      .cec-shift{padding:0!important;border-radius:16px!important;overflow:hidden;box-shadow:0 2px 8px rgba(28,73,91,.04);transition:border-color .18s ease,box-shadow .18s ease;background:#fff}
      .cec-shift.expanded{border-color:#9abfcb;box-shadow:0 6px 18px rgba(11,79,108,.08)}
      .cec-shift-top{margin:0!important;min-height:60px;padding:10px 12px!important;cursor:pointer;user-select:none;display:grid!important;grid-template-columns:minmax(0,1fr) auto auto;gap:8px!important;align-items:center!important}
      .cec-shift-top:active{background:#f5f9fb}
      .cec-v142-timebox{min-width:0;display:flex;flex-direction:column;gap:2px}
      .cec-shift-time{font-size:17px!important;line-height:1.1}
      .cec-v142-meta{font-size:11px;color:#718690;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cec-shift-count{margin:0!important;white-space:nowrap;padding:7px 10px!important;font-size:10px!important}
      .cec-v142-chevron{width:30px;height:30px;border-radius:10px;background:#eef4f6;display:grid;place-items:center;color:#5f7783;font-size:18px;font-weight:900;transition:transform .18s ease,background .18s ease;color .18s ease}
      .cec-shift.expanded .cec-v142-chevron{transform:rotate(180deg);background:#0b4f6c;color:#fff}
      .cec-slots{display:none!important;padding:0 12px 12px!important;gap:7px!important;border-top:1px solid #edf2f4}
      .cec-shift.expanded .cec-slots{display:grid!important;padding-top:10px!important}
      .cec-slot{min-height:46px!important;border-radius:13px!important;padding:7px 9px!important}
      .cec-slot-num{width:28px!important;height:28px!important;border-radius:9px!important}
      .cec-slot-body strong{font-size:13px!important}.cec-slot-body small{font-size:10px!important}
      .cec-claim{min-height:38px!important;padding:8px 11px!important;border-radius:11px!important}
      @media(max-width:380px){.cec-shift-top{grid-template-columns:minmax(0,1fr) auto auto;padding:9px 10px!important}.cec-shift-time{font-size:16px!important}.cec-v142-meta{font-size:10px}.cec-shift-count{padding:6px 8px!important}.cec-v142-chevron{width:28px;height:28px}}
    `;document.head.appendChild(s);
  }

  function decorateShift(article){
    if(!article||article.dataset.v142Done==='1')return;
    const top=$('.cec-shift-top',article),time=$('.cec-shift-time',article),count=$('.cec-shift-count',article),slots=$$('.cec-slot',article);
    if(!top||!time||!count||!slots.length)return;
    article.dataset.v142Done='1';
    article.classList.remove('expanded');
    const free=slots.filter(x=>x.classList.contains('cec-slot-free')).length;
    const occupied=Math.max(0,slots.length-free);
    const timeBox=document.createElement('span');timeBox.className='cec-v142-timebox';
    const meta=document.createElement('span');meta.className='cec-v142-meta';meta.textContent=`${occupied} ocupado${occupied===1?'':'s'} · ${free} vacante${free===1?'':'s'}`;
    time.parentNode.insertBefore(timeBox,time);timeBox.appendChild(time);timeBox.appendChild(meta);
    const chev=document.createElement('span');chev.className='cec-v142-chevron';chev.setAttribute('aria-hidden','true');chev.textContent='⌄';top.appendChild(chev);
    top.setAttribute('role','button');top.setAttribute('tabindex','0');top.setAttribute('aria-expanded','false');
    const toggle=()=>{
      const open=!article.classList.contains('expanded');
      $$('.cec-shift.expanded',article.parentNode).forEach(x=>{if(x!==article){x.classList.remove('expanded');$('.cec-shift-top',x)?.setAttribute('aria-expanded','false');}});
      article.classList.toggle('expanded',open);top.setAttribute('aria-expanded',open?'true':'false');
    };
    top.addEventListener('click',e=>{if(e.target.closest('button'))return;toggle();});
    top.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  }

  function decorateAll(){
    if(busy)return;busy=true;
    try{$$('.cec-shift').forEach(decorateShift);}finally{busy=false;}
  }

  function observe(){
    const root=$('#cecCarritosShifts');if(!root)return setTimeout(observe,100);
    const obs=new MutationObserver(()=>queueMicrotask(decorateAll));obs.observe(root,{childList:true,subtree:true});decorateAll();
  }

  function patchVersion(){
    const run=()=>{const strong=$('.about-card strong');if(strong)strong.textContent='Aplicación v1.4.2 · carritos y horarios compactos';const p=$('.about-card p');if(p)p.textContent='Los carritos y cada franja horaria se muestran minimizados. Tocá un horario para ver publicadores, vacantes y ocupar un lugar.';};run();setTimeout(run,700);
  }

  injectStyles();observe();patchVersion();
  window.CongElCalafateCarritosCompactShifts={version:VERSION,refresh:decorateAll};
})();
