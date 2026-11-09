#!/usr/bin/env node
// Penalidade de ferimento configurável: confere ferPen/texto de fuga nos 4 passos, o seletor, a persistência e o redesenho do modo mesa. Precisa do pacote playwright.
const path=require('path'),os=require('os'),cp=require('child_process');
let pw;for(const p of [process.env.PW,'playwright','/opt/npm-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(p);break}catch(e){}}
if(!pw){console.log('playwright não encontrado');process.exit(2)}
const out=path.join(os.tmpdir(),'ferimento.html');cp.execFileSync('node',[path.join(__dirname,'..','build.js'),'--out',out],{stdio:'ignore'});
const ERR=[];const bad=m=>ERR.push(m);
(async()=>{const b=await pw.chromium.launch(),pg=await b.newPage();pg.on('pageerror',e=>bad('erro de página: '+e.message));await pg.goto('file://'+out);
 // 1) função pura nos 4 passos
 const r=await pg.evaluate(()=>{const o={};for(const s of [3,2,1,0]){ferSet(s);o[s]=[0,1,2,3,4,5,6,9,12].map(ferPen)}return o});
 const esp={3:[0,0,0,1,1,1,2,3,4],2:[0,0,1,1,2,2,3,4,6],1:[0,1,2,3,4,5,6,9,12],0:[0,0,0,0,0,0,0,0,0]};
 for(const s of [3,2,1,0])if(JSON.stringify(r[s])!==JSON.stringify(esp[s]))bad(`ferPen passo ${s}: ${JSON.stringify(r[s])} ≠ ${JSON.stringify(esp[s])}`);
 // 2) seletor existe, reflete o valor guardado e grava ao mudar
 await pg.evaluate(()=>{localStorage.removeItem('sr5_fer')});
 if(await pg.evaluate(()=>ferStep())!==3)bad('padrão sem valor guardado não é 3');
 const opts=await pg.evaluate(()=>[...document.querySelectorAll('#fer option')].map(o=>o.value).join(','));if(opts!=='3,2,1,0')bad('opções do seletor: '+opts);
 // 3) redesenho do modo mesa e texto de fuga em cada passo
 for(const s of [3,2,1,0]){
  const x=await pg.evaluate(async s=>{BOOKS.forEach(b=>SEL.add(b[0]));await new Promise(r=>setTimeout(r));const sel=document.getElementById('fer');sel.value=String(s);sel.dispatchEvent(new Event('change'));
   const c=genNPC(5,Object.keys(TYPES)[8],'rand','rand');c.npc.hook={mot:'x',pec:'y',f:.6,rd:false,rf:null};SESSAO.fichas=[c];renderNPC(SESSAO.fichas);
   const html=document.getElementById('out').innerHTML,d=derived(c),n=ganchoNotas(c).join(' ');
   const ems=(html.match(/<em>−\d+<\/em>/g)||[]).length;
   return{ems,fis:d.fis,atu:d.atu,stored:localStorage.getItem('sr5_fer'),temNota:html.includes(t('fer.regra.'+s)),fuga:(n.match(/Foge ao sofrer[^.]*\./)||[''])[0]}},s);
  if(x.stored!==String(s))bad(`passo ${s}: não gravou (${x.stored})`);
  if(!x.temNota)bad(`passo ${s}: texto da regra não aparece na ficha`);
  if(!x.fuga)bad(`passo ${s}: texto de fuga ausente`);
  console.log(`passo ${s}: físico ${x.fis} atord. ${x.atu} · marcas −N na tela: ${x.ems} · ${x.fuga.slice(0,95)}`)}
 await b.close();
 console.log(ERR.length?ERR.length+' problema(s)':'penalidade de ferimento: tudo certo');ERR.forEach(e=>console.log(' -',e));process.exit(ERR.length?1:0)})();
