package app.congregacion.elcalafate;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.pdf.PdfRenderer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final String HOME = "file:///android_asset/index.html";
    private static final int MAX_DOWNLOAD_BYTES = 6_000_000;
    private static final Set<String> ALLOWED_SHEETS = new HashSet<>(Arrays.asList(
            "1gLPJ8AXiADvFoztBJC0Wf-umVAS4GpN9RF0fGXlE7kk","1SfJQfHRblwVM891QvDnu6fbZewb_l1gx0iYoHIU5YNg",
            "1K4BowT0kvU1zlbMw0M9cFA8ToMp9CaTHSqag64x7UWc","1tnW0uSGdfcsO2ldEyyUpLAMO2mI9ttABnzmgSQc2OUE",
            "1SjYd-8pDMTshIQATZaYapMhhavhrNJ5tj7PKt7bu0NA","1AamlWyb8Kuh1Ou4ib0cxD-E740x-v8_VjMCcwEOmf0c",
            "1F9U5PgnoCBr50g_3rRDPbQExzMdNKhepFIjz67XaoNc","1MjKoX4IHKKarkk0wl7IHCITY9mDIzqvQTZhO_DE6rlk",
            "1BD346D9zBPeKGC4cyV0dkzv3e6BBwYaVYN_Hs3Xe9KQ"));

    private WebView webView;
    private LinearLayout browserBar;
    private TextView browserTitle;
    private ProgressBar progressBar;
    private final ExecutorService networkExecutor = Executors.newFixedThreadPool(3);
    private volatile long lastStreetFetch = 0L;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.rgb(244,248,250));
        browserBar=createBrowserBar(); browserBar.setVisibility(View.GONE); root.addView(browserBar,new LinearLayout.LayoutParams(-1,dp(54)));
        progressBar=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal); progressBar.setMax(100); progressBar.setVisibility(View.GONE); root.addView(progressBar,new LinearLayout.LayoutParams(-1,dp(3)));
        webView=new WebView(this); root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f)); setContentView(root);
        configureWebView(); webView.addJavascriptInterface(new AppBridge(),"AndroidBridge"); webView.loadUrl(HOME);
    }

    private LinearLayout createBrowserBar(){
        LinearLayout bar=new LinearLayout(this); bar.setOrientation(LinearLayout.HORIZONTAL); bar.setGravity(Gravity.CENTER_VERTICAL); bar.setPadding(dp(8),0,dp(8),0); bar.setBackgroundColor(Color.rgb(11,79,108));
        TextView back=toolbarButton("‹"); back.setTextSize(32); back.setContentDescription("Volver"); back.setOnClickListener(v->goBackInsideApp()); bar.addView(back,new LinearLayout.LayoutParams(dp(48),-1));
        browserTitle=new TextView(this); browserTitle.setText("Contenido"); browserTitle.setTextColor(Color.WHITE); browserTitle.setTextSize(14); browserTitle.setMaxLines(1); browserTitle.setEllipsize(android.text.TextUtils.TruncateAt.END); browserTitle.setGravity(Gravity.CENTER_VERTICAL); browserTitle.setPadding(dp(4),0,dp(4),0); bar.addView(browserTitle,new LinearLayout.LayoutParams(0,-1,1f));
        TextView home=toolbarButton("Inicio"); home.setTextSize(12); home.setContentDescription("Volver al inicio"); home.setOnClickListener(v->webView.loadUrl(HOME)); bar.addView(home,new LinearLayout.LayoutParams(dp(64),-1)); return bar;
    }
    private TextView toolbarButton(String text){TextView v=new TextView(this);v.setText(text);v.setTextColor(Color.WHITE);v.setGravity(Gravity.CENTER);v.setBackgroundColor(Color.TRANSPARENT);v.setClickable(true);v.setFocusable(true);return v;}

    private void configureWebView(){
        WebSettings s=webView.getSettings(); s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(true);s.setAllowContentAccess(false);s.setAllowFileAccessFromFileURLs(false);s.setAllowUniversalAccessFromFileURLs(false);s.setJavaScriptCanOpenWindowsAutomatically(false);s.setSupportMultipleWindows(false);s.setBuiltInZoomControls(true);s.setDisplayZoomControls(false);s.setLoadWithOverviewMode(true);s.setUseWideViewPort(true);s.setMediaPlaybackRequiresUserGesture(true);
        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.LOLLIPOP)s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O)s.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.LOLLIPOP)CookieManager.getInstance().setAcceptThirdPartyCookies(webView,true);
        webView.setWebViewClient(new InternalWebViewClient()); webView.setWebChromeClient(new WebChromeClient(){@Override public void onProgressChanged(WebView v,int p){progressBar.setProgress(p);progressBar.setVisibility(p>=100?View.GONE:View.VISIBLE);}@Override public void onReceivedTitle(WebView v,String t){if(!isLocal(v.getUrl())&&t!=null&&!t.isBlank())browserTitle.setText(t);}});
    }

    public final class AppBridge {
        @JavascriptInterface public void loadSheet(String resourceId,String spreadsheetId){
            if(!safeResourceId(resourceId)||!ALLOWED_SHEETS.contains(spreadsheetId)){sendSheetError(resourceId,"Planilla no autorizada dentro de esta aplicación.");return;}
            networkExecutor.execute(()->{try{String csv=fetchSheetCsv(spreadsheetId),payload=Base64.encodeToString(csv.getBytes(StandardCharsets.UTF_8),Base64.NO_WRAP);sendJs("window.__cecReceiveSheet("+JSONObject.quote(resourceId)+","+JSONObject.quote(payload)+");");}catch(Exception e){sendSheetError(resourceId,"No se pudo leer la planilla. Verificá la conexión o la visibilidad pública del archivo.");}});
        }
        @JavascriptInterface public void loadTerritoryPdf(String territory,String fileId){
            int n;try{n=Integer.parseInt(territory==null?"":territory.trim());}catch(Exception e){sendTerritoryError(territory,"Territorio no válido.");return;}
            if(n<1||n>102||!safeDriveFileId(fileId)){sendTerritoryError(territory,"Plano individual no autorizado dentro de esta aplicación.");return;}
            final int tn=n; final String fid=fileId; networkExecutor.execute(()->{try{TerritoryImage im=renderTerritoryPdf(tn,fid);String b64=Base64.encodeToString(im.bytes,Base64.NO_WRAP);sendJs("window.__cecReceiveTerritoryImage("+JSONObject.quote(String.valueOf(tn))+","+JSONObject.quote(b64)+","+im.width+","+im.height+");");}catch(Exception e){sendTerritoryError(String.valueOf(tn),"No se pudo cargar el plano individual. Verificá la conexión y volvé a intentar.");}});
        }
        @JavascriptInterface public void loadElCalafateStreets(){
            long now=System.currentTimeMillis();if(now-lastStreetFetch<10_000L)return;lastStreetFetch=now;networkExecutor.execute(()->{try{String q="[out:json][timeout:25];way[\"highway\"][\"name\"](-50.40,-72.38,-50.27,-72.16);out tags;",ep="https://overpass-api.de/api/interpreter?data="+URLEncoder.encode(q,StandardCharsets.UTF_8.name());JSONObject root=new JSONObject(fetchText(ep));JSONArray el=root.optJSONArray("elements");TreeSet<String> names=new TreeSet<>(String.CASE_INSENSITIVE_ORDER);if(el!=null)for(int i=0;i<el.length();i++){JSONObject o=el.optJSONObject(i),tags=o==null?null:o.optJSONObject("tags");if(tags==null)continue;String name=tags.optString("name","").trim();if(!name.isEmpty()&&name.length()<=120)names.add(name);}JSONArray out=new JSONArray();for(String name:names)out.put(name);sendJs("window.__cecReceiveStreetCatalog("+JSONObject.quote(out.toString())+");");}catch(Exception e){sendJs("window.__cecStreetCatalogError("+JSONObject.quote("No se pudieron cargar las calles desde OpenStreetMap.")+");");}});
        }
    }

    private static final class TerritoryImage{final byte[] bytes;final int width,height;TerritoryImage(byte[] b,int w,int h){bytes=b;width=w;height=h;}}
    private TerritoryImage renderTerritoryPdf(int territory,String fileId)throws Exception{
        File dir=new File(getCacheDir(),"territory-pdfs");if(!dir.exists()&&!dir.mkdirs())throw new IllegalStateException("cache");File pdf=new File(dir,"territory_"+territory+"_"+fileId+".pdf");if(!pdf.exists()||pdf.length()<1000||!isPdfFile(pdf)){if(pdf.exists())pdf.delete();downloadTerritoryPdf(fileId,pdf);}
        ParcelFileDescriptor fd=ParcelFileDescriptor.open(pdf,ParcelFileDescriptor.MODE_READ_ONLY);PdfRenderer renderer=new PdfRenderer(fd);PdfRenderer.Page page=null;Bitmap bitmap=null;try{if(renderer.getPageCount()<1)throw new IllegalStateException("no pages");page=renderer.openPage(0);int w=1800,h=Math.max(1,Math.round(page.getHeight()*(w/(float)page.getWidth())));if(h>2900){float r=2900f/h;w=Math.max(1200,Math.round(w*r));h=2900;}bitmap=Bitmap.createBitmap(w,h,Bitmap.Config.ARGB_8888);bitmap.eraseColor(Color.WHITE);Matrix m=new Matrix();m.setScale(w/(float)page.getWidth(),w/(float)page.getWidth());page.render(bitmap,null,m,PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);ByteArrayOutputStream out=new ByteArrayOutputStream();if(!bitmap.compress(Bitmap.CompressFormat.PNG,100,out))throw new IllegalStateException("render");byte[] data=out.toByteArray();if(data.length<1000||data.length>4_500_000)throw new IllegalStateException("render size");return new TerritoryImage(data,w,h);}finally{if(bitmap!=null)bitmap.recycle();if(page!=null)page.close();renderer.close();fd.close();}
    }
    private void downloadTerritoryPdf(String fileId,File target)throws Exception{
        String id=URLEncoder.encode(fileId,StandardCharsets.UTF_8.name());String[] urls={"https://drive.usercontent.google.com/download?id="+id+"&export=download&confirm=t","https://drive.google.com/uc?export=download&confirm=t&id="+id,"https://drive.google.com/uc?export=download&id="+id};Exception last=null;
        for(String url:urls){File tmp=new File(target.getParentFile(),target.getName()+".tmp");if(tmp.exists())tmp.delete();try{fetchBinaryToFile(url,tmp);if(!isPdfFile(tmp))throw new IllegalStateException("not pdf");if(target.exists())target.delete();if(!tmp.renameTo(target)){copyFile(tmp,target);tmp.delete();}return;}catch(Exception e){last=e;tmp.delete();}}
        throw last==null?new IllegalStateException("PDF unavailable"):last;
    }
    private void copyFile(File a,File b)throws Exception{try(FileInputStream in=new FileInputStream(a);FileOutputStream out=new FileOutputStream(b)){byte[] buf=new byte[8192];int r;while((r=in.read(buf))!=-1)out.write(buf,0,r);}}
    private void fetchBinaryToFile(String address,File target)throws Exception{HttpURLConnection c=(HttpURLConnection)new URL(address).openConnection();c.setConnectTimeout(15_000);c.setReadTimeout(35_000);c.setInstanceFollowRedirects(true);c.setRequestProperty("User-Agent","CongElCalafate/1.6.2 Android");c.setRequestProperty("Accept","application/pdf,application/octet-stream,*/*");int st=c.getResponseCode();if(st<200||st>=300){c.disconnect();throw new IllegalStateException("HTTP "+st);}try(InputStream in=c.getInputStream();FileOutputStream out=new FileOutputStream(target)){byte[] buf=new byte[8192];int r,total=0;while((r=in.read(buf))!=-1){total+=r;if(total>MAX_DOWNLOAD_BYTES)throw new IllegalStateException("PDF too large");out.write(buf,0,r);}}finally{c.disconnect();}}
    private boolean isPdfFile(File f){if(f==null||!f.exists()||f.length()<5)return false;try(FileInputStream in=new FileInputStream(f)){byte[] h=new byte[5];return in.read(h)==5&&h[0]=='%'&&h[1]=='P'&&h[2]=='D'&&h[3]=='F'&&h[4]=='-';}catch(Exception e){return false;}}

    private String fetchSheetCsv(String id)throws Exception{String csv=fetchText("https://docs.google.com/spreadsheets/d/"+id+"/gviz/tq?tqx=out:csv&headers=1");if(looksLikeHtml(csv))csv=fetchText("https://docs.google.com/spreadsheets/d/"+id+"/export?format=csv");if(looksLikeHtml(csv))throw new IllegalStateException("html");return csv;}
    private boolean looksLikeHtml(String t){if(t==null)return true;String s=t.trim().toLowerCase();return s.startsWith("<!doctype html")||s.startsWith("<html")||s.contains("accounts.google.com");}
    private String fetchText(String address)throws Exception{HttpURLConnection c=(HttpURLConnection)new URL(address).openConnection();c.setConnectTimeout(15_000);c.setReadTimeout(30_000);c.setInstanceFollowRedirects(true);c.setRequestProperty("User-Agent","CongElCalafate/1.6.2 Android");c.setRequestProperty("Accept","text/csv,text/plain,application/json,*/*");int st=c.getResponseCode();if(st<200||st>=300){c.disconnect();throw new IllegalStateException("HTTP "+st);}try(InputStream in=c.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream()){byte[] buf=new byte[8192];int r,total=0;while((r=in.read(buf))!=-1){total+=r;if(total>MAX_DOWNLOAD_BYTES)throw new IllegalStateException("Response too large");out.write(buf,0,r);}return out.toString(StandardCharsets.UTF_8.name());}finally{c.disconnect();}}
    private boolean safeResourceId(String id){return id!=null&&id.length()<=80&&id.matches("[A-Za-z0-9_-]+");}private boolean safeDriveFileId(String id){return id!=null&&id.length()>=10&&id.length()<=100&&id.matches("[A-Za-z0-9_-]+");}
    private void sendSheetError(String id,String msg){sendJs("window.__cecSheetError("+JSONObject.quote(id==null?"":id)+","+JSONObject.quote(msg)+");");}private void sendTerritoryError(String id,String msg){sendJs("window.__cecTerritoryImageError("+JSONObject.quote(id==null?"":id)+","+JSONObject.quote(msg)+");");}private void sendJs(String js){runOnUiThread(()->{if(webView!=null)webView.evaluateJavascript(js,null);});}

    private class InternalWebViewClient extends WebViewClient{@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return handleNavigation(r.getUrl());}@Override public boolean shouldOverrideUrlLoading(WebView v,String u){return handleNavigation(Uri.parse(u));}@Override public void onPageStarted(WebView v,String u,android.graphics.Bitmap f){updateBrowserChrome(u);}@Override public void onPageFinished(WebView v,String u){updateBrowserChrome(u);}}
    private boolean handleNavigation(Uri u){String s=u.getScheme()==null?"":u.getScheme().toLowerCase();if(s.equals("http")||s.equals("https")||s.equals("file"))return false;if(s.equals("intent")){try{android.content.Intent i=android.content.Intent.parseUri(u.toString(),android.content.Intent.URI_INTENT_SCHEME);String f=i.getStringExtra("browser_fallback_url");if(f!=null&&(f.startsWith("https://")||f.startsWith("http://")))webView.loadUrl(f);else Toast.makeText(this,"Este enlace requiere una aplicación externa.",Toast.LENGTH_SHORT).show();}catch(Exception e){Toast.makeText(this,"No se pudo abrir este recurso dentro del app.",Toast.LENGTH_SHORT).show();}return true;}Toast.makeText(this,"Enlace no compatible dentro del app.",Toast.LENGTH_SHORT).show();return true;}
    private void updateBrowserChrome(String url){boolean local=isLocal(url);browserBar.setVisibility(local?View.GONE:View.VISIBLE);if(!local){String host="Contenido";try{Uri u=Uri.parse(url);if(u.getHost()!=null)host=u.getHost().replace("www.","");}catch(Exception ignored){}browserTitle.setText(host);}}
    private boolean isLocal(String url){return url==null||url.startsWith("file:///android_asset/");}private void goBackInsideApp(){if(webView.canGoBack())webView.goBack();else webView.loadUrl(HOME);}
    @Override public void onBackPressed(){if(!isLocal(webView.getUrl()))goBackInsideApp();else if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){networkExecutor.shutdownNow();if(webView!=null){webView.removeJavascriptInterface("AndroidBridge");webView.destroy();}super.onDestroy();}
    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
}
