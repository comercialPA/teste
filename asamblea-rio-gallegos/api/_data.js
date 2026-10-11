import { put, list, del } from '@vercel/blob';
import crypto from 'node:crypto';

const ENC_VERSION = 2;

function key(){
  const raw=String(process.env.DATA_ENC_KEY||'');
  if(!raw) throw new Error('Cifrado de datos no configurado.');
  const normalized=raw.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(raw.length/4)*4,'=');
  const buf=Buffer.from(normalized,'base64');
  if(buf.length!==32) throw new Error('Clave de cifrado de datos inválida.');
  return buf;
}

function encrypt(value){
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return {
    __rg26:ENC_VERSION,
    alg:'A256GCM',
    iv:iv.toString('base64url'),
    tag:cipher.getAuthTag().toString('base64url'),
    data:data.toString('base64url')
  };
}

function decrypt(value){
  if(!value||value.__rg26!==ENC_VERSION) return {value,encrypted:false};
  const decipher=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(value.iv,'base64url'));
  decipher.setAuthTag(Buffer.from(value.tag,'base64url'));
  const out=Buffer.concat([decipher.update(Buffer.from(value.data,'base64url')),decipher.final()]);
  return {value:JSON.parse(out.toString('utf8')),encrypted:true};
}

export async function writeJson(pathname,value){
  return put(pathname,JSON.stringify(encrypt(value)),{
    access:'public',
    addRandomSuffix:false,
    allowOverwrite:true,
    contentType:'application/json',
    cacheControlMaxAge:60
  });
}

export async function readJson(pathname,{migrate=true}={}){
  const found=await findExact(pathname);
  if(!found) return null;
  const raw=await fetchRawJson(found.url);
  if(!raw) return null;
  const decoded=decrypt(raw);
  if(migrate&&!decoded.encrypted){
    try{await writeJson(pathname,decoded.value);}catch(err){console.error('[RG26 DATA MIGRATE]',pathname,err?.message||err);}
  }
  return decoded.value;
}

export async function listJson(prefix,{migrate=true}={}){
  const blobs=(await listAll(prefix)).filter(b=>b.pathname.endsWith('.json'));
  const rows=[];
  for(let i=0;i<blobs.length;i+=40){
    const batch=blobs.slice(i,i+40);
    const values=await Promise.all(batch.map(async blob=>{
      const raw=await fetchRawJson(blob.url);
      if(!raw) return null;
      try{
        const decoded=decrypt(raw);
        if(migrate&&!decoded.encrypted){
          try{await writeJson(blob.pathname,decoded.value);}catch(err){console.error('[RG26 DATA MIGRATE]',blob.pathname,err?.message||err);}
        }
        return {pathname:blob.pathname,value:decoded.value,blob};
      }catch(err){
        console.error('[RG26 DATA DECRYPT]',blob.pathname,err?.message||err);
        return null;
      }
    }));
    rows.push(...values.filter(Boolean));
  }
  return rows;
}

export async function listAll(prefix){
  const out=[];
  let cursor;
  do{
    const result=await list({prefix,limit:1000,...(cursor?{cursor}:{})});
    out.push(...(result.blobs||[]));
    cursor=result.hasMore?result.cursor:undefined;
  }while(cursor);
  return out;
}

export async function findExact(pathname){
  const result=await list({prefix:pathname,limit:5});
  return (result.blobs||[]).find(b=>b.pathname===pathname)||null;
}

export async function deleteByPath(pathname){
  const found=await findExact(pathname);
  if(found?.url) await deleteUrl(found.url);
}

export async function deleteUrl(url){
  try{await del(url);}catch(_){}
}

export async function fetchRawJson(url){
  try{
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) return null;
    return response.json();
  }catch(_){return null;}
}

export function dataStorageMode(){return 'encrypted-aes256gcm';}
