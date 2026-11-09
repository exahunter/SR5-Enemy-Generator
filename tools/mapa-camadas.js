#!/usr/bin/env node
// Mapa das camadas (comCamadas / .camada) na ordem do manifest, e guarda contra reatribuição de função.
//   node tools/mapa-camadas.js            -> todas as funções com camadas
//   node tools/mapa-camadas.js genNPC     -> detalha uma função
// Sai com código 1 se algum arquivo reatribui uma função que tem camadas (ou que o padrão antigo `{const g=X;X=function…}` voltou).
const fs=require('fs'),path=require('path'),M=require('../src/manifest.js');
const files=[];const walk=e=>{if(typeof e==='string')files.push(e);else if(e.files)e.files.forEach(walk)};
M.scripts.forEach(b=>(b.files||[]).forEach(walk));
const L={},bases={},erros=[];   // L: nome -> [{f,ln,rot}]   bases: nome -> {f,ln}
const src=f=>fs.readFileSync(path.join(__dirname,'..','src',f),'utf8').split('\n');
const js=files.filter(f=>f.endsWith('.js'));
js.forEach(f=>src(f).forEach((t,i)=>{
 let m;
 if(f!=='logic/camadas.js'&&(m=t.match(/comCamadas\(\s*'([^']+)'/)))bases[m[1]]={f,ln:i+1};
 if(f!=='logic/camadas.js')for(const r of t.matchAll(/\b([A-Za-z_$][\w$]*)\.camada\(\s*'([^']*)'/g))(L[r[1]]=L[r[1]]||[]).push({f,ln:i+1,rot:r[2]});
}));
// reatribuição de nome que tem camadas, ou capturas `const x=Nome;` seguidas de `Nome=` (padrão antigo)
const nomes=new Set([...Object.keys(bases),...Object.keys(L)]);
js.forEach(f=>src(f).forEach((t,i)=>{
 if(f==='logic/camadas.js')return;
 for(const n of nomes){
  if(new RegExp('(^|[;{}\\s])'+n.replace(/\$/g,'\\$')+'\\s*=\\s*(async\\s+)?(function|\\([^)]*\\)\\s*=>|[\\w$]+\\s*=>)').test(t)&&!new RegExp('const\\s+'+n+'\\s*=').test(t))
   erros.push(`${f}:${i+1}  reatribui ${n} (use ${n}.camada('rótulo', prox=>…))`);
 }}));
Object.keys(L).forEach(n=>{if(!bases[n])erros.push(`${n}: tem .camada(…) mas nenhum comCamadas('${n}', base)`)});
const alvo=process.argv[2];
const rows=Object.keys(bases).filter(n=>!alvo||n===alvo).sort((a,b)=>(L[b]||[]).length-(L[a]||[]).length||a.localeCompare(b));
rows.forEach(n=>{const a=L[n]||[];console.log(`${n}  (base + ${a.length} camada${a.length===1?'':'s'})  base: ${bases[n].f}:${bases[n].ln}`);a.forEach((x,i)=>console.log(`  ${i+1}. ${x.rot.padEnd(52)} ${x.f}:${x.ln}`))});
console.log(`\n${rows.length} função(ões) em camadas`);
if(erros.length){console.log('\nPROBLEMAS:');erros.forEach(e=>console.log('  '+e));process.exit(1)}
console.log('nenhuma reatribuição de função com camadas');
