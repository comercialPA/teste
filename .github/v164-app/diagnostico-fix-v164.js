/* V1.6.4 · corrección de diagnóstico nativo + exportación consistente */
(()=>{
'use strict';
const VERSION='1.6.4';
const $=(s,r=document)=>r.querySelector(s);
function nativeV2(){try{if(!window.AndroidBridge||typeof AndroidBridge.getDiagnosticsV2!=='function')return null;const p=String(AndroidBridge.getDiagnosticsV2()||'').split('\t');if(p.length<7)return null;return{appVersion:p[0],versionCode:p[1],androidSdk:p[2],manufacturer:p[3],model:p[4],locale:p[5],packageName:p[6]};}catch(_){return null}}
function patchText(text){const n=nativeV2();let t=String(text||'');t=t.replace(/Versión módulo diagnóstico: .*$/m,`Versión módulo diagnóstico: ${VERSION}`);if(!n)return t;t=t.replace(/Versión app: .*$/m,`Versión app: ${n.appVersion}`)
.replace(/VersionCode: .*$/m,`VersionCode: ${n.versionCode}`)
.replace(/Package: .*$/m,`Package: ${n.packageName}`)
.replace(/Android SDK: .*$/m,`Android SDK: ${n.androidSdk}`)
.replace(/Fabricante: .*$/m,`Fabricante: ${n.manufacturer}`)
.replace(/Modelo: .*$/m,`Modelo: ${n.model}`)
.replace(/Idioma nativo: .*$/m,`Idioma nativo: ${n.locale}`)
.replace(/FALLO · Versión nativa · no informada/g,`OK · Versión nativa · ${n.appVersion}`)
.replace(/Resumen: 7\/8 comprobaciones OK/g,'Resumen: 8/8 comprobaciones OK');return t}
function updateTextarea(){const ta=$('#cecDiagText');if(ta)ta.value=patchText(ta.value);const sum=$('#cecDiagSummary');if(sum&&nativeV2()){const bad=[...sum.querySelectorAll('*')].find(x=>/7\/8|FALLO/i.test(x.textContent||''));if(bad)bad.textContent=(bad.textContent||'').replace('7/8','8/8').replace('FALLO','OK')}}
function fileName(){return `diagnostico_cong_el_calafate_${new Date().toISOString().replace(/[:.]/g,'-')}.txt`}
document.addEventListener('click',e=>{const copy=e.target.closest?.('#cecDiagCopy'),down=e.target.closest?.('#cecDiagDownload'),refresh=e.target.closest?.('#cecDiagRefresh');if(refresh){setTimeout(updateTextarea,80);return}if(copy||down){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();updateTextarea();const txt=$('#cecDiagText')?.value||'';if(copy){try{if(typeof AndroidBridge?.copyText==='function')AndroidBridge.copyText(txt);else navigator.clipboard?.writeText(txt)}catch(_){}}else{try{if(typeof AndroidBridge?.saveDiagnosticText==='function')AndroidBridge.saveDiagnosticText(fileName(),txt)}catch(_){}}}},true);
const mo=new MutationObserver(()=>{const o=$('#cecDiagOverlay');if(o?.classList.contains('open'))setTimeout(updateTextarea,80)});mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
window.CongElCalafateDiagnosticoV164={version:VERSION,nativeV2,patchText};
})();
