/* ===== v28: ligação da personalidade ao gerador =====
 * Carrega depois de equipamento.js e arma-natural.js (as camadas se empilham como as de genNPC já faziam).
 * O que está dentro do gerador base (npc-gerar, npc-qualidades, implantes, mago, poderes, decker, rerrolar) são só chamadas
 * pontuais às funções de logic/personalidade.js. */
/* o perfil de equipamento da ocupação vira o perfil da PERSONALIDADE enquanto o equipamento é montado */
eqBuild.camada(xl('kit da personalidade'),g=>function(c,pr){const o=c.npc||{},K0=KIT[o.type];if(!K0||!o.pers)return g(c,pr);
 GEN.persCur=o.pers;KIT[o.type]=persKit(K0,o.pers);try{return g(c,pr)}finally{KIT[o.type]=K0}});
/* conduta em combate */
genGancho.camada('personalidade',g=>function(c){g(c);try{persHook(c)}catch(e){console.error('persHook',e)}});
/* notas do Chummer / JSON: personalidade e táticas */
ganchoNotas.camada(xl('personalidade e táticas'),g=>function(c){let p=[];try{p=persNotes(c)}catch(e){avisa('personalidade-ligacao',e)}return[...p,...g(c)]});
/* depois de tudo: conhecimentos do estilo e garantia dos marcadores de ficha */
function persFinal(c){const P=c.npc&&c.npc.pers;if(!P||c.crit)return;GEN.persCur=P;
 if(!lockOf(c).skill)persKnow(c);persEnforce(c)}
npcPos(xl('personalidade e arma garantida'),c=>{try{persFinal(c)}catch(e){console.error('persFinal',e)}try{eqEnsureWeapon(c)}catch(e){console.error('eqEnsureWeapon',e)}});
/* subir de nível: perícias do "ap", arma melhor da mesma linha, item do estilo; o resto usa o kit da personalidade */
function persGrow(n,pr0,PR){eqBowSet(n,PR);const P=n.npc.pers,Lk=lockOf(n),o=n.npc,K=persKit(KIT[o.type]||{},P),G=n.gear||[];
 if(!Lk.skill){const SKC=skCap(PR),sr=srv(PR);for(let i=Math.floor(PR/3)-Math.floor(pr0/3);i>0;i--){const pl=persApPool(P,s=>n.sk[s]!==undefined);if(!pl.length)break;const x=wchoose(pl,z=>z.w);n.sk[x.s]=Math.max(1,Math.min(SKC,sr-3+R(0,1)));GEN.lvAdd.g.push(x.s+xl(' (perícia)'))}persKnow(n)}
 if(!Lk.gear&&!(META[n.meta]||{}).ai){
  const up=P.t.reduce((a,k)=>a*(TRACO[k].up===undefined?1:TRACO[k].up),1);
  if(Math.random()<pcl(.45*up,0,.9)){const w=persMainW(n,P);
   if(w&&!w.nat&&!eqIsMelee(w)){const b=BUD(PR),cap=Math.max(b*.4,350)*(K.cap||1),
     pool=poolItems().filter(i=>i[0]==='weapon'&&i[6]===w.sub&&i[2]>w.cost&&i[2]<=cap&&eqBowOk(i)&&!G.some(x=>x.n===i[1])&&!EQ_BANNAME.test(i[1])&&!(i[7]||{}).cyberware&&!('hide' in (i[7]||{})));
    if(pool.length){GEN.persCur=P;const it=persPickW(pool),nw=eqWeaponItem(it);eqDressWeapon(nw,K,PR,{left:b*.2});n.gear=G.filter(x=>x!==w);n.gear.push(nw);eqAmmo(n,K,PR);GEN.lvAdd.g.push(it[1]+' (troca '+w.n+')')}}}
  const cand=[];P.s.forEach(x=>(ESTILO[x.k].pg||[]).forEach(([nm,ch,mp])=>{if(PR>=(mp||0)&&!n.gear.some(z=>z.n===nm)){const r=EQGm.get(nm);if(r&&okSrc(r[7]))cand.push({nm,r,w:ch*(x.p/100)+.05})}}));
  if(cand.length&&Math.random()<.5){const x=wchoose(cand,z=>z.w),rt=x.r[5]>0?Math.max(1,Math.min(x.r[5],R(Math.ceil(PR/3),Math.ceil(PR/2)+1))):0;n.gear.push(eqGearItem(x.r,1,rt));GEN.lvAdd.g.push(x.nm)}
  persEnforce(n)}}
growLoadout.camada('personalidade',g=>function(n,pr0,PR){const P=n.npc&&n.npc.pers,K0=P&&KIT[n.npc.type];
 GEN.persCur=P||null;if(K0)KIT[n.npc.type]=persKit(K0,P);try{g(n,pr0,PR)}finally{if(K0)KIT[n.npc.type]=K0}
 if(P&&PR>pr0){try{persGrow(n,pr0,PR)}catch(e){console.error('persGrow',e)}}});
Object.keys(XKT_P).forEach(k=>{if(!XKT[k])XKT[k]=XKT_P[k]});
