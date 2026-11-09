const fs=require('fs'),L=require('./idioma')();   // --lang pt (padrão)
const src=fs.readFileSync(__dirname+'/../src/data/condutas-alta.js','utf8')+fs.readFileSync(__dirname+'/../src/data/condutas-baixa.js','utf8')+fs.readFileSync(__dirname+'/../src/data/condutas-perfil.js','utf8')+';module.exports={CD_HI,CD_LO}';
const m={exports:{}};new Function('module',src)(m);
const {CD_HI,CD_LO}=m.exports;
const ex=t=>{let r=[t];for(;;){let ch=false;r=r.flatMap(s=>{const k=s.match(/\{([^{}]*\|[^{}]*)\}/);if(!k)return[s];ch=true;return k[1].split('|').map(v=>s.replace(k[0],v))});if(!ch)break}return r};
let tot=0;
for(const [n,B] of [...Object.entries(CD_HI),...Object.entries(CD_LO)]){const all=B.flatMap(l=>ex(l.split('§')[0]));const u=new Set(all);tot+=u.size;console.log(n,B.length,'modelos',u.size,'condutas')}
console.log('total',tot);
for(const t of ['l','m','d','x'])for(const s of ['s1','s2','s3']){const L=CD_LO[s].filter(l=>l.split('§')[1].includes(t));console.log(s,t,L.length,new Set(L.flatMap(l=>ex(l.split('§')[0]))).size)}
console.log('--- revisar (2+ " e " ou repetição) ---');
const seen=new Set();
for(const [n,B] of [...Object.entries(CD_HI),...Object.entries(CD_LO)])for(const l of B)for(const s of ex(l.split('§')[0])){const k=(s.match(L.conjuncao)||[]).length;const w=s.toLowerCase().split(/\W+/);const rep=w.some((x,i)=>x.length>4&&w.indexOf(x)!==i&&w.indexOf(x)>=0&&i-w.indexOf(x)<5);if((k>=2||rep)&&!seen.has(s)){seen.add(s);console.log(n,'|',s)}}
