// ---------- calibrador de deslocamento (página impressa x página do PDF) ----------
// Compara lado a lado a página impressa do livro (itens que o índice do Chummer coloca nela) com a página do PDF (imagem + texto).
// Dois métodos independentes: (1) títulos do índice achados na página do PDF; (2) número impresso (rodapé/cabeçalho) lido em cada página do PDF.
const PFILE={},PDOC={},FOL={},CC={ok:'#2a8a3a',mid:'#b7791f',bad:'#c0392b'};let CALT=0,CALKH=null;
const sgn=n=>(n>=0?'+':'')+n,reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function calHas(code,idx,name){   // o título está numa linha da página do PDF (igual ao nome, ou título que começa com ele)
 const L=normLines(code)[idx];if(!L)return false;
 const want=[nz(name),nz(baseName(name))].filter(w=>w.length>=4);
 return L.some(x=>want.some(w=>x.n===w||(x.h&&x.n.startsWith(w))))}
function calMention(code,idx,name){   // o nome só é citado no meio do texto
 const L=normLines(code)[idx],w=nz(name);if(!L||w.length<4)return false;
 return L.some(x=>x.n.includes(w))}
function calItems(code){
 const seen=new Set(),all=[];
 IX.rows.forEach(r=>{if(r[3]!==code||!/^\d+$/.test(String(r[4]))||+r[4]<1||String(r[0]).length<5)return;const k=r[0]+'|'+r[4];if(seen.has(k))return;seen.add(k);all.push({n:r[0],p:+r[4],sec:r[1]})});
 return all}
// candidatos a número impresso de cada página do PDF: e = nas bordas (primeiras/últimas linhas), a = também linhas só com número
function folios(code){
 if(FOL[code])return FOL[code];
 const num=n=>n>=1&&n<=1500;
 return FOL[code]=(PT[code]||[]).map(t=>{
  const ls=t.split('\n').map(l=>l.replace(/\u0001/g,'').trim()).filter(Boolean),e=new Set(),a=new Set();
  ls.forEach((l,i)=>{if(l.length>70)return;
   if(/^\d{1,4}$/.test(l)&&num(+l)){a.add(+l);if(i<3||i>=ls.length-3)e.add(+l);return}
   if(i<3||i>=ls.length-3){let m=l.match(/^(\d{1,4})(?=\s)/);if(m&&num(+m[1])){e.add(+m[1]);a.add(+m[1])}
    m=l.match(/\s(\d{1,4})$/);if(m&&num(+m[1])){e.add(+m[1]);a.add(+m[1])}}});
  return{e:[...e],a:[...a]}})}
function folioVotes(code){   // cada página do PDF vota nos deslocamentos que o número dela sugere
 const F=folios(code),cnt={};let pgs=0;
 F.forEach((f,i)=>{if(!f.a.length)return;pgs++;const seen=new Set();
  for(const n of f.a){const o=i+1-n;if(o<-40||o>40||seen.has(o))continue;seen.add(o);cnt[o]=(cnt[o]||0)+1}});
 return{arr:Object.entries(cnt).map(([o,h])=>({off:+o,h})).sort((a,b)=>b.h-a.h||Math.abs(a.off)-Math.abs(b.off)),pgs}}
function titleScan(code,all){
 const step=Math.max(1,Math.floor(all.length/150)),sam=all.filter((_,i)=>i%step===0).slice(0,150),res=[];
 for(let off=-40;off<=40;off++){let h=0;for(const it of sam)if(calHas(code,it.p+off-1,it.n))h++;res.push({off,h})}
 res.sort((a,b)=>b.h-a.h||Math.abs(a.off)-Math.abs(b.off));
 return{res,tot:sam.length}}
async function calDoc(code){
 if(PDOC[code])return PDOC[code];
 const f=PFILE[code];if(!f)return null;
 await loadPdfjs();return PDOC[code]=await PJ.getDocument({data:await f.arrayBuffer()}).promise}
const nextBook=code=>{const ks=Object.keys(PM).sort(),i=ks.indexOf(code),ord=ks.slice(i+1).concat(ks.slice(0,i));return ord.find(c=>!PM[c].cal)||null};
async function openCal(code,banner){
 const box=$('pdfcal'),pg=await ensureText(code),meta=PM[code];
 if(!pg||!meta){box.innerHTML='<div class="note">'+t('cal.leia')+'</div>';return}
 const all=calItems(code);
 if(!all.length){box.innerHTML='<div class="note">'+t('cal.semitens',{code:esc(code)})+'</div>';return}
 box.innerHTML='<div class="note">'+t('cal.calibrando',{code:esc(code)})+'</div>';box.scrollIntoView({block:'nearest'});await new Promise(r=>setTimeout(r));
 const by=new Map();for(const it of all){if(!by.has(it.p))by.set(it.p,[]);by.get(it.p).push(it)}
 const pages=[...by.keys()].sort((a,b)=>a-b),K=Math.min(14,pages.length),
  cps=[...new Set(Array.from({length:K},(_,k)=>pages[Math.round(k*(pages.length-1)/Math.max(1,K-1))]))];
 const T=titleScan(code,all),tb=T.res[0],okT=tb.h>=Math.max(3,T.tot*.08),
  FV=folioVotes(code),fb=FV.arr[0],f2=FV.arr[1],okF=!!fb&&fb.h>=Math.max(5,FV.pgs*.2)&&fb.h>=1.8*(f2?f2.h:0),
  rec=okT?tb.off:okF?fb.off:meta.offset,agree=okT&&okF&&tb.off===fb.off,
  st={off:rec,p:pages[Math.min(pages.length-1,Math.floor(pages.length/3))]};
 const stepPage=dir=>{const q=dir<0?[...pages].reverse().find(x=>x<st.p):pages.find(x=>x>st.p);if(q!==undefined)st.p=q};

 const sumT=okT?t('cal.s.t.ok',{off:sgn(tb.off),h:tb.h,tot:T.tot,pct:Math.round(tb.h*100/T.tot)})+t('cal.outros',{l:T.res.slice(1,4).map(r=>sgn(r.off)+' ('+r.h+')').join(', ')})
  :t('cal.s.t.no',{off:sgn(tb.off),h:tb.h,tot:T.tot});
 const sumF=okF?t('cal.s.f.ok',{off:sgn(fb.off),h:fb.h,pgs:FV.pgs})+(f2?t('cal.outros',{l:FV.arr.slice(1,3).map(r=>sgn(r.off)+' ('+r.h+')').join(', ')}):'')
  :t('cal.s.f.no',{x:FV.pgs?t('cal.s.f.melhor',{off:sgn(fb.off),h:fb.h,pgs:FV.pgs}):''});
 const verdict=agree?`<span style="color:${CC.ok}">${t('cal.v.agree',{off:sgn(rec)})}</span>`
  :okT&&okF?`<span style="color:${CC.mid}">${t('cal.v.diverge',{a:sgn(tb.off),b:sgn(fb.off)})}</span>`
  :okT||okF?`<span style="color:${CC.mid}">${t('cal.v.um',{off:sgn(rec)})}</span>`
  :`<span style="color:${CC.bad}">${t('cal.v.nenhum')}</span>`;

 const draw=()=>{
  const tk=++CALT,p=st.p,idx=p+st.off-1,items=by.get(p)||[],txt=(pg[idx]||'').replace(/\u0001/g,''),F=folios(code)[idx]||{e:[],a:[]},hasFile=!!PFILE[code];
  // livro: itens do índice nesta página, e se cada um está na página do PDF
  const rows=items.slice(0,40).map(it=>{
   const s=calHas(code,idx,it.n)?'t':calMention(code,idx,it.n)?'m':'';let w=null;
   if(!s)for(const d of [-1,1,-2,2,-3,3]){if(calHas(code,idx+d,it.n)){w=d;break}}
   const ic=s==='t'?`<b style="color:${CC.ok}">✔</b>`:s==='m'?`<b style="color:${CC.mid}">≈</b>`:`<b style="color:${CC.bad}">✘</b>`,
    tx=s==='t'?t('cal.r.titulo'):s==='m'?t('cal.r.citado'):w!==null?t('cal.r.pdfpag',{p:idx+w+1})+` <button type="button" data-c="off" data-o="${st.off+w}">${t('cal.usar',{off:sgn(st.off+w)})}</button>`:t('cal.r.nao');
   return `<div style="display:flex;gap:6px;align-items:baseline;flex-wrap:wrap">${ic} <span>${esc(it.n)}</span> <span class="note">${esc(it.sec)} · ${tx}</span></div>`}).join('');
  const nb=items.length?[-2,-1,0,1,2].map(d=>{const o=st.off+d;let h=0;for(const it of items)if(calHas(code,p+o-1,it.n))h++;
   return `<button type="button" data-c="off" data-o="${o}" style="padding:4px 8px;${d?'':'border-color:var(--hot)'}">${sgn(o)}: ${h}/${items.length}</button>`}).join(' '):'';
  let fl;
  if(!pg[idx])fl=t('cal.pg.semtexto');
  else if(F.a.includes(p))fl=`<span style="color:${CC.ok}">${t('cal.pg.ok',{p})}</span>`;
  else if(F.e.length){const o=idx+1-F.e[0];fl=`<span style="color:${CC.bad}">${t('cal.pg.bad',{n:F.e.join(' / '),p})}</span>`+t('cal.pg.sugere',{off:sgn(o)})+`<button type="button" data-c="off" data-o="${o}" style="padding:4px 8px">${t('cal.usar0')}</button>`}
  else fl=t('cal.pg.nenhum');
  // pontos de conferência espalhados pelo livro (mostra se o deslocamento muda no meio)
  let okN=0;
  const chips=cps.map(q=>{const its=by.get(q),ix=q+st.off-1,h=its.filter(it=>calHas(code,ix,it.n)).length,ok=(folios(code)[ix]||{a:[]}).a.includes(q)||h*2>=its.length;if(ok)okN++;
   return `<button type="button" data-c="go" data-p="${q}" style="padding:4px 8px;color:${ok?CC.ok:CC.bad};${q===p?'border-color:var(--hot)':''}">p.${q} ${ok?'✔':'✘'}</button>`}).join(' ');
  // texto da página do PDF, com os nomes do índice marcados
  const names=items.map(i=>reEsc(esc(i.n))).sort((a,b)=>b.length-a.length);
  let tx=esc(txt);if(names.length)tx=tx.replace(new RegExp('('+names.join('|')+')','ig'),'<mark>$1</mark>');
  const txBox=`<div class="note" style="white-space:pre-wrap;max-height:${hasFile?220:420}px;overflow:auto;padding:6px 8px">${txt?tx:t('cal.txsem')}</div>`;
  const pdfSide=hasFile?`<div id="calwrap" style="overflow:auto;max-height:640px;background:var(--soft);border-radius:6px;padding:4px"><canvas style="display:block;max-width:100%"></canvas></div>
    <div id="calcvn" class="note">${t('cal.carregando')}</div><details><summary class="note">${t('cal.textoext')}</summary>${txBox}</details>`
   :`${txBox}<label class="note" style="display:block;margin-top:6px">${t('cal.abrirpdf')}<input type="file" accept="application/pdf,.pdf" data-f="1"></label>`;
  box.innerHTML=`<div style="border:1px solid #8886;border-radius:8px;padding:10px;display:grid;gap:10px">${banner?`<div style="color:${CC.ok};font-weight:600">${banner}</div>`:''}
   <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>${t('cal.titulo',{code:esc(code),nome:esc(bookName(code))})}</b><span class="note">${t('cal.atual',{off:sgn(meta.offset)})}</span></div>
   <div style="display:grid;gap:3px"><div>${sumT}</div><div>${sumF}</div><div>${verdict}${rec!==st.off?` <button type="button" data-c="off" data-o="${rec}" style="padding:4px 8px">${t('cal.usar',{off:sgn(rec)})}</button>`:''}</div></div>
   <div><div class="note">${t('cal.pontos',{off:sgn(st.off),ok:okN,n:cps.length})}</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${chips}</div></div>
   <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
    <span>${t('cal.desl')} <button type="button" data-c="om">−1</button> <input type="number" value="${st.off}" style="width:70px" data-c="of"> <button type="button" data-c="op">+1</button></span>
    <span>${t('cal.pglivro')} <input type="number" value="${p}" style="width:70px" data-c="bp"></span>
    <span>${t('cal.igualpdf')} <input type="number" value="${idx+1}" style="width:70px" data-c="pp"> <span class="note">${t('cal.de',{n:meta.pages})}</span></span></div>
   <div style="display:flex;gap:8px;align-items:center"><button type="button" data-c="bm" style="flex:1;padding:12px">${t('cal.ant')}</button><span class="note" style="white-space:nowrap">${t('cal.xdey',{a:Math.max(1,pages.indexOf(p)+1),b:pages.length})}</span><button type="button" data-c="bn" class="go" style="flex:2;padding:12px">${t('cal.prox')}</button></div>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;align-items:start">
    <div style="display:grid;gap:6px;align-content:start"><b>${t('cal.livropag',{p})}</b>
     <div class="note">${items.length?tn('cal.indiceTem',items.length):t('cal.indiceNao')}</div>${rows}
     ${nb?`<div class="note" style="margin-top:4px">${t('cal.achados')}</div><div style="display:flex;gap:4px;flex-wrap:wrap">${nb}</div>`:''}</div>
    <div style="display:grid;gap:6px;align-content:start"><b>${t('cal.pdfpag',{n:idx+1})}</b><div>${fl}</div>${pdfSide}
     ${hasFile?`<div class="note"><span style="background:rgba(255,214,0,.55);padding:0 4px">${t('cal.amarelo')}</span> ${t('cal.leg.t')} <span style="background:rgba(0,190,200,.55);padding:0 4px">${t('cal.azul')}</span> ${t('cal.leg.n')}</div>`:''}</div></div>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-c="ok" class="go">${t('cal.aplicar',{off:sgn(st.off)})}</button>${nextBook(code)?`<button type="button" data-c="okn" class="go">${t('cal.aplicaIr',{code:esc(nextBook(code))})}</button><button type="button" data-c="skip">${t('cal.pular',{code:esc(nextBook(code))})}</button>`:''}${hasFile?`<button type="button" data-c="pdf">${t('cal.abrir')}</button>`:''}<button type="button" data-c="x">${t('cal.fechar')}</button></div></div>`;

  box.querySelectorAll('button[data-c]').forEach(b=>b.onclick=async()=>{const c=b.dataset.c;
   if(c==='om'){st.off--;draw()}else if(c==='op'){st.off++;draw()}
   else if(c==='off'){st.off=+b.dataset.o;draw()}
   else if(c==='bm'){stepPage(-1);draw()}else if(c==='bn'){stepPage(1);draw()}
   else if(c==='go'){st.p=+b.dataset.p;draw()}
   else if(c==='pdf'){window.open(BLOB[code]+'#page='+(idx+1),'_blank')}
   else if(c==='x'){CALT++;box.innerHTML=''}
   else if(c==='skip'){CALT++;openCal(nextBook(code))}
   else if(c==='ok'||c==='okn'){CALT++;const o=st.off,nx=nextBook(code);PM[code].offset=o;PM[code].cal=1;
    try{drawPdf()}catch(x){avisa('pdf-calibrador',x)}
    const msg=t('cal.aplicado',{code,off:sgn(o)});pm(msg+t('cal.gere'));
    putD('__pdfmeta',PM);   // salva em segundo plano; não trava o botão
    if(c==='okn'&&nx)openCal(nx,msg);
    else{box.innerHTML=`<div style="border:1px solid #8886;border-radius:8px;padding:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="color:${CC.ok};font-weight:600">${esc(msg)}</span>${nx?`<button type="button" class="go" id="calnx">${t('cal.calnx',{code:esc(nx)})}</button>`:`<span class="note">${t('cal.todos')}</span>`}<button type="button" id="calcl">${t('cal.fechar')}</button></div>`;
     const bn=$('calnx');if(bn)bn.onclick=()=>openCal(nx);$('calcl').onclick=()=>{box.innerHTML=''};box.scrollIntoView({block:'nearest'})}}});
  const inp=k=>box.querySelector(`input[data-c="${k}"]`),ib=inp('bp'),ip=inp('pp'),io=inp('of');
  if(io)io.onchange=()=>{st.off=Math.trunc(+io.value)||0;draw()};
  if(ib)ib.onchange=()=>{st.p=Math.max(1,Math.trunc(+ib.value)||1);draw()};
  if(ip)ip.onchange=()=>{const v=Math.trunc(+ip.value);if(v>=1){st.off=v-p;draw()}};
  const fi=box.querySelector('input[data-f]');
  if(fi)fi.onchange=async()=>{const f=fi.files[0];if(!f)return;
   try{await loadPdfjs();const doc=await PJ.getDocument({data:await f.arrayBuffer()}).promise;
    if(doc.numPages!==meta.pages)pm(t('cal.pgs',{n:doc.numPages,code,m:meta.pages}));
    PFILE[code]=f;PDOC[code]=doc;if(BLOB[code])URL.revokeObjectURL(BLOB[code]);BLOB[code]=URL.createObjectURL(f);drawPdf();draw()}
   catch(x){pm(t('cal.naoabre',{e:x&&x.message||x}))}};
  if(hasFile)paint(tk,idx,items,p)};

 // desenha a página do PDF e destaca os títulos do índice (amarelo) e o número impresso (azul)
 const paint=async(tk,idx,items,p)=>{
  const cv=box.querySelector('canvas'),nt=box.querySelector('#calcvn');if(!cv)return;
  try{
   const doc=await calDoc(code);if(tk!==CALT)return;
   if(idx<0||idx>=doc.numPages){nt.textContent=t('cal.naoexiste',{n:doc.numPages});return}
   const page=await doc.getPage(idx+1);if(tk!==CALT)return;
   const v0=page.getViewport({scale:1}),wrap=box.querySelector('#calwrap'),cssW=Math.max(260,Math.min(640,(wrap.clientWidth||420)-8)),dpr=Math.min(2,window.devicePixelRatio||1),vp=page.getViewport({scale:cssW/v0.width*dpr});
   cv.width=vp.width;cv.height=vp.height;cv.style.width=cssW+'px';cv.style.height=(vp.height/dpr)+'px';
   const ctx=cv.getContext('2d');await page.render({canvasContext:ctx,viewport:vp}).promise;if(tk!==CALT)return;
   const tc=await page.getTextContent();if(tk!==CALT)return;
   const want=items.flatMap(i=>[nz(i.n),nz(baseName(i.n))]).filter(w=>w.length>=4),box1=(x,col)=>{const w=x.width||0,h=Math.abs(x.transform[3])||x.height||10,r=vp.convertToViewportRectangle([x.transform[4],x.transform[5],x.transform[4]+w,x.transform[5]+h]);ctx.fillStyle=col;ctx.fillRect(Math.min(r[0],r[2]),Math.min(r[1],r[3]),Math.abs(r[2]-r[0]),Math.abs(r[3]-r[1]))};
   for(const x of tc.items){if(typeof x.str!=='string')continue;const s=x.str.trim();if(!s)continue;const n=nz(s),y=x.transform[5];
    if(n.length>=4&&want.some(w=>w.includes(n)||n.includes(w)))box1(x,'rgba(255,214,0,.4)');
    else if(/^\d{1,4}$/.test(s)&&+s===p&&(y<v0.height*.12||y>v0.height*.86))box1(x,'rgba(0,190,200,.5)')}
   nt.textContent='';
  }catch(x){if(tk===CALT&&nt)nt.textContent=t('cal.naodesenha',{e:x&&x.message||x})}};

 if(CALKH)document.removeEventListener('keydown',CALKH);
 CALKH=e=>{if(!box.firstChild||!box.isConnected){document.removeEventListener('keydown',CALKH);return}
  if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='ArrowLeft'){e.preventDefault();stepPage(-1);draw()}else if(e.key==='ArrowRight'){e.preventDefault();stepPage(1);draw()}};
 document.addEventListener('keydown',CALKH);
 draw()}

$('pdfin').onchange=async e=>{
 const fs=[...e.target.files];if(!fs.length)return;
 try{pm(t('pdf.load'));await loadPdfjs()}catch(x){pm(t('pdf.loadfail',{e:x&&x.message||x}));return}
 for(const f of fs){try{
   pm(t('pdf.abrindo',{f:f.name}));const doc=await PJ.getDocument({data:await f.arrayBuffer()}).promise,n=doc.numPages;
   pm(t('pdf.ident',{f:f.name}));const d=await detect(doc,n);
   if(d){await extract(doc,n,d.code,f,d.offset,$('pdfkeep').checked);pm(t('pdf.ok',{code:d.code,nome:bookName(d.code),n,off:d.offset}))}
   else{unk.push({file:f,doc,n});drawUnk();pm(t('pdf.unk',{f:f.name}))}
  }catch(x){pm(t('pdf.err',{f:f.name,e:x&&x.message||x}))}}
 e.target.value=''};

