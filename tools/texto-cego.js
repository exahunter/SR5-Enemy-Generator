#!/usr/bin/env node
// Teste "texto cego": prova que a GERAÇÃO não lê o texto em português.
// Copia o projeto duas vezes (A e B), troca o texto em português dos literais por letras embaralhadas (cada cópia com uma cifra
// diferente) e marca o trecho trocado com ⟦…⟧. Roda a impressão digital nas duas, descartando o conteúdo das marcas.
// Se um hash difere entre A e B, a geração (ou a renderização) depende do texto: o arquivo cifrado é o suspeito.
//   node tools/texto-cego.js                    cifra tudo em src/
//   node tools/texto-cego.js --so '^data/cond'  cifra só os arquivos cujo caminho (relativo a src/) casa
//   node tools/texto-cego.js --manter           mantém /tmp/texto-cego para inspeção
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const RAIZ=path.join(__dirname,'..'),TMP=path.join(os.tmpdir(),'texto-cego');
const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:(process.argv[i+1]||true)};
const SO=arg('--so')?new RegExp(arg('--so')):null,PULAR=/^data\/textos-/;
const PT=/[áàâãéêíóôõúçÁÉÍÓÚÂÊÔÃÕÇ]|\b(de|do|da|dos|das|com|sem|para|por|que|não|nao|em|um|uma|se|ao|aos|na|no|nas|nos|ou|mais|sobre|entre|até|ele|ela|seu|sua|o|a|e)\b/;
const ehTexto=s=>/[A-Za-zÀ-ú]{3,}/.test(s)&&PT.test(s)&&!/^[\w./:#-]+$/.test(s);
const L='abcdefghijklmnopqrstuvwxyz';
function cifra(seed){let x=seed*2654435761>>>0;const r=()=>(x=Math.imul(x^x>>>15,2246822507)>>>0)/4294967296,p=[...L];
 for(let i=25;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
 const m={};L.split('').forEach((c,i)=>{m[c]=p[i];m[c.toUpperCase()]=p[i].toUpperCase()});
 'áàâãä'.split('').forEach(c=>m[c]=m.a);'éê'.split('').forEach(c=>m[c]=m.e);m['í']=m.i;'óôõ'.split('').forEach(c=>m[c]=m.o);m['ú']=m.u;m['ç']=m.c;
 return c=>c.replace(/\\(?:u\{[^}]*\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])|<[^>]*>|&#?\w+;|§[\w,]*|[A-Za-zÀ-ú]/g,t=>t.length>1||t[0]==='\\'||t[0]==='§'?t:(m[t]||t))}
function trechos(src){const T=[],S=[],n=src.length;let i=0,modo='cod',depth=0,ini=0;
 const ant=()=>{let j=i-1;while(j>=0&&/\s/.test(src[j]))j--;return j<0?'':src[j]};
 while(i<n){const c=src[i];
  if(modo==='cod'){
   if(c==='/'&&src[i+1]==='/'){while(i<n&&src[i]!=='\n')i++;continue}
   if(c==='/'&&src[i+1]==='*'){i=src.indexOf('*/',i+2);i=i<0?n:i+2;continue}
   if(c==="'"||c==='"'){let j=i+1;while(j<n&&src[j]!==c&&src[j]!=='\n'){if(src[j]==='\\')j++;j++}T.push([i+1,j]);i=j+1;continue}
   if(c==='`'){S.push(depth);modo='tpl';ini=i+1;i++;continue}
   if(c==='/'&&/[(,=:[!&|?{};]|^$/.test(ant())){let j=i+1,cl=false;while(j<n&&src[j]!=='\n'){if(src[j]==='\\')j++;else if(src[j]==='[')cl=true;else if(src[j]===']')cl=false;else if(src[j]==='/'&&!cl)break;j++}i=j+1;continue}
   if(c==='{')depth++;
   else if(c==='}'){if(depth===0&&S.length){modo='tpl';ini=i+1;i++;continue}depth--}
   i++;continue}
  if(c==='\\'){i+=2;continue}
  if(c==='`'){T.push([ini,i]);depth=S.pop();modo='cod';i++;continue}
  if(c==='$'&&src[i+1]==='{'){T.push([ini,i]);depth=0;modo='cod';i+=2;continue}
  i++}
 return T}
// separadores '|', chaves {} (variantes e {A}/{B}) e marcas §tag são estruturais (não são idioma): ficam FORA do trecho cifrado
const marca=(c,f)=>c.split(/(§[\w, ]*|[|{}])/).map(p=>/^[|{}]$/.test(p)||p[0]==='§'?p:p?'⟦'+f(p)+'⟧':'').join('');
function js(src,f){let n=0,out='',p=0;for(const [a,b] of trechos(src)){const c=src.slice(a,b);if(!ehTexto(c))continue;out+=src.slice(p,a)+marca(c,f);p=b;n++}return{out:out+src.slice(p),n}}
function jsonV(src,f){let n=0;const w=v=>typeof v==='string'?(ehTexto(v)?(n++,marca(v,f)):v):Array.isArray(v)?v.map(w):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,w(x)])):v;
 return{out:JSON.stringify(w(JSON.parse(src)),null,1),n}}
fs.rmSync(TMP,{recursive:true,force:true});fs.mkdirSync(TMP,{recursive:true});
const res={};
for(const [m,seed] of [['A',1],['B',2]]){
 const D=path.join(TMP,m);fs.cpSync(RAIZ,D,{recursive:true,filter:s=>!/node_modules|[\\/]dist([\\/]|$)/.test(s)});
 const f=cifra(seed);let tot=0;const por={};
 (function ler(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){ler(p);continue}
  const rel=path.relative(path.join(D,'src'),p).split(path.sep).join('/');
  if(PULAR.test(rel)||rel==='manifest.js'||(SO&&!SO.test(rel)))continue;
  if(!/\.(js|json)$/.test(rel))continue;
  const src=fs.readFileSync(p,'utf8');let r;try{r=/\.json$/.test(rel)?jsonV(src,f):js(src,f)}catch(err){console.error('falhou',rel,err.message);continue}
  if(r.n){fs.writeFileSync(p,r.out);tot+=r.n;por[rel]=r.n}}})(path.join(D,'src'));
 res[m]=tot;
 const chk=cp.spawnSync('node',['build.js','--check'],{cwd:D,encoding:'utf8'});
 if(/erro/i.test(chk.stdout+chk.stderr))console.log('SINTAXE',m,(chk.stdout+chk.stderr).split('\n').slice(0,5).join('\n'));
 // impressão digital cega: hashes descartam o conteúdo das marcas
 let im=fs.readFileSync(path.join(D,'tools','impressao.js'),'utf8');
 im=im.replace("ctx.window=ctx;","ctx.NORM=s=>String(s).replace(/⟦[^⟧]*⟧/g,'T');ctx.window=ctx;")
  .replace("const H=s=>{let h=2166136261;for(const ch of String(s))","const H=s=>{let h=2166136261;for(const ch of NORM(s))")
  .replace("const h=s=>{let x=2166136261;for(const ch of String(s))","const h=s=>{let x=2166136261;for(const ch of ctx.NORM(s))");
 fs.writeFileSync(path.join(D,'tools','impressao.js'),im);
 const o=cp.spawnSync('node',['tools/impressao.js','--gravar'],{cwd:D,encoding:'utf8'});
 if(o.status!==0)console.log('impressão falhou em',m,(o.stdout+o.stderr).slice(0,300));
 try{res['f'+m]=JSON.parse(fs.readFileSync(path.join(D,'tools','impressao.base.json'),'utf8'))}catch(e){}
}
console.log('textos trocados por cópia:',JSON.stringify({A:res.A,B:res.B}));
const a=res.fA||{},b=res.fB||{},dif=Object.keys({...a,...b}).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]));
console.log(dif.length?'A GERAÇÃO LÊ O TEXTO em: '+dif.join(', '):'texto cego OK: A e B iguais ('+Object.keys(a).length+' impressões)');
dif.forEach(k=>console.log(' ',k,'A='+JSON.stringify(a[k]).slice(0,60),'B='+JSON.stringify(b[k]).slice(0,60)));
if(!arg('--manter'))fs.rmSync(TMP,{recursive:true,force:true});
process.exit(dif.length?1:0);
