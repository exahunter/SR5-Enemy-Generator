#!/usr/bin/env node
// Impressão digital do comportamento (sem navegador): monta o HTML, carrega os scripts num contexto `vm` com DOM simulado,
// gera grupos, NPCs, critters, subida de nível, notas, renderização e importação com sementes fixas e resume tudo em hashes.
//   node tools/impressao.js            compara com tools/impressao.base.json (sai com 1 se algo mudou)
//   node tools/impressao.js --gravar   grava o estado atual como referência (use quando a mudança de comportamento for intencional)
// Serve para refatorar com segurança: se só a estrutura mudou, os hashes não mudam. Cobre o empilhamento de camadas
// (importFiles, genGroup, genCritter, ganchoNotas, growLoadout, renderNPC…), não a exatidão do XML no Chummer.
const cp=require('child_process'),os=require('os'),path=require('path');
const DIR=process.argv[2]||path.join(__dirname,'..'),_out=path.join(os.tmpdir(),'ui-'+path.basename(DIR)+'.html');
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
 const H=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)};
 const strip=o=>JSON.stringify(o,(k,v)=>typeof v==='function'?'fn':typeof v==='string'?v.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'U'):(v instanceof Set?[...v]:v));
 const FI=()=>typeof SESSAO!=='undefined'?SESSAO.fichas:curN, SETF=v=>{if(typeof SESSAO!=='undefined')SESSAO.fichas=v;else curN=v};
 const ST=()=>typeof GEN!=='undefined'?[GEN.wild,GEN.impSel,GEN.comp,Object.keys(GEN.metaUsed).length]:[WILD,IMPSEL,COMP,Object.keys(META_USED).length];
 const seeded=(seed,f)=>{const o=Math.random;Math.random=mkRng(hashSeed(String(seed)));try{return f()}catch(e){return 'ERRO '+e.message}finally{Math.random=o}};
 const base={nsize:'2-3',npr:'medio',nspec:'rand',ngrp:'grp',ntype:'rand',meta:'rand',ncrit:'rand',nimp:'auto'};
 const reset=ex=>{Object.keys(V).forEach(k=>delete V[k]);Object.assign(V,base,ex)};
 const cen=[['grp',{}],['grp',{ngrp:Object.keys(COMPS)[2]}],['npc',{nspec:'Mage'}],['npc',{'wild#c':1,nsize:'2-2'}],['npc',{nimp:'0'}],['critter',{nsize:'2-2'}],['grp',{'wild#c':1,nsize:'4-4'}]];
 const o={doGen:[]};
 cen.forEach(([mode,ex],i)=>{reset(Object.assign({mode},ex));SETF([]);const r=seeded('ui'+i,()=>{modeEl.value=mode;doGen();return strip(FI())+'|'+JSON.stringify(ST())});o.doGen.push(H(r)+':'+FI().length+(r.startsWith('ERRO')?' '+r:''))});
 reset({'wild#c':1});o.rr=[];
 for(let i=0;i<8;i++){const c=seeded('g'+i,()=>genNPC(2+i%6,Object.keys(TYPES)[i%22],'rand','rand'));SETF([c]);
  o.rr.push(H(seeded('r'+i,()=>strip(rerollChar(c,i%2?'equip':undefined,i%3?{pr:Math.min(12,(c.npc.pr||2)+1)}:undefined))+JSON.stringify(ST()))));
  o.rr.push(H(seeded('l'+i,()=>{levelAt(0,Math.min(12,(FI()[0].npc.pr||2)+2));return strip(FI())+JSON.stringify(ST())})))}
 return o})()`);
console.log(JSON.stringify(out));
console.log(REC.filter(x=>/class="neg"/.test(x)).slice(0,2).map(x=>x.slice(0,250)).join('\n'));
