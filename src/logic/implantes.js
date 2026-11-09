const IU=h=>h.replace(/(.{8})(.{4})(.{4})(.{4})/,'$1-$2-$3-$4-');
IMPL=IMP0.map(a=>({k:a[0]?'b':'c',id:IU(a[1]),n:a[2],cat:a[3],es:a[4],co:a[5],av:a[6],mr:a[7],mn:a[8],fg:a[9],bg:a[10]?a[10].split(','):[],fb:a[11],s:a[12],pg:a[13],cp:a[14],ok:a[15],why:a[16],mt:a[17]||{}}));
const IFX=(t,r,mn)=>{if(t==null)return null;t=String(t).trim();if(/^-?\d+(\.\d+)?$/.test(t))return +t;
 const m=t.match(/^FixedValues\(([^)]*)\)$/);if(m){const a=m[1].split(',').map(parseFloat),v=a[Math.min(Math.max(r,1),a.length)-1];return isNaN(v)?null:v}
 if(/[A-Za-z]/.test(t.replace(/MinRating|Rating|number/g,'')))return null;
 t=t.replace(/MinRating/g,mn||1).replace(/Rating/g,r).replace(/number\(([^()]*)\)/g,'(($1)?1:0)');
 if(!/^[\d+\-*\/().\s<>?:]+$/.test(t))return null;try{const v=Function('return '+t)();return isFinite(v)?v:null}catch(e){return null}};
const IAV=(t,r,mn)=>{if(t==null)return null;t=String(t).trim();if(/^\+|or Gear/i.test(t))return null;const f=/F\)?\s*$/.test(t),m=t.match(/^FixedValues\(([^)]*)\)$/);
 const v=m?parseInt(m[1].split(',')[Math.min(Math.max(r,1),m[1].split(',').length)-1]):IFX(t.replace(/([RF])\s*$/,''),r,mn);return v==null||isNaN(v)?null:{v:Math.round(v),f}};
function impParse(e,k){const gt=t=>g(e,t),cat=gt('category');
 if(!(k==='c'?/^(Bodyware|Headware|Eyeware|Earware|Nanocybernetics|Hard Nanoware|Soft Nanoware)$/:/^(Basic|Cultured)$/).test(cat))return null;
 if(['requireparent','required','selectside','limbslot','addweapon','hide'].some(t=>e.querySelector(':scope > '+t))||/^\[/.test(gt('capacity')))return null;
 const rt=gt('rating'),mr=rt===''?0:/^\d+$/.test(rt)?+rt:-1,mnr=gt('minrating'),mn=mnr===''?0:/^\d+$/.test(mnr)?+mnr:-1;
 if(mr<0||mn<0||mr>12)return null;
 const es=gt('ess'),co=gt('cost'),av=gt('avail');
 for(const r of new Set([Math.max(1,mn),Math.max(1,mr)])){const x=IFX(es,r,mn),y=IFX(co,r,mn),z=IAV(av,r,mn);if(x==null||x<=0||y==null||y<0||!z)return null}
 return{k,id:gt('id'),n:gt('name'),cat,es,co,av,mr,mn,fg:gt('forcegrade'),bg:[...e.querySelectorAll(':scope > bannedgrades > grade')].map(x=>x.textContent.trim()),fb:[...e.querySelectorAll(':scope > forbidden cyberware, :scope > forbidden bioware')].map(x=>x.textContent.trim()),s:gt('source'),pg:gt('page'),cp:gt('capacity')}}
const saveImp=()=>IDB.tx('readwrite',t=>t.put({name:'__imp',size:0,data:{L:IMPL,G:IMPG}})).catch(()=>{});
importFiles.camada('cyberware e bioware',_imp3=>async function(files){const mine=[],rest=[];for(const f of files)(/^(cyberware|bioware)/i.test(f.name)?mine:rest).push(f);let n=0;
 for(const f of mine){const d=new DOMParser().parseFromString(await f.text(),'text/xml'),k=/^cyber/i.test(f.name)?'c':'b',all=q=>[...d.querySelectorAll(q)];
  const L=all(k==='c'?'chummer > cyberwares > cyberware':'chummer > biowares > bioware').map(e=>impParse(e,k)).filter(Boolean);
  if(L.length){IMPL=IMPL.filter(x=>x.k!==k).concat(L);n++}
  all('chummer > grades > grade').forEach(e=>{const nm=g(e,'name');if(!nm||/\(/.test(nm)||IMPG.some(x=>x[0]===nm))return;IMPG.push([nm,parseFloat(g(e,'ess')),parseFloat(g(e,'cost')),parseInt(g(e,'avail'))||0,g(e,'source')])});
  IMPL.forEach(x=>FOUND.add(x.s))}
 if(n){FOUND.delete('');FOUND.forEach(c=>{if(!BOOKS.some(b=>b[0]===c))BOOKS.push([c,c]);SEL.add(c)});if(typeof fixBooks==='function')fixBooks();drawBooks();saveImp()}
 return n+(rest.length?await _imp3(rest):0)});
(async()=>{try{const r=await IDB.tx('readonly',t=>t.get('__imp'));if(r&&r.data&&r.data.L&&r.data.L.length){IMPL=r.data.L;IMPG=r.data.G||IMPG}}catch(x){avisa('implantes',x)}})();
const IGW={Used:[3,3,2,1,0,0,0,0,0,0,0],Standard:[6,6,6,6,5,4,3,2,1,1,0],Alphaware:[0,0,0,1,2,4,5,5,4,3,1],Betaware:[0,0,0,0,0,1,3,5,6,5,3],Deltaware:[0,0,0,0,0,0,0,1,3,5,6],Gammaware:[0,0,0,0,0,0,0,0,0,2,4]};
const IT_F={'Operações especiais (spec ops)':1,'Resposta de alta ameaça (HTR)':.9,'Mercenário (merc)':.9,'Caçador de recompensas (bounty hunter)':.7,'Segurança corporativa (rent-a-cop)':.6,'Polícia (Lone Star / força local)':.5,'Ganger de rua (gangue)':.5,'Sindicato (máfia, yakuza, vory)':.5,'Técnico / engenheiro':.5,'Contrabandista':.4,'Médico / street doc':.4,'Arruaceiro / manifestante':.3,'Wage slave (funcionário corporativo)':.3,'Executivo / Mr. Johnson':.3,'Informante / fixer':.3,'Cientista':.3,'Cultista / fanático':.2,'Civil (cidadão comum)':0,'Político / burocrata':.3,'Guarda-costas':.7,'Detetive / investigador':.4,'Motorista / piloto':.5};
// Essência-alvo: valor escolhido (0–6) ou automático (nível × tipo). Mago, adepto e tecnomante gastam bem menos: cada ponto cheio perdido tira 1 de Magia/Ressonância.
const _IM=new Map(),_AM=new Map();
const ixm=(t,r,mn)=>{const k=t+'|'+r+'|'+mn;let v=_IM.get(k);if(v===undefined){v=IFX(t,r,mn);_IM.set(k,v)}return v};
const iavm=(t,r,mn)=>{const k=t+'|'+r+'|'+mn;let v=_AM.get(k);if(v===undefined){v=IAV(t,r,mn);_AM.set(k,v)}return v};
// Essência-alvo: valor escolhido (0–6, deixa sempre ~0,01) ou automático por nível e ocupação. Mago, adepto e tecnomante gastam menos (cada ponto cheio perdido tira 1 de Magia/Ressonância).
function impTarget(c,sel){const pr=c.npc.pr,CAP=5.99;let t;
 if(sel==='auto'){const f=IT_F[c.npc.type]??.4;if(f===0)return 0;t=Math.min(CAP,[0,.4,1,2,3,3.8,4.5,5,5.4,5.7,5.95][Math.min(pr,10)]*(.4+.6*f)*(.85+Math.random()*.3)*persImpF(c))}
 else t=Math.min(CAP,+sel);
 if(['Adept','Magician','Mystic Adept','Technomancer'].includes(c.talent)){const base=c.talent==='Technomancer'?(c.at.RES||0):(c.magic||0);t=Math.min(+(t*.4).toFixed(1),Math.max(0,Math.min(2,base-1)))}
 return Math.round(t*100)/100}
function genImplants(c){c.imp=null;c.magicLoss=c.resLoss=0;const M=META[c.meta]||{};if(M.sh||M.ai||!c.npc)return;
 const pr=c.npc.pr;let tgt=impTarget(c,GEN.impSel);
 /* Rigger: Control Rig (VCR) garantido; rating sobe com o nível e é reduzido se a Essência alvo não comporta */
 const RGC=c.npc.sp==='Rigger'&&pr>=2&&GEN.impSel!=='0'?IMPL.find(x=>x.n==='Control Rig'&&okSrc(x.s)):null;let rigR=0;
 if(RGC){const E=q=>ixm(RGC.es,q,RGC.mn)||99,mn=RGC.mn||1;let r=Math.max(mn,Math.min(RGC.mr||3,pr>=8?3:pr>=5?2:1));if(GEN.impSel==='auto'&&tgt<E(r))tgt=Math.min(5.99,E(r));while(r>=mn&&!(E(r)<=tgt+1e-9))r--;if(r>=mn)rigR=r}
 if(tgt<.05)return;
 const pool=IMPL.filter(x=>okSrc(x.s)&&x.ok!==0&&!/\(2050\)/.test(x.n))   /* v44: variantes da era 2050 não entram no sorteio */,GA=IMPG.filter(x=>okSrc(x[4])),GW=GA.filter(x=>IGW[x[0]]&&IGW[x[0]][Math.min(pr,10)]>0);if(!pool.length||!GA.length)return;
 const GR=GW.length?GW:GA,gById=n=>IMPG.find(x=>x[0]===n),cap=EXT([6,8,10,12,14,16,18,20,24,28,40],pr),kk=Math.max(-.4,Math.min(1.2,(pr-3)/5)),r2=x=>Math.round(x*100)/100,picks=[];let rem=tgt;
 const gOf=(it,G)=>it.fg==='None'?(gById('None')||['None',1,1,0]):it.fg==='Standard'?gById('Standard'):it.bg.includes(G[0])?null:G;
 const used=it=>picks.some(p=>p.it===it||it.fb.includes(p.it.n)||p.it.fb.includes(it.n));
 const avOk=(it,r,gg,lim)=>{const av=iavm(it.av,r||1,it.mn);return !!av&&!(av.f&&pr<9)&&av.v+gg[3]<=(pr<7?Math.min(lim,12):lim)};   // abaixo do nível 7, nada acima de disponibilidade 12 (mesma regra do resto do equipamento)
 if(rigR){const G0=gById('Standard');if(G0){const es=r2(ixm(RGC.es,rigR,RGC.mn)*G0[1]);if(es<=rem+1e-9){picks.push({it:RGC,r:rigR,gg:G0,es,cost:Math.round(ixm(RGC.co,rigR,RGC.mn)*G0[2])});rem=r2(rem-es)}}}
 /* v39: um kit pronto de cyber/bio (packs.xml) como base, antes do sorteio solto */
 try{impKit(c,pr,{pool,all:IMPL.filter(x=>okSrc(x.s)&&!/\(2050\)/.test(x.n)),GR,gById,gOf,avOk,cap,r2,used},rem).forEach(o=>{picks.push(o);rem=r2(rem-o.es)})}catch(e){avisa('implantes',e)}
 // 1ª passada: sorteio ponderado por grade, rating e custo (dá variedade)
 for(let t=0;t<80&&rem>=.04;t++){const G=wchoose(GR,x=>(IGW[x[0]]&&IGW[x[0]][Math.min(pr,10)])||1),opts=[];
  for(const it of pool){if(used(it))continue;const gg=gOf(it,G);if(!gg)continue;
   let r=it.mr?Math.max(it.mn||1,Math.min(it.mr,Math.round(it.mr*(.2+.07*pr)+Math.random()*2-1))):0,es;
   for(;;){es=r2(ixm(it.es,r||1,it.mn)*gg[1]);if(es<=rem+1e-9||!r||r<=(it.mn||1))break;r--}
   if(!(es>0)||es>rem+1e-9||!avOk(it,r,gg,cap))continue;
   const cost=Math.round(ixm(it.co,r||1,it.mn)*gg[2]);opts.push({it,r,gg,es,cost,w:Math.pow(Math.max(cost/es,300)/3000,kk)*persImpW(it.n)})}
  if(!opts.length)break;const o=wchoose(opts,x=>x.w);picks.push(o);rem=r2(rem-o.es)}
 // 2ª passada: preenche a sobra, sempre com o maior item que ainda cabe (qualquer grade, rating mais alto possível, disponibilidade um pouco mais folgada)
 for(let t=0;t<40&&rem>=.02;t++){let best=null;
  for(const it of pool){if(used(it))continue;
   for(const G of GA){const gg=gOf(it,G);if(!gg)continue;
    for(let r=it.mr||0,lo=it.mr?Math.max(1,it.mn||1):0;r>=lo;r--){
     const es=r2(ixm(it.es,r||1,it.mn)*gg[1]);if(!(es>0)||es>rem+1e-9)continue;
     if(!avOk(it,r,gg,cap+6))continue;
     const cost=Math.round(ixm(it.co,r||1,it.mn)*gg[2]);
     if(!best||es>best.es+1e-9||(Math.abs(es-best.es)<1e-9&&cost<best.cost))best={it,r,gg,es,cost};
     break}}}
  if(!best)break;picks.push(best);rem=r2(rem-best.es)}
 if(!picks.length)return;
 const spent=r2(tgt-rem);picks.forEach(o=>c.gear.push({cat:o.it.k==='c'?'cyber':'bio',n:o.it.n,cost:o.cost,src:o.it.s||'SR5',ess:o.es,id:o.it.id,sub:o.it.cat,st:Object.assign({},o.it.pg?{page:o.it.pg}:{},{avail:o.it.av,capacity:o.it.cp||'0'}),rt:o.r,gr:o.gg[0],es:o.it.es,co:o.it.co}));
 c.imp={t:tgt,spent,n:picks.length};c.ess=r2(6-spent);
 if(c.talent==='Technomancer')c.resLoss=Math.ceil(spent-1e-9);else if(c.magic)c.magicLoss=Math.ceil(spent-1e-9)}

/* ===== v39: kits de cyber/bio do packs.xml como base dos implantes =====
 * Escolhe um kit (afinidade com a especialização/ocupação) cujos itens existem no catálogo de implantes e cabem na Essência que sobra;
 * o resto do orçamento segue o sorteio normal. Item que o catálogo não tem (ex.: Hand Razors) é pulado; kit só vale se render algo. */
const CK_AFF=[   // [regex do nome do kit, afinidade geral, {especialização: afinidade}]
 [/^(Basic|Advanced) Rigger Pack$/,0,{Rigger:4}],
 [/Sim-Setional|Bio-Computer/,.25,{Decker:3,Technomancer:0}],
 [/Street Samurai Classic/,.9,{}],[/Speedboost/,1.2,{}],[/Vatjob/,1,{}],[/Bulletproof Jeff/,.8,{}],
 [/Combat Eyes|Eagle Eyes|Rabbit Ears/,1,{}],[/Razorboi/,.6,{}],[/^Bioware/,.5,{}]];
/* v45: Spurs e Hand Razors têm ok=0 no catálogo (implante que adiciona arma); só entram dentro dos kits Razorboi/Street Samurai, que os trazem em par */
const IK_ESP=new Set(['Spurs','Hand Razors']);
function impKit(c,pr,A,rem){c.impKitName=null;
 const sp=c.npc.sp,mag=['Adept','Magician','Mystic','Mystic Adept','Mage','Technomancer'].includes(sp)||['Adept','Magician','Mystic Adept','Technomancer'].includes(c.talent);
 const opts=[];
 for(const[nm,k]of Object.entries(KITP)){const L=[...(k.cy||[]),...(k.bi||[])];if(!L.length)continue;
  const af=CK_AFF.find(([re])=>re.test(nm));if(!af)continue;let w=af[2][sp]!==undefined?af[2][sp]:af[1];if(mag&&!/^Bioware/.test(nm))w=0;if(w<=0)continue;
  let left=rem;const got=[],seen=new Set(),G0=pr>=5&&Math.random()<.5?wchoose(A.GR,x=>(IGW[x[0]]&&IGW[x[0]][Math.min(pr,10)])||1):null;
  for(const x of L){const it=A.pool.find(i=>i.n===x.n)||(IK_ESP.has(x.n)?(A.all||[]).find(i=>i.n===x.n):null);if(!it||(seen.has(it.n)&&!IK_ESP.has(it.n))||A.used(it)||got.some(g=>it.fb.includes(g.it.n)||g.it.fb.includes(it.n)))continue;
   const gg=A.gOf(it,G0||A.gById(x.gr||'Standard')||A.GR[0]);if(!gg)continue;
   let r=it.mr?Math.max(it.mn||1,Math.min(it.mr,x.rt||it.mn||1)):0,es;
   es=A.r2(ixm(it.es,r||1,it.mn)*gg[1]);if(!(es>0)||es>left+1e-9||!A.avOk(it,r,gg,A.cap))continue;
   seen.add(it.n);left=A.r2(left-es);got.push({it,r,gg,es,cost:Math.round(ixm(it.co,r||1,it.mn)*gg[2])})}
  if(got.length&&got.length>=Math.ceil(L.length/2))opts.push({got,w,nm})}
 if(!opts.length||Math.random()>=.65)return[];
 const pk=wchoose(opts,o=>o.w);c.impKitName=pk.nm;return pk.got}
