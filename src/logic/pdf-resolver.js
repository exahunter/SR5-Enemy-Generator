// ---------- v30: resolvedor único das notas dos livros ----------
// Um só caminho (nome -> fonte e página -> texto do PDF) para as três saídas: Notas do .chum5 (XML), Notas do JSON (Foundry)
// e a dica que aparece ao passar o mouse na ficha. Tudo o que está num livro passa por aqui, de qualquer categoria.
// kind -> arquivos do Chummer (nome do arquivo sem .xml, como no índice mestre) onde procurar o item primeiro
const KSTEM={skill:['skills'],weapon:['weapons'],accessory:['weapons'],armor:['armor'],armormod:['armor'],vehiclemod:['vehicles'],gear:['gear'],program:['gear'],
 cyberware:['cyberware','bioware'],bioware:['bioware','cyberware'],vehicle:['vehicles'],vehiclemod:['vehicles'],quality:['qualities'],spell:['spells'],
 power:['powers'],martialart:['martialarts'],martialarttechnique:['martialarts'],metamagic:['metamagic'],complexform:['complexforms'],
 critterpower:['critterpowers','spiritpowers'],tradition:['traditions','streams'],mentorspirit:['mentors','paragons'],drug:['drugcomponents'],
 lifestyle:['lifestyles'],aiprogram:['programs'],spirit:['critters'],vessel:['vessels']};
const _nx={r:null,n:-1,m:new Map()};
function nameIndex(){const rows=IX.rows;if(rows===_nx.r&&rows.length===_nx.n)return _nx.m;
 _nx.r=rows;_nx.n=rows.length;_nx.m=new Map();
 for(const r of rows){if(r[1]==='books'||!r[0])continue;const k=nz(r[0]);if(k.length<3)continue;let a=_nx.m.get(k);if(!a)_nx.m.set(k,a=[]);a.push(r)}
 return _nx.m}
// variantes do nome como o Chummer procura (sem o que vem depois de ':', sem I/II/III, sem parênteses) + parte antes da vírgula
const cvars=n=>{const o=new Set(nameVars(n)),s=String(n||'');if(s.includes(',')){const k=nz(s.split(',')[0]);if(k.length>=3)o.add(k)}return[...o]};
const pgOk=p=>/^\d+$/.test(String(p==null?'':p));
// fonte e página: as do próprio item, se tiver; senão a linha do índice mestre com o mesmo nome (a do arquivo esperado para o tipo vem primeiro)
function bookRef(kind,names,src,page){
 const nms=[...new Set((names||[]).filter(Boolean).map(String))];
 if(src&&pgOk(page))return{src,page:String(page),row:null};
 const pref=KSTEM[kind]||[],ix=nameIndex();let best=null,rk=1e9;
 for(const nm of nms){
  for(const v of cvars(nm)){const a=ix.get(v);if(!a)continue;
   for(const r of a){if(!r[3]||!pgOk(r[4]))continue;let k=pref.indexOf(r[6]);if(k<0)k=40;if(src&&r[3]!==src)k+=20;if(nz(r[0])!==nz(nm))k+=5;if(k<rk){rk=k;best=r}}}
  if(best&&rk<40)break}
 return best?{src:best[3],page:best[4],row:best}:{src:src||'',page:pgOk(page)?String(page):'',row:null}}

const BNC=new Map();let _bsig='';
const bsig=()=>Object.keys(PM).map(c=>c+':'+PM[c].offset+':'+PM[c].v+':'+(PT[c]?PT[c].length:0)).join('|')+'#'+IX.rows.length;
// devolve {src,page,paras:[título,custo,...parágrafos]|null,how:'cascade'|'snippet'|'',why}  (why = motivo quando não achou o texto)
function bookNote(kind,names,src,page){
 const s=bsig();if(s!==_bsig){BNC.clear();_bsig=s}
 const nms=[...new Set((names||[]).filter(Boolean).map(String))],key=kind+'\u0000'+(src||'')+'\u0000'+(page||'')+'\u0000'+nms.join('\u0001');
 let r=BNC.get(key);
 if(!r){try{r=bookNote0(kind,nms,src,page)}catch(e){r={src:src||'',page:page||'',paras:null,how:'',why:xl('erro: ')+(e&&e.message||e)}}BNC.set(key,r)}
 return r}
function bookNote0(kind,nms,src,page){
 const ref=bookRef(kind,nms,src,page),R={src:ref.src,page:ref.page,paras:null,how:'',why:''},all=ref.row&&ref.row[7]?[ref.row[7]].concat(nms):nms;
 if(!R.src){R.why=xl('sem fonte');return R}
 if(!R.page){R.why=xl('sem página');return R}
 const meta=PM[R.src];
 if(!meta){R.why=xl('sem o PDF de ')+R.src+' ('+bookName(R.src)+xl('): você não enviou');return R}
 if(!(meta.v>=3)){R.why=xl('texto antigo de ')+R.src+' (releia o PDF)';return R}
 if(!PT[R.src]){R.why=xl('texto de ')+R.src+xl(' não carregado');return R}
 // 1) trecho do título até o próximo título; 2) a lógica do Chummer (título em maiúsculas / "Título: texto") e a busca folgada
 const snip=()=>{let why='';for(const nm of all){const r=bookTextWhy(R.src,R.page,nm);if(r[0]){const p=reflow(r[0]);return p.length?[p[0],''].concat(p.slice(1)):null}why=r[1]}R.why=why;return null};
 const casc=()=>{const r=qResolve(R.src,R.page,all);return r&&r.length>2?r:null};
 // qualidades têm linha de custo (BONUS/COST): a busca completa vem primeiro; as demais categorias começam pelo trecho simples
 const ord=kind==='quality'?[[casc,'cascade'],[snip,'snippet']]:[[snip,'snippet'],[casc,'cascade']];
 for(const [f,h] of ord){const p=f();if(p){R.paras=p;R.how=h;R.why='';return R}}
 R.why=R.why||(xl('título não achado em ')+R.src+xl(' (página ')+R.page+')');return R}
Object.assign(window.PDFNOTES,{note:bookNote,ref:bookRef});
