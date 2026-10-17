from pathlib import Path
import json, re, zipfile, xml.etree.ElementTree as ET
import fitz

XLSX=Path('Territorios_MZ_1-109.xlsx')
PDF=Path('MAPA_CONG_CALAFATE_2026.pdf')
OUT=Path('cong_el_calafate_android/app/src/main/assets')
OUT.mkdir(parents=True, exist_ok=True)

MAIN_NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL_NS='http://schemas.openxmlformats.org/officeDocument/2006/relationships'

def cell_value(c, sst):
    typ=c.attrib.get('t','')
    if typ=='inlineStr':
        node=c.find(f'{{{MAIN_NS}}}is')
        if node is None: return ''
        return ''.join((t.text or '') for t in node.iter(f'{{{MAIN_NS}}}t'))
    v=c.find(f'{{{MAIN_NS}}}v')
    val='' if v is None else (v.text or '')
    if typ=='s' and val:
        val=sst[int(val)]
    return val

def parse_resumen(path):
    with zipfile.ZipFile(path) as z:
        ns={'m':MAIN_NS,'r':REL_NS}
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        relmap={r.attrib['Id']:r.attrib['Target'] for r in rels}
        target=None
        for s in wb.find('m:sheets',ns):
            if s.attrib.get('name')=='Resumen':
                rid=s.attrib[f'{{{REL_NS}}}id']
                target=relmap[rid]
                break
        if not target: raise RuntimeError('Resumen sheet not found')
        target=target.lstrip('/')
        if not target.startswith('xl/'):
            target='xl/'+target
        sst=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            root=ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root:
                sst.append(''.join((t.text or '') for t in si.iter(f'{{{MAIN_NS}}}t')))
        ws=ET.fromstring(z.read(target))
        rows=[]
        for row in ws.iter(f'{{{MAIN_NS}}}row'):
            cells={}
            for c in row.findall(f'{{{MAIN_NS}}}c'):
                addr=c.attrib.get('r','A1')
                col=re.match(r'([A-Z]+)',addr).group(1)
                cells[col]=cell_value(c,sst)
            rows.append([cells.get(x,'') for x in ('A','B','C','D','E')])
    data={}
    for r in rows[1:]:
        try: n=int(float(r[0]))
        except Exception: continue
        if not 1 <= n <= 102: continue
        txt=(r[2] or '').strip()
        if n==100:
            items=[x.strip() for x in txt.split('|') if x.strip()]
            data[str(n)]={'type':'tramos','items':items}
        else:
            items=[x.strip() for x in txt.split(',') if x.strip()]
            data[str(n)]={'type':'manzanas','items':items}
    if len(data)!=102: raise RuntimeError(f'Expected 102 territories, got {len(data)}')
    if not data['1']['items'] or not data['102']['items']:
        raise RuntimeError('Official manzana lists were not parsed')
    if 'Avda. Costanera Pte. Néstor Carlos Kirchner' not in data['100']['items']:
        raise RuntimeError('Territorio 100 official road list was not parsed')
    return data

def map_assets(path):
    doc=fitz.open(path)
    page=doc[0]
    W,H=page.rect.width,page.rect.height
    hot={}
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            for s in l.get('spans',[]):
                txt=s.get('text','').strip()
                if re.fullmatch(r'\d{1,3}',txt) and s.get('size',0)>20:
                    n=int(txt)
                    if 1<=n<=102 and str(n) not in hot:
                        x0,y0,x1,y1=s['bbox']
                        hot[str(n)]={'x':round(((x0+x1)/2)/W*100,4),'y':round(((y0+y1)/2)/H*100,4)}
    if len(hot)!=102: raise RuntimeError(f'Expected 102 hotspots, got {len(hot)}')
    pix=page.get_pixmap(matrix=fitz.Matrix(.55,.55),alpha=False)
    pix.save(str(OUT/'territory-map-2026.png'))
    doc.close()
    return hot

data=parse_resumen(XLSX)
hot=map_assets(PDF)
refs={
 '1':['JW','FLIA RODRIGUEZ','PUNTA BANDERA','RIO SANTA CRUZ','LAGO ARGENTINO','REIMUNDO FREILE','AVDA. GENERAL JUAN DOMINGO PERON','CTE. LUIS PIEDRABUENA','CERRO CALAFATE','AVDA. 17 DE OCTUBRE'],
 '100':['PLANTA TRATAMIENTO','Qta. 64','Qta. 69','QTA 11a','QTA 11b','Avda. Costanera Pte. Néstor Carlos Kirchner','Calle 96','Calle 207','Calle 209','Calle 205','Calle S/NOMBRE'],
 '102':['ALMIRANTE GUILLERMO BROWN','CALLE 409','CALLE LAGO POSADAS','CORONEL DE MARINA LEONARDO ROSALES','LAS HERAS (EX 406)','PUERTO DESEADO','Psje. Peatonal N° 115','CALETA OLIVIA']
}
payload={'data':data,'hotspots':hot,'refs':refs,'source':{'mapFile':'MAPA - CONG CALAFATE 2026','territoryRange':'1-102','embeddedLabel':'MAPA DE TERRITORIO 2023 - CONG CALAFATE 12310'}}
(OUT/'territory-data.js').write_text('window.CongTerritoryOfficialData='+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('territories',len(data),'hotspots',len(hot),'t1',len(data['1']['items']),'t100',len(data['100']['items']),'t102',len(data['102']['items']),'png',(OUT/'territory-map-2026.png').stat().st_size,'datajs',(OUT/'territory-data.js').stat().st_size)
