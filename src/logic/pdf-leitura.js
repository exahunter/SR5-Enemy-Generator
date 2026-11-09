async function ensureText(code){
 if(PT[code])return PT[code];
 const d=await getD('__pdft_'+code);if(d&&d.pages){PT[code]=d.pages;return d.pages}
 return null}
const pageText=async(doc,i)=>{const pg=await doc.getPage(i),tc=await pg.getTextContent();return tc.items.map(x=>x.str).join(' ')};
// texto da página em ordem de leitura: separa colunas, junta as linhas e marca os títulos com \u0001
// agrupa os itens do PDF em colunas, na ordem de leitura. Acha as calhas (faixas verticais vazias entre colunas),
// aguenta 2 ou 3 colunas e itens de largura total (títulos, caixas), que separam a página em faixas
function colGroups(its,W){
  const N=its.length;if(N<12)return[its];
  const B=2,nb=Math.ceil(W/B)+2,cov=new Int32Array(nb);
  for(const x of its){const a=Math.max(0,Math.floor(x.x/B)),b=Math.min(nb-1,Math.ceil((x.x+Math.max(x.w,B))/B));for(let k=a;k<b;k++)cov[k]++}
  const tol=Math.max(2,Math.round(N*.2)),lo=Math.floor(W*.15/B),hi=Math.ceil(W*.85/B),minW=Math.max(8,W*.015);
  let G=[],s=-1;
  for(let k=lo;k<=hi;k++){const ok=k<hi&&cov[k]<=tol;if(ok&&s<0)s=k;if(!ok&&s>=0){if((k-s)*B>=minW)G.push({a:s*B,b:k*B,c:(s+k)*B/2});s=-1}}
  const crosses=(G,x)=>G.some(g=>x.x<g.a&&x.x+x.w>g.b);
  const colIdx=(G,x)=>{const c=x.x+x.w/2;let k=0;while(k<G.length&&c>G[k].c)k++;return k};
  // cada coluna precisa ter uma parte razoável do texto (senão era só uma coluna de números, margem etc.)
  for(;;){
   if(!G.length)return[its];
   const m=new Array(G.length+1).fill(0);for(const x of its)if(!crosses(G,x))m[colIdx(G,x)]+=Math.max(x.w,1);
   const tot=m.reduce((a,b)=>a+b,0)||1;let bad=-1,bm=1;m.forEach((v,k)=>{if(v/tot<.12&&v/tot<bm){bm=v/tot;bad=k}});
   if(bad<0)break;
   const gi=bad===0?0:bad===G.length?G.length-1:(G[bad-1].b-G[bad-1].a<=G[bad].b-G[bad].a?bad-1:bad);
   G=G.filter((_,k)=>k!==gi)}
  const cr=new Set(its.filter(x=>crosses(G,x))),cl=[...cr].sort((p,q)=>q.y-p.y),CL=[];
  for(const x of cl){const l=CL[CL.length-1];if(l&&Math.abs(l.y-x.y)<=Math.max(l.h,x.h)*.5)l.it.push(x);else CL.push({y:x.y,h:x.h,it:[x]})}
  const nC=G.length+1,bk=Array.from({length:CL.length+1},()=>Array.from({length:nC},()=>[]));
  for(const x of its){if(cr.has(x))continue;let b=0;while(b<CL.length&&CL[b].y>x.y+CL[b].h*.5)b++;bk[b][colIdx(G,x)].push(x)}
  const out=[];
  for(let b=0;b<=CL.length;b++){for(let c=0;c<nC;c++)if(bk[b][c].length)out.push(bk[b][c]);if(b<CL.length)out.push(CL[b].it)}
  return out}
async function pageTextL(doc,i){
  const pg=await doc.getPage(i),W=pg.getViewport({scale:1}).width,tc=await pg.getTextContent();
  const its=tc.items.filter(x=>typeof x.str==='string'&&x.str.trim()!=='').map(x=>({s:x.str,x:x.transform[4],y:x.transform[5],h:Math.abs(x.transform[3])||x.height||10,w:x.width||0}));
  if(!its.length)return '';
  const hs=its.map(x=>x.h).sort((a,b)=>a-b),med=hs[Math.floor(hs.length/2)]||10;
  const cols=colGroups(its,W);
  const out=[];
  for(const col of cols){
   const s=col.slice().sort((a,b)=>b.y-a.y||a.x-b.x),lines=[];
   for(const it of s){const ln=lines[lines.length-1];if(ln&&Math.abs(ln.y-it.y)<=Math.max(ln.h,it.h)*.5){ln.it.push(it);ln.h=Math.max(ln.h,it.h)}else lines.push({y:it.y,h:it.h,it:[it]})}
   const pit=lines.slice(1).map((l,k)=>lines[k].y-l.y).filter(d=>d>0).sort((a,b)=>a-b),pitch=pit.length>=3?pit[Math.floor(pit.length/2)]:0,
    left=Math.min(...lines.map(l=>Math.min(...l.it.map(z=>z.x))));
   for(let li=0;li<lines.length;li++){const ln=lines[li];
    if(li&&pitch&&out.length&&out[out.length-1]!==''){const dy=lines[li-1].y-ln.y,x0=Math.min(...ln.it.map(z=>z.x));if(dy>pitch*1.3||x0>left+ln.h*.9)out.push('')}
    ln.it.sort((a,b)=>a.x-b.x);let t='';ln.it.forEach((it,k)=>{if(k){const p=ln.it[k-1],gap=it.x-(p.x+p.w);t+=gap>it.h*.15?' ':''}t+=it.s});
    t=t.replace(/\s+/g,' ').trim();if(!t)continue;
    const letters=t.replace(/[^\p{L}]/gu,''),up=letters&&letters.replace(/[^\p{Lu}]/gu,'').length/letters.length;
    const head=ln.h>=med*1.18||(up>=.85&&letters.length>=4&&t.length<=55&&ln.h>=med*.98);
    out.push((head?'\u0001':'')+t)}}
  return out.join('\n')}
// trecho de um item: do título até o próximo título (ou até 3000 caracteres)
const baseName=n=>String(n).replace(/\s*\(.*?\)\s*/g,' ').trim();
// variantes do título como o Chummer procura: sem o que vem depois de ':' e sem " I/II/III/IV" no fim
const nameVars=n=>{const o=new Set(),add=x=>{x=nz(x);if(x.length>=3)o.add(x)};
 const a=String(n||'');add(a);add(baseName(a));
 let b=a.split(':')[0].trim().replace(/\s+(I|II|III|IV)$/i,'');add(b);add(baseName(b));return[...o]};
function snippetFor(t,name){
 const lines=t.split('\n'),want=[nz(name),nz(baseName(name))].filter(Boolean);
 let hi=-1;
 for(const w of want){hi=lines.findIndex(l=>l.charCodeAt(0)===1&&nz(l).startsWith(w));if(hi>=0)break}
 if(hi<0)for(const w of want){hi=lines.findIndex(l=>nz(l)===w);if(hi>=0)break}
 if(hi<0)for(const w of want){hi=lines.findIndex(l=>nz(l).includes(w));if(hi>=0)break}
 if(hi<0)return null;
 let j=hi+1;while(j<lines.length&&lines[j].charCodeAt(0)===1&&lines[j].length<45)j++;   // título em várias linhas
 let body=lines.slice(hi,j).map(l=>l.replace(/\u0001/g,'')).join(' ');
 for(;j<lines.length;j++){const l=lines[j];if(l.charCodeAt(0)===1&&body.length>=160)break;body+='\n'+l.replace(/\u0001/g,'');if(body.length>3000){body=body.slice(0,3000)+'…';break}}
 return body}


async function detect(doc,n){
 const sn=[];Object.entries(IX.bm).forEach(([code,ms])=>ms.forEach(m=>{const s=nz(m.t).slice(0,40);if(s.length>=15&&/^\d+$/.test(m.p))sn.push({code,page:+m.p,s,l:m.l})}));
 if(!sn.length)return null;
 for(let i=1;i<=Math.min(n,200);i++){
  const t=nz(await pageText(doc,i));if(t.length<20)continue;
  for(const x of sn){if(!t.includes(x.s))continue;
   const off=i-x.page,others=sn.filter(y=>y.code===x.code&&y.l===x.l&&y.page!==x.page);let ok=!others.length;
   for(const y of others){const pi=y.page+off;if(pi<1||pi>n)continue;if(nz(await pageText(doc,pi)).includes(y.s)){ok=true;break}}
   if(ok)return{code:x.code,offset:off}}}
 return null}

async function extract(doc,n,code,file,offset,keep){
 const pages=[];for(let i=1;i<=n;i++){pages.push(await pageTextL(doc,i));if(i%10===0){pm(xl('Extraindo o texto de ')+code+xl(': página ')+i+' de '+n+'…');await new Promise(r=>setTimeout(r))}}
 PT[code]=pages;delete PTL[code];delete PNZ[code];
 PM[code]={file:file.name,offset,pages:n,kept:!!keep,v:3};
 if(BLOB[code])URL.revokeObjectURL(BLOB[code]);BLOB[code]=URL.createObjectURL(file);PFILE[code]=file;delete PDOC[code];delete FOL[code];
 if(keep)await putD('__pdft_'+code,{pages});
 await putD('__pdfmeta',PM);drawPdf();draw();window.BOOKTIP&&window.BOOKTIP.refresh()}

const unk=[];   // PDFs não identificados esperando escolha manual
function drawUnk(){
 $('pdfun').innerHTML=unk.map((u,i)=>xlf('<div class="row"><span>Não identifiquei: {0} <span class="note">({1} páginas)</span></span><span><select data-u="{2}">{3}</select> deslocamento <input type="number" value="0" style="width:70px" data-o="{4}"> <button type="button" data-ok="{5}">Usar</button></span></div>',esc(u.file.name),u.n,i,BOOKS.map(([c,nm])=>`<option value="${esc(c)}">${esc(c)} · ${esc(nm)}</option>`).join(''),i,i)).join('');
 $('pdfun').querySelectorAll('[data-ok]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.ok,u=unk[i],code=$('pdfun').querySelector(`[data-u="${i}"]`).value,off=+$('pdfun').querySelector(`[data-o="${i}"]`).value||0;
  unk.splice(i,1);drawUnk();try{await extract(u.doc,u.n,code,u.file,off,$('pdfkeep').checked);pm(xl('Livro ')+code+' pronto: '+u.n+xl(' páginas, deslocamento ')+off+'.')}catch(x){pm(xl('Erro lendo o PDF: ')+(x&&x.message||x))}})}
/* v41: quais livros o usuário NÃO enviou em PDF. tem = com PDF lido; falta = marcado em "Livros ativos" mas sem PDF; outros = sem PDF e não marcado */
function pdfResumo(){const has=c=>{try{return!!PM[c]}catch(e){return false}},B=BOOKS.map(b=>b[0]);
 return{tem:B.filter(has),falta:B.filter(c=>SEL.has(c)&&!has(c)),outros:B.filter(c=>!SEL.has(c)&&!has(c)),marcados:B.filter(c=>SEL.has(c)).length}}
/* selo ao lado de cada livro da lista "Livros ativos" */
function bookBadges(){const b=document.getElementById('bklist');if(!b)return;const R=pdfResumo();
 b.querySelectorAll('.bkpdf').forEach(e=>{const c=e.dataset.c,t=R.tem.includes(c),m=SEL.has(c);e.className='bkpdf '+(t?'ok':'no'+(m?' sel':''));e.textContent=t?' · PDF ✔':xl(' · sem PDF');e.title=t?xl('Você enviou o PDF deste livro'):xl('Você não enviou o PDF deste livro')+(m?xl(' (e ele está marcado: o gerador usa os itens dele, mas não mostra o texto nem a página)'):'')})}
function pdfFaltaHtml(){const R=pdfResumo(),nm=c=>esc(c)+' · '+esc(bookName(c)),li=a=>a.map(c=>xlf('<div class="row"><span>{0}</span><span class="bkpdf no{1}">sem PDF</span></div>',nm(c),SEL.has(c)?' sel':'')).join('');
 const comPdf=R.marcados-R.falta.length;let h=xl('<div class="pdfno"><b>Livros sem PDF</b> ');
 if(!R.tem.length)h+=xl('<span class="note">Nenhum PDF enviado ainda.</span>');
 else h+='<span class="note">'+comPdf+' de '+R.marcados+xl(' livros marcados têm PDF.</span>');
 if(R.falta.length)h+=xl('<div class="note pdfwarn">Marcados em “Livros ativos”, mas sem PDF (')+R.falta.length+xl('): o gerador sorteia itens deles, só não mostra o texto do livro, a página certa nem a busca.</div>')+li(R.falta);
 else if(R.marcados)h+=xl('<div class="note">Todos os livros marcados têm PDF.</div>');
 if(R.outros.length)h+=xl('<details><summary class="note">Outros livros sem PDF (')+R.outros.length+xl(', não marcados)</summary>')+li(R.outros)+'</details>';
 return h+'</div>'}
function pdfResumoTitulo(){const sm=document.querySelector('#pdfp>summary');if(!sm)return;const R=pdfResumo();
 sm.textContent=xl('Livros ativos e PDFs: página certa e busca no texto')+(!R.tem.length?xl(' · nenhum PDF enviado'):R.falta.length?' · '+tn('pdf.falta',R.falta.length):xl(' · todos os marcados têm PDF'))}
/* ponte para fora do bloco do leitor de PDFs (a lista de livros fica em outro bloco) */
window.PDFX={PM,resumo:pdfResumo,badges:bookBadges,refresh:()=>drawPdf()};
function drawPdf(){
 const ks=Object.keys(PM).sort();
 $('pdfbooks').innerHTML=ks.length?xl('<b>Livros lidos</b>')+ks.map(c=>`<div class="row"><span>${esc(c)} · ${esc(bookName(c))} <span class="note">${esc(PM[c].file)} · ${PM[c].pages} pág. · ${PT[c]||PM[c].kept?(PM[c].v>=3?xl('texto guardado'):xl('texto antigo: releia este PDF para o trecho completo')):xl('sem texto guardado')}${BLOB[c]?xl(' · PDF aberto nesta sessão'):''}</span></span><span>deslocamento <input type="number" value="${PM[c].offset}" style="width:70px" data-off="${esc(c)}"> <button type="button" data-cal="${esc(c)}">${PM[c].cal?'✔ ':''}Calibrar</button></span></div>`).join('')+xl('<div class="note">Chummer: em Opções > Livros, coloque o deslocamento de cada livro para ele abrir o PDF na página certa. <button type="button" id="pdfcp">Copiar lista</button></div>'):'';
 try{$('pdfbooks').insertAdjacentHTML('beforeend',pdfFaltaHtml());bookBadges();pdfResumoTitulo()}catch(e){avisa('pdf-falta',e)}
 $('pdfbooks').querySelectorAll('[data-cal]').forEach(b=>b.onclick=()=>openCal(b.dataset.cal));
 $('pdfbooks').querySelectorAll('[data-off]').forEach(i=>i.onchange=async()=>{PM[i.dataset.off].offset=+i.value||0;await putD('__pdfmeta',PM);searchPdf()});
 const cp=$('pdfcp');if(cp)cp.onclick=()=>{const t=ks.map(c=>c+' ('+bookName(c)+'): '+(PM[c].offset>=0?'+':'')+PM[c].offset).join('\n');navigator.clipboard&&navigator.clipboard.writeText(t);cp.textContent='Copiado'}}

