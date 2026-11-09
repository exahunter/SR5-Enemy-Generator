#!/usr/bin/env python3
"""python3 tools/gen_alcances.py <pasta-data> src/data/alcances.json
Gera alcances.json a partir de ranges.xml e weapons.xml do Chummer:
  r: tabela de alcance [min,curto,médio,longo,extremo] (números ou fórmulas com {STR})
  w: arma -> [alcance, alcance alternativo] só onde weapons.xml traz <range>/<alternaterange>
  c: categoria da arma -> alcance, quando o nome da categoria não é o do alcance"""
import sys,json,xml.etree.ElementTree as ET
D=sys.argv[1].rstrip('/')+'/';out=sys.argv[2]
r=ET.parse(D+'ranges.xml').getroot()
R={x.findtext('name'):[x.findtext(k) for k in('min','short','medium','long','extreme')] for x in r.findall('./ranges/range')}
w=ET.parse(D+'weapons.xml').getroot()
W={};C={}
for x in w.find('weapons'):
    if x.findtext('type')!='Ranged':continue
    n,cat=x.findtext('name'),x.findtext('category')
    rg,al=x.findtext('range'),x.findtext('alternaterange')
    if rg or al:W[n]=[rg or '',al or '']
    elif cat not in R:C.setdefault(cat,None)
C={k:v for k,v in {'Heavy Machine Guns':'Medium/Heavy Machinegun','Medium Machine Guns':'Medium/Heavy Machinegun'}.items()}
json.dump({'r':R,'w':W,'c':C},open(out,'w'),ensure_ascii=False,separators=(',',':'))
print(len(R),'alcances',len(W),'armas com alcance próprio')
