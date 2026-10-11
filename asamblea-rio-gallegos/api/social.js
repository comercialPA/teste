import crypto from 'node:crypto';
import webpush from 'web-push';
import { readJson, writeJson, listJson, deleteByPath } from './_data.js';
import { assertRateLimit } from './_rate-limit.js';

const PUBLIC_APP_URL=process.env.PUBLIC_APP_URL||'https://asamblea-rio-gallegos.vercel.app';
const STATUS_PUBLISHED='PUBLICADA';
const MAX_NOTIFICATIONS=60;

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'Método no permitido.'});
  }
  try{
    const body=req.body&&typeof req.body==='object'?req.body:{};
    const action=safeText(body.action,50);
    const payload=body.payload&&typeof body.payload==='object'?body.payload:{};
    applyRate(req,action);
    const methods={config:apiConfig,state:apiLikeState,like:apiSetLike,notifications:apiNotifications,markRead:apiMarkRead,subscribe:apiSubscribe,unsubscribe:apiUnsubscribe,resetSubscriptions:apiResetSubscriptions};
    if(!methods[action])throw new Error('Acción social no permitida.');
    const result=await methods[action](payload);
    return res.status(200).json({ok:true,result});
  }catch(err){
    console.error('[RG26 SOCIAL]',err);
    if(err?.retryAfter)res.setHeader('Retry-After',String(err.retryAfter));
    return res.status(err?.statusCode||400).json({ok:false,error:err?.message||'Error social.'});
  }
}

function applyRate(req,action){
  const cfg={
    like:{limit:120,windowMs:60*1000},
    subscribe:{limit:20,windowMs:10*60*1000},
    unsubscribe:{limit:30,windowMs:10*60*1000},
    resetSubscriptions:{limit:10,windowMs:10*60*1000},
    notifications:{limit:90,windowMs:5*60*1000},
    markRead:{limit:90,windowMs:5*60*1000}
  }[action]||{limit:240,windowMs:60*1000};
  assertRateLimit(req,`social:${action||'unknown'}`,cfg);
}

async function apiConfig(){return {version:'1.2.0',pushAvailable:pushConfigured(),vapidPublicKey:pushConfigured()?String(process.env.VAPID_PUBLIC_KEY||''):''};}

async function apiLikeState(payload){
  const photoId=safeText(payload.photoId,100);
  if(!photoId)throw new Error('Foto inválida.');
  const meta=await readJson(photoMetaPath(photoId));
  if(!meta||meta.status!==STATUS_PUBLISHED||!meta.fileUrl)throw new Error('Foto no encontrada.');
  let liked=false;
  const profileId=safeText(payload.profileId,100);
  if(profileId){const record=await readJson(likePath(photoId,profileId));liked=!!record?.active;}
  const count=await countActiveLikes(photoId);
  return {liked,count,isOwn:!!profileId&&profileId===String(meta.profileId||'')};
}

async function apiSetLike(payload){
  const photoId=safeText(payload.photoId,100);
  const profileId=safeText(payload.profileId,100);
  const ownerSecret=safeText(payload.ownerSecret,300);
  if(!photoId)throw new Error('Foto inválida.');
  const profile=await verifyProfile(profileId,ownerSecret);
  const meta=await readJson(photoMetaPath(photoId));
  if(!meta||meta.status!==STATUS_PUBLISHED||!meta.fileUrl)throw new Error('Foto no encontrada.');
  if(String(meta.profileId||'')===profileId)throw new Error('No podés indicar Me gusta en tu propia foto.');

  const path=likePath(photoId,profileId);
  const previous=await readJson(path);
  const previousLiked=!!previous?.active;
  const requested=typeof payload.liked==='boolean'?payload.liked:!previousLiked;
  const now=new Date().toISOString();
  if(requested===previousLiked)return {liked:requested,count:await countActiveLikes(photoId)};

  const likeRecord={photoId,likerHash:hash(profileId),active:requested,createdAt:previous?.createdAt||now,updatedAt:now,lastNotifiedAt:previous?.lastNotifiedAt||''};
  const shouldCreateNotification=requested&&!previousLiked&&shouldNotify(previous?.lastNotifiedAt);
  if(shouldCreateNotification)likeRecord.lastNotifiedAt=now;
  await writeJson(path,likeRecord);

  if(shouldCreateNotification){
    const currentMeta=await readJson(photoMetaPath(photoId));
    if(currentMeta&&currentMeta.status===STATUS_PUBLISHED&&currentMeta.fileUrl){
      const notification={id:crypto.randomUUID(),type:'LIKE',photoId,fromName:safeText(profile.name,80),message:`${safeText(profile.name,80)} indicó que le gusta tu foto.`,createdAt:now,readAt:'',url:`${PUBLIC_APP_URL}/?foto=${encodeURIComponent(photoId)}`};
      await createNotification(String(currentMeta.profileId||''),notification);
    }
  }
  return {liked:requested,count:await countActiveLikes(photoId)};
}

async function countActiveLikes(photoId){
  const entries=await listJson(likePrefix(photoId));
  return entries.reduce((n,e)=>n+(e.value?.active===true?1:0),0);
}

async function apiNotifications(payload){
  const profile=await verifyProfile(safeText(payload.profileId,100),safeText(payload.ownerSecret,300));
  const entries=await listJson(notificationPrefix(profile.profileId));
  const items=[];
  for(const entry of entries.slice(-MAX_NOTIFICATIONS).reverse()){
    const decoded=decryptJson(entry.value);
    if(decoded?.id)items.push(decoded);
  }
  items.sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  return {items,unread:items.filter(n=>!n.readAt).length};
}

async function apiMarkRead(payload){
  const profile=await verifyProfile(safeText(payload.profileId,100),safeText(payload.ownerSecret,300));
  const entries=(await listJson(notificationPrefix(profile.profileId))).slice(-MAX_NOTIFICATIONS);
  const now=new Date().toISOString();
  let changed=0;
  for(const entry of entries){
    const item=decryptJson(entry.value);
    if(!item?.id||item.readAt)continue;
    item.readAt=now;
    await writeJson(entry.pathname,encryptJson(item));
    changed++;
  }
  return {ok:true,changed};
}

async function apiSubscribe(payload){
  if(!pushConfigured())throw new Error('Notificaciones push no configuradas.');
  const profile=await verifyProfile(safeText(payload.profileId,100),safeText(payload.ownerSecret,300));
  const subscription=normalizeSubscription(payload.subscription);
  await writeJson(pushPath(profile.profileId,subscription.endpoint),encryptJson({subscription,createdAt:new Date().toISOString()}));
  return {ok:true};
}
async function apiUnsubscribe(payload){
  const profile=await verifyProfile(safeText(payload.profileId,100),safeText(payload.ownerSecret,300));
  const endpoint=safeText(payload.endpoint,2000);
  if(endpoint)await deleteByPath(pushPath(profile.profileId,endpoint));
  return {ok:true};
}
async function apiResetSubscriptions(payload){
  const profile=await verifyProfile(safeText(payload.profileId,100),safeText(payload.ownerSecret,300));
  const entries=await listJson(pushPrefix(profile.profileId));
  await Promise.all(entries.map(e=>deleteByPath(e.pathname)));
  return {ok:true,removed:entries.length};
}

async function createNotification(ownerProfileId,notification){
  if(!ownerProfileId)return;
  const pathname=`${notificationPrefix(ownerProfileId)}${Date.now()}-${safeId(notification.id)}.json`;
  try{await writeJson(pathname,encryptJson(notification));}catch(err){console.error('[RG26 NOTIFICATION STORE]',err);}
  if(!pushConfigured())return;
  try{await sendPushToProfile(ownerProfileId,notification);}catch(err){console.error('[RG26 PUSH]',err);}
}

async function sendPushToProfile(profileId,notification){
  configureWebPush();
  const entries=await listJson(pushPrefix(profileId));
  if(!entries.length)return;
  const payload=JSON.stringify({title:'Nuevo Me gusta',body:notification.message,icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:`like-${notification.photoId}`,url:notification.url,photoId:notification.photoId});
  for(const entry of entries){
    const stored=decryptJson(entry.value);
    const subscription=stored?.subscription;
    if(!subscription?.endpoint)continue;
    try{await webpush.sendNotification(subscription,payload,{TTL:60*60*12,urgency:'normal'});}
    catch(err){
      if(err?.statusCode===404||err?.statusCode===410)await deleteByPath(entry.pathname);
      else console.error('[RG26 PUSH DEVICE]',err?.statusCode||'',err?.message||err);
    }
  }
}

function configureWebPush(){webpush.setVapidDetails(String(process.env.VAPID_SUBJECT||PUBLIC_APP_URL),String(process.env.VAPID_PUBLIC_KEY||''),String(process.env.VAPID_PRIVATE_KEY||''));}
function pushConfigured(){return !!(process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY&&process.env.NOTIF_ENC_KEY);}
async function verifyProfile(profileId,ownerSecret){if(!profileId||!ownerSecret)throw new Error('Primero creá o recuperá tu perfil.');const profile=await readJson(profilePath(profileId));if(!profile||!secureEqual(String(profile.ownerHash||''),hash(ownerSecret)))throw new Error('No pudimos verificar tu perfil.');return profile;}
function normalizeSubscription(value){if(!value||typeof value!=='object')throw new Error('Suscripción push inválida.');const endpoint=safeText(value.endpoint,2000),p256dh=safeText(value.keys?.p256dh,500),auth=safeText(value.keys?.auth,500);if(!endpoint||!p256dh||!auth)throw new Error('Suscripción push incompleta.');return {endpoint,expirationTime:value.expirationTime||null,keys:{p256dh,auth}};}
function shouldNotify(last){if(!last)return true;const ms=Date.parse(last);return !Number.isFinite(ms)||Date.now()-ms>12*60*60*1000;}
function encryptionKey(){const raw=String(process.env.NOTIF_ENC_KEY||'');if(!raw)throw new Error('Cifrado de notificaciones no configurado.');const key=Buffer.from(raw.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(raw.length/4)*4,'='),'base64');if(key.length!==32)throw new Error('Clave de cifrado inválida.');return key;}
function encryptJson(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',encryptionKey(),iv);const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);const tag=cipher.getAuthTag();return {v:1,iv:iv.toString('base64url'),tag:tag.toString('base64url'),data:data.toString('base64url')};}
function decryptJson(value){try{if(!value||value.v!==1)return null;const decipher=crypto.createDecipheriv('aes-256-gcm',encryptionKey(),Buffer.from(value.iv,'base64url'));decipher.setAuthTag(Buffer.from(value.tag,'base64url'));const out=Buffer.concat([decipher.update(Buffer.from(value.data,'base64url')),decipher.final()]);return JSON.parse(out.toString('utf8'));}catch(_){return null;}}
function profilePath(id){return `profiles/${safeId(id)}.json`;}
function photoMetaPath(id){return `photos/${safeId(id)}.json`;}
function likePrefix(photoId){return `social/likes/${safeId(photoId)}/`;}
function likePath(photoId,profileId){return `${likePrefix(photoId)}${hash(profileId).slice(0,40)}.json`;}
function notificationPrefix(profileId){return `social/notifications/${hash(profileId).slice(0,40)}/`;}
function pushPrefix(profileId){return `social/push/${hash(profileId).slice(0,40)}/`;}
function pushPath(profileId,endpoint){return `${pushPrefix(profileId)}${hash(endpoint).slice(0,40)}.json`;}
function safeId(v){return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);}
function safeText(v,max=200){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max);}
function hash(v){return crypto.createHash('sha256').update(String(v||''),'utf8').digest('hex');}
function secureEqual(a,b){const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
