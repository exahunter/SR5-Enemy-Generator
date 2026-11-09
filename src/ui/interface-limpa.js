/* ===== Interface limpa: reorganiza as fichas depois de desenhadas ===== */
(()=>{
 const MAIN=new RegExp('^('+['Habilidades','Especializações','Conhecimentos','Idiomas','Feitiços','Poderes','Formas complexas','Sprites registrados','Arte marcial','Submersão','Iniciação'].map(w=>rxEsc(xl(w))).join('|')+')');
 const chips=(t,cls)=>`<div class="chips">${t.split(/, (?![^()]*\))/).filter(Boolean).map(x=>`<span class="chip ${cls||''}">${x}</span>`).join('')}</div>`;
 decoratePage((L,out)=>{
  // barra de resultados
  const act=out.querySelector(':scope > .actions');
  if(act){const note=act.querySelector('.note'),n=note?note.textContent.replace(/\D+/g,'')||L.length:L.length;
   act.className='toolbar';
   if(note)note.remove();
   act.insertAdjacentHTML('afterbegin',`<div class="count">${L.length} ${L.length===1?xl('ficha'):xl('fichas')}<span>${xl('guardadas neste navegador')}</span></div>`);
   const prt=document.getElementById('prt');if(prt)prt.textContent=xl('Imprimir');
   const zall=document.getElementById('zall');if(zall)zall.textContent=xl('Baixar todos (.zip)')}
  const ta=document.getElementById('jtx');
  if(ta&&!ta.closest('details')){const d=document.createElement('details');d.className='jsonbox';d.innerHTML=xl('<summary>Ver JSON do grupo</summary>');ta.replaceWith(d);d.appendChild(ta);d.addEventListener('toggle',()=>{if(d.open&&!ta.value&&window.__mkT)ta.value=window.__mkT()})}
  });
 // fichas
 decorateSheet(sh=>{if(sh.dataset.clean)return;sh.dataset.clean=1;sh.removeAttribute('style');
   const top=sh.querySelector('.top'),sp=top&&top.querySelector('span');
   if(sp){const parts=sp.textContent.split(' · ').map(s=>s.trim()).filter(Boolean),lvl=parts.pop();
    sp.outerHTML='<div class="chips">'+parts.map((p,i)=>`<span class="chip${i===0?' t':''}">${p}</span>`).join('')+(lvl?`<span class="chip k">${lvl}</span>`:'')+'</div>'}
   const sec=sh.querySelector('.sec');if(!sec)return;
   const rows=[...sec.querySelectorAll(':scope > .row')];
   const stat=rows.filter(r=>r.querySelector('.num')).slice(0,2);
   rows.forEach(r=>{if(r.firstElementChild.textContent.startsWith(xl('Penalidade de ferimento')))r.remove()});
   if(stat.length){const w=document.createElement('div');w.className='stats';stat[0].before(w);stat.forEach(r=>{r.firstElementChild.textContent=r.firstElementChild.textContent.replace(' (combinado)','');w.appendChild(r)})}
   const rest=[...sec.children].filter(e=>(e.classList.contains('row')||e.classList.contains('note')));
   const main=document.createElement('div');main.className='main';
   const more=document.createElement('details');more.className='more';
   rest.forEach(r=>{if(r.classList.contains('note')){more.appendChild(r);return}const lab=r.firstElementChild.textContent.trim();
    if(MAIN.test(lab)){const v=r.lastElementChild;v.outerHTML=chips(v.innerHTML,lab.startsWith(xl('Habilidades'))?'':'t');main.appendChild(r)}
    else more.appendChild(r)});
   const anchor=sec.querySelector('.stats');
   if(main.children.length)(anchor||sec.firstElementChild).after(main);
   if(more.children.length){more.insertAdjacentHTML('afterbegin',xlf('<summary>Mais detalhes ({0})</summary>',more.children.length));sec.appendChild(more)}
   // botões do cartão
   const jb=sh.querySelector('.jb'),xb=sh.querySelector('.xmlb');if(jb){jb.classList.remove('go');jb.textContent='JSON'}if(xb)xb.textContent='XML';
   const zb=sh.querySelector('.zb');if(zb)zb.textContent=xl('Baixar .chum5')});
 window.addEventListener('beforeprint',()=>document.querySelectorAll('.more,.help').forEach(d=>d.open=true));
})();
