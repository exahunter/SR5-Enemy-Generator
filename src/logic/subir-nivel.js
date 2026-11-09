/* ===== v19: ao subir de nível, mantém qualidades/equipamento e sorteia novos ===== */
const LV_Q_CHANCE=.35,LV_G_CHANCE=.40,LV_MAXROLLS=8;
const NQ_LV={'Segurança corporativa (rent-a-cop)':'Samurai de rua','Polícia (Lone Star / força local)':'Samurai de rua','Ganger de rua (gangue)':'Samurai de rua','Arruaceiro / manifestante':'Samurai de rua','Sindicato (máfia, yakuza, vory)':'Samurai de rua','Resposta de alta ameaça (HTR)':'Samurai de rua','Operações especiais (spec ops)':'Samurai de rua','Cultista / fanático':'Face','Político / burocrata':'Face','Guarda-costas':'Samurai de rua','Mercenário (merc)':'Samurai de rua','Caçador de recompensas (bounty hunter)':'Samurai de rua'};
const growLoadout=comCamadas('growLoadout',growLoadoutBase);
function growLoadoutBase(n,pr0,PR){
 GEN.lvAdd={q:[],g:[]};const up=PR-pr0;if(up<=0||!n.npc)return;
 const rolls=Math.min(up,LV_MAXROLLS),sp=n.npc.sp||'',T=TYPES[n.npc.type]||{},Lk=lockOf(n);
 /* qualidades novas (as antigas já vieram intactas) */
 if(!Lk.qual){
  n.q=[...(n.q||[])];
  const bud=qBudget(PR),spent=t=>n.q.filter(o=>o.t===t).reduce((a,o)=>a+(+o.c||0),0),
   arch=sp==='Decker'||sp==='Technomancer'?'Decker':sp==='Rigger'?'Rigger':sp==='Mage'||sp==='Mystic'?'Mago hermético':sp==='Adept'?'Adepto físico':(NQ_LV[n.npc.type]||'');
  for(let i=0;i<rolls;i++){if(Math.random()>=LV_Q_CHANCE)continue;
   const t=Math.random()<.75?'Positive':'Negative';
   for(let a=0;a<3;a++){
    const cand=genQuals(arch,R(0,5),bud).filter(o=>o.t===t&&!n.q.some(g=>g.n===o.n||QFB(g.n,o.n))&&spent(t)+o.c<=bud);
    if(cand.length){const o=pick(cand);n.q.push(o);GEN.lvAdd.q.push(o.n);break}}}
 }
 /* equipamento novo (o antigo já veio intacto) */
 if(!Lk.gear&&!(META[n.meta]&&META[n.meta].ai)){
  n.gear=[...(n.gear||[])];const G=n.gear,pool=poolItems(),b=BUD(PR),noC=T.pw!==undefined&&!G.some(x=>x.cat==='weapon'&&!x.nat);
  const F={weapon:.3,armor:.3,gear:.1,drone:.6};
  for(let i=0;i<rolls;i++){if(Math.random()>=LV_G_CHANCE)continue;
   const r=Math.random();let k=r<.35?'weapon':r<.55?'armor':r<.9?'gear':'drone';
   if(k==='weapon'&&noC)k='gear';if(k==='drone'&&PR<3)k='gear';
   const maxArm=Math.max(0,...G.filter(x=>x.cat==='armor').map(x=>+x.cost||0));
   let o=pool.filter(it=>it[0]===k&&it[2]<=b*F[k]&&!G.some(x=>x.n===it[1])&&eqAvOk((it[7]||{}).avail,PR)&&(k!=='armor'||it[2]>maxArm));
   if(k==='weapon'&&T.wc){const w=o.filter(it=>T.wc.test(it[6]||''));if(w.length)o=w}
   if(!o.length)continue;const it=pick(o);
   G.push({cat:k,n:it[1],cost:it[2],src:it[3]||'SR5',ess:0,id:it[5]||'',sub:it[6]||'',st:it[7]||{}});GEN.lvAdd.g.push(it[1])}
  /* comlink melhor para o novo nível (o antigo é mantido) */
  {const K=KIT[(n.npc||{}).type]||{},best=Math.max(0,...G.filter(x=>x.cat==='comm'&&x.sub==='Commlinks').map(x=>+((x.st||{}).devicerating)||0));   // v44: comlink do perfil para o novo nível (o antigo é mantido)
   if(EQ_CL_DR(PR)+(K.cd||0)>best){const i=eqCommPick({cd:K.cd||0},PR,G.map(x=>x.n));if(i&&eqCommDR(i)>best){G.push(eqCommItem(i));GEN.lvAdd.g.push(i[1])}}}
  if(sp==='Decker')dkUpgrade(n,PR).forEach(x=>GEN.lvAdd.g.push(x));
 }
}
const lvAddMsg=()=>(GEN.lvAdd.q.length?xl(' Novas qualidades: ')+GEN.lvAdd.q.join(', ')+'.':'')+(GEN.lvAdd.g.length?xl(' Novo equipamento: ')+GEN.lvAdd.g.join(', ')+'.':'')+(!GEN.lvAdd.q.length&&!GEN.lvAdd.g.length?' Nada novo sorteado desta vez.':'');
function levelChar(c,PR){
 if(c.crit){const n=genCritter(Math.max(1,PR),c.meta,true);if(lockOf(c).name)n.alias=c.alias;n.fav=c.fav;n.lock=c.lock;if(LM.has(c))LM.add(n);if(RM.has(c))RM.add(n);if(MO.has(c))MO.add(n);return n}
 const o=c.npc,pr0=+o.pr||0,Lo=lockOf(c),n=rerollChar(c,null,{pr:PR,lock:{name:1,meta:1,qual:1,gear:1,pers:1}}),dA=EXT(BASEA,PR)-EXT(BASEA,pr0),dS=EXT(SRA,PR)-EXT(SRA,pr0),SKC=skCap(PR);
 if(!Lo.attr){const ak={},P0=Math.min(pr0,10);let base=o.base,bl=o.bl,rf=o.rf;const ok=base&&bl!=null&&ATTR.every(k=>c.at[k]===undefined||base[k]===undefined||nAttr(n.meta,k,base[k],bl,rf,pr0)===c.at[k]);if(!ok){base={};bl=P0;ATTR.forEach(k=>{if(c.at[k]!==undefined)base[k]=Math.min(c.at[k],capNat(n.meta,k,10))})}if(!rf||!ok&&!o.rf){rf={};ATTR.forEach(k=>rf[k]=.55+.45*Math.random())}
  ATTR.forEach(k=>{if(c.at[k]===undefined)return;const lm=lim(n.meta,k);n.at[k]=nAttr(n.meta,k,base[k],bl,rf,PR);ak[k]=Math.min((c.ak&&c.ak[k])||0,Math.max(0,n.at[k]-lm[0]))});n.ak=ak;if(n.npc){n.npc.ak=ak;n.npc.base=base;n.npc.bl=bl;n.npc.rf=rf}}
 if(!Lo.skill){const sx=o.sx||SXP(Object.keys(c.sk||{})),ks=Object.keys(c.sk||{}).filter(k=>!sx.includes(k)),sA=(b,l,P)=>Math.max(1,Math.min(skCap(P),b+srv(P)-srv(l)));let sb=o.sbase,sl=o.sbl;const sok=sb&&sl!=null&&ks.every(k=>sb[k]!==undefined&&sA(sb[k],sl,pr0)===c.sk[k]);if(!sok){sb={};ks.forEach(k=>sb[k]=c.sk[k]);sl=pr0}sx.forEach(k=>delete n.sk[k]);ks.forEach(k=>{n.sk[k]=sA(sb[k],sl,PR)});sx.slice(0,nExtra(PR)).forEach(k=>{n.sk[k]=Math.max(1,Math.min(skCap(PR),srv(PR)-2))});if(n.npc){n.npc.sbase=sb;n.npc.sbl=sl;n.npc.sx=sx}}
 growLoadout(n,pr0,PR);karmaFinish(n,{noTrim:!!Lo.attr,noSpec:!!Lo.skill});return n}
function levelAt(idx,PR){const c=SESSAO.fichas[idx];if(!c)return;const pr0=c.crit?c.crit.force:+c.npc.pr||0;PR=Math.max(c.crit?1:0,Math.min(LVMAX,PR));if(PR===pr0)return;
 try{leOpcoesGeracao();const w=snapChar(c);flagsTo(c,w);const nv=levelChar(w,PR);undoPush(c,nv);SESSAO.fichas[idx]=nv;if(LVO.has(c))LVO.add(SESSAO.fichas[idx]);if(MO.has(c))MO.add(SESSAO.fichas[idx]);afterRoll(idx,SESSAO.fichas[idx].alias+': '+(c.crit?xl('Força '):xl('nível '))+pr0+' → '+PR+(c.crit?xl(' (mesmo tipo e nome).'):xl(' (nome, metatipo, qualidades e equipamento mantidos; atributos e perícias ajustados; implantes e magia refeitos).')+(PR>pr0?lvAddMsg():'')))}catch(x){say(xl('Não consegui mudar o nível: ')+x.message)}}
