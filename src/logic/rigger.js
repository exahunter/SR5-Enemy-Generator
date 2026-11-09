/* ===== Rigger: veículo, drones, RCC e autosofts =====
 * Chamado por genNPC (npc-gerar-ext.js) depois dos implantes, só quando npc.sp==='Rigger'.
 * O Control Rig (VCR) é forçado em implantes.js; aqui entram o resto do kit.
 * Categorias de item: 'veh' (veículo) e 'drone' saem em <vehicles>; 'auto' (autosoft) sai em <gears>. */
const RG_DOM={
 ground:{rx:/^(Bikes|Cars|Trucks)/,pilot:'Pilot Ground Craft',mech:'Automotive Mechanic'},
 air:{rx:/^(Rotorcraft|VTOL|Fixed-Wing)/,pilot:'Pilot Aircraft',mech:'Aeronautics Mechanic'},
 water:{rx:/^(Boats|Submarines)/,pilot:'Pilot Watercraft',mech:'Nautical Mechanic'}};
const RG_AUTO=[
 {n:'Clearsight Autosoft',id:'149a8dd2-dfef-473f-94a4-1bdd77e4f855',pg:'269',min:1,on:'none'},
 {n:'[Model] Maneuvering Autosoft',id:'9d81218f-ee70-4304-9a09-ac865d84b8e0',pg:'269',min:2,on:'main'},
 {n:'[Model] Evasion Autosoft',id:'80137629-41f0-41da-bfed-c8a1388b759e',pg:'269',min:4,on:'main'},
 {n:'Electronic Warfare Autosoft',id:'f84179b8-34b2-4fb1-bb24-099b0b700b5b',pg:'269',min:5,on:'none'},
 {n:'[Model] Stealth Autosoft',id:'c29a96f9-25bf-4ebc-8c56-f4c8afc3c002',pg:'270',min:7,on:'drone'}];
const rgBudget=pr=>BUD(pr)*2.2;
/* v39: veículos e drones dos kits prontos (packs.xml: Spy/Combat Drone, Vehicle e Basic/Advanced Rigger). O nome do kit traz o tamanho entre parênteses, o catálogo não: casa pelo prefixo */
function rgPack(pool,cat,has,pr,max,rx){const out=[];
 Object.values(KITP).forEach(k=>(k.v||[]).forEach(v=>{const b=v.n.replace(/ \(.*$/,'');
  pool.forEach(i=>{if(i[0]===cat&&(i[1]===v.n||i[1]===b||i[1].startsWith(b))&&i[2]<=max&&!has(i[1])&&eqAvOk((i[7]||{}).avail,pr)&&(!rx||rx.test(i[6]||''))&&!out.includes(i))out.push(i)})}));
 return out}
function genRiggerKit(c){
 const o=c.npc||{},pr=o.pr||0,dom=RG_DOM[o.rg]||RG_DOM.ground,pool=poolItems(),G=c.gear;let left=rgBudget(pr);
 const put=i=>{G.push({cat:i[0],n:i[1],cost:i[2],src:i[3]||'SR5',ess:0,id:i[5]||'',sub:i[6]||'',st:Object.assign({},i[7]||{})});left-=i[2]};
 const has=n=>G.some(x=>x.n===n),cheap=a=>a.slice().sort((p,q)=>p[2]-q[2]);
 /* RCC (console de controle de rigger): o mais caro que cabe em ~35% do orçamento; senão o mais barato */
 if(pr>=2){const rc=pool.filter(i=>i[0]==='comm'&&/Rigger Command/.test(i[6]||'')&&!has(i[1])),ok=cheap(rc.filter(i=>i[2]<=left*.35));
  const r=ok.length?ok[Math.max(0,ok.length-1-R(0,1))]:cheap(rc)[0];if(r)put(r)}
 /* veículo principal do domínio (metade mais cara do que cabe; se nada couber, o mais barato) */
 let main=null;{const all0=pool.filter(i=>i[0]==='veh'&&dom.rx.test(i[6]||'')&&!has(i[1])),av=all0.filter(i=>eqAvOk((i[7]||{}).avail,pr)),all=av.length?av:all0,ok=cheap(all.filter(i=>i[2]<=left*.5)),src=ok.length?ok.slice(Math.floor(ok.length/2)):cheap(all).slice(0,1);
  if(src.length){main=pick(src);const pv=Math.random()<.4?rgPack(pool,'veh',has,pr,left*.5,dom.rx):[];if(pv.length)main=pick(pv);put(main)}}
 /* drones: 0 em nível <2; depois 2 a 6 conforme o nível; sempre pelo menos 1 se o nível pede */
 const nD=pr<2?0:Math.min(6,1+Math.floor(pr/2)),drones=[];
 for(let k=0;k<nD;k++){const all0=pool.filter(i=>i[0]==='drone'&&!has(i[1])),av=all0.filter(i=>eqAvOk((i[7]||{}).avail,pr)),all=av.length?av:all0,ok=all.filter(i=>i[2]<=left*.45),src=ok.length?ok:(k===0?cheap(all).slice(0,1):[]);if(!src.length)break;const pd=Math.random()<.55?rgPack(pool,'drone',has,pr,left*.45):[],d=pd.length?pick(pd):pick(src);drones.push(d);put(d)}
 /* módulos (Rigger 5.0): veículo principal e os 2 primeiros drones; o veículo do rigger sempre leva Rigger Interface */
 [main,...drones.slice(0,2)].forEach((v,ix)=>{const it=v&&G.find(x=>x.n===v[1]&&(x.cat==='veh'||x.cat==='drone'));if(it){const c={left};vmDress(it,pr,c,{rigger:v===main,share:ix?.15:.3});left=c.left}});
 /* autosofts (custo = rating × 500): rating sobe com o nível */
 const r=Math.max(1,Math.min(6,Math.ceil(pr/2)));
 RG_AUTO.forEach(a=>{if(pr<a.min)return;const tgt=a.on==='main'?main:a.on==='drone'?(drones[0]||main):null;if(a.on!=='none'&&!tgt)return;
  const st={page:a.pg,avail:'Rating * 2',rating:String(r)};if(tgt)st.extra=tgt[1];
  G.push({cat:'auto',n:a.n,cost:r*500,src:'SR5',ess:0,id:a.id,sub:'Autosofts',rt:r,st})});

 rgPackExtras(c,[main,...drones]);
}
/* v45: o que o kit pronto traz junto do veículo/drone: Tool Kit, capacete (Racing Bike Pack) e a munição do drone de combate (Basic Combat Drone Pack) */
function rgPackExtras(c,chosen){
 const G=c.gear,pr=(c.npc||{}).pr||0,names=chosen.filter(Boolean).map(v=>v[1]);
 Object.entries(KITP).forEach(([kn,k])=>{if(!/Drone Pack|Vehicle Packs?|Racing Bike|Off Road/.test(kn+(k.c||'')))return;
  const hit=(k.v||[]).some(v=>{const b=v.n.replace(/ \(.*$/,'');return names.some(n=>n===v.n||n===b||n.startsWith(b))});if(!hit)return;
  (k.g||[]).forEach(g=>{
   if(/^Ammo: /.test(g.n)){const x=typeof EQAMm!=='undefined'&&EQAMm.get(g.n);if(x&&okSrc(x[5])&&!G.some(y=>y.sub==='Ammunition'&&y.n===g.n&&y.rg))G.push(Object.assign(eqAmmoItem(x,Math.min(g.qty||100,200)),{rg:1,eqd:0}));return}
   if(g.n==='Tool Kit'){const x=EQGm.get('Tool Kit');if(x&&okSrc(x[7])&&!G.some(y=>y.n==='Tool Kit'))G.push(Object.assign(eqGearItem(x,1,0),{rg:1}));return}});
  if((k.a||[]).some(a=>a.n==='Helmet')){const H=EQAm.get('Helmet');if(H&&okSrc(H[7])&&!G.some(y=>y.cat==='armor'&&y.n==='Helmet')){const h=eqArmorItem(H);h.eqd=1;h.mods=[];h.rg=1;G.push(h)}}})}
