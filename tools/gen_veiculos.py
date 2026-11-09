#!/usr/bin/env python3
"""Gera src/data/veiculo-modulos.js a partir do vehicles.xml do Chummer (módulos de veículo e drone + módulos de fábrica).
   python3 tools/gen_veiculos.py <pasta-do-data> [saida]
VM: [nome, id, categoria, fonte, página, ratingMax(num|'body'|'qty'|'seats'), slots, custo, disp, requisito]  (slots/custo/disp ficam como fórmula; avaliados em logic/veiculo-modulos.js)
requisito: null | {m:'any'|'all', t:[[tipo,valor]...], f:[nomes proibidos]}  tipos: c=categoria contém, q=categoria igual, n=nome igual, nc=nome contém, b=corpo <=, s=assentos >=
VF: veículo -> módulos de fábrica (já vêm instalados, não gastam slot nem nuyen)"""
import xml.etree.ElementTree as ET,json,sys
D=(sys.argv[1] if len(sys.argv)>1 else 'data').rstrip('/')+'/'
OUT=sys.argv[2] if len(sys.argv)>2 else 'src/data/veiculo-modulos.js'
r=ET.parse(D+'vehicles.xml').getroot()
def term(e):
    op=e.attrib.get('operation','');t=(e.text or '').strip()
    if e.tag=='category':return ['c' if op=='contains' else 'q',t]
    if e.tag=='name':return ['nc' if op=='contains' else 'n',t]
    if e.tag=='body' and op=='lessthanequals':return ['b',int(t)]
    if e.tag=='seats' and op=='greaterthanequals':return ['s',int(t)]
    return None
def req(m):
    q=m.find('required');f=m.find('forbidden');o={}
    if q is not None:
        vd=q.find('vehicledetails')
        if vd is None:return {'x':1}
        orr=vd.find('OR');kids=list(orr) if orr is not None else list(vd)
        ts=[term(k) for k in kids]
        if None in ts or len(q)!=1:return {'x':1}
        o['m']='any' if orr is not None else 'all';o['t']=ts
    if f is not None:
        o['f']=[n.text for n in f.iter('name')]
    return o or None
def mx(s):
    s=(s or '0').strip()
    return int(s) if s.isdigit() else s.lower()
VM=[]
for m in r.find('mods'):
    VM.append([m.findtext('name'),m.findtext('id'),m.findtext('category'),m.findtext('source'),m.findtext('page'),mx(m.findtext('rating')),
               (m.findtext('slots') or '0').strip(),(m.findtext('cost') or '0').strip(),(m.findtext('avail') or '0').strip(),req(m)])
VF={}
for v in r.find('vehicles'):
    ns=[x.text for x in v.findall('mods/name')]
    if ns:VF[v.findtext('name')]=ns
j=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
open(OUT,'w',encoding='utf8').write('/* GERADO por tools/gen_veiculos.py a partir do vehicles.xml do Chummer. Não editar à mão.\n VM: [nome,id,cat,fonte,pág,ratingMax,slots,custo,disp,requisito]  VF: veículo->módulos de fábrica */\nconst VM='+j(VM)+',\nVF='+j(VF)+';\n')
print(len(VM),'módulos;',len(VF),'veículos com módulos de fábrica;',round(len(open(OUT,encoding='utf8').read())/1024),'KB')
