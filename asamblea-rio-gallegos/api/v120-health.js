import { issueSignedToken, presignUrl, list, del } from '@vercel/blob';
import crypto from 'node:crypto';
import { writeJson, readJson, findExact, fetchRawJson, deleteByPath } from './_data.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false});
  const id=crypto.randomUUID();
  const jsonPath=`health-v120/${id}.json`;
  const imagePath=`health-v120/${id}.jpg`;
  try{
    const marker=`health-${id}`;
    await writeJson(jsonPath,{marker,version:'1.2.0'});
    const found=await findExact(jsonPath);
    const raw=found?await fetchRawJson(found.url):null;
    const decoded=await readJson(jsonPath,{migrate:false});
    const encrypted=raw?.__rg26===2&&!JSON.stringify(raw).includes(marker)&&decoded?.marker===marker;

    const validUntil=Date.now()+3*60*1000;
    const signed=await issueSignedToken({pathname:imagePath,operations:['put'],validUntil,allowedContentTypes:['image/jpeg'],maximumSizeInBytes:1024});
    const generated=await presignUrl(signed,{operation:'put',pathname:imagePath,access:'public',validUntil,allowedContentTypes:['image/jpeg'],maximumSizeInBytes:1024,addRandomSuffix:false,allowOverwrite:false});
    const uploadUrl=typeof generated==='string'?generated:(generated?.presignedUrl||generated?.url||'');
    if(!uploadUrl)throw new Error('signed url missing');
    const putResponse=await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':'image/jpeg'},body:Buffer.from([0xff,0xd8,0xff,0xd9])});
    const listed=await list({prefix:imagePath,limit:5});
    const image=(listed.blobs||[]).find(b=>b.pathname===imagePath);
    if(image?.url)await del(image.url);
    await deleteByPath(jsonPath);

    return res.status(200).json({ok:encrypted&&putResponse.ok&&!!image,version:'1.2.0',encryptedMetadata:encrypted,signedUpload:putResponse.ok&&!!image,status:putResponse.status});
  }catch(err){
    try{await deleteByPath(jsonPath);}catch(_){}
    try{const listed=await list({prefix:imagePath,limit:5});const image=(listed.blobs||[]).find(b=>b.pathname===imagePath);if(image?.url)await del(image.url);}catch(_){}
    console.error('[V120 HEALTH]',err);
    return res.status(500).json({ok:false,error:err?.message||'health error'});
  }
}
