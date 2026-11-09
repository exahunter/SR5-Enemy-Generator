#!/usr/bin/env python3
"""Gera src/data/implantes.json a partir da pasta data/ do Chummer (cyberware.xml, bioware.xml): TODOS os itens (v36).
Uso: python3 tools/gen_implantes.py <pasta-data> src/data/implantes.json
ok=1 (índice 15): passa nas regras do impParse (logic/implantes.js) e entra no sorteio; ok=0: fica embutido para uso futuro (índice 16 = motivo, 17 = metadados). O filtro por livro é feito na execução (okSrc).
Linha: [0=cyber|1=bio, id(sem hifens), nome, categoria, ess, custo, disp, ratingMax, ratingMin, forcegrade, gradesBanidos(csv), proibidos[], livro, pág, capacidade, ok, motivo, meta{rq,sd,ls,aw,av,lm,bm,sub,rt}]"""
import sys, json, re, xml.etree.ElementTree as ET
src, out = sys.argv[1].rstrip('/'), sys.argv[2]
def g(e,t): return (e.findtext(t) or '').strip()
def ifx(t,r,mn):
    if t is None: return None
    t=str(t).strip()
    if re.fullmatch(r'-?\d+(\.\d+)?',t): return float(t)
    m=re.fullmatch(r'FixedValues\(([^)]*)\)',t)
    if m:
        a=m.group(1).split(','); 
        try: return float(a[min(max(r,1),len(a))-1])
        except: return None
    if re.search(r'[A-Za-z]',re.sub(r'MinRating|Rating|number','',t)): return None
    t=t.replace('MinRating',str(mn or 1)).replace('Rating',str(r))
    t=re.sub(r'number\(([^()]*)\)',r'((\1)and 1 or 0)',t)
    if not re.fullmatch(r'[\d+\-*/().\s<>?:a-z]+',t) or '?' in t: return None
    try:
        v=eval(t,{'__builtins__':{}}); return float(v)
    except Exception: return None
def iav(t,r,mn):
    if t is None: return None
    t=str(t).strip()
    if re.match(r'\+|.*or Gear',t): return None
    f=bool(re.search(r'F\)?\s*$',t)); m=re.fullmatch(r'FixedValues\(([^)]*)\)',t)
    if m:
        a=m.group(1).split(',')
        try: v=float(int(re.match(r'\s*-?\d+',a[min(max(r,1),len(a))-1]).group(0)))
        except: return None
    else: v=ifx(re.sub(r'([RF])\s*$','',t),r,mn)
    return None if v is None else (round(v),f)
CAT={'cyberware':'Bodyware|Headware|Eyeware|Earware|Nanocybernetics|Hard Nanoware|Soft Nanoware','bioware':'Basic|Cultured'}
import os
ORD={}
if os.path.exists(out):
    for i,r in enumerate(json.load(open(out))): ORD[(r[0],r[1])]=i
rows=[]
for fn,k in (('cyberware',0),('bioware',1)):
    root=ET.parse(f'{src}/{fn}.xml').getroot()
    for e in root.findall(f'./{fn}s/{fn}'):
        cat=g(e,'category'); why=[]
        if not re.fullmatch(CAT[fn],cat): why.append('categoria')
        for t in ('requireparent','required','selectside','limbslot','addweapon','hide'):
            if e.find(t) is not None: why.append(t)
        if g(e,'capacity').startswith('['): why.append('capacidade[]')
        rt=g(e,'rating'); mr=0 if rt=='' else int(rt) if rt.isdigit() else -1
        mnr=g(e,'minrating'); mn=0 if mnr=='' else int(mnr) if mnr.isdigit() else -1
        if mr<0 or mn<0 or mr>12: why.append('rating')
        es,co,av=g(e,'ess'),g(e,'cost'),g(e,'avail')
        if not why:
            for r in {max(1,mn),max(1,mr)}:
                x,y,z=ifx(es,r,mn),ifx(co,r,mn),iav(av,r,mn)
                if x is None or x<=0 or y is None or y<0 or not z: why.append('formula');break
        bg=[x.text.strip() for x in e.findall('./bannedgrades/grade')]
        fb=[x.text.strip() for f in e.findall('./forbidden') for x in f.iter() if x.tag in ('cyberware','bioware')]
        M={}
        rq=[(x.text or '').strip() for r_ in e.findall('./required') for x in r_.iter('name') if (x.text or '').strip()]
        if rq: M['rq']=rq
        if e.find('selectside') is not None: M['sd']=1
        for key,tag in (('ls','limbslot'),('aw','addweapon'),('av','addvehicle'),('lm','limit'),('bm','blocksmounts')):
            v=g(e,tag)
            if v and not (tag=='limit' and v=='False'): M[key]=v
        sub=[x.text.strip() for x in e.findall('./allowsubsystems/category') if x.text]
        if sub: M['sub']=sub
        if rt and not rt.isdigit() or mr<0 or mr>12: M['rt']=rt
        if mr<0 or mr>12: mr=0
        if mn<0: mn=0
        rows.append([k,g(e,'id').replace('-',''),g(e,'name'),cat,es,co,av,mr,mn,g(e,'forcegrade'),','.join(bg),fb,g(e,'source'),g(e,'page'),g(e,'capacity'),0 if why else 1,'+'.join(why),M])
for i,r in enumerate(rows): r.append(i)
rows.sort(key=lambda r:(0 if r[15] else 1, ORD.get((r[0],r[1]),10**6+r[-1])))
for r in rows: r.pop()
json.dump(rows,open(out,'w'),ensure_ascii=False,separators=(',',':'))
import collections
print(len(rows),'itens;',sum(r[15] for r in rows),'no sorteio (ok=1)')
print('motivos:',collections.Counter(r[16] for r in rows if r[16]).most_common(8))
print('livros:',collections.Counter(r[12] for r in rows).most_common())
