// ---------- qualidades: texto completo do livro (atravessa páginas, ignora rodapés) ----------
const QFOOT=s=>/^(>>.*|<<.*|.*>>|.*<<)$/.test(s)||/^\d{1,3}$/.test(s);
const QCOST=s=>/^(BONUS|COST)\s*:/i.test(s);
const QSTOP=s=>/^(POSITIVE|NEGATIVE|METAGENIC) QUALITIES$/.test(s);
const QFL=new WeakMap(),QIX=new WeakMap(),noLower=s=>!/\p{Ll}/u.test(s);
function qReflow(lines,brs){
 const ls=lines.map(s=>s.length).sort((a,b)=>a-b),mx=ls[Math.floor(ls.length*.9)]||0,out=[];let p='';
 const push=()=>{if(p.trim())out.push(p.trim());p=''};
 for(let idx=0;idx<lines.length;idx++){const s=lines[idx];
  if(/^[•·▪‣◦]\s*$/.test(s)){push();p='•';continue}
  if(/^[•·▪‣◦]\s*\S/.test(s)){push();p=s.replace(/^[•·▪‣◦]\s*/,'• ')}
  else if(/\p{L}-$/u.test(p)&&/^\p{Ll}/u.test(s))p=p.slice(0,-1)+s;
  else p=p?p+' '+s:s;
  if(brs&&brs.size?brs.has(idx):/[.!?:"”)]$/.test(s)&&s.length<mx*.82)push()}
 push();return out}
function qFlatH(pg,i){let c=QFL.get(pg);if(!c){c={};QFL.set(pg,c)}
 if(c[i])return c[i];const o=[];
 for(const l of (pg[i]||'').split('\n')){const t=l.replace(/\u0001/g,'').replace(/\s+/g,' ').trim();
  if(!t){if(o.length)o[o.length-1].br=true;continue}
  if(QFOOT(t))continue;o.push({h:l.charCodeAt(0)===1,t,br:false})}
 return c[i]=o}
// índice dos títulos que têm "BONUS:/COST:" logo depois (1 ou 2 linhas de título)
function qIndex(pg){let ix=QIX.get(pg);if(ix)return ix;ix=[];
 for(let i=0;i<pg.length;i++){const L=qFlatH(pg,i).map(x=>x.t);
  for(let k=0;k<L.length-1;k++){if(QCOST(L[k]))continue;
   if(QCOST(L[k+1])&&L[k].length<=70)ix.push({k:nz(L[k]),p:i,l:k,h:1});
   else if(k<L.length-2&&QCOST(L[k+2])&&!QCOST(L[k+1])&&L[k].length+L[k+1].length<=70)ix.push({k:nz(L[k]+L[k+1]),p:i,l:k,h:2})}}
 QIX.set(pg,ix);return ix}
function qFind(pg,want,e){const ix=qIndex(pg);
 let c=ix.filter(x=>want.includes(x.k));
 if(!c.length)c=ix.filter(x=>want.some(w=>w.length>=5&&x.k.length>=5&&(x.k.startsWith(w)||w.startsWith(x.k))));
 if(!c.length)return null;
 c.sort((a,b)=>Math.abs(a.p-e)-Math.abs(b.p-e));return c[0]}
// 2ª tentativa, como o Chummer: acha o título só pelo nome (1 ou 2 linhas), sem exigir a linha de custo
function qLoose(src,pg,want,e,name){
 const at=i=>{const L=qFlatH(pg,i);
  let k=L.findIndex(x=>want.includes(nz(x.t)));if(k>=0)return{p:i,l:k,h:0};
  k=L.findIndex((x,j)=>j+1<L.length&&x.h&&L[j+1].h&&want.includes(nz(x.t+L[j+1].t)));if(k>=0)return{p:i,l:k,h:2};
  k=L.findIndex(x=>x.h&&want.some(w=>w.length>=5&&nz(x.t).startsWith(w)));if(k>=0)return{p:i,l:k,h:0};
  return null};
 for(const d of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6]){if(pg[e+d]){const h=at(e+d);if(h)return h}}
 const k=findAnywhere(src,name,e);return k>=0?at(k):null}
// texto a partir do título, atravessando páginas; nt = nº de linhas do título, se já sabido
function qBody(pg,h){
 let L=qFlatH(pg,h.p).slice(h.l);
 for(let i=1;i<=4;i++)L=L.concat(qFlatH(pg,h.p+i));
 let j=1;const ttl=[L[0].t];
 if(h.h){while(j<h.h){ttl.push(L[j].t);j++}}
 else while(j<L.length&&L[j].h&&L[j].t.length<45&&!QCOST(L[j].t)&&noLower(L[j].t)&&ttl.length<3){ttl.push(L[j].t);j++}
 let cost='';
 if(j<L.length&&(QCOST(L[j].t)||(L[j].t.length<40&&/karma/i.test(L[j].t)))){
  const first=L[j].t;
  if(QCOST(first)&&first.length>45&&!noLower(first)){}   // custo e texto na mesma linha (ex.: One Born Every Minute): a linha abre o corpo
  else{const ls=[first];j++;
   // custo quebrado em várias linhas (ex.: Astral Hazing): segue enquanto as linhas forem só maiúsculas
   while(j<L.length&&ls.length<5&&noLower(L[j].t)&&L[j].t.length<=60&&!QSTOP(L[j].t)&&!QCOST(L[j].t)&&!(j+1<L.length&&QCOST(L[j+1].t))){ls.push(L[j].t);j++}
   cost=ls.join('\n')}}
 const body=[],brs=new Set();let n=0;
 for(;j<L.length;j++){const t=L[j].t;
  if(QSTOP(t))break;
  if(j+1<L.length&&QCOST(L[j+1].t)&&!QCOST(t)&&t.length<=70)break;                                   // próxima qualidade
  if(j+2<L.length&&QCOST(L[j+2].t)&&!QCOST(L[j+1].t)&&noLower(t)&&noLower(L[j+1].t))break;           // idem, título em 2 linhas
  if(L[j].h&&n>=160&&noLower(t)&&t.length<=55)break;                                                 // título sem linha de custo
  body.push(t);if(L[j].br)brs.add(body.length-1);n+=t.length;if(n>9000)break}
 const paras=qReflow(body,brs);
 return paras.length?[ttl.join(' '),cost].concat(paras):null}
// o que o PDF mostra perto do nome (para o diagnóstico)
function qualityWhy(src,page,name){
 const meta=PM[src],pg=PT[src];if(!meta||!pg)return'';
 const want=[nz(name),nz(baseName(name))].filter(w=>w.length>=3),e=/^\d+$/.test(String(page))?+page+meta.offset-1:0,out=[];
 for(const d of [0,1,-1,2,-2,3,-3]){if(!pg[e+d])continue;const L=qFlatH(pg,e+d);
  L.forEach((x,k)=>{const n=nz(x.t);if(out.length<2&&n.length>=4&&want.some(w=>w.length>=5&&(n.includes(w)||w.includes(n)))&&x.t.length<90)out.push(xl('PDF pág. ')+(e+d+1)+': “'+x.t.slice(0,45)+'”'+(L[k+1]?' → “'+L[k+1].t.slice(0,35)+'”':''))})}
 return out.join(' | ')||xl('nenhuma linha parecida perto da página ')+(e+1)}
// devolve [título, linha de custo ('' se não houver), parágrafo, ...] ou null se não achar
function qualityParas(src,page,name){
 const meta=PM[src],pg=PT[src];
 if(!meta||!(meta.v>=3)||!pg)return null;
 const want=nameVars(name);
 const e=/^\d+$/.test(String(page))?+page+meta.offset-1:0;
 const h=qFind(pg,want,e)||qLoose(src,pg,want,e,name),r=h?qBody(pg,h):null;
 return r&&!qLooksIndex(r)?r:null}
// Alternativa que copia a lógica do Chummer (CommonFunctions.GetTextFromPdf): título em linha só de maiúsculas ou "Título: texto";
// linhas seguintes só de maiúsculas, logo após o título, são info extra (ex.: "(+3 KARMA)"); o bloco termina na próxima linha em maiúsculas.
// Usada quando a busca principal não acha o texto. Aceita também "TÍTULO (+3 KARMA)" numa linha só.
function chummerText(src,page,name){
 const meta=PM[src],pg=PT[src];if(!meta||!(meta.v>=3)||!pg||!/^\d+$/.test(String(page)))return null;
 let find=String(name||'');const ci=find.indexOf(':');if(ci>=0)find=find.slice(0,ci);
 find=find.trim().replace(/\s+(I|II|III|IV)$/,'');if(!find)return null;
 const F=find.toLowerCase(),up=t=>!/\p{Ll}/u.test(t),e0=+page+meta.offset-1;
 const one=start=>{
  const ls=[];let ti=-1,be=-1,extra=0,colon=false,inl='';
  for(let n=0;n<3&&pg[start+n]!==undefined;n++){
   const k0=ls.length;
   ls.push(...pg[start+n].split('\n').map(l=>l.replace(/\u0001/g,'').replace(/\s+/g,' ').trim()).filter(Boolean));
   for(let i=k0;i<ls.length;i++){
    if(extra>10)break;
    let cur=ls[i];
    if(ti<0){
     let more=0;
     if(cur.length<find.length){
      if(F.startsWith(cur.toLowerCase())){let t=cur;while(t.length<find.length&&i+more+1<ls.length){more++;t+=' '+ls[i+more]}cur=t}
      else continue}
     if(cur.length<find.length)break;
     if(cur.toLowerCase().startsWith(F)){
      if(cur.length>find.length){
       const rest=cur.slice(find.length);
       if(rest[0]===':'){ti=i;colon=true}
       else if(/^\s*\([^)]*karma[^)]*\)\s*$/i.test(rest)&&up(cur)){ti=i;colon=false;inl=rest.trim();cur=cur.slice(0,find.length)}}
      else if(up(cur)){ti=i;colon=false}
      if(ti>=0&&more>0){ls[i]=cur;ls.splice(i+1,more)}
      else if(ti>=0&&inl)ls[i]=cur}
    }else{
     if(up(cur)){
      if(/^\d+$/.test(cur)||cur.includes('>>')||cur.includes('<<')){ls.splice(i,1);i--;continue}
      if(!colon&&i===ti+extra+1){extra++;continue}
      be=i;break}
     if(colon&&cur.includes(':')){be=i;break}}
   }
   if(ti<0)return null;
   if(be>=0)break}
  if(be<0){if(ls.length-ti-extra-1<1)return null;be=ls.length}
  if(colon)return['','',ls.slice(ti,be).join(' ')];
  const out=[];let c='';
  for(let i=ti+extra+1;i<be;i++){const t=ls[i],ch=t[t.length-1];
   if(ch==='-')c+=t.slice(0,-1);
   else if('.?!:…。？！：'.includes(ch)){out.push((c+t).trim());c=''}
   else c+=t+' '}
  if(c.trim())out.push(c.trim());
  return out.length?[ls[ti],[inl].concat(ls.slice(ti+1,ti+1+extra)).filter(Boolean).join('\n'),...out]:null};
 for(const d of [0,-1,1,-2,2,-3,3,-4,4,-5,5,-6,6]){if(!pg[e0+d])continue;const r=one(e0+d);if(r)return r}
 return null}
// sumário/índice: muitos números de página soltos no começo do texto
function qLooksIndex(r){
 const body=r.slice(2).join(' ').slice(0,700);
 return (body.match(/\s\d{2,3}(?=\s|$)/g)||[]).length>=8}

function stat(){
 const ks=Object.keys(WHY),ok=ks.filter(k=>!WHY[k].why).length,miss=ks.filter(k=>WHY[k].why);
 const by={};miss.forEach(k=>{(by[WHY[k].why]=by[WHY[k].why]||[]).push(WHY[k].n)});
 $('pdfstat').innerHTML=ks.length?xl('<b>Última exportação (JSON):</b> ')+ok+xl(' de ')+ks.length+xl(' itens com o texto do livro.')+Object.entries(by).map(([w,l])=>'<div>• '+l.length+xl(' sem texto: ')+esc(w)+' — '+esc(l.slice(0,8).join(', '))+(l.length>8?'…':'')+'</div>').join(''):''}
document.getElementById('gen')&&document.getElementById('gen').addEventListener('click',()=>{for(const k in WHY)delete WHY[k];stat()});
let notesReady=false;
async function preloadTexts(){await Promise.all(Object.keys(PM).map(c=>ensureText(c)));notesReady=true;draw();window.BOOKTIP&&window.BOOKTIP.refresh()}
// última tentativa, sem exigir linha de custo nem título em maiúsculas: acha a linha do nome perto da página e lê até o próximo título
function qLenient(src,page,name){
 const meta=PM[src],pg=PT[src];if(!pg||!/^\d+$/.test(String(page)))return null;
 const want=nameVars(name),e=+page+(meta&&meta.offset||0)-1;
 for(const d of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6]){const i=e+d;if(!pg[i])continue;
  const L=qFlatH(pg,i),cl=t=>nz(t.replace(/\s*[\(:–-].*$/,''));
  const k=L.findIndex(x=>x.t.length<=80&&(want.includes(nz(x.t))||want.includes(cl(x.t))));if(k<0)continue;
  let all=L.slice(k);for(let q=1;q<=3;q++)all=all.concat(qFlatH(pg,i+q));
  let j=1,cost='';
  while(j<all.length&&j<4&&(QCOST(all[j].t)||(all[j].t.length<45&&noLower(all[j].t)&&/karma|\(|\+|–/i.test(all[j].t)))){cost+=(cost?'\n':'')+all[j].t;j++}
  const body=[],brs=new Set();let n=0;
  for(;j<all.length;j++){const t=all[j].t;
   if(QSTOP(t))break;
   if(body.length&&j+1<all.length&&QCOST(all[j+1].t)&&t.length<=70)break;
   if(body.length&&all[j].h&&noLower(t)&&t.length<=55&&n>=60)break;
   body.push(t);if(all[j].br)brs.add(body.length-1);n+=t.length;if(n>6000)break}
  const paras=qReflow(body,brs);
  if(paras.length)return[all[0].t.replace(/\s*\(.*$/,'').trim()||all[0].t,cost].concat(paras)}
 return null}
// um só resolvedor para a exportação do Chummer (XML) e do Foundry (JSON)
function qResolve(src,page,names){
 const nms=[...new Set((names||[]).filter(Boolean))];if(!src||!page)return null;
 for(const f of [qualityParas,chummerText,qLenient])for(const nm of nms){let r=null;try{r=f(src,page,nm)}catch(x){avisa('pdf-qualidades',x)}if(r&&r.length>2)return r}
 return null}
window.PDFNOTES={quality:qualityParas,resolve:qResolve,nop:n=>{try{return nameOnPage({name:n},'quality')}catch(e){return''}},bookText,preload:preloadTexts,get ready(){return notesReady},why:WHY};

// texto do livro em parágrafos: junta as linhas quebradas pela coluna e separa onde o parágrafo termina
function reflow(t){
 const L=String(t).split('\n').map(x=>x.trim()).filter(Boolean);if(!L.length)return[];
 const lens=L.slice(1).map(x=>x.length).sort((a,b)=>a-b),med=lens[Math.floor(lens.length/2)]||60,P=[L[0]];
 let cur='',prev='';
 for(let i=1;i<L.length;i++){const l=L[i];
  if(!cur){cur=l;prev=l;continue}
  if(/-$/.test(cur)&&/^\p{Ll}/u.test(l))cur=cur.slice(0,-1)+l;
  else if(/[.!?:;)]$/.test(prev)&&prev.length<med*.72)  {P.push(cur);cur=l}
  else cur+=' '+l;
  prev=l}
 if(cur)P.push(cur);return P}
function composeNote(sum,book,html){
 const sl=String(sum||'').split('\n').filter(x=>x.trim()),bp=book?(Array.isArray(book)?book.slice():reflow(book)):[];
 if(bp.length>1&&sl.length&&nz(bp[0])===nz(sl[0]))bp.shift();
 if(!html)return [sl.join('\n'),bp.join('\n\n')].filter(Boolean).join('\n\n');
 const parts=[];
 if(sl.length)parts.push('<p>'+sl.map((x,i)=>i?esc(x):'<strong>'+esc(x)+'</strong>').join('<br>')+'</p>');
 if(bp.length){parts.push('<hr>');bp.forEach((x,i)=>parts.push('<p>'+(i?'':'<strong>')+esc(x)+(i?'':'</strong>')+'</p>'))}
 return parts.join('')}
