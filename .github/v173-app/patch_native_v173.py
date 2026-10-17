from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')
assert 'private LinearLayout externalNav;' in s
assert 'private void configureWebView()' in s
assert 'setContentView(root);' in s
s=s.replace('private LinearLayout externalNav;', '''private LinearLayout externalNav;
    private volatile long lastUiPulseMs=0L;
    private volatile String lastUiPulse="Sin señal";''')
s=s.replace('setContentView(root);','root.addView(createRescueBar(),new LinearLayout.LayoutParams(-1,dp(49))); setContentView(root);',1)
marker='    private void configureWebView(){'
methods='''
    private LinearLayout createRescueBar(){
        LinearLayout bar=new LinearLayout(this);bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setPadding(dp(6),dp(4),dp(6),dp(4));bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setBackgroundColor(Color.rgb(246,250,253));
        String[] labels={"‹","↑","↓","›","Inicio","SOS"};
        String[] hints={"Página anterior","Subir en la página","Bajar en la página","Página siguiente","Inicio del app","Diagnóstico de emergencia"};
        for(int i=0;i<labels.length;i++){
            final int which=i;TextView b=new TextView(this);b.setText(labels[i]);b.setGravity(Gravity.CENTER);
            b.setTextColor(Color.rgb(11,65,111));b.setTextSize(i>=4?11:24);b.setTypeface(null,android.graphics.Typeface.BOLD);
            b.setContentDescription(hints[i]);b.setClickable(true);b.setFocusable(true);
            android.graphics.drawable.GradientDrawable bg=new android.graphics.drawable.GradientDrawable();
            bg.setColor(i==5?Color.rgb(229,245,255):Color.WHITE);bg.setCornerRadius(dp(12));bg.setStroke(dp(1),Color.rgb(218,232,241));
            b.setBackground(bg);
            LinearLayout.LayoutParams params=new LinearLayout.LayoutParams(0,-1,i==4?1.25f:1f);
            params.setMargins(dp(3),0,dp(3),0);bar.addView(b,params);
            b.setOnClickListener(v->rescueNavigation(which));
        }
        return bar;
    }
    private void rescueNavigation(int action){
        if(action==5){showEmergencyDiagnostics();return;}
        if(action==4){webView.loadUrl(HOME);return;}
        if(action==1||action==2){
            final boolean down=action==2;
            // Scroll nativo de emergencia + scroll de contenedores internos cuando estén visibles.
            String js="(function(){var e=document.querySelector('#cecV162Resolve.open .cec-v162-resolve-list, #cecCarritosScreen.open, #sheetScreen:not([hidden]) .sheet-body, #cecDiagOverlay.open .cec-diag-text');if(e){e.scrollBy({top:"+(down?"1":"-1")+"*Math.max(260,e.clientHeight*.7),behavior:'smooth'});return;}window.scrollBy({top:"+(down?"1":"-1")+"*Math.max(290,innerHeight*.7),behavior:'smooth'});})();";
            webView.evaluateJavascript(js,null);return;
        }
        final boolean next=action==3;
        if(!isLocal(webView.getUrl())){
            if(next&&webView.canGoForward())webView.goForward();
            if(!next&&webView.canGoBack())webView.goBack();
            return;
        }
        String js="(function(){var tabs=Array.from(document.querySelectorAll('.bottom-nav .nav-item'));var i=tabs.findIndex(x=>x.classList.contains('active'));if(i<0)i=0;var to=Math.max(0,Math.min(tabs.length-1,i"+(next?"+1":"-1")+"));if(tabs[to]&&i!==to){document.querySelector('#cecCarritosScreen.open .cec-c-back')?.click();tabs[to].click();}else{window.scrollTo({top:0,behavior:'smooth'});}})();";
        webView.evaluateJavascript(js,null);
    }
    private void showEmergencyDiagnostics(){
        String url=webView==null?"":String.valueOf(webView.getUrl());
        long now=System.currentTimeMillis();
        String alive=lastUiPulseMs==0?"Ninguna":((now-lastUiPulseMs)/1000)+" s desde la última señal";
        final String txt="=== DIAGNÓSTICO DE EMERGENCIA ===\\n"
          +"Versión: 1.7.3 · 27\\nPaquete: "+getPackageName()+"\\n"
          +"Android SDK: "+Build.VERSION.SDK_INT+"\\nFabricante: "+Build.MANUFACTURER+"\\nModelo: "+Build.MODEL+"\\n"
          +"WebView URL: "+url+"\\nProgreso carga: "+(webView==null?"-":webView.getProgress())+"%\\n"
          +"Última señal JavaScript: "+alive+"\\nEstado JS: "+lastUiPulse+"\\n"
          +"WebView scrollY: "+(webView==null?"-":webView.getScrollY())+"\\n"
          +"Hora: "+new java.util.Date(now).toString()+"\\n"
          +"Si la señal JS quedó atrasada, la interfaz puede estar bloqueada.\\n";
        new android.app.AlertDialog.Builder(this)
          .setTitle("Diagnóstico de emergencia")
          .setMessage(txt)
          .setPositiveButton("Copiar",(dialog,which)->{
            ClipboardManager cb=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
            if(cb!=null)cb.setPrimaryClip(ClipData.newPlainText("Diagnóstico de emergencia",txt));
            Toast.makeText(this,"Diagnóstico copiado",Toast.LENGTH_SHORT).show();
          }).setNegativeButton("Cerrar",null).show();
    }
'''
s=s.replace(marker,methods+marker,1)
needle='    private class InternalWebViewClient extends WebViewClient'
assert needle in s
# add public bridge method inside AppBridge via other anchor
needle2='@JavascriptInterface public String getDiagnosticsV2()'
assert needle2 in s
s=s.replace(needle2,'@JavascriptInterface public void heartbeat(String status){lastUiPulseMs=System.currentTimeMillis();lastUiPulse=status==null?"":status.substring(0,Math.min(status.length(),180));}\n        '+needle2,1)
s=s.replace('1.7.2\\t26\\t','1.7.3\\t27\\t').replace('1.7.2\\\\t26\\\\t','1.7.3\\\\t27\\\\t')
assert 'rescueNavigation' in s and 'showEmergencyDiagnostics' in s and 'lastUiPulseMs' in s
p.write_text(s,encoding='utf-8')
print('V1.7.3 Native: rescue navigation and independent diagnostics enabled')
