decorateSheet((sh,c)=>{if(!c.npc||!c.npc.vinc)return;
 sh.querySelector('.sec').insertAdjacentHTML('beforeend',row(xl('Vínculo do grupo'),esc(c.npc.vinc))+(c.npc.loy?row(xl('Lealdade ao líder'),c.npc.loy+'/6'):'')+c.npc.rel.map(r=>xlf('<div class="row"><span>Relação</span><span>{0}</span></div>',esc(relTxt(r)))).join(''))});
