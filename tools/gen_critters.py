#!/usr/bin/env python3
"""Gera src/data/critters.json a partir do critters.xml da pasta data/ do Chummer.
Uso: python3 tools/gen_critters.py <pasta-data> src/data/critters.json
Cada critter sai no mesmo formato que logic/critters.js (addCrit) produz ao importar o XML:
  n nome, cat categoria, a/m atributos normal/aumentado na ordem BOD AGI REA STR CHA INT LOG WIL (texto, aceita F),
  px poderes [nome, rating, select], ox poderes opcionais, wk fraquezas, sk perícias, src livro, id GUID."""
import sys, json, re, xml.etree.ElementTree as ET
src, out = sys.argv[1], sys.argv[2]
ATTR = ['bod', 'agi', 'rea', 'str', 'cha', 'int', 'log', 'wil']
T = lambda e, k: (e.findtext(k) or '').strip()
clean = lambda s: re.sub(r'\s+', ' ', (s or '').strip())
def powers(e, path): return [[clean(p.text), p.get('rating') or '', p.get('select') or ''] for p in e.findall(path)]
L = []
for e in ET.parse(f'{src}/critters.xml').getroot().findall('metatypes/metatype'):
    a = [T(e, p + 'min') or T(e, p + 'max') or '3' for p in ATTR]
    m = [T(e, p + 'aug') or T(e, p + 'max') or a[i] for i, p in enumerate(ATTR)]
    L.append(dict(n=T(e, 'name'), cat=T(e, 'category'), a=a, m=m,
                  px=powers(e, 'powers/power'),
                  ox=powers(e, 'optionalpowers/optionalpower') + powers(e, 'optionalpowers/power'),
                  wk=[clean(w.text) for w in e.findall('weaknesses/weakness')],
                  sk=[clean(s.text) for s in e.findall('skills/skill')],
                  src=T(e, 'source'), id=T(e, 'id')))
bad = [(c['n'], v) for c in L for v in c['a'] + c['m'] if not re.fullmatch(r'[\dF+\-*/() .]+', v)]
if bad: print('AVISO: atributos com fórmula fora do padrão (viram 3):', bad[:10])
json.dump(L, open(out, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(len(L), 'critters ->', out)
