/* ===== v40/v41: bloco "Condutas em combate" na ficha de critter/espírito =====
 * v41: cada conduta mostra as ações do livro que ela usa, a perícia da ficha que a sustenta (com o rating) e o poder que a motivou;
 * no fim, a lista "Ações do livro" com tipo, página, reserva de dados (atributos + perícias do critter) e limite. */
decorateSheet((sh,c)=>{let k;try{k=critCondOf(c)}catch(e){console.error('condutas de critter',e);return}
 const sec=sh.querySelector('.sec');if(!k||!sec)return;
 const li=(a,part,lo)=>a.map((t,i)=>{const x=ccHtml(c,k,part,i),j=lo?t.indexOf(': '):-1;return j>0?`<li><b>${esc(t.slice(0,j+1))}</b>${esc(t.slice(j+2))}${x}</li>`:`<li>${esc(t)}${x}</li>`}).join('');
 let AR=[];try{AR=acResumoCrit(c)}catch(e){avisa('decorador-condutas-critter',e)}
 sec.insertAdjacentHTML('beforeend',xlf('<details class="pcd"><summary>Condutas em combate</summary><p><b>Temperamento:</b> {0}</p><p class="ph hi"><b>Vida alta (3)</b></p><ol class="hi">{1}</ol><p class="ph lo"><b>Vida baixa (3)</b></p><ol class="lo">{2}</ol>{3}</details>',esc(CC_TEMP[k.tp]),li(k.hi,'hi',false),li(k.lo,'lo',true),AR.length?xlf('<p><b>Ações do livro</b> <span class="note">(actions.xml; reserva de dados do critter quando a ficha permite)</span></p><ul>{0}</ul>',AR.map(t=>`<li>${esc(t)}</li>`).join('')):''))});
