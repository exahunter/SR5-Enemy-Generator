#!/usr/bin/env node
// Validador de coerência das fichas: gera N NPCs (padrão 500, níveis 1-12, todos os tipos e especializações) e confere:
//  disp   – item com disponibilidade > 12 em NPC de nível < 7 (qualquer categoria: veículos, drones, programas, foci, mods...)
//  ess    – essência fora de 0–6 ou diferente de 6 − soma dos implantes
//  nuyen  – nuyen restante negativo
//  skill  – perícia negativa, fracionária ou acima de 12
//  magia  – perda de magia por implante maior que a Magia (ou magia/adepto sem Magia efetiva)
//  cond   – conduta que cita equipamento/poder que o NPC não tem (granada, drone, deck, magia/espírito)
//   node tools/validar-fichas.js [N]      (sai com código 1 se achar algo)
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const root=path.join(__dirname,'..'),out=path.join(os.tmpdir(),'gerador-validar.html'),N=+process.argv[2]||500;
let pw;for(const p of [process.env.PW,'playwright','/opt/npm-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(p);break}catch(e){}}
if(!pw){console.error('playwright não encontrado (defina PW=...)');process.exit(2)}
cp.execFileSync('node',[path.join(root,'build.js'),'--out',out],{stdio:'ignore'});
function roda(N){
 BOOKS.forEach(b=>SEL.add(b[0]));const T=Object.keys(TYPES),SP=['rand',...Object.keys(SPEC).filter(k=>k!=='Critter')],E={},ex={};
 const add=(k,pr,t,msg)=>{(E[k]=E[k]||{});const m=E[k][msg]=(E[k][msg]||0)+1;if(!ex[k])ex[k]=pr+'/'+t+': '+msg};
 const avN=(it,pr)=>{const a=it.st&&it.st.avail;if(a==null||a==='')return 0;try{const v=iavm(String(a),it.rt||1,1);return v?v.v:0}catch(e){return 0}};
 for(let i=0;i<N;i++){const pr=(i%12)+1,t=T[i%T.length],sp=SP[i%SP.length];let c;
  try{c=genNPC(pr,t,sp,'rand')}catch(e){add('erro',pr,t,'genNPC lançou: '+e.message);continue}
  const tag=t+'|'+sp;
  if(pr<7)(c.gear||[]).forEach(g=>{if(g.nat||g.cat==='cyber'||g.cat==='bio')return;const v=avN(g,pr);if(v>12)add('disp',pr,tag,g.cat+': '+g.n+' ('+g.st.avail+')');
   (g.mods||[]).forEach(m=>{const mv=avN({st:{avail:m.avail||(m.st||{}).avail},rt:m.rt},pr);if(mv>12)add('disp',pr,tag,'mod de '+g.n+': '+(m.n||m.name)+' ('+(m.avail||(m.st||{}).avail)+')')})});
  const sum=(c.gear||[]).reduce((s,g)=>s+(+g.ess||0),0);
  if(c.ess<-1e-9||c.ess>6+1e-9)add('ess',pr,tag,'essência '+c.ess);else if(Math.abs((6-c.ess)-sum)>0.051)add('ess',pr,tag,'essência ≠ 6 − implantes ('+c.ess+' vs '+(6-sum).toFixed(2)+')');
  if(c.nuyenLeft<0||c.nuyen<0)add('nuyen',pr,tag,'nuyen negativo');
  Object.entries(c.sk||{}).forEach(([k,v])=>{if(v<0||v>12||v!==Math.round(v))add('skill',pr,tag,k+'='+v)});
  const mg=c.at&&c.at.MAG;if(c.talent&&c.magic&&c.talent!=='Technomancer'){if((c.magicLoss||0)>c.magic)add('magia',pr,tag,'perda '+c.magicLoss+' > Magia '+c.magic);else if(c.magic-(c.magicLoss||0)<=0&&((c.spells||[]).length||(c.spirits||[]).length||(c.powers||[]).length))add('magia',pr,tag,'Magia efetiva 0 mas tem magias/espíritos/poderes')}
  try{const k=condOf(c);if(k){const txt=[...(k.hi||[]),...(k.lo||[])].join(' ¦ ').toLowerCase(),G=c.gear||[],has=re=>G.some(g=>re.test(g.n+' '+(g.sub||'')));
   if(/granada/.test(txt)&&!has(/grenade|granada|rocket|missile/i))add('cond',pr,tag,'cita granada sem ter');
   if(/\bdrones?\b/.test(txt)&&!G.some(g=>g.cat==='drone')&&!(c.spirits||[]).length)add('cond',pr,tag,'cita drone sem ter');
   if(/(feiti[çc]o|\bconjura\b|espírito invocado|\binvoca\b)/.test(txt)&&!c.magic&&!c.spirits.length)add('cond',pr,tag,'cita magia sem ser desperto')}}catch(e){add('erro',pr,tag,'condOf lançou: '+e.message)}}
 return{E,ex}}
(async()=>{const b=await pw.chromium.launch(),p=await b.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+out);await p.waitForTimeout(800);const r=await p.evaluate(`(${roda})(${N})`);await b.close();
 let n=0;for(const k of ['erro','disp','ess','nuyen','skill','magia','cond']){const e=r.E[k]||{},t=Object.values(e).reduce((a,v)=>a+v,0);n+=t;
  console.log((t?'FALHA ':'ok    ')+k+(t?` (${t})`:''));Object.entries(e).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(([m,v])=>console.log(`        ${v}× ${m}`))}
 if(errs.length){console.log('erros de página:',errs.slice(0,3));n++}
 console.log(n?`${n} problema(s) em ${N} NPCs`:`${N} NPCs sem problemas`);process.exit(n?1:0)})();
