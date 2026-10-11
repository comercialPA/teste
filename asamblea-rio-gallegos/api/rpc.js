import { put } from '@vercel/blob';
import JSZip from 'jszip';
import crypto from 'node:crypto';
import { readJson, writeJson, listJson, deleteByPath, deleteUrl, listAll, dataStorageMode } from './_data.js';
import { assertRateLimit } from './_rate-limit.js';

const VERSION='1.2.0';
const PUBLIC_APP_URL=process.env.PUBLIC_APP_URL||'https://asamblea-rio-gallegos.vercel.app';
const STATUS=Object.freeze({PUBLISHED:'PUBLICADA',PENDING:'PENDIENTE',HIDDEN:'OCULTA',DELETED:'ELIMINADA'});
const MAX_LEGACY_UPLOAD_BYTES=3*1024*1024;
const MAX_DIRECT_UPLOAD_BYTES=32*1024*1024;
const MAX_IMAGE_SIDE_PX=4096;
const THUMBNAIL_SIDE_PX=720;
const MAX_ZIP_PHOTOS=30;
const MAX_ZIP_BYTES=120*1024*1024;
const EXPORT_TTL_MS=6*60*60*1000;

let photoCache={at:0,items:[]};
let congregationCache={at:0,items:[]};

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'Método no permitido.'});
  }
  if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({ok:false,error:'Almacenamiento todavía no configurado.'});
  try{
    const payload=req.body&&typeof req.body==='object'?req.body:{};
    const fn=safeText(payload.fn,80);
    const args=Array.isArray(payload.args)?payload.args:[];
    applyRateLimit(req,fn);
    const methods={apiBootstrap,apiListPhotos,apiGetPhoto,apiGetPhotosByIds,apiRegisterProfile,apiRecoverProfile,apiUploadPhoto,apiDeleteOwnPhoto,apiCreateZip,apiAdminLogin,apiAdminGetData,apiAdminSetStatus,apiAdminAddCongregation};
    if(!methods[fn])throw new Error('Método API no permitido.');
    const result=await methods[fn](...args);
    return res.status(200).json({ok:true,result});
  }catch(err){
    console.error('[RG26 RPC]',err);
    if(err?.retryAfter)res.setHeader('Retry-After',String(err.retryAfter));
    return res.status(err?.statusCode||400).json({ok:false,error:err?.message||'Error del servidor.'});
  }
}

function applyRateLimit(req,fn){
  const sensitive={
    apiRegisterProfile:{limit:12,windowMs:10*60*1000},
    apiRecoverProfile:{limit:8,windowMs:10*60*1000},
    apiUploadPhoto:{limit:30,windowMs:10*60*1000},
    apiDeleteOwnPhoto:{limit:40,windowMs:10*60*1000},
    apiCreateZip:{limit:12,windowMs:10*60*1000},
    apiAdminLogin:{limit:10,windowMs:15*60*1000},
    apiAdminSetStatus:{limit:90,windowMs:10*60*1000}
  };
  const cfg=sensitive[fn]||{limit:300,windowMs:60*1000};
  assertRateLimit(req,`rpc:${fn||'unknown'}`,cfg);
}

async function apiBootstrap(profileId=''){
  const [photos,congregations]=await Promise.all([loadAllPhotoMeta(),getCongregations()]);
  return {
    ok:true,
    version:VERSION,
    backend:'vercel-blob-direct-4k',
    dataProtection:dataStorageMode(),
    event:{
      title:'Asamblea Río Gallegos 2026',
      city:'Río Gallegos',
      date:'2026-10-10',
      startDate:'2026-10-10',
      endDate:'2026-10-12',
      dateLabel:'10 · 11 · 12 · OCTUBRE · 2026',
      disclaimer:'Proyecto independiente creado para compartir recuerdos entre los asistentes. No es una aplicación oficial de los Testigos de Jehová.'
    },
    limits:{
      maxUploadMb:32,
      maxSourceUploadMb:32,
      maxImageSidePx:MAX_IMAGE_SIDE_PX,
      thumbnailSidePx:THUMBNAIL_SIDE_PX,
      maxZipPhotos:MAX_ZIP_PHOTOS,
      directUpload:true
    },
    appUrl:PUBLIC_APP_URL,
    congregations,
    gallery:listPhotosFrom(photos,{offset:0,limit:48,congregation:'',query:'',profileId}),
    stats:publicStats(photos,congregations)
  };
}

async function apiListPhotos(params={}){
  const photos=await loadAllPhotoMeta();
  return listPhotosFrom(photos,{
    offset:clampInt(params.offset,0,100000,0),
    limit:clampInt(params.limit,1,120,48),
    congregation:safeText(params.congregation,100),
    query:safeText(params.query,120),
    profileId:safeText(params.profileId,100)
  });
}

async function apiGetPhoto(photoId,profileId=''){
  const meta=await readJson(photoMetaPath(photoId));
  if(!meta||meta.status!==STATUS.PUBLISHED||!meta.fileUrl)throw new Error('Foto no encontrada.');
  return publicPhoto(meta,safeText(profileId,100));
}

async function apiGetPhotosByIds(photoIds,profileId=''){
  const ids=Array.isArray(photoIds)?photoIds.slice(0,250).map(v=>safeText(v,100)).filter(Boolean):[];
  const metas=await Promise.all(ids.map(id=>readJson(photoMetaPath(id))));
  return metas.filter(m=>m&&m.status===STATUS.PUBLISHED&&m.fileUrl).map(m=>publicPhoto(m,safeText(profileId,100)));
}

async function apiRegisterProfile(payload={}){
  const name=safeText(payload.name,80);
  const congregation=safeText(payload.congregation,100);
  if(name.length<2)throw new Error('Ingresá tu nombre.');
  if(congregation.length<2)throw new Error('Ingresá tu congregación.');
  const profileId=crypto.randomUUID();
  const ownerSecret=randomSecret(32);
  const recoveryCode=createRecoveryCode();
  const now=new Date().toISOString();
  const profile={profileId,name,congregation,ownerHash:hash(ownerSecret),recoveryHash:hash(normalizeRecovery(recoveryCode)),createdAt:now,updatedAt:now};
  await Promise.all([writeJson(profilePath(profileId),profile),writeJson(recoveryPath(profile.recoveryHash),{profileId}),ensureCongregation(congregation)]);
  return {ok:true,profile:{profileId,ownerSecret,recoveryCode,name,congregation}};
}

async function apiRecoverProfile(code){
  const normalized=normalizeRecovery(code);
  if(!normalized)throw new Error('Código de recuperación inválido.');
  const oldRecoveryHash=hash(normalized);
  const mapping=await readJson(recoveryPath(oldRecoveryHash));
  if(!mapping?.profileId)throw new Error('No encontramos ese código de recuperación.');
  const profile=await readJson(profilePath(mapping.profileId));
  if(!profile)throw new Error('Perfil no encontrado.');
  const ownerSecret=randomSecret(32);
  const recoveryCode=createRecoveryCode();
  const newRecoveryHash=hash(normalizeRecovery(recoveryCode));
  profile.ownerHash=hash(ownerSecret);
  profile.recoveryHash=newRecoveryHash;
  profile.updatedAt=new Date().toISOString();
  await Promise.all([writeJson(profilePath(profile.profileId),profile),writeJson(recoveryPath(newRecoveryHash),{profileId:profile.profileId}),deleteByPath(recoveryPath(oldRecoveryHash))]);
  return {ok:true,profile:{profileId:profile.profileId,ownerSecret,recoveryCode,name:profile.name,congregation:profile.congregation}};
}

// Compatibilidad con clientes anteriores a V1.2.0. La V1.2.0 usa /api/upload-photo
// y carga el binario directamente a Blob para conservar resolución 4K.
async function apiUploadPhoto(payload={}){
  const profileId=safeText(payload.profileId,100);
  const ownerSecret=safeText(payload.ownerSecret,300);
  const profile=await verifyProfile(profileId,ownerSecret);
  const caption=safeText(payload.caption,220);
  const originalName=safeFileName(payload.fileName||'foto.jpg');
  const mimeType=normalizeMime(payload.mimeType,originalName);
  const base64=String(payload.base64||'');
  if(!base64)throw new Error('La foto llegó vacía.');
  const bytes=Buffer.from(base64,'base64');
  if(!bytes.length)throw new Error('No pudimos leer la foto.');
  if(bytes.length>MAX_LEGACY_UPLOAD_BYTES)throw new Error('Actualizá el app para subir fotos 4K de hasta 32 MB.');
  if(!/^image\/(jpeg|png|webp|heic|heif)$/i.test(mimeType))throw new Error('Formato de imagen no permitido.');
  const id=crypto.randomUUID();
  const ext=extensionForMime(mimeType,originalName);
  const filePath=`files/${id}/foto${ext}`;
  const blob=await put(filePath,bytes,{access:'public',addRandomSuffix:false,contentType:mimeType});
  const now=new Date().toISOString();
  const meta={id,profileId,uploaderName:safeText(profile.name,80),congregation:safeText(profile.congregation,100),caption,status:STATUS.PUBLISHED,uploadedAt:now,updatedAt:now,originalName,mimeType,size:bytes.length,width:0,height:0,fileUrl:blob.url,downloadUrl:blob.downloadUrl||blob.url,thumbnailUrl:blob.url,storageFormat:'legacy-base64'};
  await Promise.all([writeJson(photoMetaPath(id),meta),ensureCongregation(meta.congregation)]);
  invalidateCaches();
  return publicPhoto(meta,profileId);
}

async function apiDeleteOwnPhoto(photoId,profileId,ownerSecret){
  const id=safeText(photoId,100);
  const pid=safeText(profileId,100);
  await verifyProfile(pid,safeText(ownerSecret,300));
  const meta=await readJson(photoMetaPath(id));
  if(!meta)throw new Error('Foto no encontrada.');
  if(String(meta.profileId)!==pid)throw new Error('Solo el autor puede eliminar esta foto.');
  if(meta.status===STATUS.DELETED)return {ok:true};
  const urls=[meta.fileUrl,meta.thumbnailUrl].filter(Boolean);
  for(const url of [...new Set(urls)])await deleteUrl(url);
  meta.status=STATUS.DELETED;
  meta.updatedAt=new Date().toISOString();
  meta.deletedAt=meta.updatedAt;
  meta.fileUrl='';meta.downloadUrl='';meta.thumbnailUrl='';
  await writeJson(photoMetaPath(id),meta);
  invalidateCaches();
  return {ok:true};
}

async function apiCreateZip(photoIds){
  await cleanupOldExports();
  const ids=Array.isArray(photoIds)?photoIds.slice(0,MAX_ZIP_PHOTOS).map(v=>safeText(v,100)).filter(Boolean):[];
  if(!ids.length)throw new Error('Seleccioná al menos una foto.');
  const metas=(await Promise.all(ids.map(id=>readJson(photoMetaPath(id))))).filter(m=>m&&m.status===STATUS.PUBLISHED&&m.fileUrl);
  if(!metas.length)throw new Error('Las fotos seleccionadas ya no están disponibles.');
  const totalBytes=metas.reduce((n,m)=>n+Number(m.size||0),0);
  if(totalBytes>MAX_ZIP_BYTES)throw new Error('La selección es demasiado grande para un solo ZIP. Elegí menos fotos.');
  const zip=new JSZip();
  for(let i=0;i<metas.length;i++){
    const m=metas[i];
    const response=await fetch(m.fileUrl,{cache:'no-store'});
    if(!response.ok)continue;
    const buf=Buffer.from(await response.arrayBuffer());
    zip.file(`${String(i+1).padStart(2,'0')}_${safeFileName(m.originalName||`foto_${m.id}.jpg`)}`,buf);
  }
  const out=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:4}});
  const zipBlob=await put(`exports/seleccion-${Date.now()}-${crypto.randomUUID()}.zip`,out,{access:'public',addRandomSuffix:false,contentType:'application/zip',cacheControlMaxAge:60});
  return {ok:true,count:metas.length,url:zipBlob.downloadUrl||zipBlob.url};
}

async function cleanupOldExports(){
  try{
    const blobs=await listAll('exports/');
    const cutoff=Date.now()-EXPORT_TTL_MS;
    const expired=blobs.filter(b=>new Date(b.uploadedAt||0).getTime()<cutoff).slice(0,100);
    await Promise.all(expired.map(b=>deleteUrl(b.url)));
  }catch(err){console.warn('[RG26 EXPORT CLEANUP]',err?.message||err);}
}

async function apiAdminLogin(key){verifyAdmin(key);return {ok:true};}

async function apiAdminGetData(key){
  verifyAdmin(key);
  const [photos,congregations]=await Promise.all([loadAllPhotoMeta(),getCongregations()]);
  const sorted=photos.slice().sort((a,b)=>String(b.uploadedAt||'').localeCompare(String(a.uploadedAt||'')));
  return {ok:true,congregations,stats:adminStats(photos),photos:sorted.slice(0,500).map(adminPhoto)};
}

async function apiAdminSetStatus(photoId,status,reason,key){
  verifyAdmin(key);
  const id=safeText(photoId,100),next=safeText(status,20);
  if(![STATUS.PUBLISHED,STATUS.PENDING,STATUS.HIDDEN].includes(next))throw new Error('Estado inválido.');
  const meta=await readJson(photoMetaPath(id));
  if(!meta)throw new Error('Foto no encontrada.');
  if(meta.status===STATUS.DELETED)throw new Error('Una foto eliminada por su autor no puede ser restaurada.');
  meta.status=next;meta.moderationReason=safeText(reason,250);meta.updatedAt=new Date().toISOString();
  await writeJson(photoMetaPath(id),meta);invalidateCaches();return {ok:true};
}

async function apiAdminAddCongregation(name,key){
  verifyAdmin(key);
  const value=safeText(name,100);
  if(value.length<2)throw new Error('Nombre de congregación inválido.');
  await ensureCongregation(value);
  return {ok:true,congregations:await getCongregations(true)};
}

function listPhotosFrom(photos,params){
  const congregation=normalize(params.congregation),q=normalize(params.query);
  let rows=photos.filter(p=>p&&p.status===STATUS.PUBLISHED&&p.fileUrl);
  if(congregation)rows=rows.filter(p=>normalize(p.congregation)===congregation);
  if(q)rows=rows.filter(p=>normalize(`${p.uploaderName} ${p.congregation} ${p.caption||''}`).includes(q));
  rows.sort((a,b)=>String(b.uploadedAt||'').localeCompare(String(a.uploadedAt||'')));
  const total=rows.length,offset=Math.min(params.offset||0,total),limit=params.limit||48;
  const slice=rows.slice(offset,offset+limit).map(p=>publicPhoto(p,params.profileId));
  const nextOffset=offset+slice.length;
  return {items:slice,total,nextOffset,hasMore:nextOffset<total};
}

function publicPhoto(meta,profileId=''){
  return {id:meta.id,uploaderName:meta.uploaderName||'',congregation:meta.congregation||'',caption:meta.caption||'',uploadedAt:meta.uploadedAt||'',thumbnailUrl:meta.thumbnailUrl||meta.fileUrl||'',downloadUrl:meta.downloadUrl||meta.fileUrl||'',mimeType:meta.mimeType||'',size:Number(meta.size||0),width:Number(meta.width||0),height:Number(meta.height||0),isMine:!!profileId&&String(meta.profileId||'')===String(profileId)};
}
function adminPhoto(meta){return {id:meta.id,uploaderName:meta.uploaderName||'',congregation:meta.congregation||'',caption:meta.caption||'',uploadedAt:meta.uploadedAt||'',originalName:meta.originalName||'',status:meta.status||STATUS.PENDING};}
function publicStats(photos,congregations){return {photos:photos.filter(p=>p.status===STATUS.PUBLISHED&&p.fileUrl).length,congregations:congregations.length,collaborators:new Set(photos.filter(p=>p.status!==STATUS.DELETED).map(p=>p.profileId).filter(Boolean)).size};}
function adminStats(photos){return {total:photos.length,published:photos.filter(p=>p.status===STATUS.PUBLISHED).length,pending:photos.filter(p=>p.status===STATUS.PENDING).length,hidden:photos.filter(p=>p.status===STATUS.HIDDEN).length,deleted:photos.filter(p=>p.status===STATUS.DELETED).length};}

async function verifyProfile(profileId,ownerSecret){
  if(!profileId||!ownerSecret)throw new Error('Perfil inválido.');
  const profile=await readJson(profilePath(profileId));
  if(!profile||!secureEqual(String(profile.ownerHash||''),hash(ownerSecret)))throw new Error('No pudimos verificar el autor de esta foto.');
  return profile;
}
function verifyAdmin(key){const expected=String(process.env.ADMIN_KEY||'');if(!expected)throw new Error('Administración no configurada.');if(!secureEqual(hash(safeText(key,300)),hash(expected)))throw new Error('Clave de administración incorrecta.');}

async function loadAllPhotoMeta(force=false){
  if(!force&&Date.now()-photoCache.at<2500)return photoCache.items;
  const entries=await listJson('photos/');
  const out=entries.map(e=>e.value).filter(v=>v?.id);
  photoCache={at:Date.now(),items:out};return out;
}
async function getCongregations(force=false){
  if(!force&&Date.now()-congregationCache.at<5000)return congregationCache.items;
  const entries=await listJson('congregations/');
  const values=entries.map(e=>safeText(e.value?.name,100)).filter(Boolean);
  const unique=[...new Set(values)].sort((a,b)=>a.localeCompare(b,'es'));
  congregationCache={at:Date.now(),items:unique};return unique;
}
async function ensureCongregation(name){const value=safeText(name,100);if(!value)return;await writeJson(`congregations/${hash(normalize(value)).slice(0,24)}.json`,{name:value});congregationCache.at=0;}
function invalidateCaches(){photoCache.at=0;congregationCache.at=0;}
function profilePath(id){return `profiles/${safeId(id)}.json`;}
function recoveryPath(recoveryHash){return `recovery/${safeId(recoveryHash)}.json`;}
function photoMetaPath(id){return `photos/${safeId(id)}.json`;}
function safeId(v){return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);}
function safeText(v,max=200){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max);}
function normalize(v){return safeText(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
function hash(v){return crypto.createHash('sha256').update(String(v||''),'utf8').digest('hex');}
function randomSecret(bytes=24){return crypto.randomBytes(bytes).toString('base64url');}
function normalizeRecovery(v){return safeText(v,60).toUpperCase().replace(/[^A-Z0-9]/g,'');}
function createRecoveryCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<8;i++)s+=alphabet[crypto.randomInt(0,alphabet.length)];return `RG26-${s.slice(0,4)}-${s.slice(4)}`;}
function secureEqual(a,b){const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function clampInt(v,min,max,fallback){const n=Number(v);if(!Number.isFinite(n))return fallback;return Math.max(min,Math.min(max,Math.trunc(n)));}
function safeFileName(name){const clean=safeText(name,140).replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,' ').trim();return clean||'foto.jpg';}
function normalizeMime(mime,name){const m=safeText(mime,80).toLowerCase();if(/^image\/(jpeg|png|webp|heic|heif)$/.test(m))return m;if(/\.png$/i.test(name))return'image/png';if(/\.webp$/i.test(name))return'image/webp';if(/\.hei[cf]$/i.test(name))return'image/heic';return'image/jpeg';}
function extensionForMime(mime,name){if(mime==='image/png')return'.png';if(mime==='image/webp')return'.webp';if(mime==='image/heic'||mime==='image/heif')return'.heic';const m=String(name||'').match(/\.(jpe?g)$/i);return m?`.${m[1].toLowerCase()}`:'.jpg';}
