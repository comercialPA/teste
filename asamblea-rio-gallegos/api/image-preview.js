import sharp from 'sharp';
import { readJson } from './_data.js';

const WIDTHS=[720,1600];
const MAX_SOURCE_BYTES=40*1024*1024;

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).end();
  }
  try{
    const id=safeId(req.query?.id);
    if(!id)return res.status(400).end();
    const requested=Number(req.query?.w||720);
    const width=WIDTHS.reduce((best,v)=>Math.abs(v-requested)<Math.abs(best-requested)?v:best,WIDTHS[0]);

    const meta=await readJson(`photos/${id}.json`,{migrate:false});
    if(!meta||meta.status!=='PUBLICADA'||!meta.fileUrl)return res.status(404).end();

    const source=await fetch(meta.fileUrl,{cache:'no-store'});
    if(!source.ok){
      let detail='';
      try{detail=(await source.text()).slice(0,120);}catch(_){}
      const blocked=source.status===403&&/store is blocked|limits?.*exceeded|suspend/i.test(detail);
      return res.status(blocked?503:502).end();
    }

    const bytes=Buffer.from(await source.arrayBuffer());
    if(!bytes.length||bytes.length>MAX_SOURCE_BYTES)return res.status(413).end();

    let output=bytes;
    let contentType=meta.mimeType||source.headers.get('content-type')||'image/jpeg';
    try{
      output=await sharp(bytes,{failOn:'none',limitInputPixels:4096*4096*4})
        .rotate()
        .resize({width,height:width,fit:'inside',withoutEnlargement:true})
        .jpeg({quality:width<=720?76:84,mozjpeg:true})
        .toBuffer();
      contentType='image/jpeg';
    }catch(err){
      console.warn('[RG26 IMAGE PREVIEW FALLBACK]',id,err?.message||err);
    }

    res.setHeader('Content-Type',contentType);
    res.setHeader('Cache-Control','public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('X-Content-Type-Options','nosniff');
    return res.status(200).send(output);
  }catch(err){
    console.error('[RG26 IMAGE PREVIEW]',err);
    const code=Number(err?.statusCode||0);
    return res.status(code>=400&&code<600?code:500).end();
  }
}

function safeId(v){return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);}
