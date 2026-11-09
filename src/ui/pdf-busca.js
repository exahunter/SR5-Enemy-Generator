// busca
let st=0;
async function searchPdf(){
 const q=$('pdfq').value.trim().toLowerCase(),out=$('pdfres'),ks=Object.keys(PM);
 if(!q){out.innerHTML='';$('pdfcount').textContent='';return}
 const my=++st;for(const c of ks)await ensureText(c);if(my!==st)return;
 const terms=q.split(/\s+/).filter(Boolean),hits=[];
 for(const c of ks){const pg=PT[c];if(!pg)continue;const L=PTL[c]||(PTL[c]=pg.map(t=>t.toLowerCase()));
  for(let i=0;i<L.length&&hits.length<400;i++){if(terms.every(t=>L[i].includes(t)))hits.push([c,i])}}
 $('pdfcount').textContent=hits.length?tn('pdf.pag',hits.length)+(hits.length>60?' (mostrando 60)':''):xl('Nada encontrado nos livros lidos.');
 out.innerHTML=hits.slice(0,60).map(([c,i])=>{const t=PT[c][i].replace(/\u0001/g,'').replace(/\n/g,' '),k=PTL[c][i].replace(/\u0001/g,'').replace(/\n/g,' ').indexOf(terms[0]),a=Math.max(0,k-90),sn=esc(t.slice(a,k+terms[0].length+160)).replace(new RegExp('('+esc(terms[0]).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>'),pr=i+1-PM[c].offset;
  return `<div class="row" style="align-items:flex-start"><span>${a>0?'…':''}${sn}…</span><span class="note">${esc(c)} p. ${pr}${BLOB[c]?` <a href="#" data-a="open" data-b="${esc(c)}" data-p="${pr}">abrir PDF</a>`:''}</span></div>`}).join('')}
let tq;$('pdfq').oninput=()=>{clearTimeout(tq);tq=setTimeout(searchPdf,250)};

// ações nas linhas (busca e índice mestre)
document.addEventListener('click',async ev=>{const a=ev.target.closest&&ev.target.closest('a[data-a]');if(!a)return;ev.preventDefault();
 const b=a.dataset.b,p=+a.dataset.p;
 if(a.dataset.a==='open'){if(BLOB[b]&&PM[b])window.open(BLOB[b]+'#page='+(p+PM[b].offset),'_blank');return}
 if(a.dataset.a==='snip'||a.dataset.a==='page'){const row=a.closest('.row')||a.closest('[data-snip]').previousElementSibling,nx=row.nextElementSibling;if(nx&&nx.dataset.snip){nx.remove();if(a.dataset.a==='snip')return}
  const pg=await ensureText(b),meta=PM[b];let html;
  if(!pg||!meta)html=xl('Leia o PDF deste livro (painel “Livros ativos e PDFs”) para ver o trecho.');
  else{let txt=null,pgn=p;
   if(a.dataset.a==='page'){txt=(pg[p+meta.offset-1]||'').replace(/\u0001/g,'');}
   else{for(const d of [0,1,-1]){const t=pg[p+d+meta.offset-1];if(!t)continue;const s=snippetFor(t,a.dataset.n);if(s){txt=s;pgn=p+d;break}}
    if(txt===null){const t=pg[p+meta.offset-1]||'',k=t.toLowerCase().indexOf(a.dataset.n.toLowerCase());txt=t.replace(/\u0001/g,'').slice(Math.max(0,k<0?0:k-60),(k<0?0:k)+1500)}}
   html=esc(txt||xl('Sem texto nessa página.'))+xlf('<div style="margin-top:6px"><a href="#" data-a="page" data-b="{0}" data-p="{1}" data-n="{2}">ver a página inteira</a>{3}</div>',esc(b),esc(pgn),esc(a.dataset.n),a.dataset.a==='page'?'':(BLOB[b]?` · <a href="#" data-a="open" data-b="${esc(b)}" data-p="${esc(pgn)}">abrir PDF</a>`:''))}
  row.insertAdjacentHTML('afterend','<div class="note" data-snip="1" style="padding:6px 10px;white-space:pre-wrap;max-height:380px;overflow:auto">'+html+'</div>')}});

// carga
(async()=>{const m=await getD('__pdfmeta');if(m){Object.assign(PM,m);draw()}drawPdf();await preloadTexts();stat()})();

