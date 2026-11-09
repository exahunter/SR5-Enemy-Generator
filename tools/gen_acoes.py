#!/usr/bin/env python3
"""python3 tools/gen_acoes.py <pasta-data> src/data/acoes.json
Gera acoes.json a partir de actions.xml do Chummer: [nome, tipo, fonte, página, dados, limite, custo de iniciativa]
(dados/limite só quando são fórmulas; 'None'/'Variable' viram vazio). Ações de Matrix levam o nome do livro tal qual (nome em inglês, como na ficha do Chummer)."""
import sys,json,re,xml.etree.ElementTree as ET
D=sys.argv[1].rstrip('/')+'/';out=sys.argv[2]
r=ET.parse(D+'actions.xml').getroot()
def f(s):
    s=(s or '').strip()
    return '' if s in('','None','Variable') else s
A=[]
for a in r.iter('action'):
    t=a.find('test')
    A.append([a.findtext('name'),a.findtext('type') or '',a.findtext('source') or 'SR5',a.findtext('page') or '',
      f(t.findtext('dice')) if t is not None else '',f(t.findtext('limit')) if t is not None else '',int(a.findtext('initiativecost') or 0)])
json.dump(A,open(out,'w'),ensure_ascii=False,separators=(',',':'))
print(len(A),'ações')
