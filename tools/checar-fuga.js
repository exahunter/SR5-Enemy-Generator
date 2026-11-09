#!/usr/bin/env node
// Regra do projeto: toda conduta que menciona fuga também diz o que acontece (1) sem rotas de fuga, (2) com aliados feridos, (3) com aliado importante ainda em combate.
//   node tools/checar-fuga.js            -> resumo + modelos incompletos (até 15 por arquivo)
//   node tools/checar-fuga.js --tudo     -> lista todos
//   node tools/checar-fuga.js --json     -> saída em JSON
// Idioma: --lang pt (padrão); as expressões ficam em tools/idioma/<código>.js e esta ferramenta não tem palavras de idioma.
// Heurística por palavras-chave sobre o texto do modelo (todas as variações {a|b|c}); confira os casos listados à mão.
const fs=require('fs');
const src=['alta','baixa','perfil','v40'].map(n=>fs.readFileSync(__dirname+`/../src/data/condutas-${n}.js`,'utf8')).join('\n')+';module.exports={CD_HI,CD_LO}';
const m={exports:{}};new Function('module',src)(m);const {CD_HI,CD_LO}=m.exports;
const L=require('./idioma')(),FUGA=L.fuga,R=L.complementos;   // as palavras-chave moram em tools/idioma/<--lang>.js
const ex=t=>{let r=[t];for(;;){let ch=false;r=r.flatMap(s=>{const k=s.match(/\{([^{}]*\|[^{}]*)\}/);if(!k)return[s];ch=true;return k[1].split('|').map(v=>s.replace(k[0],v))});if(!ch)break}return r};
// fuga do INIMIGO (cerco, perseguição, interdição) ou blefe: a regra é sobre a fuga do próprio NPC, então ficam fora
const IGNORA=new Set(['CD_HI.h1[6]','CD_HI.h1[20]','CD_HI.h1[26]','CD_HI.h2[25]','CD_HI.h5[44]','CD_HI.h5[48]']);
const rows=[];
for(const [bank,D] of [['CD_HI',CD_HI],['CD_LO',CD_LO]])for(const [k,B] of Object.entries(D))B.forEach((l,i)=>{
 const p=l.split('§'),txt=ex(p[0]).join(' / '),tag=(p[2]||'').trim();
 if(IGNORA.has(`${bank}.${k}[${i}]`))return;const fuga=tag==='flee'||FUGA.test(txt);if(!fuga)return;
 const falta=Object.entries(R).filter(([n,re])=>!re.test(txt)).map(([n])=>n);
 rows.push({ref:`${bank}.${k}[${i}]`,tag,falta,txt:p[0].slice(0,110)})});
if(process.argv.includes('--json')){console.log(JSON.stringify(rows,null,1));process.exit(0)}
const inc=rows.filter(r=>r.falta.length),cnt={semRota:0,ferido:0,importante:0};inc.forEach(r=>r.falta.forEach(f=>cnt[f]++));
console.log(`${rows.length} modelos mencionam fuga; ${inc.length} sem o complemento completo`);
console.log(`faltando: sem rota ${cnt.semRota} · aliados feridos ${cnt.ferido} · aliado importante ${cnt.importante}`);
const lim=process.argv.includes('--tudo')?1e9:15,seen={};
inc.forEach(r=>{const g=r.ref.split('[')[0];seen[g]=(seen[g]||0)+1;if(seen[g]<=lim)console.log(`${r.ref} [${r.falta.join(',')}] ${r.txt}`)});
process.exit(inc.length?1:0);
