import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir=path.resolve('public');
const outDir=path.join(publicDir,'icons');
fs.rmSync(publicDir,{recursive:true,force:true});
fs.mkdirSync(outDir,{recursive:true});

const staticFiles=[
  'index.html',
  'app-1.css','app-2.css','app-3.css','app-4.css','app-5.css','app-6.css','app-7.css',
  'app-loader.js','app-gesture-fix.js','app-update-manager.js','version.json',
  'app-chunk-1.txt','app-chunk-2.txt','app-chunk-3.txt',
  'app-chunk-4.txt','app-chunk-5.txt','app-chunk-6.txt',
  'manifest.webmanifest','service-worker.js'
];
for(const file of staticFiles){
  const src=path.resolve(file);
  if(!fs.existsSync(src)) throw new Error(`Static asset missing: ${file}`);
  fs.copyFileSync(src,path.join(publicDir,file));
}

const crcTable=(()=>{
  const table=new Uint32Array(256);
  for(let n=0;n<256;n++){
    let c=n;
    for(let k=0;k<8;k++) c=(c&1)?0xedb88320^(c>>>1):c>>>1;
    table[n]=c>>>0;
  }
  return table;
})();

function crc32(buf){
  let c=0xffffffff;
  for(const b of buf) c=crcTable[(c^b)&0xff]^(c>>>8];
  return (c^0xffffffff)>>>0;
}
function chunk(type,data){
  const t=Buffer.from(type);
  const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);
  const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])),0);
  return Buffer.concat([len,t,data,crc]);
}
function png(width,height,rgba){
  const raw=Buffer.alloc((width*4+1)*height);
  for(let y=0;y<height;y++){
    const row=y*(width*4+1);raw[row]=0;
    rgba.copy(raw,row+1,y*width*4,(y+1)*width*4);
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
  ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),
    chunk('IDAT',zlib.deflateSync(raw,{level:9})),
    chunk('IEND',Buffer.alloc(0))
  ]);
}
function lerp(a,b,t){return Math.round(a+(b-a)*t)}
function makeIcon(size,maskable=false){
  const data=Buffer.alloc(size*size*4);
  const c0=[6,19,27], c1=[13,48,57], gold=[216,191,139], gold2=[239,217,169];
  const cx=size/2, cy=size/2;
  for(let y=0;y<size;y++){
    for(let x=0;x<size;x++){
      const i=(y*size+x)*4;
      const gx=(x/(size-1))*0.55+(1-y/(size-1))*0.45;
      data[i]=lerp(c0[0],c1[0],gx);
      data[i+1]=lerp(c0[1],c1[1],gx);
      data[i+2]=lerp(c0[2],c1[2],gx);
      data[i+3]=255;

      const nx=(x-cx)/(size/2), ny=(y-cy)/(size/2);
      const d=Math.abs(nx)+Math.abs(ny);
      const outer=maskable?0.53:0.58;
      const inner=maskable?0.39:0.43;
      if(d<=outer && d>=inner){
        const t=Math.max(0,Math.min(1,(ny+1)/2));
        data[i]=lerp(gold2[0],gold[0],t);
        data[i+1]=lerp(gold2[1],gold[1],t);
        data[i+2]=lerp(gold2[2],gold[2],t);
      }
      const r=Math.hypot(nx,ny);
      if(r<0.085){data[i]=gold2[0];data[i+1]=gold2[1];data[i+2]=gold2[2];}
    }
  }
  return png(size,size,data);
}

for(const [name,size,maskable] of [
  ['icon-192.png',192,false],
  ['icon-512.png',512,false],
  ['icon-maskable-512.png',512,true],
  ['apple-touch-icon.png',180,false]
]){
  fs.writeFileSync(path.join(outDir,name),makeIcon(size,maskable));
  console.log('generated',name);
}

console.log(`PWA static bundle ready in ${publicDir}`);
