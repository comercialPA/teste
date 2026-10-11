import crypto from 'node:crypto';
import { readJson, listJson } from './_data.js';
import { assertRateLimit } from './_rate-limit.js';

const STATUS_PUBLISHED='PUBLICADA';
const MAX_OWN_PHOTOS=1000;

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'Método no permitido.'});
  }
  try{
    assertRateLimit(req,'my-photos',{limit:40,windowMs:5*60*1000});
    const payload=req.body&&typeof req.body==='object'?req.body:{};
    const profileId=safeText(payload.profileId,100);
    const ownerSecret=safeText(payload.ownerSecret,300);
    await verifyProfile(profileId,ownerSecret);
    const rows=await listJson('photos/');
    const items=[];
    for(const entry of rows){
      const meta=entry.value;
      if(!meta||meta.status!==STATUS_PUBLISHED||!meta.fileUrl)continue;
      if(String(meta.profileId||'')!==profileId)continue;
      items.push(publicPhoto(meta));
      if(items.length>=MAX_OWN_PHOTOS)break;
    }
    items.sort((a,b)=>String(b.uploadedAt||'').localeCompare(String(a.uploadedAt||'')));
    return res.status(200).json({ok:true,items,total:items.length});
  }catch(err){
    console.error('[RG26 MY PHOTOS]',err);
    if(err?.retryAfter)res.setHeader('Retry-After',String(err.retryAfter));
    return res.status(err?.statusCode||400).json({ok:false,error:err?.message||'No pudimos cargar tus fotos.'});
  }
}

async function verifyProfile(profileId,ownerSecret){
  if(!profileId||!ownerSecret)throw new Error('Perfil inválido.');
  const profile=await readJson(`profiles/${safeId(profileId)}.json`);
  if(!profile||!secureEqual(String(profile.ownerHash||''),hash(ownerSecret)))throw new Error('No pudimos verificar tu perfil.');
  return profile;
}
function publicPhoto(meta){return {id:meta.id,uploaderName:meta.uploaderName||'',congregation:meta.congregation||'',caption:meta.caption||'',uploadedAt:meta.uploadedAt||'',thumbnailUrl:meta.thumbnailUrl||meta.fileUrl||'',downloadUrl:meta.downloadUrl||meta.fileUrl||'',mimeType:meta.mimeType||'',size:Number(meta.size||0),width:Number(meta.width||0),height:Number(meta.height||0),isMine:true};}
function safeId(v){return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);}
function safeText(v,max=200){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max);}
function hash(v){return crypto.createHash('sha256').update(String(v||''),'utf8').digest('hex');}
function secureEqual(a,b){const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
