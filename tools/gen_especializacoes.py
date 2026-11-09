#!/usr/bin/env python3
"""Gera src/data/especializacoes.json a partir do skills.xml do Chummer.

  python3 tools/gen_especializacoes.py <pasta data do Chummer> src/data/especializacoes.json

Formato: {"sk": {"Pistols": {"c": "Combat Active", "b": "SR5", "s": ["Holdouts", "Revolvers", ...]}, ...}}
  c categoria · b livro · s especializações na ordem do XML (entradas "[Algo]" são campos livres do Chummer;
  o gerador as troca por um valor concreto quando sabe qual é: tipo de sprite, forma complexa).
Só perícias ativas entram (os conhecimentos do gerador não têm especialização).
Importar um skills.xml no gerador sobrescreve estas listas em tempo de execução (logic/especializacoes.js).
"""
import json, sys, os
import xml.etree.ElementTree as ET

def main(data, out):
    root = ET.parse(os.path.join(data, 'skills.xml')).getroot()
    sk = {}
    for s in root.find('skills'):
        nome = (s.findtext('name') or '').strip()
        if not nome:
            continue
        specs = [(x.text or '').strip() for x in s.iter('spec') if (x.text or '').strip()]
        sk[nome] = {'c': s.findtext('category') or '', 'b': s.findtext('source') or 'SR5', 's': specs}
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'sk': sk}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('%d perícias, %d especializações -> %s' % (len(sk), sum(len(v['s']) for v in sk.values()), out))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
