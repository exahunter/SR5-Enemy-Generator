// ---------- notas com o texto dos livros no JSON (o que o Foundry importa) ----------
const WHY={};   // item -> motivo (para o diagnóstico)
const PNZ={};   // linhas normalizadas por livro (para achar o título em qualquer página)
const normLines=code=>PNZ[code]||(PNZ[code]=PT[code].map(t=>t.split('\n').map(l=>({h:l.charCodeAt(0)===1,n:nz(l)}))));
function findAnywhere(code,name,expected){   // procura um título (linha igual ao nome) no livro inteiro, a mais próxima da página esperada
 const want=[nz(name),nz(baseName(name))].filter(w=>w.length>=3),L=normLines(code);let best=-1,bd=1e9;
 for(let i=0;i<L.length;i++){const hit=L[i].some(x=>want.some(w=>x.n===w||(x.h&&x.n.startsWith(w))));if(hit){const d=Math.abs(i-expected);if(d<bd){bd=d;best=i}}}
 return best}
function bookTextWhy(src,page,name){
 const meta=PM[src];
 if(!meta)return['',xl('sem o PDF de ')+src+' ('+bookName(src)+xl('): você não enviou')];
 if(!(meta.v>=3))return['',xl('texto antigo de ')+src+' (releia o PDF)'];
 if(!/^\d+$/.test(String(page)))return['',xl('página inválida (')+page+')'];
 const pg=PT[src];if(!pg)return['',xl('texto de ')+src+xl(' não carregado')];
 const e=+page+meta.offset-1;
 for(const d of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6]){const t=pg[e+d];if(!t)continue;const s=snippetFor(t,name);if(s)return[s,'']}
 const k=findAnywhere(src,name,e);if(k>=0){const s=snippetFor(pg[k],name);if(s)return[s,'']}
 return['',xl('título não achado em ')+src+xl(' (página ')+page+')']}
const SKEY={skill:'skills',weapon:'weapons',armor:'armors',quality:'qualities',spell:'spells',power:'powers',cyberware:'cyberwares',gear:'gears',vehicle:'vehicles',martialart:'martialarts',metamagic:'metamagic',complexform:'complexforms'};
let _ixR=null,_ixN=-1,_ixNP=new Map(),_ixSP=new Map();
function ixMaps(){const rows=IX.rows;if(rows===_ixR&&rows.length===_ixN)return;
 _ixR=rows;_ixN=rows.length;_ixNP=new Map();_ixSP=new Map();
 for(const x of rows){const k=x[0]+'\u0000'+x[1];
  if(x[7]&&!_ixNP.has(k))_ixNP.set(k,x[7]);
  if(x[3]&&/^\d+$/.test(x[4])&&!_ixSP.has(k))_ixSP.set(k,x)}}
function nameOnPage(v,key){   // <nameonpage> do XML (nome do título no livro), se houver
 const sec=SKEY[key];if(!sec)return'';
 ixMaps();return _ixNP.get(v.name+'\u0000'+sec)||''}
function srcPage(v,key){
 if(v.source&&v.page)return[v.source,v.page];
 const sec=SKEY[key];if(!sec)return[v.source||'',v.page||''];
 ixMaps();const r=_ixSP.get(v.name+'\u0000'+sec);
 return r?[r[3],r[4]]:[v.source||'',v.page||'']}
function stat(){
 const ks=Object.keys(WHY),ok=ks.filter(k=>!WHY[k].why).length,miss=ks.filter(k=>WHY[k].why);
 const by={};miss.forEach(k=>{(by[WHY[k].why]=by[WHY[k].why]||[]).push(WHY[k].n+' ('+WHY[k].k+')')});
 $('pdfstat').innerHTML=ks.length?xl('<b>Última exportação (JSON):</b> ')+ok+xl(' de ')+ks.length+xl(' itens com o texto do livro.')+Object.entries(by).map(([w,l])=>'<div>• '+l.length+xl(' sem texto: ')+esc(w)+' — '+esc(l.slice(0,8).join(', '))+(l.length>8?'…':'')+'</div>').join(''):''}

const bookText=(s,p,n)=>bookTextWhy(s,p,n)[0];
