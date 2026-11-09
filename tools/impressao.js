#!/usr/bin/env node
// Impressão digital do comportamento (sem navegador): monta o HTML, carrega os scripts num contexto `vm` com DOM simulado,
// gera grupos, NPCs, critters, subida de nível, notas, renderização e importação com sementes fixas e resume tudo em hashes.
//   node tools/impressao.js            compara pt e en, cada um com a sua referência (tools/impressao.base.<idioma>.json); sai com 1 se algo mudou
//   node tools/impressao.js --gravar   grava o estado atual como referência dos dois idiomas (use quando a mudança de comportamento for intencional)
//   node tools/impressao.js --lang=en  só um idioma (a tela lê o idioma de localStorage 'sr5_lang'; aqui ele é simulado)
// Serve para refatorar com segurança: se só a estrutura mudou, os hashes não mudam. Cobre o empilhamento de camadas
// (importFiles, genGroup, genCritter, ganchoNotas, growLoadout, renderNPC…), não a exatidão do XML no Chummer.
const cp=require('child_process'),os=require('os'),path=require('path');
const _langArg=process.argv.find(a=>/^--lang=/.test(a));
if(!_langArg){   // sem --lang: roda cada idioma num processo próprio (o idioma é lido no carregamento dos scripts)
 let rc=0;for(const l of ['pt','en']){console.log('['+l+']');const r=cp.spawnSync('node',[__filename,'--lang='+l,...process.argv.slice(2)],{stdio:'inherit'});if(r.status)rc=r.status}
 process.exit(rc)}
const _lang=_langArg.slice(7);
const _out=path.join(os.tmpdir(),'gerador-impressao-'+_lang+'.html'),_base=path.join(__dirname,'impressao.base.'+_lang+'.json');
cp.execFileSync('node',[path.join(__dirname,'..','build.js'),'--out',_out],{stdio:'ignore'});
const _gravar=process.argv.includes('--gravar');process.argv[2]=_out;
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const html=fs.readFileSync(process.argv[2],'utf8');
const scripts=[...html.matchAll(/<script(?![^>]*type="text\/plain")(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const REC=[];
const el=(name)=>new Proxy(function(){},{get:(t,k)=>k==='style'||k==='classList'||k==='dataset'?el(name+'.'+String(k)):k==='children'||k==='childNodes'?[]:k==='length'?0:k===Symbol.toPrimitive?()=>'':k==='value'?'':k==='checked'?false:el(name+'.'+String(k)),apply:()=>el(name+'()'),set:(t,k,v)=>{if(k==='innerHTML'||k==='textContent'||k==='outerHTML')REC.push(name+'.'+k+'='+String(v));return true}});
const PARSED=[];
const ctx={document:el('doc'),localStorage:{getItem:k=>k==='sr5_lang'?_lang:null,setItem(){},removeItem(){}},navigator:{},console:{log(){},error(){},warn(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:()=>0,addEventListener(){},location:{hash:''},URL:{createObjectURL(){return ''}},Blob:function(){},FileReader:function(){},Image:function(){},Option:function(){},Event:function(){},CSS:{},matchMedia:()=>({matches:false}),crypto:crypto.webcrypto,indexedDB:undefined,
 DOMParser:function(){return {parseFromString:(t)=>{PARSED.push(String(t).slice(0,40));return {querySelectorAll:()=>[],querySelector:()=>null,documentElement:{children:[]},getElementsByTagName:()=>[]}}}},
 XMLSerializer:function(){}};
ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;ctx.REC=REC;ctx.PARSED=PARSED;
vm.createContext(ctx);
let i=0;for(const s of scripts){try{vm.runInContext(s,ctx,{filename:'bloco'+(++i)})}catch(e){console.error('ERRO bloco',i,e.message.slice(0,150))}}
const R=c=>vm.runInContext(c,ctx);
R("BOOKS.forEach(b=>SEL.add(b[0]));Date.now=()=>1700000000000");
const fp=R(`(function(){
 const H=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)};
 const strip=o=>JSON.stringify(o,(k,v)=>typeof v==='function'?'fn':typeof v==='string'?v.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'U'):(v instanceof Set?[...v]:v));
 const seeded=(seed,f)=>{const o=Math.random;Math.random=mkRng(hashSeed(String(seed)));try{return f()}catch(e){return 'ERRO '+e.message}finally{Math.random=o}};
 const out={};
 const comps=Object.keys(COMPS);
 let acc=[];
 for(let s=1;s<=36;s++){GEN.comp=comps[s%comps.length];GEN.metaUsed={};
  const r=seeded('g'+s,()=>{const L=genGroup(1+s%6,1+s%11,s%3?'__auto':Object.keys(TYPES)[s%22],'rand');return strip(L)+'|'+L.map(c=>ganchoNotas(c).join('/')).join('#')});acc.push(H(r))}
 out.grupos=H(acc.join());GEN.comp='grp';
 acc=[];for(let s=1;s<=30;s++){GEN.metaUsed={};acc.push(H(seeded('c'+s,()=>strip(genCritter(1+s%9,'rand')))))} out.critters=H(acc.join());
 acc=[];for(let s=1;s<=30;s++){GEN.metaUsed={};acc.push(H(seeded('n'+s,()=>{const c=genNPC(1+s%10,Object.keys(TYPES)[s%22],'rand','rand');const p=ganchoNotas(c).join('/');return strip(c)+p})))} out.npcs=H(acc.join());
 acc=[];for(let s=1;s<=60;s++){GEN.comp=comps[s%comps.length];GEN.metaUsed={};acc.push(H(seeded('t'+s,()=>{const L=genGroup(2+s%6,1+s%9,'__auto','rand');return strip(grupoTatica(L))})))} out.taticas=H(acc.join());GEN.comp='grp';
 acc=[];for(let s=1;s<=30;s++){GEN.metaUsed={};acc.push(H(seeded('l'+s,()=>{const c=genNPC(1+s%6,Object.keys(TYPES)[s%22],'rand','rand');const n=levelChar(c,Math.min(12,(c.npc.pr||1)+1+s%4));return strip(n)+strip(typeof GEN.lvAdd!=='undefined'?GEN.lvAdd:0)})))} out.subir=H(acc.join());
 return out})()`);
(async()=>{
 const imp=await R(`(async()=>{const mk=n=>({name:n,text:async()=>'<?xml '+n+'?>'});const r=[];
  for(const set of [['cyberware.xml','bioware.xml'],['streams.xml','mentors.xml'],['martialarts.xml'],['weapons.xml','gear.xml','skills.xml'],['qualities.xml','metatypes.xml','critters.xml','vehicles.xml','traditions.xml','licenses.xml','lifestyles.xml']]){
   PARSED.length=0;let v;try{v=await importFiles(set.map(mk))}catch(e){v='ERRO '+e.message.slice(0,60)}r.push(set.join(',')+'=>'+v+' ['+PARSED.join('|')+']')}
  return r})()`);
 fp.importar=imp;
 // renderização
 REC.length=0;
 R(`GEN.metaUsed={};{const o=Math.random;Math.random=mkRng(5);try{SESSAO.fichas=genGroup(4,5,'__auto','rand');renderNPC(SESSAO.fichas);const k=genCritter(5,'rand');renderNPC([k])}catch(e){REC.push('ERRO '+e.message)}finally{Math.random=o}}`);
 const h=s=>{let x=2166136261;for(const ch of String(s)){x^=ch.codePointAt(0);x=Math.imul(x,16777619)}return (x>>>0).toString(16)};
 fp.render=h(REC.join('\n').replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'U'))+':'+REC.length;
 fp.renderArmaNatural=R(`(function(){GEN.metaUsed={};const c=genNPC(3,Object.keys(TYPES)[1],'rand','rand');c.gear=c.gear.filter(g=>!g.nat);const antes=c.gear.some(g=>g.nat);renderNPC([c]);return antes+'->'+c.gear.some(g=>g.nat)})()`);

 const atual=JSON.stringify(fp,null,1);
 if(_gravar){fs.writeFileSync(_base,atual+'\n');console.log('referência gravada em tools/impressao.base.'+_lang+'.json');return}
 let ref;try{ref=JSON.parse(fs.readFileSync(_base,'utf8'))}catch(e){console.error('sem tools/impressao.base.'+_lang+'.json: rode com --gravar');process.exit(2)}
 const dif=Object.keys({...ref,...fp}).filter(k=>JSON.stringify(ref[k])!==JSON.stringify(fp[k]));
 if(dif.length){console.log('COMPORTAMENTO MUDOU em: '+dif.join(', '));process.exit(1)}
 console.log('comportamento idêntico à referência ('+Object.keys(fp).length+' impressões)')
})();
