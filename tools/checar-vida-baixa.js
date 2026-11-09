#!/usr/bin/env node
// Regras da vida baixa do projeto (NPCs e critters):
//  (1) os 3 passos misturam dano físico e atordoante ("Com N de F caixas de dano físico (ou S de A de atordoante, o que vier primeiro): ...");
//      os limiares sobem de um passo para o outro e o 3º fica abaixo da última caixa;
//  (2) o 3º passo é o que ele faz quando sabe que está quase morto (tags last/boom/fake/turn/sur/flee, nunca "continua lutando como se nada");
//  (3) cada passo só usa as tags do seu passo, e "vem-depois" só cita tags do passo anterior.
//   node tools/checar-vida-baixa.js          -> resumo, sai com 1 se algo falhar     (a parte de execução precisa do pacote "playwright"; sem ele, só a estática)
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const load=(files,exp)=>{const m={exports:{}};new Function('module',files.map(n=>fs.readFileSync(path.join(__dirname,'..','src','data',n),'utf8')).join('\n')+';module.exports={'+exp+'}')(m);return m.exports};
const {CD_LO}=load(['condutas-baixa.js'],'CD_LO'),{CC_LO,CC_LAST,CC_FUGA}=load(['critter-condutas.js'],'CC_LO,CC_LAST,CC_FUGA');
const L=require('./idioma')();
const ERR=[];const bad=(m)=>ERR.push(m);
// ---- estática ----
const OK={s1:'fight cover heal call rage swap wary slip deal',s2:'stand shield ret hold flee sur turn',s3:'last boom fake turn sur flee'};
const prev={s2:OK.s1.split(' '),s3:OK.s2.split(' ')};
for(const k of ['s1','s2','s3']){if(!CD_LO[k]){bad('falta o passo '+k);continue}
 CD_LO[k].forEach((l,i)=>{const p=l.split('§'),tags=(p[2]||'').trim().split(/\s+/).filter(Boolean),dep=(p[3]||'').trim().split(/\s+/).filter(Boolean);
  const o=(a,b)=>(a.match(/\{/g)||[]).length!==(a.match(/\}/g)||[]).length&&bad(`${k}[${i}] chaves desbalanceadas`);o(p[0]);
  if(!tags.length)bad(`${k}[${i}] sem tag`);tags.forEach(t=>{if(!OK[k].split(' ').includes(t))bad(`${k}[${i}] tag "${t}" não é do passo ${k}`)});
  if(prev[k])dep.forEach(t=>{if(!prev[k].includes(t))bad(`${k}[${i}] "vem depois de" ${t}, que não é tag do passo anterior`)});
  if(k==='s3'&&L.continuaLutando.test(p[0])&&!tags.some(t=>/last|boom|fake/.test(t)))bad(`s3[${i}] parece conduta de ferido comum: ${p[0].slice(0,70)}`)})}
const TP=['predador','territorial','presa','emboscador','sapiente','espirito'];
TP.forEach(t=>{if(!CC_LO[t]||CC_LO[t].length!==3)bad('CC_LO.'+t+' não tem 3 passos');if(!CC_LAST[t])bad('falta CC_LAST.'+t);
 else if(!L.noLimite.test(CC_LAST[t]))bad('CC_LAST.'+t+' não diz que está no limite: '+CC_LAST[t].slice(0,60))});
// fuga dos critters (a regra do projeto: sem rota, aliado ferido, aliado importante ainda lutando)
CC_FUGA.forEach((t,i)=>L.desfechosFugaCritter.forEach(([re,nome])=>{if(!re.test(t))bad(`CC_FUGA[${i}] sem o desfecho "${nome}"`)}));
// ---- execução ----
let pw;for(const p of [process.env.PW,'playwright','/opt/npm-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(p);break}catch(e){}}
(async()=>{let n={npc:0,crit:0};
 if(pw){const out=path.join(os.tmpdir(),'vida-baixa.html');cp.execFileSync('node',[path.join(__dirname,'..','build.js'),'--out',out],{stdio:'ignore'});
  const b=await pw.chromium.launch(),pg=await b.newPage();await pg.goto('file://'+out);
  const R=await pg.evaluate(([reSrc,reFl])=>{BOOKS.forEach(x=>SEL.add(x[0]));const ts=Object.keys(KIT).filter(k=>KIT[k].pw===undefined||KIT[k].pw>=1),res=[],re=new RegExp(reSrc,reFl);
   const chk=(tipo,lo,id)=>{const e=[];if(lo&&!Array.isArray(lo)){e.push('lo não é lista: '+typeof lo+' '+JSON.stringify(lo).slice(0,90));return{tipo,id,e}}if(!lo||lo.length!==3){e.push('não tem 3 passos');return{tipo,id,e}}
    let pf=0,ps=0,F=0;lo.forEach((t,i)=>{const m=re.exec(t);if(!m){e.push('passo '+(i+1)+' sem o formato físico+atordoante');return}
     const nf=+m[1],F2=+m[2],ns=+m[3],A=+m[4];F=F2;if(nf<=pf)e.push('físico não sobe no passo '+(i+1));if(ns<=ps)e.push('atordoante não sobe no passo '+(i+1));if(nf>=F2)e.push('físico passa da última caixa no passo '+(i+1));if(ns>=A)e.push('atordoante passa da última caixa no passo '+(i+1));
     if(/[{}]|undefined|NaN/.test(t)||m[5].length<8)e.push('texto vazio ou com chave solta no passo '+(i+1));pf=nf;ps=ns});
    return{tipo,id,e}};
   for(let i=0;i<300;i++){const c=genNPC([1,3,5,8,12][i%5],ts[i%ts.length],'rand','rand');const k=condOf(c);res.push(chk('npc',k&&k.lo,ts[i%ts.length]))}
   for(let i=0;i<300;i++){const c=genCritter(1+i%12,'rand'),k=critCondOf(c);res.push(chk('crit',k&&k.lo,c.meta))}
   return res},[L.caixas.source,L.caixas.flags]);
  await b.close();R.forEach(r=>{n[r.tipo]++;if(r.e.length)bad(`${r.tipo} ${r.id}: ${[...new Set(r.e)].join('; ')}`)})}
 else console.log('(playwright não encontrado: só a verificação estática)');
 const E=[...new Set(ERR)];console.log(`vida baixa: ${E.length?E.length+' problema(s)':'tudo certo'} · estática: CD_LO ${['s1','s2','s3'].map(k=>k+'='+(CD_LO[k]||[]).length).join(' ')}, CC_LO ${TP.length} temperamentos · execução: ${n.npc} NPCs + ${n.crit} critters`);
 E.slice(0,20).forEach(x=>console.log(' -',x));process.exit(E.length?1:0)})();
