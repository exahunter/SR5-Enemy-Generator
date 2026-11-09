import xml.etree.ElementTree as ET,json,re,sys
import os
D=(sys.argv[1] if len(sys.argv)>1 else 'data').rstrip('/')+'/'
OUT=sys.argv[2] if len(sys.argv)>2 else 'src/data/equip-tabelas.js'
def num(s):
    try:return float(s)
    except:return None
def cost(s):
    """-> (base, perRating) ; None if not evaluable"""
    s=(s or '').strip()
    n=num(s)
    if n is not None:return (n,0)
    m=re.fullmatch(r'\(?\s*Rating\s*\*\s*(\d+(?:\.\d+)?)\s*\)?',s)
    if m:return (0,float(m.group(1)))
    return None
def i(x):return int(x) if x==int(x) else x
w=ET.parse(D+'weapons.xml').getroot()
# --- armas: pontos de montagem e acessórios de fábrica
W={}
for x in w.find('weapons'):
    if x.findtext('type')!='Ranged':continue
    mt=[m.text for m in x.findall('accessorymounts/mount')]
    fa=[a.findtext('name') for a in x.findall('accessories/accessory')]
    if mt or fa:W[x.findtext('name')]=[mt,fa]
# --- acessórios (todos, para achar os de fábrica)
X=[]
for a in w.find('accessories'):
    c=a.findtext('cost') or '0'
    cc=-1 if c.strip()=='Weapon Cost' else (num(c) if num(c) is not None else None)
    if cc is None:continue
    X.append([a.findtext('name'),a.findtext('id'),a.findtext('mount') or '',i(cc),a.findtext('avail') or '0',a.findtext('source'),a.findtext('page') or ''])
# --- armaduras
ar=ET.parse(D+'armor.xml').getroot()
A=[];M=[]
for x in ar.find('armors'):
    cat=x.findtext('category')
    if cat not in('Armor','Clothing','High-Fashion Armor Clothing','Cloaks','Specialty Armor'):continue
    c=num(x.findtext('cost'))
    if c is None:continue
    bm=[[m.text,int(m.get('rating') or 0)] for m in x.findall('mods/name')]
    cap=x.findtext('armorcapacity') or '0'
    A.append([x.findtext('name'),x.findtext('id'),cat,x.findtext('armor'),cap,i(c),x.findtext('avail') or '0',x.findtext('source'),x.findtext('page') or '',bm])
for m in ar.find('mods'):
    cs=cost(m.findtext('cost'))
    if cs is None or m.find('required') is not None:continue
    cp=(m.findtext('armorcapacity') or '[0]').strip()
    capv=int(cp[1:-1]) if re.fullmatch(r'\[\d+\]',cp) else ('R' if cp in('[Rating]','FixedValues([1],[2],[3],[4],[5],[6])') else None)
    if capv is None:continue
    M.append([m.findtext('name'),m.findtext('id'),m.findtext('category'),m.findtext('armor') or '0',int(m.findtext('maxrating') or 1),capv,i(cs[0]),i(cs[1]),m.findtext('avail') or '0',m.findtext('source'),m.findtext('page') or ''])
# --- gear
g=ET.parse(D+'gear.xml').getroot().find('gears')
AM=[];G=[]
CATS={'Audio Devices','Audio Enhancements','Breaking and Entering Gear','Commlink Accessories','Communications and Countermeasures','Electronics Accessories','ID/Credsticks','Biotech','Survival Gear','Tools','Security Devices','Sensors','Vision Devices','Vision Enhancements','Miscellany','Chemicals','Tools of the Trade','Explosives','Entertainment'}
for x in g:
    cat=x.findtext('category');src=x.findtext('source')
    if cat=='Ammunition':
        t=x.findtext('ammoforweapontype')
        if t not in('gun',) or x.find('requireparent') is not None:continue
        cs=cost(x.findtext('cost'))
        if cs is None or cs[1]:continue
        wb=x.find('weaponbonus')
        AM.append([x.findtext('name'),x.findtext('id'),i(cs[0]),int(x.findtext('costfor') or 1),x.findtext('avail') or '0',src,x.findtext('page') or '',x.findtext('weaponbonus/damagetype') or '',x.findtext('weaponbonus/ap') or ''])
        continue
    if cat not in CATS or src=='2050':continue
    cs=cost(x.findtext('cost'))
    if cs is None:continue
    G.append([x.findtext('name'),x.findtext('id'),cat,i(cs[0]),i(cs[1]),int(x.findtext('rating') or 0) if (x.findtext('rating') or '0').isdigit() else 0,x.findtext('avail') or '0',src,x.findtext('page') or ''])
js='/* GERADO por tools/gen_equip.py a partir do data do Chummer (weapons/armor/gear.xml). Não editar à mão.\n W: arma->[montagens,acessórios de fábrica]; X: acessórios [nome,id,montagem,custo(-1=custo da arma),disp,fonte,pág]\n A: armaduras [nome,id,cat,armadura,capacidade,custo,disp,fonte,pág,mods embutidos]; M: mods [nome,id,cat,armadura,maxRating,cap(num|R),custo,custo/rating,disp,fonte,pág]\n AM: munição [nome,id,custo,por,disp,fonte,pág,tipoDano,PA]; G: gear [nome,id,cat,custo,custo/rating,ratingMax,disp,fonte,pág] */\nconst EQ='+json.dumps({'W':W,'X':X,'A':A,'M':M,'AM':AM,'G':G},ensure_ascii=False,separators=(',',':'))+';\n'
open(OUT,'w',encoding='utf-8').write(js)
print(len(js),'bytes',{k:len(v) for k,v in dict(W=W,X=X,A=A,M=M,AM=AM,G=G).items()})
