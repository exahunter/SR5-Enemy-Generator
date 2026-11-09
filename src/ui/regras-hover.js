/* ===== v51: tudo que alude a regras só aparece ao passar o mouse =====
   Notas de cálculo, "(valor → dados que rola)", livro/página, tags de ação ([Take Cover]) e a lista "Ações do livro" ficam no DOM
   (copiar, buscar e imprimir continuam funcionando), mas viram um cartão flutuante (.rg) preso ao elemento (.rgh).
   Mouse: hover. Teclado/toque: foco (o hospedeiro ganha tabindex). Na impressão tudo volta a aparecer. */
(()=>{
 /* só notas de regra/cálculo; dados da ficha (ex.: "idioma nativo X") continuam visíveis */
 const NOTA=/^\((valor →|value →|pontuação|score|inicial \d|initial \d|nível \d|level \d|os que alteram|those that change|actions\.xml|arm\.)/;
 const HOST='.chip,li,.rgh,.row,.stat';
 const mark=(el,host)=>{el.classList.add('rg');host=host||el.closest(HOST)||el.parentElement;if(!host)return;host.classList.add('rgh');if(!host.hasAttribute('tabindex')&&!host.querySelector('input,select,textarea'))host.setAttribute('tabindex','0')};
 const trim=el=>{if(el.children.length)return;const t=el.textContent.trim();if(/^\(.*\)$/.test(t))el.textContent=t.slice(1,-1)};
 function pass(){
  const out=document.getElementById('out');if(!out)return;
  /* notas entre parênteses nas linhas da ficha e do cartão do grupo: (pontuação…), (inicial + carreira), (nível…), (valor → dados…) */
  out.querySelectorAll('.sheet .row .note, .gcard .row .note').forEach(n=>{
   if(n.closest('.edt,.mesa,.ajusta,.achar'))return;
   if(NOTA.test(n.textContent.trim())){trim(n);mark(n,n.parentElement)}});
  /* tags de ação nas condutas: [Take Cover] */
  out.querySelectorAll('.pcd li .note, .pers li .note, .pers p .note').forEach(n=>{if(/^\[/.test(n.textContent.trim()))mark(n,n.closest('li,p'))});
  /* caixa de combate: "(armadura 17)" ao lado de Resist. e a penalidade de ferimento no Monitor */
  out.querySelectorAll('.sheet .cmb').forEach(b=>{if(b.dataset.rg)return;b.dataset.rg=1;
   b.querySelectorAll('.ci').forEach(ci=>{if(/\((armadura|armor) \d+\)/.test(ci.textContent)){ci.innerHTML=ci.innerHTML.replace(/\s*\(((?:armadura|armor) \d+)\)/,xl(' <span class="rg">$1 (dados de Resist. = BOD + armadura)</span>'));mark(ci.querySelector('.rg'),ci)}});
   const mon=[...b.querySelectorAll('.cl')].find(x=>x.textContent.trim().startsWith('Monitor'));
   if(mon){mon.insertAdjacentHTML('beforeend',xl(' <span class="rg">Penalidade de ferimento: ')+ferHover()+'</span>');mark(mon.lastElementChild,mon)}});
  /* "Ações do livro": título + lista (tipo, página, reserva, limite) viram um bloco só, fechado */
  out.querySelectorAll('.pcd').forEach(d=>{if(d.querySelector('details.rgd'))return;
   const p=[...d.children].find(e=>e.tagName==='P'&&/^(Ações do livro|Book actions)/.test(e.textContent.trim()));if(!p)return;const ul=p.nextElementSibling;if(!ul||ul.tagName!=='UL')return;
   const g=document.createElement('details');g.className='rgd';g.innerHTML=xl('<summary>Ações do livro</summary>');p.before(g);const n=p.querySelector('.note');if(n)g.appendChild(n);p.remove();g.appendChild(ul)});
 }
 renderNPC.camada(xl('regras só no hover'),base=>function(L){const r=base(L);try{pass()}catch(e){avisa('regras-hover',e)}return r});
})();
