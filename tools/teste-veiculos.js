#!/usr/bin/env node
// Impressão digital do comportamento (sem navegador): monta o HTML, carrega os scripts num contexto `vm` com DOM simulado,
// gera grupos, NPCs, critters, subida de nível, notas, renderização e importação com sementes fixas e resume tudo em hashes.
//   node tools/impressao.js            compara com tools/impressao.base.json (sai com 1 se algo mudou)
//   node tools/impressao.js --gravar   grava o estado atual como referência (use quando a mudança de comportamento for intencional)
// Serve para refatorar com segurança: se só a estrutura mudou, os hashes não mudam. Cobre o empilhamento de camadas
// (importFiles, genGroup, genCritter, ganchoNotas, growLoadout, renderNPC…), não a exatidão do XML no Chummer.
// Módulos de veículo: avalia as fórmulas dos 197 módulos (falhas devem ser 0), gera riggers com e sem R5 e confere slots/duplicados.
//   node tools/teste-veiculos.js
const cp=require('child_process'),os=require('os'),path=require('path');
const DIR=path.join(__dirname,'..'),_out=path.join(os.tmpdir(),'ui-'+path.basename(DIR)+'.html');
cp.execFileSync('node',[path.join(DIR,'build.js'),'--out',_out],{stdio:'ignore'});

const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const html=fs.readFileSync(_out,'utf8');
const scripts=[...html.matchAll(/<script(?![^>]*type="text\/plain")(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const REC=[];
const el=(name)=>new Proxy(function(){},{get:(t,k)=>k==='style'||k==='classList'||k==='dataset'?el(name+'.'+String(k)):k==='children'||k==='childNodes'?[]:k==='length'?0:k===Symbol.toPrimitive?()=>'':k==='value'?'':k==='checked'?false:el(name+'.'+String(k)),apply:()=>el(name+'()'),set:(t,k,v)=>{if(k==='innerHTML'||k==='textContent'||k==='outerHTML')REC.push(name+'.'+k+'='+String(v));return true}});
const PARSED=[];
const V={};
const el2=(id)=>new Proxy(el('E.'+id),{get:(t,k)=>k==='value'?(V[id]!==undefined?V[id]:''):k==='checked'?!!V[id+'#c']:t[k],set:(t,k,v)=>Reflect.set(t,k,v)});
const doc=new Proxy(el('doc'),{get:(t,k)=>k==='getElementById'?el2:t[k]});
const ctx={document:doc,localStorage:{getItem:()=>null,setItem(){},removeItem(){}},navigator:{},console:{log(){},error(){},warn(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:()=>0,addEventListener(){},location:{hash:''},URL:{createObjectURL(){return ''}},Blob:function(){},FileReader:function(){},Image:function(){},Option:function(){},Event:function(){},CSS:{},matchMedia:()=>({}),
 DOMParser:function(){return {parseFromString:()=>({querySelectorAll:()=>[],querySelector:()=>null,documentElement:{children:[]},getElementsByTagName:()=>[]})}},XMLSerializer:function(){}};
ctx.crypto=require('crypto').webcrypto;ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;ctx.REC=REC;ctx.V=V;
vm.createContext(ctx);
let i=0;for(const s of scripts){try{vm.runInContext(s,ctx,{filename:'b'+(++i)})}catch(e){console.error('ERRO bloco',i,e.message.slice(0,150))}}
const R=c=>vm.runInContext(c,ctx);
R("BOOKS.forEach(b=>SEL.add(b[0]));Date.now=()=>1700000000000");

const out=R(`(function(){
 const lines=[];const L=x=>lines.push(x);
 const bad=[];
 // 1) avaliador: todas as fórmulas dos 197 módulos com um veículo e um drone de exemplo
 const veh=poolItems().filter(i=>i[0]==='veh'),dr=poolItems().filter(i=>i[0]==='drone');
 const mk=i=>({cat:i[0],n:i[1],cost:i[2],sub:i[6],st:i[7]||{}});
 const samples=[mk(veh[0]),mk(veh[5]),mk(dr[0]),mk(dr[7])];
 let nan=0,tot=0;const nanNames=new Set();
 VM.forEach(r=>samples.forEach(it=>{const V=vmStats(it);[0,1,3].forEach(rt=>{const W=Object.assign({},V,{Rating:rt});tot++;const a=vmEval(r[6],W),b=/Variable/.test(r[7])?0:vmEval(r[7],W),c=vmAvail(r[8],W);if(isNaN(a)||isNaN(b)||!c){nan++;nanNames.add(r[0]+' | '+r[6]+' | '+r[7]+' | '+r[8])}})}));
 L('avaliações '+tot+' ; falhas '+nan);[...nanNames].slice(0,12).forEach(x=>L('  FALHA '+x));
 // 2) pontos de referência de fórmulas
 const V1=vmStats(mk(veh[0]));L('veh0 '+veh[0][1]+' body '+V1.Body+' custo '+V1.VehicleCost);
 ['Handling Enhancement','Armor (Standard)','ECM','Chameleon Coating'].forEach(n=>{const r=VMn.get(n),rt=vmRating(r,V1,6),c=vmCalc(r,rt,V1);L('  '+n+' rt '+rt+' => '+JSON.stringify(c))});
 // 3) riggers
 const fmt=g=>g.n+' ['+(g.mods||[]).map(m=>(m.inc?'F:':'')+m.n+(m.rt?' '+m.rt:'')+' s'+m.sl+' $'+m.cost+' '+m.av).join(' | ')+']';
 [false,true].forEach(r5=>{if(r5)SEL.add('R5');else SEL.delete('R5');
  L('=== R5 '+r5);
  for(const pr of [2,4,6,8,10]){const o=Math.random;Math.random=mkRng(hashSeed('v'+pr));
   try{const c=genNPC(pr,Object.keys(TYPES)[3],'Rigger','rand');const G=c.gear.filter(x=>x.cat==='veh'||x.cat==='drone');
    G.forEach(g=>{const V=vmStats(g),cap=(+(g.st||{}).modslots)||V.Body,used=(g.mods||[]).filter(m=>!m.inc).reduce((t,m)=>t+m.sl,0);
     if(used>cap)bad.push('slots '+g.n+' '+used+'>'+cap);const nm=(g.mods||[]).map(m=>m.n);if(new Set(nm).size!==nm.length)bad.push('dup '+g.n)});
    L('pr'+pr+' '+G.map(fmt).join('\\n     '))}catch(e){L('ERRO '+pr+' '+e.stack.split('\\n').slice(0,3).join(' / '))}finally{Math.random=o}}});
 L('violações: '+JSON.stringify(bad));
 return lines.join('\\n')})()`);
console.log(out);
