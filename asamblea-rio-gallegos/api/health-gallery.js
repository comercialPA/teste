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
    const jsonPaths=all.filter(b=>String(b.pathname||'').endsWith('.json')).slice(0,80).map(b=>b.pathname);
    return res.status(200).json({ok:true,counts,store:{totalBlobs:all.length,prefixes,jsonPaths}});
  }catch(err){return res.status(500).json({ok:false,error:err?.message||'error'});}
}
