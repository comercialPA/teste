import { list } from '@vercel/blob';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({ok:false,error:'Método no permitido.'});
  }
  try{
    const records=await list({prefix:'photos/',limit:1000});
    const photoRecords=(records.blobs||[]).filter(b=>String(b.pathname||'').endsWith('.json'));
    let sample=photoRecords[0]||null;
    if(!sample){
      const files=await list({prefix:'files/',limit:1});
      sample=(files.blobs||[])[0]||null;
    }
    if(!sample){
      return res.status(200).json({ok:true,available:true,state:'ready',recordCount:0});
    }
    const probe=await fetch(sample.url,{cache:'no-store'});
    if(probe.ok){
      try{probe.body?.cancel?.();}catch(_){}
      return res.status(200).json({ok:true,available:true,state:'ready',recordCount:photoRecords.length});
    }
    let detail='';
    try{detail=(await probe.text()).slice(0,160);}catch(_){}
    const suspended=probe.status===403&&/store is blocked|limits?.*exceeded|suspend/i.test(detail);
    return res.status(200).json({
      ok:true,
      available:false,
      state:suspended?'suspended':'unavailable',
      reason:suspended?'storage-suspended':'storage-unavailable',
      recordCount:photoRecords.length
    });
  }catch(err){
    console.error('[RG26 STORAGE STATUS]',err);
    return res.status(200).json({ok:true,available:false,state:'unavailable',reason:'storage-check-failed',recordCount:0});
  }
}
