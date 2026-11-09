#!/usr/bin/env python3
"""Gera src/data/qualidades.json a partir de qualities.xml e qualitylevels.xml do Chummer.
Uso: python3 tools/gen_qualidades.py <pasta-data> src/data/qualidades.json
Saída: {P:[linhas positivas], N:[linhas negativas], F:{nome:[incompatíveis]}, X:[linhas fora do sorteio]}
Linha P/N: [nome, karma(abs), livro, id, bn[improvements], página, raro(1)]; linha X: [nome, karma, livro, id, categoria, página, motivo, req[]].
- Linhas já existentes no arquivo de saída são mantidas como estão e na mesma ordem; só entram as novas.
- Entra no sorteio (P/N) a qualidade sem requisito, sem escolha de texto/atributo e cujo bônus o gerador sabe aplicar (Skill, SkillAttribute, SkillCategory, Attribute, Notoriety, PublicAwareness, Fame, DamageResistance).
- F: conflitos de <forbidden> (só nomes de qualidade) + níveis do mesmo grupo (qualitylevels.xml: SINner).
- X: o resto, com o motivo e os requisitos (quality:, metatype:, attribute:…) para uso futuro."""
import sys, json, re, os, xml.etree.ElementTree as ET
src, out = sys.argv[1].rstrip('/'), sys.argv[2]
T = lambda e, k: (e.findtext(k) or '').strip()
num = lambda v: int(v) if re.fullmatch(r'-?\d+', (v or '').strip()) else None
# nomes do núcleo, já presentes em POS/NEG (tabelas-base.js) ou renomeados por ajustes: não duplicar
base = open(os.path.join(os.path.dirname(out), 'tabelas-base.js')).read()
CORE = set(re.findall(r"\['([^']+)',\d+", base[base.index('const POS'):base.index('const lim') if 'const lim' in base else None])) | {'Double Jointed','Insomnia (Basic)','Insomnia (Full)'}
CORE |= set(re.findall(r"'([^']+)':\['[0-9a-f-]{36}'", open(os.path.join(os.path.dirname(out), '..', 'logic', 'magias-heranca.js')).read()))
OK_B = {'skillattribute','skillcategory','notoriety','publicawareness','fame','specificskill','specificattribute','damageresistance'}
def bn(e):
    b = e.find('bonus'); o = []
    if b is None: return o, ''
    why = ''
    for x in b:
        t = x.tag
        if t not in OK_B: return [], 'bônus:' + t
        if t in ('skillattribute','skillcategory'):
            v = num(x.findtext('bonus')); n = T(x,'name')
            if v is None or not n: return [], 'bônus ilegível:' + t
            o.append(['SkillAttribute' if t == 'skillattribute' else 'SkillCategory', n, v, T(x,'condition')])
        elif t in ('notoriety','publicawareness'):
            v = num(x.text)
            if v is None: return [], 'bônus ilegível:' + t
            o.append(['Notoriety' if t == 'notoriety' else 'PublicAwareness', '', v, ''])
        elif t == 'fame': o.append(['Fame', '', 0, ''])
        elif t == 'specificskill':
            v = num(x.findtext('bonus')); n = T(x,'name')
            if v is None or not n: return [], 'bônus ilegível:' + t
            o.append(['Skill', n, v, T(x,'condition')])
        elif t == 'specificattribute':
            n = T(x,'name'); X = {k: num(x.findtext(k)) for k in ('min','max','aug','augmax') if num(x.findtext(k)) is not None}; v = num(x.findtext('val'))
            if not n or not (X or v is not None): return [], 'bônus ilegível:' + t
            o.append(['Attribute', n, v or 0, T(x,'condition'), X] if X else ['Attribute', n, v or 0, T(x,'condition')])
        elif t == 'damageresistance':
            v = num(x.text)
            if v is None: return [], 'bônus ilegível:' + t
            o.append(['DamageResistance', '', v, ''])
    return o, why
def reqs(e):
    out = []
    for r in e.findall('required'):
        for x in r.iter():
            if x is r or x.tag in ('oneof','allof','OR','AND','NONE') or not (x.text or '').strip() and not len(x): continue
            if len(x): continue
            out.append(x.tag + ':' + (x.text or '').strip() + (('@' + x.get('operation')) if x.get('operation') else ''))
    return out
def forb(e):
    q, outro = [], []
    for r in e.findall('forbidden'):
        for x in r.iter():
            if len(x) or x.tag in ('oneof','allof'): continue
            (q if x.tag == 'quality' else outro).append((x.text or '').strip() if x.tag == 'quality' else x.tag + ':' + (x.text or '').strip())
    return q, outro
old = json.load(open(out)) if os.path.exists(out) else {'P': [], 'N': [], 'F': {}, 'X': []}
oldid = {r[3] for k in 'PN' for r in old[k]} | {r[3] for r in old.get('X', [])}
P, N, X, F = list(old['P']), list(old['N']), list(old.get('X', [])), {k: list(v) for k, v in old['F'].items()}
root = ET.parse(f'{src}/qualities.xml').getroot(); ok = {}
EX = ('careeronly','onlyprioritygiven','stagedpurchase','naturalweapons','addweapon','metagenic','mutant','hide')
for e in root.findall('./qualities/quality'):
    n, i, cat = T(e,'name'), T(e,'id'), T(e,'category'); k = abs(num(T(e,'karma')) or 0)
    rq = reqs(e); fq, fo = forb(e); b, why = bn(e); mot = []
    if i in oldid: continue
    if n in CORE: mot.append('núcleo')
    if not k: mot.append('karma 0')
    if e.find('required') is not None: mot.append('requisito')
    if fo: mot.append('proibido:' + fo[0])
    if why: mot.append(why)
    if e.find('bonus') is not None and e.find('bonus').find('selecttext') is not None: mot.append('escolha de texto')
    if e.find('bonus') is not None and any(x.tag.startswith('select') for x in e.find('bonus')): mot.append('escolha')
    mot += [t for t in EX if e.find(t) is not None and (e.findtext(t) or 'True').strip() not in ('False','')]
    if fq: ok[n] = fq
    row = [n, k, T(e,'source'), i, b, T(e,'page'), 1]
    if mot: X.append([n, k, T(e,'source'), i, cat, T(e,'page'), '+'.join(dict.fromkeys(mot)), rq])
    else: (N if cat == 'Negative' else P).append(row)
    if fq:
        for f in fq: F.setdefault(n, [])
        F[n] = list(dict.fromkeys(F[n] + fq))
# níveis do mesmo grupo (qualitylevels.xml): um nível exclui os outros
for g in ET.parse(f'{src}/qualitylevels.xml').getroot().iter('qualitygroup'):
    L = [x.text.strip() for x in g.iter('level') if x.text]
    for a in L: F[a] = list(dict.fromkeys(F.get(a, []) + [b for b in L if b != a]))
json.dump({'P': P, 'N': N, 'F': F, 'X': X}, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
import collections
print('P', len(P), 'N', len(N), 'F', len(F), 'X', len(X))
print('motivos X:', collections.Counter(re.sub(r':.*', '', m) for r in X for m in r[6].split('+')).most_common(14))
print('livros P+N:', collections.Counter(r[2] for r in P + N).most_common())
