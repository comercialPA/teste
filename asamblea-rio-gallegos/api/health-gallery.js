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
    const image=all.find(b=>String(b.pathname||'').startsWith('files/'))||null;
    const probe={pathname:sample?.pathname||'',host:'',unauth:0,body:'',download:0,sdkPublic:0,sdkPrivate:0,sdkPublicError:'',sdkPrivateError:'',imageStatus:0,imageBody:''};
    if(sample){
      try{probe.host=new URL(sample.url).host;}catch(_){}
      try{const r=await fetch(sample.url,{cache:'no-store'});probe.unauth=r.status;probe.body=(await r.text()).slice(0,180);}catch(_){probe.unauth=-1;}
      try{probe.download=sample.downloadUrl?(await fetch(sample.downloadUrl,{cache:'no-store'})).status:-2;}catch(_){probe.download=-1;}
      try{probe.sdkPublic=(await get(sample.pathname,{access:'public'}))?.statusCode||0;}catch(err){probe.sdkPublic=-1;probe.sdkPublicError=String(err?.message||err).slice(0,240);}
      try{probe.sdkPrivate=(await get(sample.pathname,{access:'private'}))?.statusCode||0;}catch(err){probe.sdkPrivate=-1;probe.sdkPrivateError=String(err?.message||err).slice(0,240);}
    }
    if(image?.url){
      try{const r=await fetch(image.url,{cache:'no-store'});probe.imageStatus=r.status;if(!r.ok)probe.imageBody=(await r.text()).slice(0,180);}catch(_){probe.imageStatus=-1;}
    }
    return res.status(200).json({ok:true,counts,store:{totalBlobs:all.length,prefixes},probe});
  }catch(err){return res.status(500).json({ok:false,error:String(err?.message||err).slice(0,300)});}
}
