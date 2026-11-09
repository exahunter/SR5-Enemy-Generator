/* ===== v25: equipamento coerente com a ocupação =====
 * - armas saem com os acessórios de fábrica (ex.: Smartgun interno da Predator V) + acessórios sorteados (EQR),
 *   carregadores extras e munição (regular + especial);
 * - armaduras saem com mods que cabem na capacidade;
 * - o gear deixa de ser sorteado solto: vem do perfil da ocupação (data/kits-ocupacao.js).
 * Tabelas: data/equip-tabelas.js (geradas do data do Chummer por tools/gen_equip.py). */
const EQMap=(a,k=0)=>{const m=new Map();a.forEach(r=>{if(!m.has(r[k]))m.set(r[k],r)});return m},
 EQXm=EQMap(EQ.X),EQMm=EQMap(EQ.M),EQAm=EQMap(EQ.A),EQAMm=EQMap(EQ.AM),EQGm=EQMap(EQ.G),
 eqNum=v=>parseInt(String(v==null?'':v).replace('+',''))||0,
 EQ_FIRE='Pistols|Holdouts|Tasers|Machine Pistols|Submachine|Rifles|Shotguns|Carbines|Machine Guns|Assault Cannons',
 EQ_MELEE=/Blades|Clubs|Unarmed|Exotic Melee|Bows|Crossbows|Throwing|Improvised|Cyberweapon|Bio-Weapon|Quality|Gear|Launchers|Flamethrowers|Laser/,
 EQ_CRED=['Certified Credstick, Standard','Certified Credstick, Silver','Certified Credstick, Gold','Certified Credstick, Platinum','Certified Credstick, Ebony'];
/* acessório sorteável: [nome, nível mín. do perfil, chance base, categorias, pr mín.] */
const EQR=[
 ['Smartgun System, Internal',2,.4,/Pistols|Holdouts|Machine Pistols|Submachine|Rifles|Shotguns|Carbines|Machine Guns/,3],
 ['Smartgun System, External',2,.18,/Pistols|Machine Pistols|Submachine|Rifles|Shotguns|Carbines|Machine Guns/,3],
 ['Laser Sight',2,.28,/Pistols|Machine Pistols|Submachine|Rifles|Carbines|Shotguns/,1],
 ['Sound Suppressor',2,.12,/Pistols|Machine Pistols|Submachine|Rifles|Carbines/,2],
 ['Gas-Vent 1 System',2,.2,/Heavy Pistols|Machine Pistols|Submachine|Rifles|Carbines|Machine Guns/,4],
 ['Gas-Vent 2 System',3,.14,/Heavy Pistols|Machine Pistols|Submachine|Rifles|Carbines|Machine Guns/,6],
 ['Gas-Vent 3 System',3,.08,/Rifles|Machine Guns|Submachine/,8],
 ['Shock Pad',2,.25,/Rifles|Shotguns|Machine Guns|Carbines/,2],
 ['Imaging Scope',3,.45,/Sniper|Sporting|Assault Rifles|Carbines/,3],
 ['Flashlight, Standard',1,.28,new RegExp(EQ_FIRE),0],
 ['Flashlight, Low Light',3,.22,new RegExp(EQ_FIRE),3],
 ['Foregrip',3,.3,/Submachine|Rifles|Carbines|Machine Guns|Shotguns/,2],
 ['Bipod',3,.3,/Sniper|Machine Guns|Sporting/,2],
 ['Quick-Draw Holster',1,.22,/Pistols|Holdouts|Tasers/,0],
 ['Concealable Holster',1,.25,/Pistols|Holdouts|Tasers/,0],
 ['Folding Stock',2,.2,/Machine Pistols|Submachine|Heavy Pistols/,2],
 ['Holographic Sight',2,.3,/Pistols|Machine Pistols|Submachine|Rifles|Shotguns|Carbines/,2],
 ['Personalized Grip',2,.12,/Pistols|Machine Pistols/,3],
 ['Extended Clip',3,.12,/Pistols|Machine Pistols|Submachine|Carbines/,3]];
/* equivalente do SR5 quando o livro do acessório (RG/HT) não está marcado */
const EQSUB={'Foregrip':'Shock Pad','Holographic Sight':'Laser Sight'};
/* nomes de acessório que os kits (packs.xml) usam e o catálogo de acessórios chama de outro jeito */
const EQ_PKALIAS={'Silencer':'Sound Suppressor'};
/* v43: limite do arco. O nível do arco (Bow (Rating N)) é a FOR mínima para puxá-lo: o NPC não leva arco acima da própria FOR (total) nem acima de 3 + nível.
 * eqBowSet(c,pr) fixa o teto do NPC em montagem; sem ele (EQ_BOW infinito) não há teto. */
let EQ_BOW=Infinity;
function eqBowSet(c,pr){try{const s=xE(c,'STR');EQ_BOW=s>0?Math.min(s,3+(pr||0)):Infinity}catch(e){EQ_BOW=Infinity}}
const eqBowOk=i=>{if(!/^Bows$/.test(i[6]||''))return true;const r=+((/\(Rating (\d+)\)/.exec(i[1]||'')||[])[1]);return !r||r<=EQ_BOW};
const eqSelNorm=t=>String(t||'').toLowerCase().replace(/[^a-z]/g,'');
/* armas brancas: acessórios sorteáveis [nome, nível mín., chance, categorias, pr mín.] */
/* cada um respeita livros marcados e disponibilidade; só uma 'Special Modification' por arma */
const EQM=[['Melee Hardening',2,.2,/Blades|Clubs/,4],['Special Modification: Improved Reach',3,.1,/Blades|Clubs/,5],['Special Modification: Damage',3,.1,/Blades|Clubs/,5],['Special Modification: Improved Accuracy',2,.1,/Blades|Clubs/,3]];
const EQ_NOSG=['Vintage','Ceramic/Plasteel Components','Collapsible Traditional Bow','Cyberimplanted'],EQEXC={'Smartgun System, External':['Smartgun System, Internal'],'Smartgun System, Internal':['Smartgun System, External'],'Concealable Holster':['Quick-Draw Holster'],'Quick-Draw Holster':['Concealable Holster'],'Flashlight, Low Light':['Flashlight, Standard'],'Flashlight, Standard':['Flashlight, Low Light'],'Imaging Scope':['Laser Sight']};
['Gas-Vent 1 System','Gas-Vent 2 System','Gas-Vent 3 System'].forEach((a,_,L)=>{EQEXC[a]=(EQEXC[a]||[]).concat(L.filter(b=>b!==a))});   // só um Gas-Vent por arma
const eqIsMelee=w=>((w.st||{}).type==='Melee')||EQ_MELEE.test(w.sub||'');
const eqAmmoRe=/\((c|d|cy|belt|b)\)/i;
/* escolhe uma montagem livre para o acessório (null = não cabe) */
function eqMount(x,free,factory){const m=x[2];if(!m)return 'None';for(const o of m.split('/'))if(free.has(o)){if(o!=='Internal')free.delete(o);return o}return factory?m.split('/')[0]:null}
const eqAccObj=(x,w,inc,mount,cost)=>({n:x[0],id:x[1],m:mount,cost:inc?0:(cost!==undefined?cost:(x[3]<0?(w.cost||0):x[3])),av:x[4],src:x[5],pg:x[6],inc:inc?1:0});
function eqDressWeapon(w,K,pr,ctx){
 if(w.eqd&&w.acc)return;w.eqd=1;w.acc=[];
 if(eqIsMelee(w)){const E=EQ.W[w.n]||[[],[]],free=new Set(E[0]);free.add('Internal');
  E[1].forEach(n=>{const x=EQXm.get(n);if(x&&okSrc(x[5]))w.acc.push(eqAccObj(x,w,1,eqMount(x,free,1)))});
  const lv=K.a||0;EQM.forEach(([n,ml,p0,rx,mp])=>{if(lv<ml||pr<mp||!rx.test(w.sub||'')||w.acc.some(a=>a.n===n)||(/^Special Modification/.test(n)&&w.acc.some(a=>/^Special Modification/.test(a.n))))return;
   if(Math.random()>=Math.min(.6,p0+.1*(lv-ml)))return;const x=EQXm.get(n);if(!x||!okSrc(x[5])||!eqAvOk(x[4],pr))return;
   const co=x[3]<0?(w.cost||0):x[3];if(co>ctx.left)return;ctx.left-=co;w.acc.push(eqAccObj(x,w,0,'None',co))});
  return}
 const E=EQ.W[w.n]||[[],[]],free=new Set(E[0]);free.add('Internal');
 E[1].forEach(n=>{const x=EQXm.get(n);if(!x)return;w.acc.push(eqAccObj(x,w,1,eqMount(x,free,1)))});
 const has=n=>w.acc.some(a=>a.n===n),cat=w.sub||'',lv=K.a||0,pka=w.pka,pksg=w.pksg;delete w.pka;delete w.pksg;
 /* v43: acessórios que o KIT traz (coldre, mira laser, silenciador, shock pad, bipé, tripé…) entram antes do sorteio; só os carregadores são tratados à parte (pkCl).
  * Cada um respeita livros marcados, disponibilidade, montagem livre e exclusões, como os sorteados. Kit "Smartgun" garante o Smartgun System (interno, ou externo). */
 let pkCl=null;const cyW=/\(cy\)/i.test(String((w.st||{}).ammo||''));
 const addPk=n=>{const x=EQXm.get(n)||EQXm.get(EQ_PKALIAS[n]||'');if(!x||!okSrc(x[5])||has(x[0])||(EQEXC[x[0]]||[]).some(has)||!eqAvOk(x[4],pr))return false;
  if(/^Smartgun/.test(x[0])&&EQ_NOSG.some(has))return false;
  if(/Suppressor|Silencer/.test(x[0])&&cyW)return false;
  const co=x[3]<0?(w.cost||0):x[3];if(co>ctx.left+400)return false;
  const m=eqMount(x,free);if(m===null)return false;ctx.left-=co;w.acc.push(eqAccObj(x,w,0,m,co));return true};
 if(pka){pkCl=0;pka.forEach(n=>{if(/^(Spare Clip|Speed Loader)$/.test(n)){pkCl++;return}addPk(n)})}
 if(pksg&&!w.acc.some(a=>/^Smartgun/.test(a.n))&&!EQ_NOSG.some(has)&&/Pistols|Holdouts|Machine Pistols|Submachine|Rifles|Shotguns|Carbines|Machine Guns/.test(cat)){addPk('Smartgun System, Internal')||addPk('Smartgun System, External')}
 EQR.forEach(([n,ml,p0,rx,mp])=>{
  if(lv<ml||pr<mp||!rx.test(cat)||has(n)||(EQEXC[n]||[]).some(has))return;
  if(/^Smartgun/.test(n)&&EQ_NOSG.some(has))return;                 // Vintage / componentes cerâmicos proíbem smartgun
  if(/Suppressor/.test(n)&&/\(cy\)/i.test(String((w.st||{}).ammo||'')))return;   // revólver não aceita silenciador
  if(Math.random()>=Math.min(.9,p0+.14*(lv-ml)+(K.pa&&K.pa[n]||0)))return;
  let x=EQXm.get(n);if(!x||!okSrc(x[5])){const sb=EQSUB[n];x=sb?EQXm.get(sb):null;if(!x||!okSrc(x[5])||has(x[0])||(EQEXC[x[0]]||[]).some(has))return}
  if(!eqAvOk(x[4],pr))return;
  const co=x[3]<0?(w.cost||0):x[3];if(co>ctx.left)return;
  const m=eqMount(x,free);if(m===null)return;
  ctx.left-=co;w.acc.push(eqAccObj(x,w,0,m,co))});
 /* carregadores / speed loaders extras */
 const am=String((w.st||{}).ammo||''),cy=/\(cy\)/i.test(am),box=/\((c|d)\)/i.test(am);
 if((box||cy)&&(pkCl!==null||lv>=1)&&!/Tasers/.test(cat)){const x=EQXm.get(cy?'Speed Loader':'Spare Clip');
  if(x&&okSrc(x[5])){const cl=K.cl||[1,2];let n=pkCl!==null?Math.min(pkCl,cy?3:5):Math.min(R(cl[0],cl[1])+(pr>=6?1:0),cy?3:5);for(let i=0;i<n;i++)w.acc.push(eqAccObj(x,w,0,'None',x[3]))}}
}
/* itens de gear (munição, equipamento) */
function eqGearItem(x,qty,rt){const r=rt||0;return{cat:'gear',n:x[0],cost:x[3]+x[4]*r,src:x[7],ess:0,id:x[1],sub:x[2],qty:qty||1,rt:rt?r:undefined,eqd:1,st:{avail:x[6],page:x[8]}}}
function eqAmmoItem(x,qty){return{cat:'gear',n:x[0],cost:x[2],src:x[5],ess:0,id:x[1],sub:'Ammunition',qty:qty,eqd:1,st:{costfor:String(x[3]),avail:x[4],page:x[6]}}}
/* munição de todas as armas de fogo da ficha: regular para tudo + especial do perfil */
function eqAmmo(c,K,pr){
 const W=c.gear.filter(w=>w.cat==='weapon'&&w.acc&&!eqIsMelee(w)&&eqAmmoRe.test((w.st||{}).ammo||'')&&!/Tasers/.test(w.sub||''));
 c.gear=c.gear.filter(x=>!(x.cat==='gear'&&x.sub==='Ammunition'&&x.eqd&&!x.sa));
 try{eqSkills(c,pr);eqSupportAmmo(c,K,pr)}catch(e){console.error('eqSupport',e)}
 if(!W.length)return;
 const reg=EQAMm.get('Ammo: Regular Ammo');let tot=0,big=0;
 W.forEach(w=>{const cap=Math.min(parseInt(w.st.ammo)||10,100),cl=w.acc.filter(a=>/Spare Clip|Speed Loader/.test(a.n)).length;tot+=cap*(1+cl+(pr>=4?1:0));big=Math.max(big,cap)});
 tot=Math.max(10,Math.round(tot/10)*10);
 if(reg&&okSrc(reg[5]))c.gear.push(eqAmmoItem(reg,tot));
 (K.am||[]).forEach(([n,p,mp])=>{if(pr<mp||Math.random()>=p)return;const x=EQAMm.get(n);if(!x||!okSrc(x[5]))return;
  const q=Math.max(10,Math.min(60,Math.round(big*R(1,2)/10)*10));c.gear.push(eqAmmoItem(x,q))});
 /* v43: munição especial do kit da arma (APDS, Stick-n-Shock, Explosive Rounds…), dentro de um teto de custo; a munição regular segue a conta acima */
 let kl=BUD(pr)*.12;
 W.forEach(w=>(w.pkam||[]).forEach(([n,q0])=>{const x=EQAMm.get(n);if(!x||!okSrc(x[5])||!eqAvOk(x[4],pr)||c.gear.some(g=>g.sub==='Ammunition'&&g.n===n))return;
  const q=Math.max(10,Math.min(60,Math.round(q0/10)*10)),co=x[2]*q/(+x[3]||10);if(co>kl)return;kl-=co;c.gear.push(eqAmmoItem(x,q))}))
}
/* ---- armas de apoio (arcos, bestas, lançadores, metralhadoras médias/pesadas, canhões de assalto) ---- */
const EQ_SUP=/^(Bows|Crossbows|Grenade Launchers|Missile Launchers|Medium Machine Guns|Heavy Machine Guns|Assault Cannons)$/;

/* ===== v44: o catálogo completo traz itens sem sentido num NPC sorteado (era 2050, peças de arma, armas-novidade, roupas e armaduras de nicho).
 * eqCtxOk filtra o que o sorteio enxerga (poolItems). Itens citados pelo nome nos kits/packs não passam por aqui. ===== */
const EQ_CTX_NAME=/\(2050\)/,
 EQ_CTX_W=/Commlink (Taser|Holdout|Knife)|Macuahuitl|Gunstock War Club|Pole Arm|Halberd|Reproduction|Pitchfork|^Torch|Wrecking Ball|Entrenching Tool|Battle Sword|^Sabre|Katzbalger|Nodachi|Krime Bill|Fluid-Motion Mace|Stun-O-Net|Blaser R11|Sapphire Knife|Barrel\)|: Shotgun Barrel|: Small Caliber|Underbarrel|\(Thrown\)|Survival Kit\)|Walther Secura Superkompakt|Stinger Pen Gun/,
 EQ_CTX_AR_OK=/^(Armor|High-Fashion Armor Clothing)$/,
 EQ_CTX_AR_SPEC=/^(Form-Fitting Body Armor|Riot Control Armor|Ares Armored Survivalist|Catsuit|Security Armor: Helmet|SWAT Helmet|Riot Control Helmet|Ballistic Mask|Forearm Guards|Ares FlaShield|Ballistic Shield|Riot Shield)$/,
 EQ_CTX_AR_BAN=/Sleeping Tiger|Nightshade|Big Game Hunter|Wild Hunt|Steampunk|Murder Armor|Hard Case CCOB|Generic CCOB|Oilskin|Ace of /;
function eqCtxOk(i){const n=i[1]||'',k=i[0],sub=i[6]||'';
 if(EQ_CTX_NAME.test(n))return false;
 if(k==='weapon'){if(EQ_CTX_W.test(n))return false;if(!(+i[2]>0)&&!/^Unarmed/.test(sub))return false}
 else if(k==='armor'){if(EQ_CTX_AR_BAN.test(n))return false;if(!EQ_CTX_AR_OK.test(sub)&&!EQ_CTX_AR_SPEC.test(n))return false}
 else if(k==='comm'){if(/\(Commlink\)/.test(n))return false}
 return true}

/* ===== v44: comlink e drones por perfil =====
 * O comlink acompanha o nível (degrau padrão por nível + o ajuste 'cd' do perfil, ±1 ao acaso) e é sorteado entre os comlinks do catálogo; os drones saem de K.dr. */
const EQ_CL_DR=pr=>pr<=1?1:pr<=3?2:pr<=5?3:pr<=7?4:pr<=9?5:6,
 eqCommDR=it=>+((it[7]||{}).devicerating)||0;
function eqCommTarget(K,pr){const r=Math.random();return Math.max(1,Math.min(6,EQ_CL_DR(pr)+(K.cd||0)+(r<.25?-1:r>.8?1:0)))}
function eqCommPick(K,pr,have){
 const b=BUD(pr),all=poolItems().filter(i=>i[0]==='comm'&&i[6]==='Commlinks'&&eqCommDR(i)>0&&!(have||[]).includes(i[1])),t=eqCommTarget(K,pr);
 const ok=all.filter(i=>eqAvOk((i[7]||{}).avail,pr)&&i[2]<=Math.max(b*.35,150));let c=ok.filter(i=>eqCommDR(i)===t);
 if(!c.length){const d=Math.min(...(ok.length?ok:all).map(i=>Math.abs(eqCommDR(i)-t)));c=(ok.length?ok:all).filter(i=>Math.abs(eqCommDR(i)-t)===d)}
 return c.length?pick(c):null}
const eqCommItem=i=>({cat:'comm',n:i[1],cost:i[2],src:i[3]||'SR5',ess:0,id:i[5]||'',sub:i[6]||'',st:i[7]||{},bs:1});
function eqDronePick(K,pr,have){const D=K.dr;if(!D||pr<(D.m||0))return null;
 const b=BUD(pr),pool=poolItems().filter(i=>i[0]==='drone'&&!(have||[]).includes(i[1])&&i[2]<=Math.max(b*.6,400)&&eqAvOk((i[7]||{}).avail,pr));
 const gs=(D.l||[]).filter(([rx,w,mp])=>pr>=(mp||0)&&pool.some(i=>new RegExp(rx).test(i[1])));if(!gs.length)return null;
 const g=wchoose(gs,x=>x[1]),cand=pool.filter(i=>new RegExp(g[0]).test(i[1]));return cand.length?pick(cand):null}
function eqCommDrone(c,K,pr){
 const G=c.gear,bs=G.filter(x=>x.bs&&(x.cat==='comm'||x.cat==='drone'));if(!bs.length&&!K.dr&&K.cd===undefined)return;
 c.gear=G.filter(x=>!x.bs);
 const have=c.gear.map(x=>x.n),cl=eqCommPick(K,pr,have);if(cl)c.gear.push(eqCommItem(cl));
 const isRig=(c.npc||{}).sp==='Rigger'||c.gear.some(x=>(x.cat==='drone'||x.cat==='veh')&&!x.bs);
 if(!isRig&&K.dr&&Math.random()<(K.dr.p||0)){const d=eqDronePick(K,pr,have);
  if(d){c.gear.push({cat:'drone',n:d[1],cost:d[2],src:d[3]||'SR5',ess:0,id:d[5]||'',sub:d[6]||'',st:d[7]||{},bs:1});
   if(pr>=7&&Math.random()<(K.dr.n2||0)){const d2=eqDronePick(K,pr,have.concat(d[1]));if(d2)c.gear.push({cat:'drone',n:d2[1],cost:d2[2],src:d2[3]||'SR5',ess:0,id:d2[5]||'',sub:d2[6]||'',st:d2[7]||{},bs:1})}}}}
const eqPoolX=()=>poolItems().filter(i=>i[0]==='weapon'&&EQ_SUP.test(i[6]||'')&&!(i[7]||{}).cyberware&&!('hide' in (i[7]||{}))&&!EQ_BANNAME.test(i[1]));
/* perícia da arma: o NPC precisa ter a perícia de cada arma que porta (arco → Archery; lançador, MG média/pesada → Heavy Weapons; LMG → Automatics) */
const eqSkillOf=w=>{const s=w.sub||'';return /Light Machine/.test(s)?'Automatics':/Medium Machine|Heavy Machine/.test(s)?'Heavy Weapons':(typeof XSKW!=='undefined'&&XSKW[s])||(w.st||{}).useskill||''};
function eqSkills(c,pr){if(!c.sk||c.crit||lockOf(c).skill)return;const best=Math.max(1,...Object.values(c.sk).map(Number));
 c.gear.filter(w=>w.cat==='weapon'&&!w.nat).forEach(w=>{const s=eqSkillOf(w);if(!s||c.sk[s]||!SKA[s])return;c.sk[s]=Math.max(1,Math.min(skCap(pr),best-1))})}
/* munição das armas de apoio: flechas/virotes, granadas, mísseis. Vem do gear.xml importado (ITEMS) ou da tabela embutida (EQ.G); sem nenhum dos dois não há item para comprar. */
const EQ_SA_RX={'Bows':/\b(Arrow|Bolt)s?\b/i,'Crossbows':/\b(Bolt|Arrow)s?\b/i,'Grenade Launchers':/\bGrenade\b/i,'Missile Launchers':/\b(Missile|Rocket)s?\b/i};
const EQ_SA_NO=/Launcher|Cam\b|Camera|Pistol|Rifle/i;
function eqSupportAmmo(c,K,pr){
 c.gear=c.gear.filter(x=>!x.sa);
 const W=c.gear.filter(w=>w.cat==='weapon'&&!w.nat&&EQ_SA_RX[w.sub]);if(!W.length)return;
 const bud=BUD(pr)*.12;let left=bud;
 W.forEach(w=>{const re=EQ_SA_RX[w.sub];
  const cand=[...poolItems().filter(i=>i[0]==='gear'&&re.test(i[1])&&!EQ_SA_NO.test(i[1]))
     .map(i=>({n:i[1],cost:+i[2]||0,src:i[3]||'SR5',id:i[5]||'',sub:i[6]||'',st:i[7]||{}})),
    ...EQ.G.filter(g=>re.test(g[0])&&!EQ_SA_NO.test(g[0])&&okSrc(g[7])).map(g=>({n:g[0],cost:+g[3]||0,src:g[7],id:g[1],sub:g[2],st:{avail:g[6],page:g[8]}}))]
   .filter((x,i,a)=>a.findIndex(y=>y.n===x.n)===i&&eqAvOk(x.st.avail,pr)&&!c.gear.some(g=>g.sa&&g.n===x.n));
  if(!cand.length)return;
  const base=cand.filter(x=>/Standard|Regular|Flash-?Bang|High Explosive|Fragmentation/i.test(x.n)),pk=(base.length&&Math.random()<.6?base:cand),x=pick(pk);
  const per=Math.max(1,+(x.st.costfor)||1),k=w.sub==='Grenade Launchers'?R(2,Math.min(6,2+Math.floor(pr/2))):w.sub==='Missile Launchers'?R(1,2):(per>=10?R(1,2):R(10,20)),qty=per*k;
  const tot=x.cost*qty/per;if(tot>left)return;left-=tot;
  c.gear.push({cat:'gear',n:x.n,cost:x.cost,src:x.src,ess:0,id:x.id,sub:x.sub||'Ammunition',qty:Math.max(1,qty),eqd:1,sa:1,st:x.st})})}
/* v43: com poucas armas no catálogo (antes do embutido completo, ou depois de um armazenamento antigo) só existem as armas básicas. Kits de arma, arcos, lançadores e metralhadoras médias/pesadas dependem do weapons.xml:
 * sem ele ficam de fora, em silêncio, e o perfil usa o que houver (o NPC que deve andar armado continua armado). A interface avisa (drawArmasAviso, chamada por drawBooks). */
/* funções declaradas (içadas): drawBooks pode rodar na carga, antes de este arquivo executar as const */
function eqArmasCount(){return ITEMS.filter(i=>i[0]==='weapon').length}
function eqSemWeaponsXml(){return eqArmasCount()<30}
function eqAvisoArmas(){return eqSemWeaponsXml()?xl('Catálogo de armas reduzido: só ')+eqArmasCount()+xl(' armas (o completo tem mais de 400). Isso costuma vir de XML antigo guardado neste site. Sem o catálogo completo, os kits de arma (Smartgun, Rocketeer, Bowman…), arcos, lançadores e metralhadoras não entram, e os NPCs usam só armas básicas. Para resolver: use o botão abaixo (apaga os XML guardados e recarrega com o catálogo completo que já vem neste arquivo) ou importe de novo o weapons.xml e o gear.xml (Opções avançadas > Dados do seu Chummer).'):''}
/* o aviso fica fora das Opções avançadas (visível sem abrir nada), antes delas; id armaaviso */
function drawArmasAviso(){const ref=document.getElementById('advd')||document.getElementById('impmsg');if(!ref||!ref.parentNode)return;let n=document.getElementById('armaaviso');
 if(!n){n=document.createElement('div');n.id='armaaviso';n.className='avisobox';n.setAttribute('role','alert');ref.parentNode.insertBefore(n,ref)}
 const t=eqAvisoArmas();n.textContent=t;n.hidden=!t;
 if(t){const b=document.createElement('button');b.type='button';b.textContent=xl('Restaurar catálogo embutido');b.title=xl('Apaga os XML guardados neste site (suas fichas ficam) e recarrega a página');
  b.onclick=()=>{if(!confirm(xl('Apagar os XML guardados neste site e recarregar com o catálogo embutido? Suas fichas geradas são mantidas.')))return;const c=document.getElementById('clr');if(c)c.click()};
  n.appendChild(document.createElement('br'));n.appendChild(b)}
 if(typeof drawPrimeirosPassos==='function')drawPrimeirosPassos()}
/* mods de armadura que cabem na capacidade */
function eqDressArmor(a,K,pr,ctx){
 if(a.eqd&&a.mods)return;a.eqd=1;a.mods=[];
 const cap=eqNum((a.st||{}).armorcapacity),E=EQAm.get(a.n);let used=0;
 if(E)(E[9]||[]).forEach(([n,rt])=>{const m=EQMm.get(n);if(!m)return;const cp=m[5]==='R'?(rt||1):m[5];used+=cp;a.mods.push({n:m[0],id:m[1],rt:rt||0,cost:0,cap:cp,arm:m[3],av:m[8],src:m[9],pg:m[10],cat:m[2],inc:1})});
 if(!cap)return;
 shuffle(Object.entries(K.md||{})).forEach(([n,p])=>{
  if(Math.random()>=Math.min(.95,p*(.55+.06*pr)))return;
  const m=EQMm.get(n);if(!m||!okSrc(m[9])||!eqAvOk(m[8],pr)||a.mods.some(x=>x.n===n))return;
  const rt=m[4]>1?R(1,Math.min(m[4],1+Math.floor(pr/2))):0,cp=m[5]==='R'?Math.max(1,rt):m[5],co=m[6]+m[7]*Math.max(1,rt);
  if(used+cp>cap||co>ctx.left)return;
  used+=cp;ctx.left-=co;a.mods.push({n:m[0],id:m[1],rt,cost:co,cap:cp,arm:m[3],av:m[8],src:m[9],pg:m[10],cat:m[2],inc:0})})
}
const eqArmorItem=(x,sub)=>({cat:'armor',n:x[0],cost:x[5],src:x[7],ess:0,id:x[1],sub:sub||x[2],st:{armor:x[3],armorcapacity:x[4],avail:x[6],page:x[8]}});
/* total de armadura: melhor base + acessórios "+N" (capacete) + bônus de mods */
function eqArm(c){const A=(c.gear||[]).filter(i=>i.cat==='armor'),pl=i=>/^\+/.test(String((i.st||{}).armor||''));
 return Math.max(0,...A.filter(i=>!pl(i)).map(i=>eqNum((i.st||{}).armor)))+A.filter(pl).reduce((s,i)=>s+eqNum(i.st.armor),0)+A.reduce((s,i)=>s+(i.mods||[]).reduce((t,m)=>t+eqNum(m.arm),0),0)}
const eqAvN=v=>parseInt(String(v==null?'':v),10)||0,eqAvOk=(v,pr)=>pr>=7||eqAvN(v)<=12;   // disponibilidade acima de 12 só para NPCs de nível 7+
const eqCred=(pr,w)=>EQ_CRED[Math.max(0,Math.min(4,Math.floor(pr/3)+(w||0)-1))];
/* gear do perfil */
function eqKitGear(c,K,pr,only){
 const G=c.gear,have=n=>G.some(x=>x.n===n),out=[];
 (K.g||[]).forEach(e=>{
  let [n,p,mp,q]=Array.isArray(e)?e:[e];if(p===undefined)p=1;if(!mp)mp=0;
  if(pr<mp)return;
  const rich=n==='@cred'?(q||0):0;if(n==='@cred'){q=undefined;n=eqCred(pr,rich)}
  if(Math.random()>=Math.min(1,p*(p<1?(.75+.04*pr):1)))return;
  const x=EQGm.get(n);if(!x||!okSrc(x[7])||!eqAvOk(x[6],pr)||have(n)||out.some(o=>o.n===n))return;
  const rt=x[5]>0?Math.max(1,Math.min(x[5],R(Math.ceil(pr/3),Math.ceil(pr/2)+1))):0;
  out.push(eqGearItem(x,Array.isArray(q)?R(q[0],q[1]):1,rt))});
 return out}
/* ===== v39: kits prontos (packs.xml → data/kits-prontos.json, KITP) como base do equipamento por ocupação =====
 * O perfil da ocupação (kits-ocupacao.js) aponta para kits pelo nome do Chummer; o que o kit traz é resolvido contra o catálogo
 * carregado (livros marcados, disponibilidade do nível, orçamento) e o que não existir é pulado em silêncio, como no resto do equipamento.
 *  wk [[kit, peso, pr mín.]]  kits de arma; wkp = chance de usar um kit (senão, sorteio por categoria como antes). O NPC leva até 2 armas de fogo + 1 branca do kit
 *  ak [[kit, peso, pr mín.]]  kits de armadura: a armadura do kit entra na lista de armaduras possíveis do perfil
 *  pk [[kit, chance, pr mín.]] kits de gear (Medic, Demolitionist, Surveillance…): cada item vira peça do NPC; munição fica por conta de eqAmmo */
const KP_NOAMMO=g=>/^Ammunition$/i.test(g.cat||'')||/^(Ammo|Arrow|Bolt|Minigrenade|Rocket|Missile|Grenade)\b/i.test(g.n);
/* v43: kits de estilo de vida (Bug-out Bag) e da comunidade (Runnerhub, ShadowNET) trazem itens que o gerador já cobre em outro lugar: SIN e licenças falsas (camada de SIN),
 * credsticks (dinheiro do perfil) e drogas (camada de drogas). Esses ficam de fora; o resto do kit (comlink, trodes, microfones, câmeras, tags, chips…) entra normalmente. */
const KP_OUTRO=g=>/^Fake (SIN|License)$/i.test(g.n)||/^Certified Credstick/i.test(g.n)||/^Drugs$/i.test(g.cat||'');
function eqPackGear(c,K,pr,budget){
 const G=c.gear,have=n=>G.some(x=>x.n===n),out=[];let left=budget;
 (K.pk||[]).forEach(([nm,p,mp])=>{const k=KITP[nm];if(!k||pr<(mp||0))return;
  if(Math.random()>=Math.min(1,p*(p<1?(.75+.04*pr):1)))return;
  const add=g=>{if(!KP_NOAMMO(g)&&!KP_OUTRO(g)){const x=EQGm.get(g.n);
    if(x&&okSrc(x[7])&&eqAvOk(x[6],pr)&&!have(g.n)&&!out.some(o=>o.n===g.n)){
     const hi=Math.ceil(pr/2)+1,rt=x[5]>0?Math.max(1,Math.min(x[5],g.rt?Math.min(g.rt,hi):R(Math.ceil(pr/3),hi))):0,q=Math.min(g.qty||1,20),it=eqGearItem(x,q,rt),cost=it.cost*q;
     if(cost<=left){left-=cost;out.push(it)}}}
   (g.sub||[]).forEach(add)};
  (k.g||[]).forEach(add)});
 return out}
/* armas de um kit que o catálogo tem: até 2 de fogo e 1 branca, dentro do teto de custo; null se o kit não rende nenhuma */
function eqPackWeapons(K,pool,pr,cap){
 let ks=(K.wk||[]).filter(([n,w,mp])=>KITP[n]&&pr>=(mp||0));if(!ks.length||Math.random()>=(K.wkp||0))return null;
 const mel=/^(Blades|Clubs|Unarmed|Exotic Melee Weapons)$/;
 while(ks.length){const pk=wchoose(ks,x=>x[1]);ks=ks.filter(x=>x!==pk);
  const seen=new Set(),fire=[],bl=[];let left=cap;
  (KITP[pk[0]].w||[]).forEach(w=>{if(seen.has(w.n))return;const i=pool.find(x=>x[1]===w.n&&okSrc(x[3])&&eqAvOk((x[7]||{}).avail,pr)&&eqBowOk(x));
   if(!i||i[2]>left||/\(2050\)/.test(i[1]))return;seen.add(w.n);
   if(mel.test(i[6]||'')){if(!bl.length){bl.push([i,w]);left-=i[2]}}else if(fire.length<2){fire.push([i,w]);left-=i[2]}});
  /* v43: a arma sai com os acessórios do kit (pka), o Smartgun do kit "Smartgun" (pksg) e a munição especial do kit para a categoria dela (pkam) */
  if(fire.length||bl.length)return[...fire,...bl].map(([i,w])=>{const it=eqWeaponItem(i);it.pkn=pk[0];it.pka=(w.acc||[]).slice();if(/Smartgun/i.test(pk[0]))it.pksg=1;
   const am=(KITP[pk[0]].g||[]).filter(g=>/^Ammo: /.test(g.n)&&g.n!=='Ammo: Regular Ammo'&&(!g.sel||eqSelNorm(g.sel)===eqSelNorm(i[6]))).map(g=>[g.n,g.qty||20]);if(am.length)it.pkam=am;return it})}
 return null}
const eqPackArmorList=(K,pr)=>(K.ak||[]).flatMap(([nm,w,mp])=>{const k=KITP[nm];if(!k||pr<(mp||0))return[];return(k.a||[]).filter(a=>a.n!=='Helmet'&&EQAm.has(a.n)).slice(0,1).map(a=>[a.n,w||1,mp||0])});
/* escolhe uma arma de um conjunto [[cat,prMin,peso]] */
function eqPickWeapon(spec,pool,pr,cap,taken){
 const ok=(rx,i)=>{const s=i[7]||{};return new RegExp(rx).test(i[6]||'')&&i[2]<=cap&&!taken.some(t=>t.n===i[1])&&!/\(2050\)/.test(i[1])&&eqAvOk(s.avail,pr)&&eqBowOk(i)};
 const gs=(spec||[]).filter(([rx,mp])=>pr>=mp&&pool.some(i=>ok(rx,i)));
 if(!gs.length)return null;
 const g=wchoose(gs,x=>x[2]),cand=pool.filter(i=>ok(g[0],i));return cand.length?persPickW(cand):null}
const eqWeaponItem=i=>{const w={cat:'weapon',n:i[1],cost:i[2],src:i[3]||'SR5',ess:0,id:i[5]||'',sub:i[6]||'',st:i[7]||{}};if(/F/.test(String((i[7]||{}).avail||'')))w.ilegal=1;return w};   // v45: arma de apoio Forbidden (Striker, M202…) sai marcada como ilegal
/* monta o equipamento todo de um NPC recém-gerado (substitui o sorteio solto do gerador base) */
const eqBuild=comCamadas('eqBuild',eqBuildBase);
function eqBuildBase(c,pr){
 const o=c.npc||{},K=KIT[o.type],T=TYPES[o.type]||{};
 if(!K||(META[c.meta]||{}).ai)return;
 eqBowSet(c,pr);
 const b=BUD(pr),pool=poolItems().filter(i=>i[0]==='weapon'&&!EQ_MELEE_OUT.test(i[6]||'')&&!(i[7]||{}).cyberware&&!('hide' in (i[7]||{}))&&!EQ_BANNAME.test(i[1])),ctx={left:b*.3+150};
 const keep=c.gear.filter(x=>x.rg||x.gr1||x.il1||x.iw||!(x.cat==='weapon'||x.cat==='armor'||(x.cat==='gear'&&!x.mg&&!x.fk)));   // v45: itens do kit de Rigger (rg) e de granadas/ilegais (gr1, il1) sobrevivem à remontagem
 c.gear=keep;
 /* armas */
 const W=[],cap1=Math.max(b*.4,350)*(K.cap||1),cap2=Math.max(b*.3,250)*(K.cap||1),armed=Math.random()<(K.pw!==undefined?K.pw:1);
 const PW=armed?eqPackWeapons(K,pool.concat(eqPoolX()),pr,cap1+cap2):null;   // v43: kits como Rocketeer e Medium Machine Gunner valem em qualquer perfil que os liste (antes só com K.x)
 if(PW)W.push(...PW);
 if(armed&&!PW){
  const p1=eqPickWeapon(K.w,pool,pr,cap1,W);if(p1)W.push(eqWeaponItem(p1));
  const prim=W[0]&&/Pistols|Holdouts|Tasers/.test(W[0].sub);
  if(K.s&&(!prim||pr>=3)&&Math.random()<(K.sp||0)){const p2=eqPickWeapon(K.s,pool,pr,cap2,W);if(p2)W.push(eqWeaponItem(p2))}
  if(K.m&&Math.random()<(K.mp||0)){const p3=eqPickWeapon(K.m,pool,pr,cap2,W);if(p3)W.push(eqWeaponItem(p3))}
  if(K.x&&Math.random()<(K.xp||0)){const p4=eqPickWeapon(K.x,eqPoolX(),pr,cap2*3,W);if(p4)W.push(eqWeaponItem(p4))}
  if(!W.length&&(K.pw===undefined||K.pw>=1)){const p0=eqPickWeapon([[EQ_FIRE,0,1],[BLCL,0,1]],pool,pr,cap1,W);if(p0)W.push(eqWeaponItem(p0))}
  if(!W.length&&(K.pw===undefined||K.pw>=1)){const p9=eqPickWeapon([[EQ_FIRE,0,1],[BLCL,0,1]],pool,pr,Infinity,W);if(p9)W.push(eqWeaponItem(p9))}}   // arma de serviço garantida, mesmo com orçamento curto
 W.forEach(w=>eqDressWeapon(w,K,pr,ctx));c.gear.push(...W);eqSkills(c,pr);
 /* armadura (+ capacete) */
 const AR=K.ar||{p:0,l:[]};
 if(Math.random()<(AR.p||0)){
  const acap=Math.max(b*.6,600),all=(AR.l||[]).concat(eqPackArmorList(K,pr)).filter(([n,w,mp])=>pr>=(mp||0)&&EQAm.has(n)&&okSrc(EQAm.get(n)[7])&&eqAvOk(EQAm.get(n)[6],pr));
  let ls=all.filter(([n])=>EQAm.get(n)[5]<=acap);
  if(!ls.length&&AR.p>=.8&&all.length){const mn=Math.min(...all.map(([n])=>EQAm.get(n)[5]));ls=all.filter(([n])=>EQAm.get(n)[5]===mn)}   // perfil que sempre se protege: pega a mais barata
  if(ls.length){const [n]=wchoose(ls,x=>x[1]),a=eqArmorItem(EQAm.get(n));eqDressArmor(a,K,pr,ctx);c.gear.push(a)}
  const H=EQAm.get('Helmet');if(H&&okSrc(H[7])&&Math.random()<(AR.h||0)&&H[5]<=acap){const h=eqArmorItem(H);h.eqd=1;h.mods=[];c.gear.push(h)}}
 /* munição (depois dos acessórios, porque depende dos carregadores) */
 eqAmmo(c,K,pr);
 /* gear da ocupação */
 c.gear.push(...eqKitGear(c,K,pr));
 c.gear.push(...eqPackGear(c,K,pr,Math.max(b*.25,200)));
 eqCommDrone(c,K,pr);   // v44
 c.eqSpent=Math.round(c.gear.filter(x=>x.cat==='weapon'||x.cat==='armor'||(x.cat==='gear'&&x.eqd)).reduce((s,x)=>s+(+x.cost||0)*(x.cat==='gear'&&x.sub==='Ammunition'?x.qty/(+((x.st||{}).costfor)||1):(x.qty||1))+(x.acc||[]).reduce((t,a)=>t+a.cost,0)+(x.mods||[]).reduce((t,m)=>t+m.cost,0),0))
}
const EQ_BANNAME=/Cyber|Snap-Blades|Hand Razors|Spur|Claws|Horns|Foot Anchor|Fangs|Implant|Retractable/,EQ_MELEE_OUT=/^(Gear|Quality|Bio-Weapon|Cyberweapon|Improvised Weapons|Unarmed|Exotic Melee Weapons|Exotic Ranged Weapons|Underbarrel Weapons|Missile Launchers|Grenade Launchers|Flamethrowers|Laser Weapons|Assault Cannons|Heavy Machine Guns|Medium Machine Guns|Bows|Crossbows)$/,BLCL='Blades|Clubs';
/* rótulo curto com acessórios / mods (agrupa repetidos: "Spare Clip ×2") */
function eqLabel(x){const t=(x&&x.tox?' ('+x.tox+')':'')+(x&&x.ilegal?' · ilegal':'');return eqLabel1(x)+t}
function eqLabel1(x){
 const grp=l=>{const m=new Map();l.forEach(n=>m.set(n,(m.get(n)||0)+1));return[...m].map(([n,k])=>n+(k>1?' ×'+k:'')).join(', ')};
 if(x.cat==='weapon'&&x.acc&&x.acc.length)return x.n+' ['+grp(x.acc.map(a=>a.n+(a.inc?'*':''))) +']';
 if(x.cat==='armor'&&x.mods&&x.mods.length)return x.n+' ['+grp(x.mods.map(m=>m.n+(m.rt?' '+m.rt:'')))+']';
 if(x.cat==='gear'&&x.rt&&x.eqd&&!x.fk)return x.n+' R'+x.rt;
 return x.n}
/* ---- exportação ---- */
const eqAvl=v=>v==null?'0':String(v);
function eqXml(i){
 const E=esc,G=()=>crypto.randomUUID();
 if(i.cat==='weapon'&&i.acc&&i.acc.length)return '<accessories>'+i.acc.map(a=>`<accessory><sourceid>${E(a.id||'')}</sourceid><guid>${G()}</guid><name>${E(a.n)}</name><mount>${E(a.m||'None')}</mount><extramount>None</extramount><rating>0</rating><rc>0</rc><avail>${E(eqAvl(a.av))}</avail><cost>${a.inc?0:a.cost}</cost><source>${E(a.src||'SR5')}</source><page>${E(a.pg||'')}</page><included>${a.inc?'True':'False'}</included><equipped>True</equipped><wirelesson>True</wirelesson></accessory>`).join('')+'</accessories>';
 if(i.cat==='armor'&&i.mods&&i.mods.length)return '<armormods>'+i.mods.map(m=>`<armormod><sourceid>${E(m.id||'')}</sourceid><guid>${G()}</guid><name>${E(m.n)}</name><category>${E(m.cat||'General')}</category><armor>${E(m.arm||'0')}</armor><maxrating>${m.rt?6:1}</maxrating><rating>${m.rt||0}</rating><armorcapacity>[${m.cap}]</armorcapacity><gearcapacity>0</gearcapacity><avail>${E(eqAvl(m.av))}</avail><cost>${m.inc?0:m.cost}</cost><source>${E(m.src||'SR5')}</source><page>${E(m.pg||'')}</page><included>${m.inc?'True':'False'}</included><equipped>True</equipped><wirelesson>True</wirelesson></armormod>`).join('')+'</armormods>';
 if((i.cat==='veh'||i.cat==='drone')&&i.mods&&i.mods.length)return '<mods>'+i.mods.map(m=>`<mod><sourceid>${E(m.id||'')}</sourceid><guid>${G()}</guid><name>${E(m.n)}</name><category>${E(m.cat||'')}</category><limit /><slots>${E(m.sf)}</slots><rating>${m.rt||0}</rating><maxrating>${m.mr||0}</maxrating><ratinglabel>Rating</ratinglabel><conditionmonitor>0</conditionmonitor><avail>${E(m.af)}</avail><cost>${E(m.cf)}</cost><markup>0</markup><extra /><source>${E(m.src||'SR5')}</source><page>${E(m.pg||'')}</page><included>${m.inc?'True':'False'}</included><equipped>True</equipped><wirelesson>True</wirelesson></mod>`).join('')+'</mods>';
 return ''}
function eqJson(i,r){
 const U=()=>crypto.randomUUID();
 if(i.cat==='weapon'&&i.acc&&i.acc.length)r.accessories={accessory:i.acc.length===1?acc1(i.acc[0]):i.acc.map(acc1)};
 if(i.cat==='armor'&&i.mods&&i.mods.length)r.armormods={armormod:i.mods.length===1?mod1(i.mods[0]):i.mods.map(mod1)};
 if((i.cat==='veh'||i.cat==='drone')&&i.mods&&i.mods.length)r.mods={mod:i.mods.length===1?vmod1(i.mods[0]):i.mods.map(vmod1)};
 function vmod1(m){return{guid:U(),sourceid:m.id||XZ,name:m.n,name_english:m.n,category:m.cat||null,slots:String(m.sl),rating:String(m.rt||0),maxrating:String(m.mr||0),avail:m.av,cost:String(m.cost),source:m.src||'SR5',page:m.pg||null,included:m.inc?'True':'False',equipped:'True',wirelesson:'True'}}
 function acc1(a){return{guid:U(),sourceid:a.id||XZ,name:a.n,name_english:a.n,mount:a.m||'None',extramount:'None',rating:'0',rc:'0',avail:eqAvl(a.av),cost:String(a.inc?0:a.cost),source:a.src||'SR5',page:a.pg||null,included:a.inc?'True':'False',equipped:'True',wirelesson:'True'}}
 function mod1(m){return{guid:U(),sourceid:m.id||XZ,name:m.n,name_english:m.n,category:m.cat||'General',armor:String(m.arm||'0'),maxrating:m.rt?'6':'1',rating:String(m.rt||0),armorcapacity:'['+m.cap+']',gearcapacity:'0',avail:eqAvl(m.av),cost:String(m.inc?0:m.cost),source:m.src||'SR5',page:m.pg||null,included:m.inc?'True':'False',equipped:'True',wirelesson:'True'}}
 return r}
/* ---- ligação à geração ---- */
npcPos(xl('equipamento'),(c,pr)=>{try{eqBuild(c,pr)}catch(e){console.error('eqBuild',e)}});
/* rede de segurança: perfil que sempre porta arma nunca sai só com Unarmed Attack */
function eqEnsureWeapon(c){const o=c.npc||{},K=KIT[o.type];if(!K||(K.pw!==undefined&&K.pw<1)||(META[c.meta]||{}).ai)return;
 if((c.gear||[]).some(g=>g.cat==='weapon'&&!g.nat))return;
 const pr=o.pr||0;eqBowSet(c,pr);const pool=poolItems().filter(i=>i[0]==='weapon'&&!EQ_MELEE_OUT.test(i[6]||'')&&!(i[7]||{}).cyberware&&!('hide' in (i[7]||{}))&&!EQ_BANNAME.test(i[1]));
 const p=eqPickWeapon([[EQ_FIRE,0,1],[BLCL,0,1]],pool,pr,Infinity,[]);if(!p)return;
 const w=eqWeaponItem(p);eqDressWeapon(w,K,pr,{left:BUD(pr)*.2});c.gear.push(w);eqAmmo(c,K,pr)}
/* subir de nível: itens novos sorteados pelo gerador base ganham acessórios, mods, munição e gear coerente */
growLoadout.camada(xl('equipamento coerente'),_growEq=>function(n,pr0,PR){
 const antes=new Set((n.gear||[]));_growEq(n,pr0,PR);
 try{const K=KIT[(n.npc||{}).type];if(!K||!n.gear||lockOf(n).gear)return;
  eqBowSet(n,PR);const novos=n.gear.filter(x=>!antes.has(x)),b=BUD(PR),ctx={left:b*.25};
  novos.forEach(x=>{if(x.cat==='weapon')eqDressWeapon(x,K,PR,ctx);else if(x.cat==='armor')eqDressArmor(x,K,PR,ctx)});
  /* gear solto novo → peça do perfil da ocupação */
  const soltos=novos.filter(x=>x.cat==='gear'&&!x.eqd&&!x.mg&&!x.fk);
  if(soltos.length){n.gear=n.gear.filter(x=>!soltos.includes(x));GEN.lvAdd.g=GEN.lvAdd.g.filter(g=>!soltos.some(s=>s.n===g));
   const add=eqKitGear(n,{g:K.g},PR).slice(0,soltos.length);n.gear.push(...add);add.forEach(x=>GEN.lvAdd.g.push(x.n))}
  if(novos.some(x=>x.cat==='weapon'))eqAmmo(n,K,PR)}catch(e){console.error('eqGrow',e)}});
