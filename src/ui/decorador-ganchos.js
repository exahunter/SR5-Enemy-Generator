/* ===== Ficha: motivação, peculiaridade e conduta em combate; cartão de resumo de cada grupo ===== */
const dgRow=(a,b)=>`<div class="row"><span>${a}</span><span>${b}</span></div>`;
decoratePage((L,out)=>{const seen=new Set();
 L.forEach(c=>{const g=c.npc&&c.npc.gid;if(!g||seen.has(g))return;seen.add(g);
  const sh=sheetOf(c);if(!sh)return;const M=L.filter(x=>x.npc&&x.npc.gid===g);sh.insertAdjacentHTML('beforebegin',grupoCardHTML(M));
  const card=sh.previousElementSibling;if(card){const b1=card.querySelector('.gcopy'),b2=card.querySelector('.gdl');if(b1)b1.onclick=()=>grupoCopiar(M);if(b2)b2.onclick=()=>grupoBaixar(M)}})});
decorateSheet((sh,c)=>{const t=ganchoTxt(c);if(!t)return;const sec=sh.querySelector('.sec'),n=c.npc.nm;if(!sec)return;
 sec.insertAdjacentHTML('beforeend',dgRow(xl('Motivação'),esc(t.mot))+dgRow(xl('Peculiaridade'),esc(t.pec))+dgRow(xl('Em combate'),esc([t.fuga,t.rende].filter(Boolean).join('. '))+'. '+esc(t.rf))+(n&&n.cult?dgRow(xl('Cultura'),esc(xl(n.cult))+xl(' <span class="note">(idioma nativo ')+esc(n.l)+')</span>'):''))});
