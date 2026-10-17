from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')

# Version continuity after V1.7.0 patch.
for old in [
    'return "1.6.4\\t22\\t"+Build.VERSION.SDK_INT',
    'return "1.6.5\\t23\\t"+Build.VERSION.SDK_INT',
    'return "1.7.0\\t24\\t"+Build.VERSION.SDK_INT'
]:
    s=s.replace(old, 'return "1.7.1\\t25\\t"+Build.VERSION.SDK_INT')
s=s.replace('CongElCalafate/1.7.0 Android','CongElCalafate/1.7.1 Android')

# Fields for persistent navigation while browsing external sites.
needle='    private TextView browserTitle;\n    private ProgressBar progressBar;'
repl='    private TextView browserTitle;\n    private LinearLayout externalNav;\n    private String pendingInternalTarget=null;\n    private ProgressBar progressBar;'
if needle in s and 'private LinearLayout externalNav;' not in s:
    s=s.replace(needle,repl,1)

# Add persistent external navigation below the WebView.
needle='        webView=new WebView(this); root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f)); setContentView(root);'
repl='        webView=new WebView(this); root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f)); externalNav=createExternalNav(); externalNav.setVisibility(View.GONE); root.addView(externalNav,new LinearLayout.LayoutParams(-1,dp(68))); setContentView(root);'
if needle in s:
    s=s.replace(needle,repl,1)
else:
    raise SystemExit('onCreate WebView insertion point not found')

# Add native menu helpers after toolbarButton.
needle='    private TextView toolbarButton(String text){TextView v=new TextView(this);v.setText(text);v.setTextColor(Color.WHITE);v.setGravity(Gravity.CENTER);v.setBackgroundColor(Color.TRANSPARENT);v.setClickable(true);v.setFocusable(true);return v;}\n'
if needle not in s:
    raise SystemExit('toolbarButton insertion point not found')
methods='''    private TextView toolbarButton(String text){TextView v=new TextView(this);v.setText(text);v.setTextColor(Color.WHITE);v.setGravity(Gravity.CENTER);v.setBackgroundColor(Color.TRANSPARENT);v.setClickable(true);v.setFocusable(true);return v;}\n\n    private LinearLayout createExternalNav(){\n        LinearLayout nav=new LinearLayout(this); nav.setOrientation(LinearLayout.HORIZONTAL); nav.setGravity(Gravity.CENTER); nav.setPadding(dp(6),dp(5),dp(6),dp(5)); nav.setBackgroundColor(Color.WHITE);\n        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.LOLLIPOP)nav.setElevation(dp(12));\n        String[] labels={"Inicio","Reuniones","Territorios","Recursos","Más"}; String[] targets={"inicio","reuniones","territorios","recursos","mas"};\n        for(int i=0;i<labels.length;i++){final String target=targets[i];TextView b=new TextView(this);b.setText(labels[i]);b.setTextColor(Color.rgb(55,76,102));b.setTextSize(10);b.setGravity(Gravity.CENTER);b.setPadding(dp(2),dp(7),dp(2),dp(7));b.setClickable(true);b.setFocusable(true);b.setContentDescription(labels[i]);b.setOnClickListener(v->navigateInternal(target));nav.addView(b,new LinearLayout.LayoutParams(0,-1,1f));}\n        return nav;\n    }\n    private void navigateInternal(String target){\n        if(target==null||target.isEmpty())target="inicio";\n        if(isLocal(webView.getUrl()))runInternalTarget(target);else{pendingInternalTarget=target;webView.loadUrl(HOME);}\n    }\n    private void runInternalTarget(String target){\n        final String t=target==null?"inicio":target;\n        String js="(function(){var b=document.querySelector('.nav-item[data-target=\\\""+t.replace("\\\"","\\\\\\\"")+"\\\"]');if(b){b.click();return true;}return false;})()";\n        webView.postDelayed(()->{if(webView!=null&&isLocal(webView.getUrl()))webView.evaluateJavascript(js,null);},140);\n    }\n    private void runPendingInternalNavigation(String url){\n        if(!isLocal(url)||pendingInternalTarget==null)return;String t=pendingInternalTarget;pendingInternalTarget=null;runInternalTarget(t);\n    }\n'''
s=s.replace(needle,methods,1)

# Keep local app nav on local pages; show the native menu whenever an external page replaces the app HTML.
old='    private class InternalWebViewClient extends WebViewClient{@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return handleNavigation(r.getUrl());}@Override public boolean shouldOverrideUrlLoading(WebView v,String u){return handleNavigation(Uri.parse(u));}@Override public void onPageStarted(WebView v,String u,android.graphics.Bitmap f){updateBrowserChrome(u);}@Override public void onPageFinished(WebView v,String u){updateBrowserChrome(u);}}'
new='    private class InternalWebViewClient extends WebViewClient{@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return handleNavigation(r.getUrl());}@Override public boolean shouldOverrideUrlLoading(WebView v,String u){return handleNavigation(Uri.parse(u));}@Override public void onPageStarted(WebView v,String u,android.graphics.Bitmap f){updateBrowserChrome(u);}@Override public void onPageFinished(WebView v,String u){updateBrowserChrome(u);runPendingInternalNavigation(u);}}'
if old in s:s=s.replace(old,new,1)
else:raise SystemExit('WebViewClient insertion point not found')

old='    private void updateBrowserChrome(String url){boolean local=isLocal(url);browserBar.setVisibility(local?View.GONE:View.VISIBLE);if(!local){String host="Contenido";try{Uri u=Uri.parse(url);if(u.getHost()!=null)host=u.getHost().replace("www.","");}catch(Exception ignored){}browserTitle.setText(host);}}'
new='    private void updateBrowserChrome(String url){boolean local=isLocal(url);browserBar.setVisibility(local?View.GONE:View.VISIBLE);if(externalNav!=null)externalNav.setVisibility(local?View.GONE:View.VISIBLE);if(!local){String host="Contenido";try{Uri u=Uri.parse(url);if(u.getHost()!=null)host=u.getHost().replace("www.","");}catch(Exception ignored){}browserTitle.setText(host);}}'
if old in s:s=s.replace(old,new,1)
else:raise SystemExit('updateBrowserChrome insertion point not found')

p.write_text(s,encoding='utf-8')
print('patched V1.7.1 persistent external navigation and diagnostics')
