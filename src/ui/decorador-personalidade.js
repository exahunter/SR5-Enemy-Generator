/* ===== v28: bloco "Personalidade" na ficha: estilos com %, traços, marcadores de coerência, abertura e postura ===== */
decorateSheet((sh,c)=>{const P=c.npc&&c.npc.pers;if(!P||c.crit)return;const sec=sh.querySelector('.sec');if(!sec)return;
 let M,T;try{M=persMarkers(c);T=persTactics(c)}catch(e){console.error('personalidade',e);return}
 if(!M)return;
 const E=esc,tone=['s0','s1','s2','s3','s4'],bar=P.s.map((x,i)=>`<span class="${tone[i]}" style="flex:${x.p}" title="${E(xl(ESTILO[x.k].n))} ${x.p}%">${E(xl(ESTILO[x.k].n))} <b>${x.p}%</b></span>`).join(''),
  chips=it=>it.length?it.map(i=>`<span class="chip${i.free?'':' t'}" title="${i.free?xl('na ficha (perícia, conhecimento ou conduta)'):xl('item da ficha')}">${E(i.t)}: ${E(i.v)}</span>`).join(''):xl('<span class="note">nenhum marcador de ficha (só as táticas refletem este estilo)</span>'),
  sty=M.sty.map(s=>`<div class="ps"><div><b>${E(s.n)}</b> <span class="note">${s.p}% · ${E(s.d||'')}</span></div><div class="chips">${chips(s.it)}</div></div>`).join(''),
  trs=M.trs.map(s=>xlf('<div class="ps"><div><b>{0}</b> <span class="note">temperamento</span></div><div class="chips">{1}</div></div>',E(s.n),chips(s.it))).join('');
 const tat=T?xlf('<details class="ptat"><summary>Abertura, postura e Edge</summary>\n  {0}\n  {1}\n  {2}</details>',T.open.map(o=>`<p><b>${E(xl(o.n))} ${o.p}%:</b> ${E(o.t)}${acHtml(o.t)}</p>`).join(''),T.tr.map(o=>`<p><b>${E(xl(o.n))}:</b> ${E(o.p)} <span class="note">${E(o.e)}</span></p>`).join(''),T.pec.length?xlf('<p class="note">Manias: {0}</p>',E(T.pec.join(' · '))):''):'';
 sec.insertAdjacentHTML('beforeend',xlf('<div class="pers" data-lk="pers"><div class="ph"><b>Perfil de atuação</b> <span class="note">{0} marcador{1} na ficha ({2} de equipamento, magia ou implante)</span></div><div class="pbar">{3}</div>{4}{5}{6}</div>',M.all,M.all===1?'':'es',M.sheet,bar,sty,trs,tat))});
