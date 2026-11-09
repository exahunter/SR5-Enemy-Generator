#!/usr/bin/env python3
"""Gera src/data/chummer-extras.json a partir da pasta data/ do Chummer.
Uso: python3 tools/gen_extras.py <pasta-data> src/data/chummer-extras.json
Conteudo: streams + sprites (streams.xml), paragons (paragons.xml), mentores (mentors.xml),
drogas prontas e componentes (drugcomponents.xml), vessels (vessels.xml), programas avancados de IA (programs.xml)."""
import sys, json, re, xml.etree.ElementTree as ET
src, out = sys.argv[1], sys.argv[2]
def load(f): return ET.parse(f'{src}/{f}').getroot()
T = lambda e, k, d='': (e.findtext(k) or d).strip()
R = {}
# ---- streams ----
r = load('streams.xml')
R['ST'] = [dict(n=T(t,'name'), id=T(t,'id'), dr=T(t,'drain'), src=T(t,'source'), pg=T(t,'page'),
                sp=[s.text.strip() for s in t.findall('spirits/spirit')]) for t in r.findall('traditions/tradition')]
def num(x): return x
R['SPR'] = [dict(n=T(s,'name'), id=T(s,'id'), src=T(s,'source'), pg=T(s,'page'),
                 a={k.upper(): T(s,k) for k in ('cha','int','log','wil','ini') if T(s,k)},
                 pw=[p.text.strip() for p in s.findall('powers/power')], sk=[p.text.strip() for p in s.findall('skills/skill')])
            for s in r.findall('spirits/spirit')]
# ---- paragons / mentors ----
# Não copiar <advantage>/<disadvantage>: é texto de livro (Catalyst). A ficha o mostra a partir do PDF que o usuário carrega.
def mentors(f):
    out = []
    for m in load(f).iter('mentor'):
        ch = [T(c,'name') for c in m.findall('choices/choice') if T(c,'name')]
        out.append(dict(n=T(m,'name'), id=T(m,'id'), src=T(m,'source'), pg=T(m,'page'), ch=ch, cat=T(m,'category'), rq=1 if m.find('required') is not None else 0))
    return out
R['PAR'] = mentors('paragons.xml')
R['MEN'] = mentors('mentors.xml')
# ---- drogas ----
r = load('drugcomponents.xml')
def efeito(b):
    if b is None: return ''
    L = []
    for a in b.findall('attribute'): L.append(f"{T(a,'name')} {int(float(T(a,'value','0'))):+d}")
    for a in b.findall('limit'): L.append(f"limite {T(a,'name')} {int(float(T(a,'value','0'))):+d}")
    for k, lab in (('initiativedice','dado(s) de iniciativa'), ('initiative','iniciativa'), ('damageresistance','resist. dano'), ('armor','armadura')):
        e = b.find(k)
        if e is not None and e.text: L.append(f"{lab} {e.text.strip()}")
    for q in b.findall('quality'): L.append(f"qualidade {(q.text or '').strip()} {q.get('rating','')}".strip())
    return ', '.join(L)
dr = []
for d in r.findall('drugs/drug'):
    dr.append(dict(n=T(d,'name'), id=T(d,'id'), cat=T(d,'category'), src=T(d,'source'), pg=T(d,'page'), av=T(d,'avail'),
                   c=float(T(d,'cost','0') or 0), sp=T(d,'speed'), v=T(d,'vectors'), du=T(d,'duration'), fx=efeito(d.find('bonus')),
                   ar=T(d,'addictionrating'), at=T(d,'addictionthreshold')))
R['DRG'] = dr
R['DGR'] = [dict(n=T(g,'name'), id=T(g,'id'), c=float(T(g,'cost','1') or 1)) for g in r.findall('grades/grade')]
# ---- vessels ----
r = load('vessels.xml'); V = []
for m in r.findall('metatypes/metatype'):
    b = m.find('bonus')
    V.append(dict(n=T(m,'name'), id=T(m,'id'), cat=T(m,'category'), src=T(m,'source'), pg=T(m,'page'),
                  bod=int(T(m,'bodmax','0') or 0), arm=int(T(b,'armor','0') or 0) if b is not None else 0,
                  fx=efeito(b), pw=[p.text.strip() for p in m.findall('powers/power') if p.text]))
R['VES'] = V
# ---- programas avancados de IA ----
r = load('programs.xml'); A = []
for p in r.findall('programs/program'):
    if T(p,'category') != 'Advanced Programs': continue
    req = [x.text.strip() for x in p.findall('required/oneof/program') if x.text]
    A.append(dict(n=T(p,'name'), id=T(p,'id'), src=T(p,'source'), pg=T(p,'page'), cost=float(T(p,'cost','0') or 0), av=T(p,'avail'), rq=req))
R['AIP'] = A

# ---- licencas, poderes de espirito, poderes dos espiritos vinculados ----
R['LIC'] = [x.text.strip() for x in load('licenses.xml').iter('license') if x.text]
R['SPD'] = {T(x,'name'): [T(x,'source'), T(x,'page')] for x in load('spiritpowers.xml').iter('power') if T(x,'name')}
SPW = {}
for m in load('critters.xml').iter('metatype'):
    nm = T(m,'name')
    if not (nm.startswith('Spirit of') or T(m,'category') == 'Spirits'): continue
    SPW[nm] = dict(px=[dict(n=' '.join((p.text or '').split()), r=p.get('rating',''), s=p.get('select','')) for p in m.findall('powers/power')],
                   wk=[' '.join((w.text or '').split()) for w in m.findall('weaknesses/weakness')])
R['SPW'] = SPW

# ---- streams ressonantes (qualidades KC: Cyberadept, Machinist, Sourceror, Technoshaman) ----
RST = []
for e in load('qualities.xml').findall('qualities/quality'):
    n = T(e,'name')
    if n.startswith('Resonant Stream:'):
        RST.append(dict(n=n, id=T(e,'id'), c=int(T(e,'karma','20') or 20), src=T(e,'source'), pg=T(e,'page'),
                        sp=sorted({c.text.strip() for c in e.iter('condition') if c.text and c.text.strip().endswith('Sprite')})))
R['RST'] = RST
json.dump(R, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print({k: len(v) for k, v in R.items()})
