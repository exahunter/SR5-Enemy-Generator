#!/usr/bin/env node
// Envolve em xl()/xlf() os literais em português de src/ que aparecem na tela, nas Notas ou em tabelas de dados.
//   node tools/i18n-aplicar.js          reescreve src/ (repete até não haver mais nada; idempotente)
//   node tools/i18n-aplicar.js --seco   só conta
// Não mexe em literais usados como identificador (comparação, chave de objeto, includes/test/split…, regex) nem em texto
// que aparece em algum desses usos em outro lugar do código (ambíguo: ficaria diferente de quem compara).
const fs=require('fs'),path=require('path');
let acorn;for(const p of ['acorn','/opt/npm-tools/node_modules/acorn']){try{acorn=require(p);break}catch(e){}}
const SRC=path.join(__dirname,'..','src'),SECO=process.argv.includes('--seco');
const PULAR=/^(manifest\.js|data\/textos-|data\/en|logic\/(compat|util|i18n|formato)\.js$)/;
const PT=/[áàâãéêíóôõúçÁÉÍÓÚÂÊÔÃÕÇ]|(^|[^\w])(de|do|da|dos|das|com|sem|para|por|que|não|em|um|uma|se|ao|na|no|ou|mais|sobre|entre|até|ele|ela|seu|sua|os|as|tem|há|já|só|nenhum|nenhuma|todos|todas|sorteia|gera|gerar|ficha|fichas|arquivo|arquivos|livro|livros|armas?|armadura|equipamento|veículos?|perícias?|habilidades|qualidades?|implantes?|poderes|líder|chefe|lealdade|motivação|combate|grupo|gangue|tática|aleatório|metatipo|quando|usa|fica|abre|foge|luta|mira|atira|cobre|recua|evita|ataca|prefere|mantém|espera|procura|conhece|tenta|busca|segue|resolve|nunca|sempre|aliados?|inimigos?|alvo|alvos|erro|aviso|salvar|apagar|remover|escolha|selecione|nome|nível|tipo|total|lista|pasta|texto|página|dados|valor|valores|abertura|postura|defesa|limites?|iniciativa|peculiaridade|manias|cultura|doutrina|desenvolvimento|sinergias|ruptura|reserva|nacionalidade|mundano|mago|adepto|tecnomante|resist|gastos|resistência|civil|cidadão|idioma|nativo|vida|adulta|infância|apagar|origem|vínculo|papéis|ameaça|monitor físico|conhecimentos?|magia|perfil|temperamento|estilo)([^\w]|$)/i;
const ehPt=s=>/[A-Za-zÀ-ú]{3}/.test(s)&&!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(s)&&PT.test(s);   // chave de i18n (cab.titulo, modo.gerar.grp) não é texto
const KEYCALL=new Set(['includes','indexOf','lastIndexOf','test','startsWith','endsWith','match','matchAll','split','replace','replaceAll','has','get','set','add','delete','hasOwnProperty','querySelector','querySelectorAll','getAttribute','removeAttribute','closest','matches','getElementById','addEventListener','removeEventListener','dispatchEvent','createElement','getItem','setItem','removeItem','localeCompare','search','some','every','find','findIndex','filter']);
const KEYFN=new Set(['RegExp','avisa','require','Symbol','parseInt','parseFloat','Number','String','Boolean','CustomEvent','Set','Map','fresh','i18nAdd','xlAdd','t','tn','traduz','xl','xlf']);
const lit=s=>"'"+s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/[\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16))+"'";
const files=[];(function ler(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?ler(p):/\.js$/.test(e.name)&&files.push(p)}})(SRC);
function parse(src){for(const w of [['',''],['(async function(){\n','\n})']]){try{return{ast:acorn.parse(w[0]+src+w[1],{ecmaVersion:'latest',allowReturnOutsideFunction:true,allowAwaitOutsideFunction:true}),off:w[0].length}}catch(e){var er=e}}throw er}
function ctxo(n,P){ // 'chave' | 'ja' | 'tela'
 const p=P[P.length-1],g=P[P.length-2];if(!p)return'tela';
 if(p.type==='BinaryExpression'&&/^[!=]==?$/.test(p.operator))return'chave';
 if(p.type==='Property'&&p.key===n&&!p.computed)return'chave';
 if(p.type==='SwitchCase'&&p.test===n)return'chave';
 if(p.type==='MemberExpression'&&p.property===n&&p.computed)return'chave';
 if(p.type==='ImportDeclaration'||p.type==='ExportNamedDeclaration')return'chave';
 if(p.type==='CallExpression'||p.type==='NewExpression'){const i=p.arguments.indexOf(n);if(i>=0){
   const c=p.callee;
   if(c.type==='Identifier'&&(c.name==='xl'||c.name==='xlf'||c.name==='t'||c.name==='tn'||c.name==='traduz')&&i===0)return'ja';
   if(c.type==='Identifier'&&KEYFN.has(c.name)&&!(c.name==='xl'||c.name==='xlf')&&i===0)return'chave';
   if(c.type==='MemberExpression'&&c.object.type==='Identifier'&&c.object.name==='console')return'chave';
   if(c.type==='MemberExpression'&&!c.computed&&KEYCALL.has(c.property.name)&&i===0)return'chave'}}
 if(p.type==='ArrayExpression'){const q=g;
   if(q&&q.type==='NewExpression'&&q.callee.type==='Identifier'&&/^(Set|Map)$/.test(q.callee.name))return'chave';
   if(q&&q.type==='MemberExpression'&&q.object===p&&!q.computed&&KEYCALL.has(q.property.name))return'chave'}
 return'tela'}
function passada(){ // devolve [{f,a,b,txt,cls,tpl}] por arquivo
 const res=[];
 for(const file of files){const rel=path.relative(SRC,file).split(path.sep).join('/');if(PULAR.test(rel))continue;
  const src=fs.readFileSync(file,'utf8');let ps;try{ps=parse(src)}catch(e){console.error('parse falhou',rel);continue}
  const {ast,off}=ps,P=[];
  (function w(n){if(!n||typeof n.type!=='string')return;
   if(n.type==='Literal'&&typeof n.value==='string'&&!n.regex){if(ehPt(n.value))res.push({f:rel,a:n.start-off,b:n.end-off,txt:n.value,cls:ctxo(n,P)});return}
   if(n.type==='TemplateLiteral'){const parts=n.quasis.map(q=>q.value.cooked);const joined=parts.join(' ');const p=P[P.length-1];
     const ja=p&&p.type==='CallExpression'&&p.callee.type==='Identifier'&&/^(xl|xlf|t|tn|traduz)$/.test(p.callee.name)&&p.arguments[0]===n;
     if(p&&p.type==='TaggedTemplateExpression'){return}
     if(ehPt(joined)&&parts.every(x=>x!=null)){
       if(!n.expressions.length)res.push({f:rel,a:n.start-off,b:n.end-off,txt:parts[0],cls:ja?'ja':ctxo(n,P)});
       else if(!ja&&n.expressions.length<=9){res.push({f:rel,a:n.start-off,b:n.end-off,txt:parts.map((x,i)=>x+(i<n.expressions.length?'{'+i+'}':'')).join(''),cls:'tela',tpl:n.expressions.map(e=>[e.start-off,e.end-off])});return}}}
   P.push(n);for(const k in n){if(k==='type'||k==='start'||k==='end')continue;const v=n[k];if(Array.isArray(v))v.forEach(x=>x&&typeof x.type==='string'&&w(x));else if(v&&typeof v.type==='string')w(v)}P.pop()})(ast)}
 return res}
let total=0,ambig=0;
for(let rodada=0;rodada<8;rodada++){
 const L=passada();const chaves=new Set(L.filter(o=>o.cls==='chave').map(o=>o.txt));
 const alvo=L.filter(o=>o.cls==='tela'&&!chaves.has(o.txt));if(rodada===0)ambig=L.filter(o=>o.cls==='tela'&&chaves.has(o.txt)).length;
 if(!alvo.length)break;
 const por={};alvo.forEach(o=>(por[o.f]=por[o.f]||[]).push(o));let n=0;
 if(SECO){console.log('envolveria',alvo.length,'literais em',Object.keys(por).length,'arquivos; ambíguos:',ambig);break}
 for(const f in por){const file=path.join(SRC,f);let src=fs.readFileSync(file,'utf8');
  // não aninhar na mesma rodada: descarta alvos dentro de outro alvo de template
  const ord=por[f].sort((x,y)=>x.a-y.a||y.b-x.b);const sel=[];let fim=-1;for(const o of ord){if(o.a>=fim){sel.push(o);fim=o.b}}
  let out='',p=0;
  for(const o of sel){const pre=src.slice(p,o.a);out+=pre;
   const prev=(out.slice(-1)||'');const sp=/[\w$]/.test(prev)?' ':'';
   if(o.tpl){out+=sp+'xlf('+lit(o.txt)+','+o.tpl.map(([a,b])=>src.slice(a,b)).join(',')+')'}
   else out+=sp+'xl('+src.slice(o.a,o.b)+')';
   p=o.b;n++}
  out+=src.slice(p);fs.writeFileSync(file,out)}
 total+=n;console.log('rodada',rodada+1,'envolvidos',n)}
console.log('total',total,'ambíguos (não tocados)',ambig);
