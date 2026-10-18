from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')
assert 'createRescueRail' in s and 'heartbeat' in s
s=s.replace('1.7.4\\t28\\t','1.7.5\\t29\\t')
s=s.replace('Versión: 1.7.4 · 28','Versión: 1.7.5 · 29')
s=s.replace('CongElCalafate/1.7.4 Android','CongElCalafate/1.7.5 Android')
p.write_text(s,encoding='utf-8')
print('Android native release details updated to 1.7.5/29; navigation unchanged')
