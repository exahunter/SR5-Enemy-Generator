#!/usr/bin/env node
// Mede nos critters reais embutidos (critters.json, 6 fichas por critter): temperamentos por categoria, poderes sem conduta, condutas de poder/habilidade e condutas sem ação do livro.
//   node tools/medir-critters.js   (precisa do pacote "playwright"; PW=/caminho se não estiver no path)
let pw;for(const p of [process.env.PW,"playwright","/opt/npm-tools/node_modules/playwright"].filter(Boolean)){try{pw=require(p);break}catch(e){}}
(async()=>{const b=await pw.chromium.launch(),pg=await b.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));const out=require("path").join(require("os").tmpdir(),"medir-critters.html");require("child_process").execFileSync("node",[require("path").join(__dirname,"..","build.js"),"--out",out],{stdio:"ignore"});await pg.goto("file://"+out);
const r=await pg.evaluate(()=>{BOOKS.forEach(x=>SEL.add(x[0]));
const names=[...new Set(CRIT.map(x=>x.n))];const tp={},tpCat={},pwNo={},pwAll={};let tot=0,hiPow=0,hiPowElig=0,hiSk=0,hiTerr=0,noAc=0,nCond=0,noPwCrit=0;const noAcTxt={};
for(const nm of names)for(let k=0;k<6;k++){let c;try{c=genCritter(1+((k*2)%12),nm)}catch(e){continue}const K=critCondOf(c);if(!K)continue;tot++;
 tp[K.tp]=(tp[K.tp]||0)+1;const cat=(c.crit&&c.crit.cat)||'?';(tpCat[cat]=tpCat[cat]||{})[K.tp]=((tpCat[cat]||{})[K.tp]||0)+1;
 const pws=(c.powers||[]).map(p=>p.n.replace(/^Fraqueza: /,''));
 pws.forEach(n=>{pwAll[n]=(pwAll[n]||0)+1;if(!CC_HI_P.some(([re])=>re.test(n)))pwNo[n]=(pwNo[n]||0)+1});
 const elig=CC_HI_P.some(([re])=>pws.some(n=>re.test(n)));if(elig)hiPowElig++;
 if(K.hiP&&K.hiP[2])hiPow++;if(K.hiS[1]||K.hiS[2])hiSk++;
 ['hi','lo'].forEach(p=>K[p].forEach((t,i)=>{nCond++;if(!ccInfo(c,K,p,i).ac.length){noAc++;const key=ccStrip(t).slice(0,60);noAcTxt[key]=(noAcTxt[key]||0)+1}}))}
const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,14);
return{critters:names.length,fichas:tot,tp,tpCat,pwTotal:Object.keys(pwAll).length,pwSemRegra:top(pwNo),comPoderElegivel:hiPowElig,condutaDePoder:hiPow,fichasComCondutaDeHabilidade:hiSk,semAcao:noAc,nCond,semAcaoTop:top(noAcTxt).slice(0,8)}});
console.log(JSON.stringify(r,null,1));console.log('ERROS',errs.slice(0,3));await b.close()})()
