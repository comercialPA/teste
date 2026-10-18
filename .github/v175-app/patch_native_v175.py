from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')
a='    private static final class TerritoryImage{'
assert a in s
s=s.replace(a,'''    private static final class CsvCacheEntry{
        final String csv;final long time;
        CsvCacheEntry(String csv,long time){this.csv=csv;this.time=time;}
    }
    private final java.util.concurrent.ConcurrentHashMap<String,CsvCacheEntry> sheetCache=new java.util.concurrent.ConcurrentHashMap<>();
    private static final long SHEET_CACHE_MS=120000L;
    private int mapRenderCacheHits=0,mapRenderCacheMisses=0;
    private void trimImageCache(File dir){
        File[] all=dir.listFiles((d,n)->n.endsWith(".png"));
        if(all==null||all.length<=1)return;
        java.util.Arrays.sort(all,(a1,b1)->Long.compare(b1.lastModified(),a1.lastModified()));
        long bytes=0;for(int i=0;i<all.length;i++){bytes+=all[i].length();
            if(i>=10||bytes>25000000L){bytes-=all[i].length();all[i].delete();}
        }
    }
    private byte[] readSmallFile(File file)throws Exception{
        if(file.length()<=0||file.length()>4500000L)throw new IllegalStateException("cache bounds");
        try(FileInputStream in=new FileInputStream(file);ByteArrayOutputStream out=new ByteArrayOutputStream()){
            byte[] buf=new byte[8192];int n;while((n=in.read(buf))!=-1)out.write(buf,0,n);return out.toByteArray();
        }
    }
'''+a,1)
start='    private TerritoryImage renderTerritoryPdf(int territory,String fileId)throws Exception{\n'
assert start in s
injection='''        File imageDir=new File(getCacheDir(),"territory-png-v175");
        if(!imageDir.exists())imageDir.mkdirs();
        File cached=new File(imageDir,"territory_"+territory+"_"+fileId+".png");
        if(cached.exists()&&cached.length()>1000&&cached.length()<=4500000L){
            android.graphics.BitmapFactory.Options opts=new android.graphics.BitmapFactory.Options();
            opts.inJustDecodeBounds=true;
            android.graphics.BitmapFactory.decodeFile(cached.getAbsolutePath(),opts);
            if(opts.outWidth>500&&opts.outHeight>500){
                try{byte[] bytes=readSmallFile(cached);cached.setLastModified(System.currentTimeMillis());
                    mapRenderCacheHits++;return new TerritoryImage(bytes,opts.outWidth,opts.outHeight);
                }catch(Exception ignored){cached.delete();}
            }else cached.delete();
        }
        mapRenderCacheMisses++;
'''
s=s.replace(start,start+injection,1)
old='return new TerritoryImage(data,w,h);'
new='''try{File temp=new File(imageDir,cached.getName()+".tmp");
                try(FileOutputStream fo=new FileOutputStream(temp)){fo.write(data);fo.flush();}
                if(cached.exists())cached.delete();
                if(!temp.renameTo(cached)){copyFile(temp,cached);temp.delete();}
                trimImageCache(imageDir);
            }catch(Exception ignored){/* La lectura del mapa funciona incluso sin cache */ }
            return new TerritoryImage(data,w,h);'''
assert old in s
s=s.replace(old,new,1)
old='private String fetchSheetCsv(String id)throws Exception{String csv=fetchText('
new='''private String fetchSheetCsv(String id)throws Exception{
        final long now=System.currentTimeMillis();CsvCacheEntry entry=sheetCache.get(id);
        if(entry!=null&&now-entry.time<SHEET_CACHE_MS)return entry.csv;
        String csv=fetchText('''
assert old in s
s=s.replace(old,new,1)
old='if(looksLikeHtml(csv))throw new IllegalStateException("html");return csv;}'
new='if(looksLikeHtml(csv))throw new IllegalStateException("html");sheetCache.put(id,new CsvCacheEntry(csv,now));return csv;}'
assert old in s
s=s.replace(old,new,1)
old='o.put("webViewUrl",webView==null?"":String.valueOf(webView.getUrl()));return o.toString();'
new='o.put("webViewUrl",webView==null?"":String.valueOf(webView.getUrl()));o.put("mapCacheHits",mapRenderCacheHits);o.put("mapCacheMisses",mapRenderCacheMisses);o.put("sheetCacheEntries",sheetCache.size());return o.toString();'
assert old in s
s=s.replace(old,new,1)
s=s.replace('Versión: 1.7.4 · 28','Versión: 1.7.5 · 29').replace('1.7.4\\t28\\t','1.7.5\\t29\\t').replace('1.7.4\\\\t28\\\\t','1.7.5\\\\t29\\\\t')
s=s.replace('CongElCalafate/1.7.4 Android','CongElCalafate/1.7.5 Android')
p.write_text(s,encoding='utf-8')
print('V1.7.5 Native: cache LRU de mapas renderizados y CSV de planillas, diagnostico de cache')
