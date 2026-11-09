/* ===== v30: texto do livro ao passar o mouse sobre qualquer item da ficha =====
 * Todo item da ficha que está num livro cujo PDF foi lido (perícias, feitiços, poderes, qualidades, armas, acessórios, armaduras e mods,
 * equipamento, implantes, veículos, programas, formas complexas, metamagia/ecos, artes marciais e técnicas, tradição/stream, mentor,
 * espíritos e seus poderes, drogas, programas de IA, estilo de vida, vessel…) ganha um sublinhado pontilhado. O texto vem do resolvedor
 * único (logic/pdf-resolver.js), o mesmo que alimenta as Notas do .chum5 e do JSON. Sem o PDF lido, a dica mostra o resumo do gerador (fonte, página, regras). */
const BOOKTIP=(()=>{
 const on=()=>{const e=document.getElementById('bkon');return !e||e.checked};
 const REG=[];   // itens sublinhados da ficha atual (o <span> guarda só o índice)
 const ent=(t,kind,names,src,page,info)=>({t:String(t),kind,names:(names&&names.length?names:[t]).map(String),src:src||'',page:page||'',info:info||null});
 // resumo do próprio gerador (o que também vai nas Notas): serve quando o PDF do livro ainda não foi lido
 const STL={damage:'Dano',ap:'PA',mode:'Modo',rc:'CR',ammo:xl('Munição'),accuracy:xl('Precisão'),reach:'Alcance',conceal:xl('Ocultação'),avail:'Disp.',armor:xl('Armadura'),capacity:'Capacidade',devicerating:termo('devicerating'),attack:'Ataque',sleaze:'Sleaze',dataprocessing:xl('Proc. dados'),firewall:'Firewall',handling:'Handling',speed:'Speed',accel:'Accel',body:'Body',pilot:'Pilot',sensor:'Sensor'};
 const stLines=x=>{const st=x.st||{},a=Object.keys(STL).filter(k=>st[k]!==undefined&&st[k]!==''&&st[k]!=='0'&&st[k]!==0).map(k=>STL[k]+' '+String(st[k]).replace(/\{STR\}/g,'STR'));
  const b=[];if(x.rt)b.push(termo('rating')+' '+x.rt);if(x.gr&&x.gr!=='Standard')b.push(termo('grade')+' '+x.gr);if(x.ess)b.push(termo('essence')+' '+fmtNum(x.ess));if(x.cost)b.push(termo('cost')+' '+fmtNy(x.cost));
  return[a.join(' · '),b.join(' · ')].filter(Boolean)};
 const nop=n=>{try{return window.PDFNOTES.nop(n)}catch(e){return''}};
 const KOF={weapon:'weapon',armor:'armor',cyber:'cyberware',bio:'bioware',veh:'vehicle',drone:'vehicle',prog:'program'};
 const safe=(f,d)=>{try{return f()}catch(e){return d}};

 // tudo o que a ficha mostra e que pode estar num livro, por linha
 function collect(c){
  const R={sk:[],tr:[],sp:[],spi:[],spw:[],ech:[],mm:[],spr:[],cf:[],pw:[],mat:[],veh:[],eq:[],q:[],imp:[],ma:[],strm:[],men:[],aip:[],drg:[],life:[],ves:[],wpn:{},acc:{}};
  const cr=!!c.crit;
  Object.keys(c.sk||{}).forEach(n=>R.sk.push(ent(n,'skill',null,'','',()=>safe(()=>{const k=SKA[n],a=k&&c.at?c.at[k]:undefined,r=c.sk[n];return[a!==undefined?t('skill.info.pool',{k:k||'—',a,r,pool:a+r}):t('skill.info',{k:k||'—',r})]},[]))));
  (c.spells||[]).forEach(s=>R.sp.push(ent(s[0],'spell',[s[0]],s[2],'',['Categoria: '+s[1]])));
  (c.powers||[]).forEach(p=>R.pw.push(ent(p.n,cr?'critterpower':'power',null,'','',[xl('Nível ')+(p.l||'—')+(p.x?xl(' · Seleção: ')+p.x:'')])));
  (c.q||[]).forEach(o=>R.q.push(ent(o.n,'quality',[nop(o.n),o.n],o.s,o.pg,[xl('Qualidade ')+(o.t==='Positive'?'positiva':'negativa')+' · '+o.c+xl(' de carma')+(o.x?xl(' · Seleção: ')+o.x:''),...(o.bn||[]).map(b=>xl('Efeito: ')+[b[0],b[1],b[2]].filter(v=>v!==''&&v!==undefined).join(' ')+(b[3]?' ('+b[3]+')':''))])));
  (c.cf||[]).forEach(f=>R.cf.push(ent(f[0],'complexform',[f[0]],f[3])));
  (c.mm||[]).forEach(e=>R.mm.push(ent(e.n,'metamagic',[e.n],e.s||e.src,e.p||e.pg)));
  (c.echoes||[]).forEach(e=>R.ech.push(ent(e.n,'metamagic',[e.n],e.s||e.src,e.p||e.pg)));
  (c.spirits||[]).forEach(s=>{
   R[s.sprite?'spr':'spi'].push(ent(s.n,'spirit',[s.n],'','',[t('esp.dica',{f:s.force,s:tn(s.sprite?'n.tarefa':'n.servico',s.svc??s.force)})]));
   (s.pw||[]).forEach(p=>R.spr.push(ent(p,'critterpower',[p,String(p).replace(/\s*[(\d].*$/,'').trim()])))});
  safe(()=>(c.spirits||[]).filter(x=>!x.sprite).forEach(x=>xdSpiritPw(x.n).forEach(p=>R.spw.push(ent(p,'critterpower',[p,p.replace(/\s*[(\d].*$/,'').trim()])))));
  if(c.talent==='Magician'&&c.trad)safe(()=>{const t=tradInfo(c);R.tr.push(ent(t.n,'tradition',[t.n],t.src,t.pg,['Dreno: '+String(t.dr).replace(/[{}]/g,'')]))});
  if(c.talent==='Technomancer'&&c.stream)safe(()=>{const s=streamInfo(c);R.strm.push(ent(s.n,'tradition',[s.n],s.src,s.pg,['Dreno: '+String(s.dr).replace(/[{}]/g,'')]))});
  if(c.rstream)R.strm.push(ent(c.rstream.replace('Resonant Stream: ',''),'quality',[nop(c.rstream),c.rstream]));
  if(c.mentor)R.men.push(ent(c.mentor.n,'mentorspirit',[c.mentor.n],c.mentor.src,c.mentor.pg,[c.mentor.choice&&xl('Escolha: ')+c.mentor.choice,c.mentor.adv&&'Vantagem: '+c.mentor.adv,c.mentor.dis&&'Desvantagem: '+c.mentor.dis].filter(Boolean)));
  (c.aip||[]).forEach(p=>R.aip.push(ent(p.n,'aiprogram',[p.n],p.src,p.pg,p.rq?['Requer: '+p.rq]:null)));
  (c.drugs||[]).forEach(d=>R.drg.push(ent(d.n,'drug',[d.n],d.src,d.pg,[d.fx,'Quantidade '+d.qty+' · Grau '+d.grade].filter(Boolean))));
  if(c.life)R.life.push(ent(c.life.n,'lifestyle',[c.life.n],c.life.src,'',[termo('cost')+' '+fmtNy(c.life.cost)+xl('/mês · ')+tn('vida.mes',c.life.months)]));
  if(c.vessel)R.ves.push(ent(c.vessel.n,'vessel',[c.vessel.n],c.vessel.src,c.vessel.pg,['Corpo '+c.vessel.bod+xl(' · Armadura ')+c.vessel.arm]));
  if(c.ma){R.ma.push(ent(c.ma.n,'martialart',[c.ma.n],c.ma.s,c.ma.p,['Custo: '+c.ma.c+xl(' de carma')]));(c.ma.tech||[]).forEach(t=>R.ma.push(ent(t.n,'martialarttechnique',[t.n],t.s,t.p)))}
  const accE=a=>ent(a.n,'accessory',[a.n],a.src,a.pg,[a.m&&a.m!=='None'&&'Montagem: '+a.m,a.inc?xl('de fábrica'):(a.cost?termo('cost')+' '+fmtNy(a.cost):'')].filter(Boolean));
  (c.gear||[]).forEach(x=>{
   if(x.nat)return;                                  // ataque desarmado e armas naturais: não são itens de livro
   const e=ent(x.n,KOF[x.cat]||'gear',[x.n],x.src,(x.st||{}).page,stLines(x));
   if(x.cat==='cyber'||x.cat==='bio')R.imp.push(e);
   else if(x.cat==='veh'||x.cat==='drone')R.veh.push(e);
   else if(x.cat==='prog')R.mat.push(e);
   else{if(x.cat==='comm')R.mat.push(e);R.eq.push(e)}
   if(x.cat==='weapon'){R.wpn[x.n]=e;R.acc[x.n]=(x.acc||[]).map(accE)}
   (x.acc||[]).forEach(a=>R.eq.push(accE(a)));
   if(x.cat==='veh'||x.cat==='drone')(x.mods||[]).forEach(m=>R.veh.push(ent(m.n,'vehiclemod',[m.n],m.src,m.pg,[m.rt&&termo('rating')+' '+m.rt,m.inc?xl('de fábrica'):(m.cost?termo('cost')+' '+fmtNy(m.cost):'')].filter(Boolean))));
   else(x.mods||[]).forEach(m=>R.eq.push(ent(m.n,'armormod',[m.n],m.src,m.pg,[m.rt&&termo('rating')+' '+m.rt,m.arm&&m.arm!=='0'&&xl('Armadura ')+m.arm,m.inc?xl('de fábrica'):(m.cost?termo('cost')+' '+fmtNy(m.cost):'')].filter(Boolean))))});
  return R}

 const RW=(w,fl)=>new RegExp('^'+rxEsc(xl(w))+(fl===0?'':'$'));   // o rótulo da linha está no idioma da tela
 const ROWS=[[RW('Habilidades'),'sk'],[RW('Tradição'),'tr'],[RW('Feitiços'),'sp'],[RW('Espíritos vinculados'),'spi'],[RW('Poderes dos espíritos'),'spw'],
  [RW('Submersão',0),'ech'],[RW('Iniciação',0),'mm'],[RW('Sprites registrados'),'spr'],[RW('Formas complexas'),'cf'],[RW('Poderes'),'pw'],[/^Matrix$/,'mat'],
  [RW('Veículos e drones'),'veh'],[RW('Equipamento'),'eq'],[RW('Qualidades'),'q'],[RW('Implantes',0),'imp'],[RW('Implantes ativos',0),'imp'],[RW('Arte marcial'),'ma'],[/^Stream$/,'strm'],
  [/^(Mentor spirit|Paragon)$/,'men'],[RW('Programas de IA'),'aip'],[RW('Drogas'),'drg'],[RW('Estilo de vida'),'life'],[/^Vessel$/,'ves']];

 // o PDF do livro desse item foi lido (texto guardado na versão atual)?
 const covered=e=>{const r=bookRef(e.kind,e.names,e.src,e.page),m=r.src&&PM[r.src];return !!(m&&m.v>=3)};
 const isW=ch=>ch&&/[\p{L}\p{N}]/u.test(ch);
 const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

 // sublinha, dentro de 'host', os nomes da lista que aparecem no texto
 function wrapIn(host,list){
  const by=new Map();list.forEach(e=>{const k=e.t.toLowerCase();if(e.t.length>=2&&!by.has(k))by.set(k,e)});
  const use=[...by.values()].sort((a,b)=>b.t.length-a.t.length);if(!use.length)return;
  const re=new RegExp('('+use.map(e=>reEsc(e.t)).join('|')+')','giu'),tw=document.createTreeWalker(host,NodeFilter.SHOW_TEXT),nodes=[];
  for(let n=tw.nextNode();n;n=tw.nextNode())nodes.push(n);
  nodes.forEach(tn=>{
   if(tn.parentElement.closest('.bk'))return;
   const t=tn.nodeValue;let frag=null,last=0,m;re.lastIndex=0;
   while((m=re.exec(t))){
    const a=m.index,b=a+m[0].length;
    if(isW(t[a-1])||isW(t[b])){re.lastIndex=a+1;continue}            // só palavra inteira
    frag=frag||document.createDocumentFragment();
    if(a>last)frag.appendChild(document.createTextNode(t.slice(last,a)));
    const sp=document.createElement('span');sp.className='bk'+(covered(by.get(m[0].toLowerCase()))?'':' bn');sp.dataset.i=REG.push(by.get(m[0].toLowerCase()))-1;sp.textContent=m[0];frag.appendChild(sp);last=b}
   if(frag){if(last<t.length)frag.appendChild(document.createTextNode(t.slice(last)));tn.parentNode.replaceChild(frag,tn)}})}

 function unwrap(sh){sh.querySelectorAll('.bk').forEach(s=>s.replaceWith(document.createTextNode(s.textContent)));sh.normalize()}

 function annotate(sh,c){
  unwrap(sh);if(!on())return;
  const sec=sh.querySelector('.sec');if(!sec)return;
  let E;try{E=collect(c)}catch(x){console.error('dica-livro',x);return}
  let lastW=null;
  // a "interface limpa" move as linhas para .main (chips) e .more ("Mais detalhes"): percorre em qualquer nível, na ordem da ficha
  [...sec.querySelectorAll('.row, div.note')].forEach(el=>{
   if(el.classList.contains('row')&&el.firstElementChild&&el.lastElementChild){
    const lab=el.firstElementChild,val=el.lastElementChild,L=lab.textContent.trim(),hit=ROWS.find(([re])=>re.test(L));
    if(hit){wrapIn(val,E[hit[1]]||[]);lastW=null;return}
    if(E.wpn[L]){wrapIn(lab,[E.wpn[L]]);lastW=L;return}                // linha de arma do bloco de combate
    if(L===xl('SIN falsa'))wrapIn(lab,[ent(xl('SIN falsa'),'gear',['Fake SIN'])]);
    lastW=null}
   else if(lastW&&el.classList.contains('note')){wrapIn(el,E.acc[lastW]||[]);lastW=null}   // acessórios logo abaixo da arma
   else lastW=null})}

 // ---------- a dica ----------
 let tip=null,hideT=0,curEl=null;
 const mk=()=>{if(tip)return tip;tip=document.createElement('div');tip.id='bktip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
  tip.addEventListener('mouseenter',()=>clearTimeout(hideT));tip.addEventListener('mouseleave',()=>hide());return tip};
 const hide=()=>{clearTimeout(hideT);hideT=setTimeout(()=>{if(tip)tip.style.display='none';curEl=null},180)};
 function body(R,e){
  const bn=R.src?bookName(R.src):'',ref='<span class="note">'+(R.src?esc(bn)+' · '+esc(R.src)+(R.page?' p. '+esc(R.page):''):xl('fonte não informada'))+'</span>';
  if(!R.paras){
   let inf=[];try{inf=typeof e.info==='function'?e.info():(e.info||[])}catch(x){avisa('dica-livro',x)}
   const why=/^sem fonte|^sem página/.test(R.why||'')?xl('Livro e página não conhecidos: leia a pasta do Chummer (painel “Ler a pasta do Chummer e índice mestre”) para o gerador achar onde este item está.'):/^sem o PDF/.test(R.why||'')?xl('Você ainda não enviou o PDF de ')+bookName(R.src)+' ('+R.src+xl('): envie-o no painel “Livros em PDF” para ver aqui o texto do livro.'):/^texto antigo|^texto de .* não carregado/.test(R.why||'')?xl('Leia de novo o PDF de ')+(R.src||xl('este livro'))+xl(' (painel “Livros em PDF”) para ver aqui o texto do livro.'):xl('Texto do livro não achado: ')+(R.why||'?');
   return '<div class="bkh"><b>'+esc(e.t)+'</b> '+ref+'</div>'+inf.filter(Boolean).map(l=>'<p>'+esc(l)+'</p>').join('')+'<div class="note">'+esc(why)+'</div>'+
    (R.src&&BLOB[R.src]?'<div class="note"><a href="#" data-a="open" data-b="'+esc(R.src)+'" data-p="'+esc(R.page)+xl('">abrir o PDF nessa página</a></div>'):'')}
  const P=R.paras,out=[];let n=0;
  for(const p of P.slice(2)){if(n>2600){out.push(xl('<p class="note">… (o texto completo está no livro)</p>'));break}out.push('<p>'+esc(p)+'</p>');n+=p.length}
  return '<div class="bkh"><b>'+esc(P[0]||e.t)+'</b> '+ref+'</div>'+(P[1]?'<div class="bkc">'+esc(P[1]).replace(/\n/g,'<br>')+'</div>':'')+out.join('')+
   (BLOB[R.src]?'<div class="note"><a href="#" data-a="open" data-b="'+esc(R.src)+'" data-p="'+esc(R.page)+xl('">abrir o PDF nessa página</a></div>'):'')}
 function place(el){
  const t=tip,vw=innerWidth,vh=innerHeight;t.style.left='0px';t.style.top='0px';t.style.display='block';
  const w=t.offsetWidth,h=t.offsetHeight,r=el.getBoundingClientRect();let x,y=null;
  if(el.dataset.side){                       // lista de sugestões: a nota abre ao lado da lista, sem cobrir as opções
   const hr=(el.closest('.eac')||el).getBoundingClientRect();
   x=hr.right+8;if(x+w>vw-8)x=hr.left-w-8;
   if(x>=8)y=Math.min(Math.max(8,r.top),Math.max(8,vh-h-8));else x=Math.min(Math.max(8,hr.left),vw-w-8)}
  else x=Math.min(Math.max(8,r.left),vw-w-8);
  if(y===null){y=r.bottom+6;if(y+h>vh-8)y=r.top-h-6>=8?r.top-h-6:Math.max(8,vh-h-8)}
  t.style.left=x+'px';t.style.top=y+'px'}
 async function show(el){
  const e=el._bk||REG[+el.dataset.i];if(!e)return;clearTimeout(hideT);curEl=el;
  const r=bookRef(e.kind,e.names,e.src,e.page);try{await ensureText(r.src)}catch(x){avisa('dica-livro',x)}
  if(curEl!==el)return;
  mk().innerHTML=body(bookNote(e.kind,e.names,e.src,e.page),e);place(el)}
 document.addEventListener('mouseover',ev=>{const b=ev.target.closest&&ev.target.closest('.bk,.bkx');if(b&&b!==curEl)show(b);else if(b)clearTimeout(hideT)});
 document.addEventListener('mouseout',ev=>{const b=ev.target.closest&&ev.target.closest('.bk,.bkx');if(b&&!(ev.relatedTarget&&tip&&tip.contains(ev.relatedTarget)))hide()});
 document.addEventListener('click',ev=>{                       // no toque (sem mouse) o clique abre e fecha a dica
  const b=ev.target.closest&&ev.target.closest('.bk,.bkx');
  if(b&&matchMedia('(hover: none)').matches){if(curEl===b&&tip&&tip.style.display==='block'){tip.style.display='none';curEl=null}else show(b);return}
  if(tip&&tip.style.display==='block'&&!(ev.target.closest&&ev.target.closest('#bktip'))){tip.style.display='none';curEl=null}});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&tip){tip.style.display='none';curEl=null}});

 // ---------- ligação à ficha ----------
 function refresh(){REG.length=0;if(tip)tip.style.display='none';
  document.querySelectorAll('.sheet[data-id]').forEach(sh=>{const c=charOf(SESSAO.fichas,sh);if(c)annotate(sh,c)})}
 decoratePage(()=>{REG.length=0});
 decorateSheet(annotate);
 try{const e=document.getElementById('bkon'),v=localStorage.getItem('sr5_bkon');
  if(e){if(v!==null)e.checked=v==='1';e.addEventListener('change',()=>{try{localStorage.setItem('sr5_bkon',e.checked?'1':'0')}catch(x){avisa('dica-livro',x)}refresh()})}}catch(x){avisa('dica-livro',x)}
 // itens do painel Editar (chips e sugestões) não passam pela anotação da ficha: ganham a mesma dica por 'attach'
 const attach=(el,e)=>{el.classList.add('bkx');el._bk=e;return el};
 const close=()=>{clearTimeout(hideT);if(tip)tip.style.display='none';curEl=null};
 return{refresh,collect,annotate,ent,attach,show,close,lines:stLines,kof:KOF}})();
window.BOOKTIP=BOOKTIP;
