/* ===== v45: granadas de arremesso + itens ilegais (Forbidden) =====
 * O equipamento pode ter sido conseguido no mercado negro: item com 'F' na disponibilidade deixa de ser filtrado e entra por este passo,
 * marcado como ilegal (x.ilegal=1, rótulo "· ilegal"), com ágio de mercado negro no custo. Fora deste passo, os sorteios normais (poolItems)
 * não enxergam item F. O peso do sorteio vem do perfil (grupo/tipo), do nível, da personalidade e do perfil de combate (condCtx, a mesma base das condutas).
 * Granadas legais (Flash-Bang, Smoke, Gas…) vêm do catálogo carregado; Fragmentation/High Explosive (11F) só existem depois de importar o weapons.xml. */
const EI_GRUPO={'Militar e caça':.25,'Segurança e lei':.1,'Rua e crime':.1,Sombras:.18,'Corporativo e ciência':.025,Civis:.004};
const EI_TIPO=/Opera[çc][õo]es especiais|spec ops|Merc|Soldado|Comando|T[áa]tic/i;
const eiIsF=i=>/F/.test(String(((i||[])[7]||{}).avail||''));
const eiNum=v=>+v||0;
/* peso (0–1): chance de este NPC ter o item. ilegal=true considera também a moral/ganância do NPC e a lei */
function eiPeso(c,ilegal){
 const o=c.npc||{},T=TYPES[o.type]||{},pr=o.pr||0;
 let w=EI_GRUPO[T.g]!==undefined?EI_GRUPO[T.g]:.1;
 if(EI_TIPO.test(o.type||''))w+=.12;
 w*=1+.06*pr;
 let x=null;try{x=condCtx(c)}catch(e){}
 let m=1;
 if(x){
  m+=.35*Math.min(1.5,eiNum(x.near));                         // estilo de combate corpo a corpo/linha de frente
  m+=.25*Math.min(1,eiNum(x.mtx)<0?0:eiNum(x.tec));           // técnico
  const tt=eiNum(x.tt),vo=eiNum(x.vo);m+=.15*Math.max(-1,Math.min(1,tt))-.1*Math.max(-1,Math.min(1,vo));   // tático/coordenado usa mais o arsenal
  const t=x.tr||(()=>false);
  [['agressivo',.3],['sadico',.3],['fanatico',.25],['impulsivo',.12],['paranoico',.2],['veterano',.12],['covarde',-.35],['cauteloso',-.15]].forEach(([k,v])=>{if(t(k))m+=v});
  if(ilegal){[['ganancioso',.25],['oportunista',.2],['honrado',-.4],['metodico',-.1]].forEach(([k,v])=>{if(t(k))m+=v});
   if(x.lei)m*=.4;                                             // lei e ordem: só com corrupção
   if(eiNum(x.loy)>=5)m*=.85}                                  // muito leal à organização: segue o regulamento
 }
 return Math.max(0,Math.min(.9,w*Math.max(.15,m)))}
const eiFlag=(g,why)=>{g.ilegal=1;if(why)g.ilw=why;return g};
const eiMarket=pr=>1.3+.05*Math.min(10,pr);                     // ágio de mercado negro sobre o preço de tabela
const eiAvOk=(v,pr)=>pr>=7||(parseInt(String(v==null?'':v),10)||0)<=12;
const eiItemW=i=>({cat:'weapon',n:i[1],cost:i[2],src:i[3]||'SR5',ess:0,id:i[5]||'',sub:i[6]||'',st:i[7]||{}});

/* v45: Box of Grenades #1/#2 (packs.xml → KITP) como base das granadas: o NPC leva uma fração da caixa (a caixa inteira tem 20–35 granadas).
 * #2 (Flash-Bang, Smoke, Gas CS/Pepper Punch, Thermal Smoke + Gas Mask) é legal; #1 (Fragmentation + High Explosive, 11F) entra como item ilegal. */
function eiCaixa(c,pr,nome,ilegal,all,state){
 const K=(typeof KITP!=='undefined'&&KITP[nome])||null;if(!K)return 0;
 const f=Math.min(.6,.12+.03*pr)*(.7+Math.random()*.6);let got=0,gas=0;
 const L=shuffle((K.g||[]).filter(g=>/^Grenade: /.test(g.n))).slice(0,ilegal?2:R(2,3));
 L.forEach(e=>{const it=all.find(i=>i[1]===e.n);if(!it||(ilegal!==eiIsF(it)))return;
  const tox=((e.sub||[])[0]||{}).n,dup=c.gear.find(g=>g.gr1&&g.n===it[1]&&(g.tox||'')===(tox||''));if(dup)return;
  const q=Math.max(1,Math.round((e.qty||5)*f)),co=Math.round(it[2]*(ilegal?eiMarket(pr):1)),qq=Math.min(q,Math.floor(state.left/Math.max(1,co)));
  if(qq<1)return;state.left-=co*qq;got++;if(/Gas/.test(e.n))gas=1;
  const g=Object.assign(eiItemW(it),{cost:co,qty:qq,eqd:1,gr1:1,cx:nome});if(tox)g.tox=tox;if(ilegal)eiFlag(g,'granada');c.gear.push(g)});
 if(gas&&!c.gear.some(g=>/Gas Mask/.test(g.n))){const m=EQGm.get('Gas Mask');   // a caixa #2 traz máscara; o NPC leva uma
  if(m&&okSrc(m[7])&&eqAvOk(m[6],pr)&&m[3]<=state.left){state.left-=m[3];const it=eqGearItem(m,1,0);it.gr1=1;c.gear.push(it)}}
 return got}
function eiGranadas(c,pr){
 c.gear=c.gear.filter(x=>!x.gr1);
 const o=c.npc||{};if(!o.type||c.crit||(META[c.meta]||{}).ai)return;
 if(Math.random()>=eiPeso(c,false)*(pr>=2?1:.3))return;
 const all=ITEMS.filter(i=>i[0]==='weapon'&&okSrc(i[3])&&eqCtxOk(i)&&/^Grenade: /.test(i[1])&&!/Aerodynamic|Radioactive|\(2050\)/.test(i[1])&&(i[7]||{}).useskill==='Throwing Weapons'&&/Flash-Bang|Smoke|Flash-Pak|Gas|Thermal|Paint|Fragmentation|High Explosive/.test(i[1])&&!('hide' in (i[7]||{}))&&eiAvOk((i[7]||{}).avail,pr));
 const leg=all.filter(i=>!eiIsF(i)),ile=all.filter(eiIsF);
 const st={left:BUD(pr)*.1};
 const kinds=[[/Flash-Bang/,3],[/Smoke(?!bomb)|Smokebomb/,2],[/Flash-Pak/,1],[/Gas/,1.2],[/Thermal/,.6],[/Paint/,.3]];
 const take=(pool,ilegal)=>{
  const cand=pool.filter(i=>!c.gear.some(g=>g.gr1&&g.n===i[1]));if(!cand.length)return;
  const it=wchoose(cand,i=>{const k=kinds.find(([re])=>re.test(i[1]));return k?k[1]:(ilegal?2:.4)});
  const k=ilegal?R(1,2):R(1,Math.min(4,1+Math.ceil(pr/3))),co=Math.round(it[2]*(ilegal?eiMarket(pr):1));
  const q=Math.min(k,Math.floor(st.left/Math.max(1,co)));if(q<1)return;st.left-=co*q;
  const g=Object.assign(eiItemW(it),{cost:co,qty:q,eqd:1,gr1:1});if(ilegal)eiFlag(g,'granada');c.gear.push(g)};
 /* caixa #2 (legal) em metade dos casos; senão, sorteio simples como antes */
 if(leg.length){if(!(Math.random()<.5&&eiCaixa(c,pr,'Box of Grenades #2',false,leg,st)))take(leg,false);
  if(Math.random()<.2+.02*pr)take(leg,false)}
 if(ile.length&&Math.random()<eiPeso(c,true)*.35){if(!(Math.random()<.6&&eiCaixa(c,pr,'Box of Grenades #1',true,ile,st)))take(ile,true)}}

/* armas e outros itens F (Ares Alpha, Monofilament Whip, Fake SIN…): no máximo um item ilegal por NPC, dentro de um teto do orçamento */
function eiIlegal(c,pr){
 c.gear=c.gear.filter(x=>!x.il1);
 const o=c.npc||{},K=KIT[o.type];if(!K||c.crit||(META[c.meta]||{}).ai)return;
 if(Math.random()>=eiPeso(c,true)*.3)return;
 const bud=BUD(pr)*.35,mk=eiMarket(pr);
 const arm=ITEMS.filter(i=>i[0]==='weapon'&&eiIsF(i)&&okSrc(i[3])&&eqCtxOk(i)&&/Pistols|Rifles|Submachine|Shotguns|Sniper|Hold-Outs|Tasers|Blades|Clubs|Exotic Melee|Sporting/.test(i[6]||'')&&!(i[7]||{}).cyberware&&!('hide' in (i[7]||{}))&&!EQ_BANNAME.test(i[1])&&eiAvOk((i[7]||{}).avail,pr)&&i[2]*mk<=bud&&!c.gear.some(g=>g.n===i[1]));
 const cand=arm;
 if(!cand.length)return;
 /* quem vive de arma de fogo prefere a de fogo; o resto, qualquer uma */
 const it=wchoose(cand,i=>/Rifles|Pistols|Submachine|Shotgun|Sniper/.test(i[6]||'')?2:1);
 const co=Math.round(it[2]*mk),g=Object.assign(eiItemW(it),{cost:co,eqd:1,il1:1});eiFlag(g,xl('arma'));
 c.gear.push(g);if(typeof eqSkills==='function')eqSkills(c,pr)}

npcPos('granadas e itens ilegais',(c,pr)=>{
 try{eiGranadas(c,pr);eiIlegal(c,pr)}catch(e){console.error('equip-ilegal',e)}
 try{c.eqSpent=Math.round((c.eqSpent||0)+c.gear.filter(x=>x.gr1||x.il1).reduce((s,x)=>s+(+x.cost||0)*(x.qty||1),0))}catch(e){}});

/* v45: o que o kit de implante traz além do implante (packs.xml): a arma do implante (Spurs, Hand Razors: custo 0, vem com o implante),
 * a Katana dos kits Razorboi/Street Samurai, Tool Kit e Medkit. Roda depois do equipamento, que remonta armas e gear. */
function eiKitImplante(c,pr){
 c.gear=c.gear.filter(x=>!x.iw);
 const nm=c.impKitName,K=nm&&KITP[nm];if(!K||c.crit)return;
 const pool=ITEMS.filter(i=>i[0]==='weapon'&&okSrc(i[3])),has=n=>c.gear.some(g=>g.n===n);
 /* uma arma por implante dessa lista, no catálogo; implante de arma sem a arma no catálogo fica só como implante */
 c.gear.filter(g=>g.cat==='cyber'&&IK_ESP.has(g.n)).forEach(g=>{const w=pool.find(i=>i[1]===g.n);if(w)c.gear.push(Object.assign(eiItemW(w),{cost:0,iw:1,ew:1}))});
 const dev=(K.w||[]).some(w=>w.n==='Katana');
 if(dev&&!c.gear.some(g=>g.cat==='weapon'&&/Katana/.test(g.n))){const k=pool.find(i=>i[1]==='Katana'&&eiAvOk((i[7]||{}).avail,pr));if(k)c.gear.push(Object.assign(eiItemW(k),{iw:1,eqd:1}))}
 (K.g||[]).forEach(e=>{const x=EQGm.get(e.n);if(!x||!okSrc(x[7])||!eqAvOk(x[6],pr)||has(x[0]))return;c.gear.push(Object.assign(eqGearItem(x,1,e.rt||0),{iw:1}))});
 try{eqSkills(c,pr)}catch(e){}}
npcPos(xl('kit de implante: armas e gear'),(c,pr)=>{try{eiKitImplante(c,pr);c.eqSpent=Math.round((c.eqSpent||0)+c.gear.filter(x=>x.iw&&!x.ew).reduce((s,x)=>s+(+x.cost||0)*(x.qty||1),0))}catch(e){console.error('kit implante',e)}});
