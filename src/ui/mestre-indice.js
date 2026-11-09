// ---------- interface ----------
const imp=document.getElementById('imp'),host=imp&&(imp.closest('details')||imp.parentElement);
if(!host)return;
host.insertAdjacentHTML('afterend',xl(`<details class="adv" id="mi"><summary>Ler a pasta do Chummer e índice mestre</summary>
<div style="display:grid;gap:8px;padding:8px 0">
<label>Pasta do Chummer (a pasta <b>data</b> ou a pasta raiz do Chummer, com a <b>customdata</b> se você usa)<input type="file" id="dirimp" webkitdirectory multiple></label>
<div id="dirmsg" class="note">Escolha a pasta e o gerador lê todos os XML sozinho, guarda neste navegador e monta o índice. Nada sai do seu computador.</div>
<input type="search" id="mq" placeholder="Buscar por nome (ex.: Wired Reflexes, Fireball, Arnis de Mano)" autocomplete="off">
<div style="display:flex;gap:8px;flex-wrap:wrap"><select id="msec"><option value="">Todas as seções</option></select><select id="mbk"><option value="">Todos os livros</option></select><button id="mcsv" type="button">Baixar índice (.csv)</button></div>
<div id="mcount" class="note"></div>
<div id="mres" style="max-height:340px;overflow:auto"></div></div></details>`));
const $=id=>document.getElementById(id),mq=$('mq'),msec=$('msec'),mbk=$('mbk');

function fillSel(){
 const sc={},bc={};IX.rows.forEach(r=>{sc[r[1]]=(sc[r[1]]||0)+1;if(r[3])bc[r[3]]=(bc[r[3]]||0)+1});
 const vs=msec.value,vb=mbk.value;
 msec.innerHTML=xl('<option value="">Todas as seções (')+Object.keys(sc).length+')</option>'+Object.entries(sc).sort().map(([k,n])=>`<option value="${esc(k)}">${esc(k)} (${n})</option>`).join('');
 mbk.innerHTML=xl('<option value="">Todos os livros (')+Object.keys(bc).length+')</option>'+Object.entries(bc).sort().map(([k,n])=>`<option value="${esc(k)}">${esc(k)} · ${esc(bookName(k))} (${n})</option>`).join('');
 msec.value=vs;mbk.value=vb}
const NC=new WeakMap(),nn=r=>{let v=NC.get(r);if(v===undefined){v=norm(r[0]);NC.set(r,v)}return v};
function draw(){
 const q=norm(mq.value.trim()),s=msec.value,b=mbk.value;
 if(!IX.rows.length){$('mcount').textContent=xl('Índice vazio. Leia a pasta do Chummer acima, ou abra este painel de novo para montar o índice com os arquivos já guardados.');$('mres').innerHTML='';return}
 const m=IX.rows.filter(r=>(!s||r[1]===s)&&(!b||r[3]===b)&&(!q||nn(r).includes(q)));
 $('mcount').textContent=tn('indice.res',m.length,{tot:fmtNum(IX.rows.length)})+(m.length>150?' (mostrando 150)':'');
 $('mres').innerHTML=m.slice(0,150).map((r,i)=>{const act=PM[r[3]]&&/^\d+$/.test(r[4])?` <a href="#" data-a="snip" data-n="${esc(r[0])}" data-b="${esc(r[3])}" data-p="${esc(r[4])}">trecho</a>`+(BLOB[r[3]]?` <a href="#" data-a="open" data-b="${esc(r[3])}" data-p="${esc(r[4])}">abrir PDF</a>`:''):'';return `<div class="row"><span>${esc(r[0])} <span class="note">${esc(r[1])}${r[2]?' · '+esc(r[2]):''}</span></span><span class="note" title="${esc(bookName(r[3]))}">${r[3]?esc(r[3])+(r[4]?' p. '+esc(r[4]):''):''}${act}</span></div>`}).join('')}
{let t;mq.oninput=()=>{clearTimeout(t);t=setTimeout(draw,150)}}[msec,mbk].forEach(e=>e.oninput=draw);msec.onchange=mbk.onchange=draw;
$('mcsv').onclick=()=>{const q=s=>'"'+String(s).replace(/"/g,'""')+'"',t=xl('\ufeffNome;Seção;Categoria;Livro;Página;ID;Arquivo;Nome na página\n')+IX.rows.map(r=>r.map(q).join(';')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='indice_chummer.csv';a.click()};

