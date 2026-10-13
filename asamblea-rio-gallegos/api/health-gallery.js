import { get } from '@vercel/blob';
import { listJson, listAll } from './_data.js';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false});
  try{
    const [rows,all]=await Promise.all([listJson('photos/',{migrate:false}),listAll('')]);
    const counts={total:rows.length,publicada:0,oculta:0,pendiente:0,eliminada:0,withFile:0};
    for(const row of rows){
      const v=row?.value||{};
      if(v.fileUrl)counts.withFile++;
      if(v.status==='PUBLICADA')counts.publicada++;
      else if(v.status==='OCULTA')counts.oculta++;
      else if(v.status==='PENDIENTE')counts.pendiente++;
      else if(v.status==='ELIMINADA')counts.eliminada++;
    }
    const prefixes={};
    for(const b of all){const p=String(b.pathname||'').split('/')[0]||'(root)';prefixes[p]=(prefixes[p]||0)+1;}
    const sample=all.find(b=>String(b.pathname||'').startsWith('photos/')&&String(b.pathname||'').endsWith('.json'))||null;
    const probe={pathname:sample?.pathname||'',host:'',unauth:0,download:0,sdkPublic:0,sdkPrivate:0};
    if(sample){
      try{probe.host=new URL(sample.url).host;}catch(_){}
      try{probe.unauth=(await fetch(sample.url,{cache:'no-store'})).status;}catch(_){probe.unauth=-1;}
      try{probe.download=sample.downloadUrl?(await fetch(sample.downloadUrl,{cache:'no-store'})).status:-2;}catch(_){probe.download=-1;}
      try{probe.sdkPublic=(await get(sample.pathname,{access:'public'}))?.statusCode||0;}catch(_){probe.sdkPublic=-1;}
      try{probe.sdkPrivate=(await get(sample.pathname,{access:'private'}))?.statusCode||0;}catch(_){probe.sdkPrivate=-1;}
    }
    return res.status(200).json({ok:true,counts,store:{totalBlobs:all.length,prefixes},probe});
  }catch(err){return res.status(500).json({ok:false,error:err?.message||'error'});}
}
