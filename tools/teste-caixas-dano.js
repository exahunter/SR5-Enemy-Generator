#!/usr/bin/env node
// Caixas de dano clicáveis (ui/caixas-dano.js): marcar até a caixa, desmarcar a última, penalidade, sincronia ficha completa × modo mesa, persistência no redesenho e zerar. Precisa do pacote playwright.
const path=require('path'),os=require('os'),cp=require('child_process');
let pw;for(const p of [process.env.PW,'playwright','/opt/npm-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(p);break}catch(e){}}
if(!pw){console.log('playwright não encontrado');process.exit(2)}
const out=path.join(os.tmpdir(),'caixas-dano.html');cp.execFileSync('node',[path.join(__dirname,'..','build.js'),'--out',out],{stdio:'ignore'});
const ERR=[];const bad=m=>ERR.push(m);
(async()=>{const b=await pw.chromium.launch(),pg=await b.newPage();pg.on('pageerror',e=>bad('erro de página: '+e.message));await pg.goto('file://'+out);
 await pg.evaluate(async()=>{localStorage.setItem('sr5_fer','3');sessionStorage.clear();BOOKS.forEach(b=>SEL.add(b[0]));await new Promise(r=>setTimeout(r));
  const c=genNPC(5,Object.keys(TYPES)[8],'rand','rand');SESSAO.fichas=[c];renderNPC(SESSAO.fichas)});
 const n=async s=>pg.evaluate(s=>document.querySelectorAll(s).length,s);
 const info=await pg.evaluate(()=>{const c=SESSAO.fichas[0],d=derived(c);return{fis:d.fis,atu:d.atu,bod:c.at.BOD}});
 // 1) a ficha completa tem as três trilhas com o tamanho do monitor
 if(await n('.cmb .dano .cx.f')!==info.fis)bad('caixas físicas na ficha: '+await n('.cmb .dano .cx.f')+' ≠ '+info.fis);
 if(await n('.cmb .dano .cx.a')!==info.atu)bad('caixas de atordoamento na ficha ≠ '+info.atu);
 if(await n('.cmb .dano .cx.o')!==info.bod)bad('caixas de excedente na ficha ≠ '+info.bod);
 // 2) clicar na 4ª física marca 4 e dá −1 (passo 3); clicar de novo na 4ª volta a 3
 await pg.click('.cmb .dano .cx.f[data-n="4"]');
 if(await n('.cmb .dano .cx.f.on')!==4)bad('4ª caixa física não marcou 4');
 if(!(await pg.textContent('.cmb .dano .dp')).includes('−1'))bad('penalidade −1 não apareceu com 4 caixas');
 await pg.click('.cmb .dano .cx.f[data-n="4"]');
 if(await n('.cmb .dano .cx.f.on')!==3)bad('clicar de novo na última não desmarcou');
 // 2b) clicar numa marcada do meio desmarca a clicada: 5 marcadas, clique na 3ª → ficam 2
 await pg.click('.cmb .dano .cx.f[data-n="5"]');await pg.click('.cmb .dano .cx.f[data-n="3"]');
 if(await n('.cmb .dano .cx.f.on')!==2||await n('.cmb .dano .cx.f[data-n="3"].on')!==0)bad('clicar numa marcada do meio não desmarcou a clicada');
 await pg.click('.cmb .dano .cx.f[data-n="3"]');
 // 3) atordoamento soma na penalidade (3 físicas + 3 atordoamento = −2)
 await pg.click('.cmb .dano .cx.a[data-n="3"]');
 if(!(await pg.textContent('.cmb .dano .dp')).includes('−2'))bad('físico + atordoamento não somaram (esperado −2)');
 // 4) o modo mesa mostra o mesmo estado e muda junto
 await pg.evaluate(()=>document.body.classList.add('modo-mesa'));
 if(await n('.mesa .dano .cx.f.on')!==3||await n('.mesa .dano .cx.a.on')!==3)bad('modo mesa não espelha a ficha completa');
 await pg.click('.mesa .dano .cx.f[data-n="5"]');
 if(await n('.cmb .dano .cx.f.on')!==5)bad('clique no modo mesa não chegou na ficha completa');
 // 5) o estado sobrevive ao redesenho; zerar limpa tudo
 await pg.evaluate(()=>{localStorage.setItem('sr5-modo-mesa','1');renderNPC(SESSAO.fichas)});   // o redesenho relê a chave do modo mesa
 if(await n('.cmb .dano .cx.f.on')!==5||await n('.cmb .dano .cx.a.on')!==3)bad('estado perdido ao redesenhar');
 await pg.click('.mesa .dano .dz');
 if(await n('.dano .cx.on')!==0)bad('Zerar não limpou as caixas');
 if(!(await pg.textContent('.cmb .dano .dp')).trim())bad('texto de penalidade vazio após zerar');
 // 6) teclado: Enter marca a caixa focada e o foco continua nela
 await pg.evaluate(()=>{localStorage.setItem('sr5-modo-mesa','0');renderNPC(SESSAO.fichas)});
 await pg.focus('.cmb .dano .cx.f[data-n="2"]');await pg.keyboard.press('Enter');
 if(await n('.cmb .dano .cx.f.on')!==2)bad('Enter não marcou a caixa');
 const foco=await pg.evaluate(()=>{const a=document.activeElement;return a&&a.dataset?a.dataset.k+a.dataset.n:''});
 if(foco!=='f2')bad('foco perdido após marcar pelo teclado: '+foco);
 // 7) sem penalidade (passo 0) não mostra marcas −N
 await pg.evaluate(()=>{ferSet(0);renderNPC(SESSAO.fichas)});
 if(await n('.cmb .dano em')!==0)bad('passo 0 ainda mostra marcas −N');
 await b.close();
 console.log(ERR.length?ERR.length+' problema(s)':'caixas de dano: tudo certo');ERR.forEach(e=>console.log(' -',e));process.exit(ERR.length?1:0)})();
