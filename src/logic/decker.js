/* ===== Decker: cyberdeck, programas e linha "Matrix" na ficha =====
 * genDeckerKit é chamado por genNPC (npc-gerar-ext.js) para sp==='Decker' (menos IAs).
 * dkUpgrade é chamado por growLoadout (subir-nivel.js) quando o decker sobe de nível.
 * Categorias de item: 'comm' com sub 'Cyberdecks' (o deck) e 'prog' (programas, saem em <gears>). */
const DK_PRIO=['Exploit','Sneak','Hammer','Armor','Decryption','Stealth','Biofeedback','Track','Guard','Fork','Shell','Lockdown','Mugger','Blackout','Defuse','Demolition','Wrapper','Baby Monitor','Biofeedback Filter'];
const DK_COMMON=['Browse','Edit','Encryption','Signal Scrub','Toolbox'];
const dkTargetDR=pr=>pr<2?1:Math.min(6,Math.ceil(pr/2));
const dkDR=i=>+((i.st||{}).devicerating)||0;
const dkDecks=G=>(G||[]).filter(x=>x.cat==='comm'&&x.sub==='Cyberdecks');
const dkAttrs=i=>{const a=String((i.st||{}).attributearray||'').split(',').map(Number);return a.length===4&&a.every(Number.isFinite)?{A:a[0],S:a[1],D:a[2],F:a[3]}:null};
/* programas de hacking até o limite "Programs" do deck (prioridade com sorteio) + alguns comuns */
/* v45: pacote de programas do kit: Advanced Cyberdeck Programs (combate: Armor, Hammer, Biofeedback…) ou Data Thief Programs (Decryption, Defuse, Track); o estilo decide */
const DK_ALIAS={Decrypt:'Decryption'};
function dkPackProgs(c){const x=(()=>{try{return condCtx(c)}catch(e){return null}})(),t=x&&x.tr?x.tr:()=>false;
 let wThief=.35+(x?.4*Math.min(1,+x.stl||0)+.3*Math.min(1,+x.tec||0)-.3*Math.min(1,+x.near||0):0);
 [['ganancioso',.2],['paranoico',.1],['metodico',.1],['agressivo',-.2],['sadico',-.15]].forEach(([k,v])=>{if(t(k))wThief+=v});
 const nm=Math.random()<Math.max(.1,Math.min(.8,wThief))?'Data Thief Programs':DK_PROGPACK;
 const L=((KITP[nm]||{}).g||[]).map(g=>DK_ALIAS[g.n]||g.n);L.th=nm==='Data Thief Programs';return L}
function dkPrograms(c,deck,pool){
 const G=c.gear,has=n=>G.some(x=>x.n===n),add=i=>G.push({cat:'prog',n:i[1],cost:i[2],src:i[3]||'SR5',ess:0,id:i[5]||'',sub:i[6]||'',st:Object.assign({},i[7]||{})}),got=[];
 const slots=Math.max(0,(+((deck.st||{}).programs)||dkDR(deck))-G.filter(x=>x.cat==='prog'&&x.sub==='Hacking Programs').length);
 const kp=dkPackProgs(c),rank=i=>{const k=DK_PRIO.indexOf(i[1]);return(k<0?20:k)+Math.random()*3+persDkAdj(i[1])-(kp.includes(i[1])?(kp.th?30:3):0)};
 pool.filter(i=>i[0]==='prog'&&i[6]==='Hacking Programs'&&!has(i[1])).sort((a,b)=>rank(a)-rank(b)).slice(0,slots).forEach(i=>{add(i);got.push(i[1])});
 const nC=c.npc&&c.npc.pr>=4?5:3;
 DK_COMMON.slice(0,nC).forEach(n=>{const i=pool.find(x=>x[0]==='prog'&&x[6]==='Common Programs'&&x[1]===n);if(i&&!has(n)){add(i);got.push(n)}});
 return got}
/* melhor deck de rating <= alvo (entre os de maior rating disponível); guarda A/S/D/F e limite de programas como o Chummer salva */
/* v39: decks dos kits Decker (packs.xml: Basic/Advanced Decker Pack). Em metade dos casos, se o deck do kit cabe no rating-alvo, é ele */
const DK_PACKS=['Basic Decker Pack','Advanced Decker Pack'],DK_PROGPACK='Advanced Cyberdeck Programs Pack';
function dkPackDeck(cand,pr){if(Math.random()>=.5)return null;
 const names=DK_PACKS.flatMap(n=>((KITP[n]||{}).g||[]).map(g=>g.n)),ok=cand.filter(i=>names.includes(i[1]));
 return ok.length?pick(ok):null}
function dkAddDeck(c,pr){
 const t=dkTargetDR(pr);if(!t)return null;const pool=poolItems(),G=c.gear,cand=pool.filter(i=>i[0]==='comm'&&i[6]==='Cyberdecks'&&!G.some(x=>x.n===i[1])&&(+(i[7]||{}).devicerating||0)<=t);
 if(!cand.length){const all=pool.filter(i=>i[0]==='comm'&&i[6]==='Cyberdecks'&&!G.some(x=>x.n===i[1]));if(!all.length)return null;const lo=Math.min(...all.map(i=>+(i[7]||{}).devicerating||0));cand.push(...all.filter(i=>(+(i[7]||{}).devicerating||0)===lo))}   // nível baixo sem deck do rating-alvo: o mais simples disponível
 const top=Math.max(...cand.map(i=>+(i[7]||{}).devicerating||0)),i=dkPackDeck(cand,pr)||pick(cand.filter(x=>(+(x[7]||{}).devicerating||0)===top)),st=Object.assign({},i[7]||{}),a=String(st.attributearray||'').split(',');
 if(a.length===4){st.attack=a[0];st.sleaze=a[1];st.dataprocessing=a[2];st.firewall=a[3]}if(st.programs!=null)st.programlimit=st.programs;
 G.push({cat:'comm',n:i[1],cost:i[2],src:i[3]||'SR5',ess:0,id:i[5]||'',sub:i[6]||'',st});return{item:G[G.length-1],pool}}
function genDeckerKit(c){const r=dkAddDeck(c,c.npc.pr);if(r)dkPrograms(c,r.item,r.pool);
 const tk=EQGm.get('Tool Kit');if(r&&tk&&okSrc(tk[7])&&eqAvOk(tk[6],c.npc.pr)&&!c.gear.some(x=>x.n==='Tool Kit'))c.gear.push(eqGearItem(tk,1,0))}   // v39: os kits Decker trazem Tool Kit
/* subida de nível: se o alvo passou do deck atual, ganha um deck melhor (o antigo fica) e programas até o novo limite */
function dkUpgrade(n,PR){
 const cur=Math.max(0,...dkDecks(n.gear).map(dkDR));if(dkTargetDR(PR)<=cur)return[];
 const r=dkAddDeck(n,PR);if(!r)return[];return[r.item.n].concat(dkPrograms(n,r.item,r.pool))}
/* linha da ficha: atributos do deck, iniciativa de Matrix (RV), monitor e programas */
function dkRow(c){
 const D=dkDecks(c.gear).sort((a,b)=>dkDR(b)-dkDR(a))[0];if(!D)return'';
 const a=dkAttrs(D),dr=dkDR(D),pg=(c.gear||[]).filter(x=>x.cat==='prog').map(x=>esc(x.n)),
 p=[a&&'Ataque '+a.A+' · Sleaze '+a.S+xl(' · Proc. dados ')+a.D+' · Firewall '+a.F,a&&xl('Iniciativa Matrix (RV) ')+(a.D+((c.at||{}).INT||0))+'+2d6 (hot-sim +3d6)','Monitor Matrix '+(8+Math.ceil(dr/2)),pg.length&&'Programas: '+pg.join(', ')].filter(Boolean);
 return`<div class="row"><span>Matrix</span><span>${esc(D.n)} (DR ${dr}) · ${p.join(' · ')}</span></div>`}
