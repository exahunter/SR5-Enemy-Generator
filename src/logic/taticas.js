/* ===== v28/v31: abertura, postura e Edge da personalidade (a tabela d100 de ações foi substituída pelas condutas de logic/condutas.js) =====
 * persTactics(c) devolve abertura, postura (traços), manias e fala típica da personalidade; persTokens(c,P) lista os itens reais da ficha (arma, feitiço, drone, deck…) usados nas condutas. */
const persMainW=(c,P)=>{const W=(c.gear||[]).filter(x=>x.cat==='weapon'&&!x.nat);if(!W.length)return null;
 const S=pshare(P),score=w=>S.reduce((a,{e,f})=>a+((e.wp&&e.wp.test(w.sub||''))?f:0),0)*1000+(+w.cost||0);return W.slice().sort((a,b)=>score(b)-score(a))[0]};
function persTokens(c,P){const G=c.gear||[],W1=persMainW(c,P),W=G.filter(x=>x.cat==='weapon'&&!x.nat&&x!==W1),S=pshare(P);
 const sc=[...new Set(S.flatMap(x=>x.e.sc||[]))],sp=(c.spells||[]).find(s=>sc.includes(s[1]))||(c.spells||[])[0],
  dr=G.find(x=>x.cat==='drone')||G.find(x=>x.cat==='veh'),dk=G.find(x=>x.cat==='comm'&&x.sub==='Cyberdecks'),spi=(c.spirits||[])[0];
 return{W1:W1&&W1.n,W2:W[0]&&W[0].n,SP:sp&&sp[0],SPI:spi&&spi.n,DR:dr&&dr.n,DECK:dk&&dk.n}}
function persTactics(c){const P=c.npc&&c.npc.pers;if(!P||c.crit)return null;
 const S=pshare(P),open=S.map(({k,p,e})=>({n:e.n,p,t:(TAT_ST[k]||{}).o||''})).filter(x=>x.t),
  tr=P.t.map(k=>({n:TRACO[k].n,p:(TAT_TR[k]||{}).p||'',e:(TAT_TR[k]||{}).e||''}));
 return{open,tr,fr:P.fr,pec:P.pec||[]}}
/* linhas de texto para o campo Notas do Chummer / JSON (as condutas em si saem de condNotas, em logic/condutas.js) */
function persNotes(c){const P=c.npc&&c.npc.pers;if(!P)return[];const t=persTactics(c);if(!t)return[];const M=persMarkers(c);
 return[xl('Perfil de atuação: ')+persLabel(P)+xl('; temperamento: ')+persTraits(P)+(M?' ('+M.all+xl(' marcadores na ficha)'):''),
  ...t.open.map(o=>xl('Abertura (')+xl(o.n)+' '+o.p+'%): '+o.t+acSuf(o.t)),
  ...t.tr.map(o=>xl('Postura (')+xl(o.n)+'): '+o.p+' '+o.e),
  t.pec.length?xl('Manias: ')+t.pec.join('; '):''].filter(Boolean)}
