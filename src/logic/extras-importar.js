/* v29: importação dos XML que alimentam os extras (streams, paragons, mentors, drugcomponents, vessels, programs).
   Sem importar nada vale o conjunto embutido (data/chummer-extras.json); importando, o do usuário o substitui
   (outros livros, customdata). O resultado fica guardado no navegador, como o de importar-extras.js. */
const XD_RE=/^(streams|paragons|mentors|drugcomponents|vessels|programs|licenses|spiritpowers|qualities)/;
function xdParseFile(nm,d){
 const all=s=>[...d.querySelectorAll(s)],T=(e,k)=>{const x=e&&e.querySelector(':scope > '+k);return x?x.textContent.trim():''};
 const fx=b=>{if(!b)return'';const L=[],sg=v=>{v=Math.round(parseFloat(v)||0);return(v>=0?'+':'')+v};
  [...b.querySelectorAll(':scope > attribute')].forEach(a=>L.push(T(a,'name')+' '+sg(T(a,'value'))));
  [...b.querySelectorAll(':scope > limit')].forEach(a=>L.push(xl('limite ')+T(a,'name')+' '+sg(T(a,'value'))));
  [['initiativedice',null],['initiative',t('bn.ini')],['damageresistance',t('bn.resdano')],['armor',t('bn.armadura')]].forEach(([k,l])=>{const v=T(b,k);if(v)L.push(l?l+' '+v:(isFinite(+v)?tn('n.dado.ini',+v):v))});
  [...b.querySelectorAll(':scope > quality')].forEach(q=>L.push((xl('qualidade ')+q.textContent.trim()+' '+(q.getAttribute('rating')||'')).trim()));return L.join(', ')};
 const men=()=>all('mentor').map(m=>({n:T(m,'name'),id:T(m,'id'),adv:T(m,'advantage'),dis:T(m,'disadvantage'),src:T(m,'source'),pg:T(m,'page'),
   ch:[...m.querySelectorAll(':scope > choices > choice')].map(c=>T(c,'name')).filter(Boolean),cat:T(m,'category'),rq:m.querySelector(':scope > required')?1:0})).filter(m=>m.n);
 if(nm==='streams'){const ST=all('chummer > traditions > tradition').map(t=>({n:T(t,'name'),id:T(t,'id'),dr:T(t,'drain'),src:T(t,'source'),pg:T(t,'page'),sp:[...t.querySelectorAll(':scope > spirits > spirit')].map(s=>s.textContent.trim())})).filter(t=>t.n);
  const SPR=all('chummer > spirits > spirit').map(s=>({n:T(s,'name'),id:T(s,'id'),src:T(s,'source'),pg:T(s,'page'),a:Object.fromEntries(['cha','int','log','wil','ini'].map(k=>[k.toUpperCase(),T(s,k)]).filter(x=>x[1])),pw:[...s.querySelectorAll(':scope > powers > power')].map(p=>p.textContent.trim()),sk:[...s.querySelectorAll(':scope > skills > skill')].map(p=>p.textContent.trim())})).filter(s=>s.n);
  return ST.length&&SPR.length?{ST,SPR}:null}
 if(nm==='paragons'){const l=men();return l.length?{PAR:l}:null}
 if(nm==='mentors'){const l=men();return l.length?{MEN:l}:null}
 if(nm==='drugcomponents'){const DRG=all('chummer > drugs > drug').map(d=>({n:T(d,'name'),id:T(d,'id'),cat:T(d,'category'),src:T(d,'source'),pg:T(d,'page'),av:T(d,'avail'),c:parseFloat(T(d,'cost'))||0,sp:T(d,'speed'),v:T(d,'vectors'),du:T(d,'duration'),fx:fx(d.querySelector(':scope > bonus')),ar:T(d,'addictionrating'),at:T(d,'addictionthreshold')})).filter(d=>d.n);
  const DGR=all('chummer > grades > grade').map(g=>({n:T(g,'name'),id:T(g,'id'),c:parseFloat(T(g,'cost'))||1})).filter(g=>g.n);return DRG.length&&DGR.length?{DRG,DGR}:null}
 if(nm==='vessels'){const VES=all('chummer > metatypes > metatype').map(m=>{const b=m.querySelector(':scope > bonus');return{n:T(m,'name'),id:T(m,'id'),cat:T(m,'category'),src:T(m,'source'),pg:T(m,'page'),bod:parseInt(T(m,'bodmax'))||0,arm:parseInt(T(b,'armor'))||0,fx:fx(b),pw:[...m.querySelectorAll(':scope > powers > power')].map(p=>p.textContent.trim())}}).filter(v=>v.n);return VES.length?{VES}:null}
 if(nm==='programs'){const AIP=all('chummer > programs > program').filter(p=>T(p,'category')==='Advanced Programs').map(p=>({n:T(p,'name'),id:T(p,'id'),src:T(p,'source'),pg:T(p,'page'),cost:parseFloat(T(p,'cost'))||0,av:T(p,'avail'),rq:[...p.querySelectorAll(':scope > required > oneof > program')].map(x=>x.textContent.trim())})).filter(p=>p.n);return AIP.length?{AIP}:null}
 if(nm==='qualities'){const RST=all('chummer > qualities > quality').filter(q=>/^Resonant Stream:/.test(T(q,'name'))).map(q=>({n:T(q,'name'),id:T(q,'id'),c:parseInt(T(q,'karma'))||20,src:T(q,'source'),pg:T(q,'page'),sp:[...new Set([...q.querySelectorAll('condition')].map(x=>x.textContent.trim()).filter(x=>/Sprite$/.test(x)))].sort()}));return RST.length?{RST}:null}
 if(nm==='licenses'){const LIC=all('chummer > licenses > license').map(x=>x.textContent.trim()).filter(Boolean);return LIC.length?{LIC}:null}
 if(nm==='spiritpowers'){const SPD={};all('chummer > powers > power').forEach(x=>{const n=T(x,'name');if(n)SPD[n]=[T(x,'source'),T(x,'page')]});return Object.keys(SPD).length?{SPD}:null}
 return null}
importFiles.camada(xl('extras do Chummer (streams, mentores, drogas…)'),_impXD=>async function(files){const mine=[];let n=0,flag=0;
 for(const f of files){const nm=f.name.toLowerCase().replace(/\.xml$/,'').replace(/__\d+$/,'');
  if(XD_RE.test(nm)){const k=nm.match(XD_RE)[1];
   try{const d=new DOMParser().parseFromString(await f.text(),'text/xml'),r=xdParseFile(k,d);if(r){Object.assign(XD,r);flag=1;if(k!=='mentors'&&k!=='qualities')n++}}catch(e){console.error('extras-importar:',k,e)}}}
 if(flag)IDB.tx('readwrite',t=>t.put({name:'__xd',size:0,data:{ST:XD.ST,SPR:XD.SPR,PAR:XD.PAR,MEN:XD.MEN,DRG:XD.DRG,DGR:XD.DGR,VES:XD.VES,AIP:XD.AIP,LIC:XD.LIC,SPD:XD.SPD,RST:XD.RST}})).catch(()=>{});
 return n+await _impXD(files)});
(async()=>{try{const r=await IDB.tx('readonly',t=>t.get('__xd'));if(r&&r.data)Object.keys(r.data).forEach(k=>{if((Array.isArray(r.data[k])&&r.data[k].length)||(k==='SPD'&&r.data[k]&&Object.keys(r.data[k]).length))XD[k]=r.data[k]})}catch(x){avisa('extras-importar',x)}})();
