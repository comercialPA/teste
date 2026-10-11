const STORE=globalThis.__RG26_RATE_LIMIT__||(globalThis.__RG26_RATE_LIMIT__=new Map());

export function clientIp(req){
  const forwarded=String(req.headers?.['x-forwarded-for']||'').split(',')[0].trim();
  return forwarded||String(req.headers?.['x-real-ip']||req.socket?.remoteAddress||'unknown').trim()||'unknown';
}

export function assertRateLimit(req,scope,{limit=60,windowMs=60000}={}){
  const now=Date.now();
  const key=`${scope}:${clientIp(req)}`;
  let item=STORE.get(key);
  if(!item||now>=item.resetAt) item={count:0,resetAt:now+windowMs};
  item.count++;
  STORE.set(key,item);
  if(STORE.size>2500){
    for(const [k,v] of STORE){if(now>=v.resetAt)STORE.delete(k);}
  }
  if(item.count>limit){
    const err=new Error('Demasiadas solicitudes. Esperá un momento y volvé a intentar.');
    err.statusCode=429;
    err.retryAfter=Math.max(1,Math.ceil((item.resetAt-now)/1000));
    throw err;
  }
  return {remaining:Math.max(0,limit-item.count),resetAt:item.resetAt};
}
