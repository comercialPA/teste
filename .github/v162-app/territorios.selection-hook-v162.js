/* V1.6.2 · cualquier selección visual de territorio abre el plano individual */
(()=>{
'use strict';
document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-territory]');
  const n=b?.dataset?.territory;
  if(!n||!/^\d{1,3}$/.test(n))return;
  setTimeout(()=>window.CongElCalafateTerritoriosV162?.load?.(n),90);
},false);
})();
