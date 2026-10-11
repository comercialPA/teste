import { issueSignedToken, presignUrl, list } from '@vercel/blob';
import crypto from 'node:crypto';
import { readJson, writeJson, deleteByPath, deleteUrl } from './_data.js';
import { assertRateLimit } from './_rate-limit.js';

const MAX_ORIGINAL_BYTES=32*1024*1024;
const MAX_THUMB_BYTES=2*1024*1024;
const MAX_SIDE_PX=4096;
const THUMB_SIDE_PX=720;
const TICKET_TTL_MS=10*60*1000;
const STATUS_PUBLISHED='PUBLICADA';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'Método no permitido.'});
  }
  try{
    const body=req.body&&typeof req.body==='object'?req.body:{};
    const action=safeText(body.action,30);
    if(action==='ticket'){
      assertRateLimit(req,'upload-ticket',{limit:35,windowMs:10*60*1000});
      return res.status(200).json({ok:true,result:await createTicket(body)});
    }
    if(action==='finalize'){
      assertRateLimit(req,'upload-finalize',{limit:35,windowMs:10*60*1000});
      return res.status(200).json({ok:true,result:await finalizeUpload(body)});
    }
    throw new Error('Acción de carga no permitida.');
  }catch(err){
    console.error('[RG26 UPLOAD 4K]',err);
    if(err?.retryAfter)res.setHeader('Retry-After',String(err.retryAfter));
    return res.status(err?.statusCode||400).json({ok:false,error:err?.message||'Error de carga.'});
  }
}

async function createTicket(body){
  const profile=await verifyProfile(body.profileId,body.ownerSecret);
  const mimeType=normalizeMime(body.mimeType,body.fileName);
  const originalName=safeFileName(body.fileName||'foto.jpg');
  const declaredSize=Number(body.size||0);
  if(!/^image\/(jpeg|png|webp)$/i.test(mimeType)) throw new Error('Formato de imagen no permitido para carga 4K.');
  if(!Number.isFinite(declaredSize)||declaredSize<=0||declaredSize>MAX_ORIGINAL_BYTES) throw new Error('La foto supera el límite de 32 MB.');

  const photoId=crypto.randomUUID();
  const ext=extensionForMime(mimeType);
  const filePath=`files/${photoId}/foto${ext}`;
  const thumbPath=`thumbnails/${photoId}.jpg`;
  const expiresAt=Date.now()+TICKET_TTL_MS;
  const uploadUrl=await createPutUrl(filePath,mimeType,MAX_ORIGINAL_BYTES,expiresAt);
  const thumbnailUploadUrl=await createPutUrl(thumbPath,'image/jpeg',MAX_THUMB_BYTES,expiresAt);

  await writeJson(pendingPath(photoId),{
    photoId,
    profileId:profile.profileId,
    filePath,
    thumbPath,
    mimeType,
    originalName,
    expiresAt,
    createdAt:new Date().toISOString()
  });

  return {
    photoId,
    filePath,
    thumbnailPath:thumbPath,
    uploadUrl,
    thumbnailUploadUrl,
    expiresAt,
    limits:{maxBytes:MAX_ORIGINAL_BYTES,maxSidePx:MAX_SIDE_PX,thumbnailSidePx:THUMB_SIDE_PX,thumbnailMaxBytes:MAX_THUMB_BYTES}
  };
}

async function finalizeUpload(body){
  const profile=await verifyProfile(body.profileId,body.ownerSecret);
  const photoId=safeId(body.photoId);
  if(!photoId) throw new Error('Carga inválida.');
  const pending=await readJson(pendingPath(photoId));
  if(!pending||pending.photoId!==photoId) throw new Error('La autorización de carga venció o no existe.');
  if(String(pending.profileId)!==String(profile.profileId)) throw new Error('Esta carga pertenece a otro perfil.');
  if(Number(pending.expiresAt||0)<Date.now()-2*60*1000) throw new Error('La autorización de carga venció. Volvé a seleccionar la foto.');

  const file=await findPublicExact(pending.filePath);
  if(!file) throw new Error('No encontramos la foto 4K subida.');
  if(Number(file.size||0)<=0||Number(file.size)>MAX_ORIGINAL_BYTES){
    await deleteUrl(file.url);
    throw new Error('La foto subida supera el límite permitido.');
  }
  const thumb=await findPublicExact(pending.thumbPath);
  if(thumb&&Number(thumb.size||0)>MAX_THUMB_BYTES){
    await deleteUrl(thumb.url);
    throw new Error('La miniatura supera el límite permitido.');
  }

  const width=clampInt(body.width,1,MAX_SIDE_PX,0);
  const height=clampInt(body.height,1,MAX_SIDE_PX,0);
  const now=new Date().toISOString();
  const meta={
    id:photoId,
    profileId:profile.profileId,
    uploaderName:safeText(profile.name,80),
    congregation:safeText(profile.congregation,100),
    caption:safeText(body.caption,220),
    status:STATUS_PUBLISHED,
    uploadedAt:now,
    updatedAt:now,
    originalName:pending.originalName,
    mimeType:pending.mimeType,
    size:Number(file.size||0),
    width,
    height,
    fileUrl:file.url,
    downloadUrl:file.downloadUrl||file.url,
    thumbnailUrl:thumb?.url||file.url,
    thumbnailSize:Number(thumb?.size||0),
    storageFormat:'v1.2.0-direct-4k'
  };

  await Promise.all([
    writeJson(photoPath(photoId),meta),
    ensureCongregation(meta.congregation)
  ]);
  await deleteByPath(pendingPath(photoId));
  return publicPhoto(meta,profile.profileId);
}

async function createPutUrl(pathname,contentType,maximumSizeInBytes,validUntil){
  const signed=await issueSignedToken({pathname,operations:['put'],validUntil,allowedContentTypes:[contentType],maximumSizeInBytes});
  const result=await presignUrl(signed,{
    operation:'put',pathname,access:'public',validUntil,
    allowedContentTypes:[contentType],maximumSizeInBytes,
    addRandomSuffix:false,allowOverwrite:false
  });
  const url=typeof result==='string'?result:(result?.presignedUrl||result?.url||'');
  if(!url)throw new Error('No pudimos generar la autorización de carga.');
  return url;
}

async function verifyProfile(profileId,ownerSecret){
  const pid=safeText(profileId,100);
  const secret=safeText(ownerSecret,300);
  if(!pid||!secret)throw new Error('Perfil inválido.');
  const profile=await readJson(`profiles/${safeId(pid)}.json`);
  if(!profile||!secureEqual(String(profile.ownerHash||''),hash(secret)))throw new Error('No pudimos verificar tu perfil.');
  return profile;
}

async function findPublicExact(pathname){
  const result=await list({prefix:pathname,limit:5});
  return (result.blobs||[]).find(b=>b.pathname===pathname)||null;
}

async function ensureCongregation(name){
  const value=safeText(name,100);
  if(!value)return;
  await writeJson(`congregations/${hash(normalize(value)).slice(0,24)}.json`,{name:value});
}

function publicPhoto(meta,profileId){return {id:meta.id,uploaderName:meta.uploaderName||'',congregation:meta.congregation||'',caption:meta.caption||'',uploadedAt:meta.uploadedAt||'',thumbnailUrl:meta.thumbnailUrl||meta.fileUrl||'',downloadUrl:meta.downloadUrl||meta.fileUrl||'',mimeType:meta.mimeType||'',width:meta.width||0,height:meta.height||0,isMine:String(meta.profileId||'')===String(profileId||'')};}
function pendingPath(id){return `uploads/pending/${safeId(id)}.json`;}
function photoPath(id){return `photos/${safeId(id)}.json`;}
function safeId(v){return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);}
function safeText(v,max=200){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max);}
function safeFileName(name){const clean=safeText(name,140).replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,' ').trim();return clean||'foto.jpg';}
function normalize(v){return safeText(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
function normalizeMime(mime,name){const m=safeText(mime,80).toLowerCase();if(/^image\/(jpeg|png|webp)$/.test(m))return m;if(/\.png$/i.test(name||''))return'image/png';if(/\.webp$/i.test(name||''))return'image/webp';return'image/jpeg';}
function extensionForMime(mime){if(mime==='image/png')return'.png';if(mime==='image/webp')return'.webp';return'.jpg';}
function hash(v){return crypto.createHash('sha256').update(String(v||''),'utf8').digest('hex');}
function secureEqual(a,b){const aa=Buffer.from(String(a));const bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function clampInt(v,min,max,fallback){const n=Number(v);if(!Number.isFinite(n))return fallback;return Math.max(min,Math.min(max,Math.trunc(n)));}
