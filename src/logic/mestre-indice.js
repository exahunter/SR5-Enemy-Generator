const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const IX={rows:[],bk:{},bm:{},ts:0};            // rows: [nome, seção, categoria, livro, página, id, arquivo]
const KEY='__index';
const saveIdx=()=>IDB.tx('readwrite',s=>s.put({name:KEY,size:0,data:{rows:IX.rows,bk:IX.bk,bm:IX.bm,ts:IX.ts}})).catch(()=>{});
const PM={},BLOB={},PT={};
const bookName=c=>IX.bk[c]||((BOOKS.find(b=>b[0]===c)||[])[1])||c;

function indexText(stem,text){
 const d=new DOMParser().parseFromString(text,'text/xml'),root=d.documentElement,out=[];
 if(!root||root.nodeName!=='chummer')return out;
 for(const sec of root.children){
  if(!sec.children.length)continue;
  for(const it of sec.children){
   if(it.nodeName==='book'&&sec.nodeName==='books'){const c=g(it,'code'),n=g(it,'name');if(c&&n){IX.bk[c]=n;const ms=[...it.querySelectorAll(':scope > matches > match')].map(x=>({l:g(x,'language'),t:g(x,'text'),p:g(x,'page')})).filter(x=>x.t&&x.p);if(ms.length)IX.bm[c]=ms}out.push([n,'books','',c,'',g(it,'id'),stem,'']);continue}
   const nm=g(it,'name');if(!nm)continue;
   out.push([nm,sec.nodeName,g(it,'category')||g(it,'type'),g(it,'source'),g(it,'page'),g(it,'id'),stem,g(it,'nameonpage')])}}
 return out}

function reindexFrom(list){ // list: [{name,text}]
 const keep=IX.rows.filter(r=>!list.some(f=>f.name.replace(/\.xml$/i,'')===r[6]));
 list.forEach(f=>{keep.push(...indexText(f.name.replace(/\.xml$/i,''),f.text))});
 IX.rows=keep;IX.ts=Date.now()}

