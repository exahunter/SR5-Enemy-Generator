#!/usr/bin/env python3
"""python3 tools/gen_kits.py <pasta-data> src/data/kits-prontos.json
Gera kits-prontos.json a partir de packs.xml do Chummer (80 kits prontos).
Saída: {nome: {c:categoria, bp:nuyenbp, w:[arma], a:[armadura], g:[gear], cy:[cyber], bi:[bio], v:[veículo/drone]}}
 arma: {n, acc:[acessórios]}  armadura: {n, mods:[..]}  gear: {n, cat, rt, qty, sel, sub:[gear aninhado]}  cyber/bio/veículo: {n, rt, gr}
Os nomes são os do Chummer: o gerador resolve contra o catálogo carregado e pula, em silêncio, o que não achar."""
import sys,json,xml.etree.ElementTree as ET
src,out=sys.argv[1].rstrip('/'),sys.argv[2]
T=lambda e,k:(e.findtext(k) or '').strip()
def num(v):
    try:return int(float(v))
    except:return 0
def gear(g):
    o={'n':T(g,'name'),'cat':T(g,'category')}
    nm=g.find('name')
    if nm is not None and nm.get('select'):o['sel']=nm.get('select')
    if T(g,'rating'):o['rt']=num(T(g,'rating'))
    if T(g,'qty'):o['qty']=num(T(g,'qty'))
    s=[gear(x) for x in g.findall('./gears/gear')]
    if s:o['sub']=s
    return o
def item(e):
    o={'n':T(e,'name')}
    if T(e,'rating'):o['rt']=num(T(e,'rating'))
    if T(e,'grade'):o['gr']=T(e,'grade')
    return o
K={}
for p in ET.parse(f'{src}/packs.xml').getroot().findall('./packs/pack'):
    k={'c':T(p,'category'),'bp':num(T(p,'nuyenbp'))}
    w=[dict(item(x),acc=[T(a,'name') for a in x.findall('./accessories/accessory')]) for x in p.findall('./weapons/weapon')]
    a=[dict(item(x),mods=[T(m,'name') for m in x.findall('./mods/name')+x.findall('./armormods/armormod/name')]) for x in p.findall('./armors/armor')]
    g=[gear(x) for x in p.findall('./gears/gear')]
    cy=[item(x) for x in p.findall('./cyberwares/cyberware')]
    bi=[item(x) for x in p.findall('./biowares/bioware')]
    v=[item(x) for x in p.findall('./vehicles/vehicle')]
    for key,val in(('w',w),('a',a),('g',g),('cy',cy),('bi',bi),('v',v)):
        if val:k[key]=val
    K[T(p,'name')]=k
json.dump(K,open(out,'w'),ensure_ascii=False,separators=(',',':'))
print(len(K),'kits')
