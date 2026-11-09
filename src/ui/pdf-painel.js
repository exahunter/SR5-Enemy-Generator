// ---------- PDFs dos livros: página certa (deslocamento) e busca no texto ----------
const PDFB='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/';
let PJ=null;
/* pdf.js (v6, build legacy) vai embutido no HTML (base64): a leitura de PDF funciona sem internet; CDN só como reserva. */
const pdfBlob=id=>{const b=atob(document.getElementById(id).textContent.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return URL.createObjectURL(new Blob([u],{type:'text/javascript'}))};
async function loadPdfjs(){
 if(PJ)return PJ;
 let m;
 try{m=await import(pdfBlob('pdfjs-main'));m.GlobalWorkerOptions.workerSrc=pdfBlob('pdfjs-worker')}
 catch(e){m=await import(PDFB+'pdf.min.mjs');try{const r=await fetch(PDFB+'pdf.worker.min.mjs');m.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([await r.blob()],{type:'text/javascript'}))}catch(x){m.GlobalWorkerOptions.workerSrc=PDFB+'pdf.worker.min.mjs'}}
 return PJ=m}
const nz=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
$('mi').insertAdjacentHTML('afterend',`<details class="adv" id="pdfp"><summary data-i18n="pdf.sum"></summary>
<div style="display:grid;gap:8px;padding:8px 0">
<label><span data-i18n="pdf.in"></span><input type="file" id="pdfin" accept="application/pdf,.pdf" multiple></label>
<label class="chk" style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="pdfkeep" checked><span data-i18n="pdf.keep"></span></label>
<div id="pdfmsg" class="note" data-i18n="pdf.msg"></div>
<label class="chk" style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="jhtml" checked><span data-i18n="pdf.jhtml"></span></label><label class="chk" style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="bkon" checked><span data-i18n="pdf.bkon"></span></label><div id="pdfun"></div><div id="pdfbooks"></div><div id="pdfcal"></div><div id="pdfstat" class="note"></div>
<input type="search" id="pdfq" data-i18n-ph="pdf.q" autocomplete="off">
<div id="pdfcount" class="note"></div><div id="pdfres" style="max-height:340px;overflow:auto"></div></div></details>`);
/* v42: "Livros ativos" sai das Opções avançadas e fica aqui, junto dos PDFs (cada livro mostra o selo "PDF ✔" / "sem PDF") */
{const bk=$('bk'),dest=$('pdfbooks');if(bk&&dest){bk.open=true;dest.before(bk);
 const row=bk.querySelector('.btnrow'),b=document.createElement('button');b.type='button';b.id='onlypdf';b.dataset.i18n='pdf.only';b.dataset.i18nTitle='pdf.only.t';b.setAttribute('data-i18n-title','pdf.only.t');
 b.onclick=()=>{const X=window.PDFX,ok=X&&X.resumo?X.resumo().tem:[];SEL.clear();SEL.add('SR5');ok.forEach(c=>SEL.add(c));drawBooks()};
 const clr=$('clr');row.insertBefore(b,clr||null)}}
aplicaIdioma();   // o HTML injetado acima usa data-i18n
const putD=(name,data)=>IDB.tx('readwrite',s=>s.put({name,size:0,data})).catch(()=>{});
const getD=name=>IDB.tx('readonly',s=>s.get(name)).then(r=>r&&r.data).catch(()=>null);
const pm=m=>$('pdfmsg').textContent=m;
const PTL={};   // texto em minúsculas por página
