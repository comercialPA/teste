from pathlib import Path
mod=Path('.github/v162-app/territorios.individual-map-v162.js')
s=mod.read_text(encoding='utf-8')
anchor="function commitStroke(points){"
assert s.count(anchor)==1
smooth=r"""
/* V1.7.5: rectificación geométrica en coordenadas físicas del SVG, incluidas calles diagonales.
   No confundir rectificación visual con confirmación de un lado de calle. */
function cecV175Straighten(points){
 if(!Array.isArray(points)||points.length<2)return points||[];
 const el=$('#cecV162Svg'),rect=el?.getBoundingClientRect();
 const w=Math.max(1,rect?.width||350),h=Math.max(1,rect?.height||550);
 let pts=points.filter(p=>Number.isFinite(+p.x)&&Number.isFinite(+p.y))
   .map(p=>({x:(+p.x)*w/100,y:(+p.y)*h/100}));
 if(pts.length<2)return points;
 // Reducir concentración excesiva de eventos durante pausas del dedo.
 const spaced=[pts[0]];
 for(let i=1;i<pts.length;i++){
  const q=pts[i],last=spaced[spaced.length-1];
  if(Math.hypot(q.x-last.x,q.y-last.y)>1.5||i===pts.length-1)spaced.push(q);
 }
 pts=spaced;
 if(pts.length<2)return points;
 const mx=pts.reduce((a,p)=>a+p.x,0)/pts.length,my=pts.reduce((a,p)=>a+p.y,0)/pts.length;
 let xx=0,xy=0,yy=0;
 for(const p of pts){const dx=p.x-mx,dy=p.y-my;xx+=dx*dx;xy+=dx*dy;yy+=dy*dy}
 if(xx+yy<25)return [points[0],points[points.length-1]];
 let theta=.5*Math.atan2(2*xy,xx-yy);
 // Alineación exacta sólo para trazos casi horizontales o verticales (menos de 7°).
 const near=Math.PI/180*7;
 if(Math.abs(Math.sin(theta))<Math.sin(near))theta=0;
 else if(Math.abs(Math.cos(theta))<Math.sin(near))theta=Math.PI/2;
 const ux=Math.cos(theta),uy=Math.sin(theta);
 const proj=pts.map(p=>(p.x-mx)*ux+(p.y-my)*uy).sort((a,b)=>a-b);
 let lo=proj[Math.floor((proj.length-1)*.015)],hi=proj[Math.ceil((proj.length-1)*.985)];
 if(hi-lo<8){lo=proj[0];hi=proj[proj.length-1]}
 const toPoint=t=>({x:+Math.max(0,Math.min(100,(mx+t*ux)/w*100)).toFixed(3),
                    y:+Math.max(0,Math.min(100,(my+t*uy)/h*100)).toFixed(3)});
 return [toPoint(lo),toPoint(hi)];
}
function cecV175TraceSample(points,limit=48){
 if(points.length<=limit)return points.map(p=>({x:+p.x.toFixed(2),y:+p.y.toFixed(2)}));
 return Array.from({length:limit},(_,i)=>{
  const p=points[Math.round(i*(points.length-1)/(limit-1))];
  return{x:+p.x.toFixed(2),y:+p.y.toFixed(2)};
 });
}
"""
s=s.replace(anchor,smooth+"\n"+anchor,1)
old="points:points.map(p=>({x:+p.x.toFixed(3),y:+p.y.toFixed(3)})),keys:[],"
new="points:cecV175Straighten(points),tracePoints:cecV175TraceSample(points),corrected:true,keys:[],"
assert old in s
s=s.replace(old,new,1)
# cache de imágenes de planos: en memoria, máximo 2; los PDFs y PNG renderizados permanecen en disco Android.
old_cache="imageCache[String(n)]={src,w:+w||0,h:+h||0};applyImage(String(n),src,w,h)"
new_cache="imageCache[String(n)]={src,w:+w||0,h:+h||0};Object.keys(imageCache).filter(k=>k!==String(n)).forEach(k=>{if(Object.keys(imageCache).length>2)delete imageCache[k]});applyImage(String(n),src,w,h)"
assert old_cache in s
s=s.replace(old_cache,new_cache,1)
# Los trazos antiguos también se ven rectificados sin modificar los datos guardados.
old_render="st.points.map(p=>\`\${p.x},\${p.y}\`).join(' ')"
new_render="(st.corrected||st.points.length<=2?st.points:cecV175Straighten(st.points)).map(p=>\`\${p.x},\${p.y}\`).join(' ')"
assert old_render in s
s=s.replace(old_render,new_render,1)
mod.write_text(s,encoding='utf-8')
sync=Path('.github/v174-app/map-list-sync-v174.js')
t=sync.read_text(encoding='utf-8')
old="if(n!=='1'||!Array.isArray(st.points)||st.points.length<4)return [];"
new="const samples=st.tracePoints||st.points;if(n!=='1'||!Array.isArray(samples)||samples.length<4)return [];"
assert old in t
t=t.replace(old,new,1).replace("const hits={N:[],E:[],S:[],O:[]},pts=st.points;","const hits={N:[],E:[],S:[],O:[]},pts=samples;",1).replace("Math.floor(st.points.length*.055)","Math.floor(samples.length*.055)",1)
# old stroke recovery should not discard corrected strokes
t=t.replace("if(st.points?.length&&!(st.keys||[]).length)","if((st.tracePoints?.length||st.points?.length)&&!(st.keys||[]).length)",1)
sync.write_text(t,encoding='utf-8')
bars=Path('.github/v141-app/carritos.compact-bars.js')
u=bars.read_text(encoding='utf-8')
old="  function refreshAll(){\n    if(!(window.AndroidBridge&&typeof window.AndroidBridge.loadSheet==='function'))return;\n    Object.entries(LOCATIONS).forEach(([id,c])=>window.AndroidBridge.loadSheet(id,c.sheetId));\n  }"
new="""  let lastRefresh=0;
  function refreshAll(force=false){
    if(!(window.AndroidBridge&&typeof window.AndroidBridge.loadSheet==='function'))return;
    const now=Date.now();if(!force&&now-lastRefresh<180000)return;
    lastRefresh=now;
    Object.entries(LOCATIONS).forEach(([id,c])=>window.AndroidBridge.loadSheet(id,c.sheetId));
  }"""
assert old in u
u=u.replace(old,new,1)
bars.write_text(u,encoding='utf-8')
print('V1.7.5: rectificación de calles, muestreo de gestos, inferencia conservadora y cache de carritos (TTL 180s); archivos parchados con éxito')
