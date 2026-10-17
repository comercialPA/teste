from pathlib import Path

p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
text=p.read_text(encoding='utf-8')
if 'saveDiagnosticText' in text and 'getDiagnostics' in text:
    print('diagnostic native bridge already present')
    raise SystemExit(0)

imports='''import android.content.ClipData;\nimport android.content.ClipboardManager;\nimport android.content.ContentValues;\nimport android.content.Context;\n'''
if 'import android.content.ClipData;' not in text:
    text=text.replace('import android.app.Activity;\n', 'import android.app.Activity;\n'+imports, 1)
if 'import android.os.Environment;' not in text:
    text=text.replace('import android.os.Bundle;\n', 'import android.os.Bundle;\nimport android.os.Environment;\n', 1)
if 'import android.provider.MediaStore;' not in text:
    text=text.replace('import android.os.ParcelFileDescriptor;\n', 'import android.os.ParcelFileDescriptor;\nimport android.provider.MediaStore;\n', 1)
if 'import java.io.OutputStream;' not in text:
    text=text.replace('import java.io.InputStream;\n', 'import java.io.InputStream;\nimport java.io.OutputStream;\n', 1)
if 'import java.util.Locale;' not in text:
    text=text.replace('import java.util.HashSet;\n', 'import java.util.HashSet;\nimport java.util.Locale;\n', 1)

bridge_methods=r'''
        @JavascriptInterface public String getDiagnostics(){return buildNativeDiagnostics();}
        @JavascriptInterface public void copyText(String text){
            final String value=safeDiagnosticText(text);runOnUiThread(()->{try{ClipboardManager cb=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);if(cb!=null){cb.setPrimaryClip(ClipData.newPlainText("Diagnóstico Cong El Calafate",value));Toast.makeText(MainActivity.this,"Diagnóstico copiado.",Toast.LENGTH_SHORT).show();}}catch(Exception e){Toast.makeText(MainActivity.this,"No se pudo copiar el diagnóstico.",Toast.LENGTH_SHORT).show();}});
        }
        @JavascriptInterface public void saveDiagnosticText(String filename,String text){
            final String name=filename,body=safeDiagnosticText(text);networkExecutor.execute(()->{try{String saved=saveDiagnosticFile(name,body);runOnUiThread(()->Toast.makeText(MainActivity.this,"Diagnóstico guardado: "+saved,Toast.LENGTH_LONG).show());}catch(Exception e){runOnUiThread(()->Toast.makeText(MainActivity.this,"No se pudo guardar el diagnóstico.",Toast.LENGTH_LONG).show());}});
        }
'''
helper_methods=r'''
    private String safeDiagnosticText(String text){if(text==null)return "";return text.length()>250_000?text.substring(0,250_000):text;}
    private String buildNativeDiagnostics(){
        try{String appVersion="1.6.3";long versionCode=21;try{android.content.pm.PackageInfo pi=getPackageManager().getPackageInfo(getPackageName(),0);if(pi.versionName!=null)appVersion=pi.versionName;if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.P)versionCode=pi.getLongVersionCode();else versionCode=pi.versionCode;}catch(Exception ignored){}JSONObject o=new JSONObject();o.put("appName","Cong El Calafate");o.put("appVersion",appVersion);o.put("versionCode",versionCode);o.put("packageName",getPackageName());o.put("androidSdk",Build.VERSION.SDK_INT);o.put("manufacturer",Build.MANUFACTURER);o.put("model",Build.MODEL);o.put("device",Build.DEVICE);o.put("locale",Locale.getDefault().toLanguageTag());o.put("webViewUrl",webView==null?"":String.valueOf(webView.getUrl()));return o.toString();}catch(Exception e){return "{}";}
    }
    private String saveDiagnosticFile(String filename,String text)throws Exception{
        String safe=(filename==null||filename.trim().isEmpty()?"diagnostico_cong_el_calafate.txt":filename.trim()).replaceAll("[^A-Za-z0-9._-]","_");if(!safe.toLowerCase(Locale.ROOT).endsWith(".txt"))safe+=".txt";byte[] bytes=text.getBytes(StandardCharsets.UTF_8);
        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.Q){ContentValues v=new ContentValues();v.put(MediaStore.Downloads.DISPLAY_NAME,safe);v.put(MediaStore.Downloads.MIME_TYPE,"text/plain");v.put(MediaStore.Downloads.RELATIVE_PATH,Environment.DIRECTORY_DOWNLOADS+"/CongElCalafate");v.put(MediaStore.Downloads.IS_PENDING,1);Uri uri=getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI,v);if(uri==null)throw new IllegalStateException("MediaStore");try(OutputStream out=getContentResolver().openOutputStream(uri)){if(out==null)throw new IllegalStateException("OutputStream");out.write(bytes);out.flush();}ContentValues done=new ContentValues();done.put(MediaStore.Downloads.IS_PENDING,0);getContentResolver().update(uri,done,null,null);return "Descargas/CongElCalafate/"+safe;}
        File dir=getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);if(dir==null)dir=getFilesDir();if(!dir.exists()&&!dir.mkdirs())throw new IllegalStateException("directory");File outFile=new File(dir,safe);try(FileOutputStream out=new FileOutputStream(outFile)){out.write(bytes);out.flush();}return outFile.getAbsolutePath();
    }
'''
marker='\n    }\n\n    private static final class TerritoryImage'
if marker not in text:
    raise SystemExit('AppBridge closing marker not found')
text=text.replace(marker, '\n'+bridge_methods+'    }\n\n'+helper_methods+'\n    private static final class TerritoryImage', 1)
text=text.replace('CongElCalafate/1.6.2 Android','CongElCalafate/1.6.3 Android')
p.write_text(text,encoding='utf-8')
print('patched',p)
