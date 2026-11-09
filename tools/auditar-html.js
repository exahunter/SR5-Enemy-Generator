#!/usr/bin/env node
// Auditoria de XSS: lista linhas que montam HTML (innerHTML, insertAdjacentHTML, outerHTML, document.write) com valores interpolados sem esc()/número.
//   node tools/auditar-html.js          -> só os suspeitos
//   node tools/auditar-html.js --tudo   -> todos os pontos de saída HTML
const fs=require('fs'),path=require('path');
const files=[];(function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);fs.statSync(p).isDirectory()?w(p):/\.js$/.test(f)&&files.push(p)}})(path.join(__dirname,'..','src'));
const SINK=/innerHTML|insertAdjacentHTML|outerHTML|document\.write/;
const SEGURO=/^(esc\(|escA\(|E\(|Number\(|\+|parseInt|Math\.|\w+\.length|\d)/;   // esc(), números
let tot=0,sus=0;
for(const f of files){fs.readFileSync(f,'utf8').split('\n').forEach((l,i)=>{if(!SINK.test(l))return;tot++;
 const ints=[...l.matchAll(/\$\{([^}]*(?:\([^)]*\)[^}]*)*)\}/g)].map(m=>m[1].trim());
 const concat=[...l.matchAll(/\+\s*([A-Za-z_$][\w$.\[\]()'"-]*)\s*(?=\+|\)|;|$)/g)].map(m=>m[1]).filter(x=>!/^(esc|E|escA)\(/.test(x)&&!/^['"]/.test(x));
 const bad=ints.filter(x=>!SEGURO.test(x)&&!/^(esc|E)\(/.test(x)).concat(concat.filter(x=>!/^\d/.test(x)));
 if(bad.length||process.argv.includes('--tudo')){sus+=bad.length?1:0;console.log(`${path.relative(path.join(__dirname,'..'),f)}:${i+1}  ${bad.length?'[?] '+[...new Set(bad)].slice(0,6).join(' | '):'ok'}`)}})}
console.log(`\n${tot} pontos de saída HTML; ${sus} com valores a conferir`);
