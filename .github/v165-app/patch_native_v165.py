from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')
s=s.replace('return "1.6.4\\t22\\t"+Build.VERSION.SDK_INT','return "1.6.5\\t23\\t"+Build.VERSION.SDK_INT')
s=s.replace('CongElCalafate/1.6.4 Android','CongElCalafate/1.6.5 Android')
p.write_text(s,encoding='utf-8')
print('patched V1.6.5 native diagnostics')
