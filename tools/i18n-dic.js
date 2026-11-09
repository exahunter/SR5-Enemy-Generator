#!/usr/bin/env node
// Dicionário pt→en de xl()/xlf(). As traduções ficam em tools/idioma/en/NN.txt, uma linha por chave: "id|texto inglês".
//   node tools/i18n-dic.js --lista     escreve tools/idioma/pt/NN.txt (id|texto pt) com as chaves do código, em lotes
//   node tools/i18n-dic.js --juntar    lê tools/idioma/en/*.txt e gera src/data/en.js; confere {0} {a|b|c} {W1} tags HTML e espaços
//   node tools/i18n-dic.js --falta     lista as chaves ainda sem tradução
// Texto de linha de banco ("texto§afinidades§tags") entra só com o que vem antes do 1º §. No .txt, quebra de linha = ⏎.
const fs=require('fs'),path=require('path');
let acorn;for(const p of ['acorn','/opt/npm-tools/node_modules/acorn']){try{acorn=require(p);break}catch(e){}}
const SRC=path.join(__dirname,'..','src'),D=path.join(__dirname,'idioma'),LOTE=+(process.env.LOTE||22000);
const files=[];(function ler(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?ler(p):/\.js$/.test(e.name)&&files.push(p)}})(SRC);
function chaves(){const m=new Map();
 for(const file of files){const rel=path.relative(SRC,file).split(path.sep).join('/');if(/^data\/en|^logic\/i18n\.js$/.test(rel))continue;
  const src=fs.readFileSync(file,'utf8');let ast;for(const w of [['',''],['(async function(){\n','\n})']]){try{ast=acorn.parse(w[0]+src+w[1],{ecmaVersion:'latest',allowReturnOutsideFunction:true,allowAwaitOutsideFunction:true});break}catch(e){}}
  if(!ast)continue;
  (function w(n){if(!n||typeof n.type!=='string')return;
   if(n.type==='CallExpression'&&n.callee.type==='Identifier'&&(n.callee.name==='xl'||n.callee.name==='xlf')){const a=n.arguments[0];
    let k=a&&a.type==='Literal'&&typeof a.value==='string'?a.value:a&&a.type==='TemplateLiteral'&&!a.expressions.length?a.quasis[0].value.cooked:null;
    if(k!=null){const i=k.indexOf('§');if(i>=0)k=k.slice(0,i);if(k.trim()&&!m.has(k))m.set(k,rel)}}
   for(const x in n){if(x==='type')continue;const v=n[x];if(Array.isArray(v))v.forEach(w);else if(v&&typeof v.type==='string')w(v)}})(ast)}
 return m}
const enc=s=>s.replace(/\n/g,'⏎'),dec=s=>s.replace(/⏎/g,'\n');
const K=chaves(),keys=[...K.keys()];
if(process.argv.includes('--lista')){
 fs.rmSync(path.join(D,'pt'),{recursive:true,force:true});fs.mkdirSync(path.join(D,'pt'),{recursive:true});
 let lote=1,buf='',tam=0;const idx={};
 keys.forEach((k,i)=>{const l=i+'|'+enc(k)+'\n';if(tam+l.length>LOTE&&buf){fs.writeFileSync(path.join(D,'pt',String(lote).padStart(2,'0')+'.txt'),buf);lote++;buf='';tam=0}buf+=l;tam+=l.length;idx[i]=k});
 if(buf)fs.writeFileSync(path.join(D,'pt',String(lote).padStart(2,'0')+'.txt'),buf);
 fs.writeFileSync(path.join(D,'chaves.json'),JSON.stringify(keys));
 console.log(keys.length,'chaves em',lote,'lotes')}
else{
 const ks=fs.existsSync(path.join(D,'chaves.json'))?JSON.parse(fs.readFileSync(path.join(D,'chaves.json'),'utf8')):keys;
 const en={};const dir=path.join(D,'en');
 for(const f of fs.existsSync(dir)?fs.readdirSync(dir).sort():[]){if(!/\.txt$/.test(f))continue;
  for(const l of fs.readFileSync(path.join(dir,f),'utf8').split('\n')){const i=l.indexOf('|');if(i<1)continue;const id=+l.slice(0,i);if(!(id in ks))continue;const v=dec(l.slice(i+1));if(v.trim()!==''||ks[id].trim()==='')en[id]=v}}
 const falta=ks.map((k,i)=>[i,k]).filter(([i])=>en[i]==null);
 if(process.argv.includes('--falta')){console.log(falta.length+' sem tradução de '+ks.length);falta.slice(0,+process.env.N||40).forEach(([i,k])=>console.log(i+'|'+enc(k).slice(0,120)));process.exit(0)}
 const tags=s=>(s.match(/<\/?[a-zA-Z][^>]*>/g)||[]).map(x=>x.replace(/\s.*>/,'>')).sort().join(''),
  vars=s=>(s.match(/\{[0-9A-Z]+\}/g)||[]).sort().join(''),
  vari=s=>(s.match(/\{[^{}]*\|[^{}]*\}/g)||[]).map(g=>g.split('|').length).join(','),
  ends=s=>[/^\s+/.exec(s),/\s+$/.exec(s)].map(x=>x?x[0].length:0).join(',');
 let erros=0;const tab={};
 ks.forEach((k,i)=>{if(en[i]==null)return;const v=en[i];const ps=[];
  if(vars(k)!==vars(v))ps.push('variáveis {..}');if(vari(k)!==vari(v))ps.push('variantes {a|b}');if(tags(k)!==tags(v))ps.push('tags HTML');if(ends(k)!==ends(v))ps.push('espaços nas pontas');
  if(ps.length){erros++;if(erros<=60)console.log('ERRO',i,ps.join(', '),'\n  pt:',enc(k).slice(0,140),'\n  en:',enc(v).slice(0,140))}else tab[k]=v});
 const body='/* Dicionário pt→en (xl/xlf). Gerado por tools/i18n-dic.js a partir de tools/idioma/en/*.txt: não edite aqui. */\nxlAdd('+JSON.stringify(tab,null,0).replace(/","/g,'",\n"')+');\n';
 fs.writeFileSync(path.join(SRC,'data','en.js'),body);
 console.log('chaves',ks.length,'· traduzidas',Object.keys(tab).length,'· faltam',falta.length,'· erros de estrutura',erros)}
