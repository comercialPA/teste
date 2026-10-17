from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')
needle='@JavascriptInterface public String getDiagnostics(){return buildNativeDiagnostics();}'
if needle not in s:
    raise SystemExit('V1.6.3 diagnostic bridge missing')
if 'getDiagnosticsV2' not in s:
    repl=needle+'\n        @JavascriptInterface public String getDiagnosticsV2(){return "1.6.4\\t22\\t"+Build.VERSION.SDK_INT+"\\t"+String.valueOf(Build.MANUFACTURER).replace("\\t"," ")+"\\t"+String.valueOf(Build.MODEL).replace("\\t"," ")+"\\t"+Locale.getDefault().toLanguageTag()+"\\t"+getPackageName();}'
    s=s.replace(needle,repl,1)
s=s.replace('CongElCalafate/1.6.3 Android','CongElCalafate/1.6.4 Android')
p.write_text(s,encoding='utf-8')
print('patched V1.6.4 native diagnostics')
