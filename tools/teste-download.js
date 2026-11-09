#!/usr/bin/env node
// Testa o fallback de download de logic/compat.js sem navegador (DOM simulado). Uso: node tools/teste-download.js
const fs=require('fs'),path=require('path'),vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'..','src','logic','compat.js'),'utf8');
function ctx(claude){const clicks=[];
 const win={};if(claude!==undefined)win.claude=claude;
 const doc={body:{appendChild(){}},createElement:()=>({click(){clicks.push(this.download)},remove(){}})};
 const sb={window:win,document:doc,Blob:class{constructor(p,o){this.p=p;this.o=o}},URL:{createObjectURL:()=>'blob:x',revokeObjectURL(){}},setTimeout:()=>0,TextEncoder,Uint32Array,Uint8Array,DataView,ArrayBuffer};
 sb.JSZip=function(){};vm.createContext(sb);vm.runInContext(src,sb);return{win,clicks}}
const T={
 'sem window.claude: baixa pelo navegador':async()=>{const c=ctx();const d=await c.win.claude.use('downloads');await d.save({filename:'a.chum5',data:'x'});return c.clicks.join()==='a.chum5'},
 'claude sem use(): baixa pelo navegador':async()=>{const c=ctx({});const d=await c.win.claude.use('downloads');await d.save({filename:'b.zip',data:'x'});return c.clicks.join()==='b.zip'},
 'use() devolve null: baixa pelo navegador':async()=>{const c=ctx({use:async()=>null});const d=await c.win.claude.use('downloads');await d.save({filename:'c',data:'x'});return c.clicks.join()==='c'},
 'use() lança erro: baixa pelo navegador':async()=>{const c=ctx({use:async()=>{throw Object.assign(new Error('x'),{code:'denied'})}});const d=await c.win.claude.use('downloads');await d.save({filename:'d',data:'x'});return c.clicks.join()==='d'},
 'use() ok: usa o do visualizador, sem clique':async()=>{let got;const c=ctx({use:async()=>({save:async o=>{got=o.filename}})});const d=await c.win.claude.use('downloads');await d.save({filename:'e',data:'x'});return got==='e'&&!c.clicks.length},
 'save() do visualizador falha: cai no navegador':async()=>{const c=ctx({use:async()=>({save:async()=>{throw new Error('boom')}})});const d=await c.win.claude.use('downloads');await d.save({filename:'f',data:'x'});return c.clicks.join()==='f'},
 'declined em use() ou save() é repassado (sem baixar)':async()=>{let n=0;for(const k of [0,1]){const dec=Object.assign(new Error('d'),{code:'declined'});const c=ctx({use:async()=>k?({save:async()=>{throw dec}}):Promise.reject(dec)});try{const d=await c.win.claude.use('downloads');await d.save({filename:'g',data:'x'});}catch(e){if(e.code==='declined'&&!c.clicks.length)n++}}return n===2},
 'outros recursos de use() seguem intactos':async()=>{const c=ctx({use:async n=>n==='x'?{ok:1}:null});return (await c.win.claude.use('x')).ok===1}
};
(async()=>{let bad=0;for(const[k,f]of Object.entries(T)){let r;try{r=await f()}catch(e){r=false;console.log('   erro:',e.message)}console.log((r?'ok   ':'FALHA ')+k);if(!r)bad++}process.exit(bad?1:0)})();
