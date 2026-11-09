#!/usr/bin/env python3
"""Gera src/data/lifemodules.json a partir de lifemodules.xml do Chummer.
Uso: python3 tools/gen_lifemodules.py <pasta-data> src/data/lifemodules.json
Linha: {i:id, s:etapa, n:nome, k:karma, b:livro, p:página, rq:{q:[qualidades],m:[metatipos]}, sk:[perícias], kn:[conhecimentos], v:[{n:versão, rq}]}
O texto narrativo (story) fica de fora: é inglês, com macros ($real, $COPDESC…)."""
import sys, json, xml.etree.ElementTree as ET
src, out = sys.argv[1].rstrip('/'), sys.argv[2]
r = ET.parse(f'{src}/lifemodules.xml').getroot()
T = lambda e, k: (e.findtext(k) or '').strip()
def rq(e):
    x = e.find('required'); d = {}
    if x is None: return d
    q = [a.text.strip() for a in x.iter('quality') if a.text]; m = [a.text.strip() for a in x.iter('metatype') if a.text]
    if q: d['q'] = q
    if m: d['m'] = m
    return d
L = []
for m in r.findall('./modules/module'):
    b = m.find('bonus')
    sk = sorted({a.findtext('name').strip() for a in (b.findall('skilllevel') if b is not None else []) if a.findtext('name')})
    kn = sorted({a.findtext('name').strip() for a in (b.findall('knowledgeskilllevel') if b is not None else []) if a.findtext('name') and not a.findtext('name').startswith('[')})
    v = []
    for x in m.findall('./versions/version'):
        d = {'n': T(x, 'name')}; q = rq(x)
        if q: d['rq'] = q
        v.append(d)
    e = {'i': T(m, 'id'), 's': T(m, 'stage'), 'n': T(m, 'name'), 'k': int(T(m, 'karma') or 0), 'b': T(m, 'source'), 'p': T(m, 'page')}
    q = rq(m)
    if q: e['rq'] = q
    if sk: e['sk'] = sk
    if kn: e['kn'] = kn
    if v: e['v'] = v
    L.append(e)
json.dump(L, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
import collections
print(len(L), 'módulos', dict(collections.Counter(e['s'] for e in L)), '| livros', dict(collections.Counter(e['b'] for e in L)))
