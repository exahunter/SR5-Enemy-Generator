#!/usr/bin/env python3
"""Gera src/data/iniciacao.json a partir de metamagic.xml do Chummer.
Uso: python3 tools/gen_iniciacao.py <pasta-data> src/data/iniciacao.json
Saída: {MM:[metamagias], AR:[artes]}
 MM: {tr,n,id,s,p,ad,mg,rq:{all:[[tipo,valor]],one:[[tipo,valor]]}}   (tr = exige tradição específica (fora do sorteio), ad = serve a adepto, mg = serve a mago)
 AR: {n,id,s,p}
Tipos de requisito: art, metamagic, quality, initiategrade (grau mínimo), e os que o gerador não sabe cumprir
(tradition, spell, martialart, critterpower, traditionspiritform), que deixam a metamagia fora do sorteio.
Iniciar dá uma metamagia OU uma arte por grau; várias metamagias exigem a arte correspondente."""
import sys, json, re, xml.etree.ElementTree as ET
src, out = sys.argv[1].rstrip('/'), sys.argv[2]
T = lambda e, k: (e.findtext(k) or '').strip()
root = ET.parse(f'{src}/metamagic.xml').getroot()
def reqs(e):
    a, o = [], []
    for r in e.findall('required'):
        for ch in r:
            leaves = [x for x in ch.iter() if not len(x)] if ch.tag in ('oneof', 'allof') else [ch]
            if any(len(x) for x in ch.iter() if x is not ch and x.tag in ('oneof', 'allof')): raise SystemExit('requisito aninhado: ' + T(e, 'name'))
            for x in leaves:
                v = (x.text or '').strip()
                (o if ch.tag == 'oneof' else a).append([x.tag, v])
    return {'all': a, 'one': o}
TR = re.compile(r'^(Paradigm Shift|Spirit Expansion)')   # dependem de tradição/espírito específico: marcadas tr=1, fora do sorteio
MM = [dict(tr=1 if TR.match(T(m, 'name')) else 0, n=T(m, 'name'), id=T(m, 'id'), s=T(m, 'source'), p=T(m, 'page'), ad=T(m, 'adept') == 'True', mg=T(m, 'magician') == 'True', rq=reqs(m)) for m in root.findall('./metamagics/metamagic')]
AR = [dict(n=T(a, 'name'), id=T(a, 'id'), s=T(a, 'source'), p=T(a, 'page')) for a in root.findall('./arts/art')]
json.dump({'MM': MM, 'AR': AR}, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
print('MM', len(MM), 'AR', len(AR))
