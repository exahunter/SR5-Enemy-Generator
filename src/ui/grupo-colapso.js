/* ===== v52: ficha do grupo com as fichas dos membros "dentro" dela, e recolher o grupo recolhe todos de uma vez =====
   O DOM continua plano (o filtro, a ordenação e o rerrolar dependem disso): o cartão do grupo vem antes dos seus membros
   e CSS (.gm) cola cada ficha no cartão e na vizinha. O botão do cartão aciona o botão de recolher de cada membro
   (ui/achar-fichas.js), então o estado de cada ficha continua o mesmo e sobrevive aos redesenhos. */
(()=>{
 const GCOL=new Set();
 decoratePage((L,out)=>{
  const mem=gid=>L.filter(c=>c.npc&&c.npc.gid===gid).map(sheetOf).filter(Boolean);
  out.querySelectorAll('.sheet.gm').forEach(s=>s.classList.remove('gm','gm-1','gm-n'));
  out.querySelectorAll('.gcard[data-gid]').forEach(card=>{const gid=card.dataset.gid,ms=mem(gid);
   ms.forEach((s,i)=>{s.classList.add('gm');if(!i)s.classList.add('gm-1');if(i===ms.length-1)s.classList.add('gm-n')});
   const h=card.querySelector('h3');if(!h||h.querySelector('.gcolb'))return;
   const b=document.createElement('button');b.type='button';b.className='gcolb';b.setAttribute('aria-label',xl('Recolher ou expandir o grupo inteiro'));
   b.innerHTML='<svg viewBox="0 0 16 16" width="15" height="15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';
   const set=on=>{card.classList.toggle('gcol',on);b.title=on?xl('Expandir o grupo e todas as fichas'):xl('Recolher o grupo e todas as fichas');b.setAttribute('aria-expanded',on?'false':'true');on?GCOL.add(gid):GCOL.delete(gid)};
   b.onclick=()=>{const on=!card.classList.contains('gcol');set(on);
    /* cada ficha vai para o estado do grupo, pelo próprio botão dela (o conjunto de recolhidas fica em achar-fichas.js) */
    mem(gid).forEach(s=>{if(s.classList.contains('colapsada')!==on){const k=s.querySelector('.colb');if(k)k.click()}})};
   h.prepend(b);set(GCOL.has(gid))})});
 /* um clique no título também recolhe (fora dos botões) */
})();
