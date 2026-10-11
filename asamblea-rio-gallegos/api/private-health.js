import { put, get, del } from '@vercel/blob';
import crypto from 'node:crypto';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({ok:false});
  const storeId=String(process.env.PRIVATE_BLOB_STORE_ID||'');
  const oidcToken=String(process.env.VERCEL_OIDC_TOKEN||'');
  if(!storeId||!oidcToken) return res.status(503).json({ok:false,storeConfigured:!!storeId,oidcAvailable:!!oidcToken});
  const path=`health/${crypto.randomUUID()}.json`;
  const opts={oidcToken,storeId};
  try{
    await put(path,JSON.stringify({ok:true,at:new Date().toISOString()}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',...opts});
    const result=await get(path,{access:'private',...opts});
    const text=result?.stream?await new Response(result.stream).text():'';
    await del(path,opts);
    return res.status(200).json({ok:!!text,privateStore:true,readBack:!!text});
  }catch(err){
    console.error('[PRIVATE HEALTH]',err);
    return res.status(500).json({ok:false,error:err?.message||'private storage error'});
  }
}
