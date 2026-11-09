#!/usr/bin/env node
// Testes de regressão do gerador. Uso: node tools/testar.js   (precisa do pacote "playwright"; defina PW=/caminho/node_modules/playwright se não estiver no path)
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const root=path.join(__dirname,'..'),out=path.join(os.tmpdir(),'gerador-teste.html');
let pw;for(const p of [process.env.PW,'playwright','/opt/npm-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(p);break}catch(e){}}
if(!pw){console.error('playwright não encontrado (defina PW=...)');process.exit(2)}
cp.execFileSync('node',[path.join(root,'build.js'),'--check'],{stdio:'inherit'});
cp.execFileSync('node',[path.join(__dirname,'mapa-camadas.js')],{stdio:'inherit'});   // falha se alguém reatribuir uma função que tem camadas
/* frases montadas: plural com parêntese ("arquivo(s)") não pode voltar; use tn('chave', n) com as duas formas inteiras (logic/i18n.js, data/textos-plural.js) */
{const RE=/\b(?:arquivo|ficha|item|serviço|tarefa|mês|livro|página|resultado|dado|NPC|travad|importad|guardad|carregad|marcad|rerrolad|favorit|complet|reconstruíd|nível)\w*\((?:s|es|ns|is|a|as)\)/,ruim=[];
 const ler=d=>fs.readdirSync(d,{withFileTypes:true}).forEach(n=>{const f=path.join(d,n.name);if(n.isDirectory())return ler(f);if(!/\.(js|html)$/.test(n.name))return;
  fs.readFileSync(f,'utf8').split('\n').forEach((l,i)=>{if(RE.test(l)&&!/^\s*(\/\*|\*|\/\/)/.test(l)&&!/→|"N nível\(is\)/.test(l))ruim.push(path.relative(root,f)+':'+(i+1))})});
 ler(path.join(root,'src'));if(ruim.length){console.error('FALHA frases montadas com "(s)": '+ruim.join(', '));process.exit(1)}}
cp.execFileSync('node',[path.join(root,'build.js'),'--out',out],{stdio:'ignore'});

/* catálogo de armas de teste: o embutido só tem 8 armas (o resto vem do weapons.xml importado), então os testes de kits, arcos e metralhadoras montam um */
const HELP=`window.__catW=function(){const SUB={'Steyr TMP':'Machine Pistols','Ares Alpha':'Assault Rifles','Stoner-Ares M202':'Medium Machine Guns','Aztechnology Striker':'Missile Launchers','Ingram Smartgun X':'Submachine Guns','Ares Predator V':'Heavy Pistols','Streetline Special':'Holdouts'};
 const names=[...new Set(Object.values(KITP).flatMap(k=>(k.w||[]).map(w=>w.n)))],have=new Set(ITEMS.filter(i=>i[0]==='weapon').map(i=>i[1])),n0=ITEMS.length;
 names.forEach(n=>{if(have.has(n))return;const bow=/^Bow \\(Rating/.test(n),bl=/Knife|Sword|Blade|Katana|Club|Bat\\b|Baton|Axe|Staff|Machete|Spear/.test(n),sub=SUB[n]||(bow?'Bows':bl?'Blades':'Light Pistols');
  ITEMS.push(['weapon',n,/Medium Machine/.test(sub)?1500:/Missile/.test(sub)?1200:bow?300:/Assault/.test(sub)?900:400,'SR5',0,'t-'+n,sub,{type:bl?'Melee':'Ranged',conceal:'0',accuracy:'5',reach:'0',damage:'8P',ap:'-',mode:'SA',rc:'0',ammo:bow?'1(m)':/Medium Machine/.test(sub)?'100(belt)':/Missile/.test(sub)?'1(m)':bl?'-':'20(c)',avail:'4R',page:'1'}])});
 for(let r=1;r<=12;r++){const n='Bow (Rating '+r+')';if(!ITEMS.some(i=>i[1]===n))ITEMS.push(['weapon',n,200+40*r,'SR5',0,'t-bow'+r,'Bows',{type:'Ranged',accuracy:'6',reach:'0',damage:(r+2)+'P',ap:'-',mode:'SS',rc:'0',ammo:'1(m)',avail:'2',page:'1'}])}
 return n0};`;
const T={
 'frases: plural por chave e frase inteira com {variáveis}':()=>{let bad=0;const ok=(a,b)=>{if(a!==b){bad++;console.log('  esperado',JSON.stringify(b),'veio',JSON.stringify(a))}};
  setIdioma('pt');ok(tn('n.servico',1),'1 serviço');ok(tn('n.servico',3),'3 serviços');ok(tn('n.servico',0),'0 serviços');ok(tn('vida.mes',2),'2 meses pagos');
  ok(t('cond.caixas',{n:4,f:10,s:6,a:10}),'Com 4 de 10 caixas de dano físico (ou 6 de 10 de atordoante, o que vier primeiro): ');ok(t('loy.media',{n:'3,5'}),'lealdade média ao líder 3,5/6');
  ok(t('cond.pericia',{p:'Pistols',r:6}),'perícia Pistols 6');ok(tn('ficha.imp',1,{c:tn('ficha.completa',1),r:''}),'1 ficha importada (1 completa).');
  ok(listaE(['RG','HT','R5']),'RG, HT e R5');
  setIdioma('en');ok(tn('n.servico',1),'1 service');ok(tn('n.servico',2),'2 services');ok(t('loy.media',{n:'3.5'}),'average loyalty to the leader 3.5/6');ok(listaE(['RG','HT','R5']),'RG, HT, and R5');
  ok(t('skill.info',{k:'AGI',r:5}),'Linked attribute: AGI · Rating 5');
  /* nenhuma chave de frase fica com {variável} sem preencher quando o chamador passa todas */
  const sobra=Object.keys(I18N.pt).filter(k=>/^(n|vida|esp|imp|indice|pdf|rr|ug|fav|ficha|pasta|livros|cond|gancho|ui|mesa|loy|grupo|skill|bn)\./.test(k)&&(I18N.en[k]==null||I18N.en[k]===''));if(sobra.length){bad++;console.log('  sem texto em inglês:',sobra.join(', '))}
  setIdioma('pt');return bad},
 'frases: idioma en gera grupos e critters sem erro nem chave solta':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;setIdioma('en');try{for(let i=0;i<20;i++){SESSAO.fichas=genGroup(4,5,'__auto','rand');renderNPC(SESSAO.fichas);const h=document.getElementById('out').innerHTML;if(/\{(n|f|s|a|pf|txt|p|r)\}/.test(h))bad++}}catch(e){bad++;console.log('  erro em en:',e.message)}setIdioma('pt');return bad},
 'formato: tela segue o idioma, arquivo fica fixo em en-US, termos de regra por tabela':()=>{let bad=0;const ok=(a,b)=>{if(a!==b)bad++};
  setIdioma('pt');ok(fmtNy(1234),'¥ 1.234');ok(fmtDec(3.5,1),'3,5');ok(fmtNum(5.5),'5,5');ok(fmtNum(1234.567),'1.234,57');ok(termo('grade'),'Grau');ok(termo('essence'),'Essência');ok(termo('rating'),'Rating');
  setIdioma('en');ok(fmtNy(1234),'¥1,234');ok(fmtDec(3.5,1),'3.5');ok(termo('grade'),'Grade');ok(termo('essence'),'Essence');
  setIdioma('pt');ok(nyArquivo(5000),'5,000');ok(fmtNum(''),'');return bad},
 'armas: todo NPC armado tem arma':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const ts=Object.keys(KIT).filter(k=>KIT[k].pw===undefined||KIT[k].pw>=1);let bad=0;
  for(let i=0;i<300;i++){const c=genNPC([1,3,5,8,12][i%5],ts[i%ts.length],'rand','rand');if(!c.gear.some(g=>g.cat==='weapon'&&!g.nat&&!/Unarmed/.test(g.n)))bad++}return bad},
 'implantes: disponibilidade <=12 abaixo do nível 7':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const t=Object.keys(TYPES);let bad=0;
  for(let i=0;i<200;i++){const c=genNPC([2,3,4,5,6][i%5],t[i%t.length],'rand','rand');c.gear.filter(g=>g.cat==='cyber'||g.cat==='bio').forEach(g=>{const v=iavm(g.st.avail,g.rt||1,1),gm=(IMPG.find(x=>x[0]===g.gr)||[0,0,0,0])[3];if(v&&v.v+gm>12)bad++})}return bad},
 'relações: nenhum {{rid}} sobra após relTxt':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;for(let i=0;i<40;i++){SESSAO.fichas=genGroup(5,5,'__auto','rand');SESSAO.fichas.forEach(c=>(c.npc.rel||[]).forEach(r=>{if(/\{\{/.test(relTxt(r)))bad++}))}return bad},
 'relações: renomear membro atualiza o parceiro':()=>{BOOKS.forEach(b=>SEL.add(b[0]));for(let i=0;i<30;i++){SESSAO.fichas=genGroup(5,5,'__auto','rand');const a=SESSAO.fichas.find(c=>(c.npc.rel||[]).some(r=>/\{\{/.test(r)));if(a){const m=a.npc.rel.find(r=>/\{\{/.test(r)),id=m.match(/\{\{(\w+)\}\}/)[1],b=SESSAO.fichas.find(c=>c.npc.rid===id);b.alias='ZZ_Teste';return relTxt(m).includes('ZZ_Teste')?0:1}}return 0},
 'semente: mesma semente gera o mesmo grupo':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const strip=o=>JSON.stringify(o,(k,v)=>/^(g|_id|id|rid|gid|guid)$/.test(k)?undefined:typeof v==='string'?v.replace(/\{\{\w+\}\}/g,'{{}}').replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'U'):v);
  const run=s=>{const o=Math.random;Math.random=mkRng(hashSeed(s));try{return strip(genGroup(5,5,'__auto','rand'))}finally{Math.random=o}};let bad=0;
  for(const s of ['123','abc','777']){const a=run(s);if(run(s)!==a||run(s)!==a)bad++}return bad},
 'critters: todos os embutidos (critters.json) geram ficha e exportam':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=CRITX.length>=269&&CRITX.every(x=>CRIT.some(c=>c.n===x.n&&c.id===x.id))?0:1;
  CRIT.forEach(k=>{try{const c=genCritter(4,k.n);if(!c.powers.length&&k.px.length)bad++;if(Object.values(c.at).some(v=>typeof v!=='number'||isNaN(v)))bad++;if(String(critXML(c)).length<200)bad++}catch(e){bad++}});return bad},
 'critters: condutas ligadas a ações do livro e a habilidades da ficha':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0,n=0,ac=0,sk=0,N=300;
  for(let i=0;i<N;i++){const c=genCritter(1+i%12,'rand'),k=critCondOf(c);if(!k){bad++;continue}
   if(k.hiS.some(Boolean)||k.loS.some(Boolean))sk++;
   [['hi',k.hi],['lo',k.lo]].forEach(([p,L])=>L.forEach((t,j)=>{n++;const o=ccInfo(c,k,p,j);if(o.ac.length)ac++;if(o.ac.some(a=>!ACO[a]))bad++;if(o.sk&&!(c.sk[o.sk.s]>0))bad++;if(o.sk&&o.sk.r!==c.sk[o.sk.s])bad++}));
   if(!acResumoCrit(c).length)bad++}
  if(ac/n<.9)bad++;if(sk/N<.6)bad++;
  SEL.clear();SEL.add('SR5');for(let i=0;i<60;i++){const c=genCritter(6,'rand'),k=critCondOf(c);['hi','lo'].forEach(p=>k[p].forEach((t,j)=>ccInfo(c,k,p,j).ac.forEach(a=>{if(ACO[a][2]!=='SR5')bad++})))}   // só ação de livro marcado
  return bad},
 'pdfs: livros marcados sem PDF ficam avisados na lista e no painel':()=>{let bad=0;const PM=PDFX.PM,pdfResumo=PDFX.resumo,keep=JSON.parse(JSON.stringify(PM)),sel=[...SEL];Object.keys(PM).forEach(k=>delete PM[k]);SEL.clear();SEL.add('SR5');SEL.add('RG');drawBooks();
  const R=pdfResumo(),L=()=>document.getElementById('bklist').textContent,P=()=>document.getElementById('pdfbooks').textContent;
  if(!R.falta.includes('SR5')||!R.falta.includes('RG')||R.tem.length)bad++;
  if(!/sem PDF/.test(L())||!/Livros sem PDF/.test(P())||!/Nenhum PDF enviado/.test(P())||!/sem PDF/.test(document.querySelector('#pdfp>summary').textContent)&&!/nenhum PDF/.test(document.querySelector('#pdfp>summary').textContent))bad++;
  PM.SR5={file:'a.pdf',offset:0,pages:3,kept:false,v:3};drawBooks();const R2=pdfResumo();
  if(R2.falta.includes('SR5')||!R2.falta.includes('RG')||!R2.tem.includes('SR5'))bad++;
  if(!/PDF ✔/.test(L())||!/faltam PDFs de 1 livro/.test(document.querySelector('#pdfp>summary').textContent))bad++;
  SEL.delete('RG');drawBooks();if(R2.falta.length!==1||pdfResumo().falta.length||!/todos os marcados têm PDF/.test(document.querySelector('#pdfp>summary').textContent))bad++;
  Object.keys(PM).forEach(k=>delete PM[k]);Object.assign(PM,keep);SEL.clear();sel.forEach(x=>SEL.add(x));drawBooks();return bad},
 'critters: 3 condutas altas e 3 baixas sem chaves soltas':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;for(let i=0;i<100;i++){const c=genCritter(1+i%12,'rand'),k=critCondOf(c);if(!k||k.hi.length!==3||k.lo.length!==3||[...k.hi,...k.lo].some(x=>!x||/[{}]/.test(x)))bad++}return bad},
 'grupos: táticas completas em todas as composições':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;for(const k of Object.keys(COMPS)){GEN.comp=k;const L=genGroup(5,5,'__auto','rand'),T=grupoTaticaTexto(L).join(' ');if(/[{}]|undefined/.test(T)||!/Doutrina/.test(T)||!/sem rota de fuga/.test(T)||!/aliado ferido/.test(T)||!/aliado importante/.test(T))bad++}return bad},

 /* ---- v43 ---- */
 'critters: Watcher, Homunculus e Corps Cadavre têm temperamento de servo (sem fuga, sem chaves soltas)':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;
  for(const nm of ['Watcher','Homunculus (Average Material)','Homunculus (Fragile)','Corps Cadavre'])for(let i=0;i<25;i++){const c=genCritter(1+i%12,nm),k=critCondOf(c);
   if(!k||k.tp!=='servo'||k.hi.length!==3||k.lo.length!==3||[...k.hi,...k.lo].some(x=>!x||/[{}]/.test(x))||/foge da luta|dá meia-volta|sem rota de fuga/.test(k.lo.join(' ')))bad++}
  CRIT.filter(x=>/Ritual/.test(x.cat||'')).forEach(x=>{const c=genCritter(4,x.n),k=critCondOf(c);if(!k||k.tp!=='servo')bad++});
  CRIT.filter(x=>!/Ritual/.test(x.cat||'')).filter((x,i)=>i%6===0).forEach(x=>{let c;try{c=genCritter(4,x.n)}catch(e){return}const k=critCondOf(c);if(k&&k.tp==='servo')bad++})   // servo só para os seres rituais
  return bad},
 'taticas: sem a lista de ações por estilo nem multiplicadores por traço (dado morto removido)':()=>{let bad=0;Object.values(TAT_ST).forEach(o=>{if('a' in o||!o.o)bad++});Object.values(TAT_TR).forEach(o=>{if('m' in o||!o.p||!o.e)bad++});return bad},
 'acoes: Matrix e ações sociais têm regra própria e sem falso positivo':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;const has=(t,n)=>acRefs(t).includes(n);
  if(!has('Comanda a luta pela Matrix: abre as portas na hora certa e só então a equipe entra','Hack on the Fly (1 Mark)'))bad++;
  if(!has('Cobertura pela Matrix: zera os sensores inimigos','Jam Signals')||has('Cobertura pela Matrix: zera os sensores inimigos','Take Cover'))bad++;
  if(!has('Usa Hermes Chariot para abrir portas e desligar câmeras antes da entrada','Control Device (Simple)'))bad++;
  if(!has('Procura outros hackers e caça a persona deles.','Trace Icon'))bad++;
  for(const t of ['Ataca primeiro mago, decker ou rigger, antes que se escondam','Guarda as costas de um aliado específico: o decker','Protege os mais fracos do grupo: o médico, o decker e o mago'])if(has(t,'Matrix Perception')||has(t,'Use Skill'))bad++;
  if(has('Procura o conjurador ou o decker dos inimigos: corta as comunicações deles','Cast Spell (Indirect, Single-target Combat)'))bad++;
  if(has('abaixa a arma por um instante e pergunta quanto estão pagando','Drop Prone')||!has('abaixa a arma por um instante e pergunta quanto estão pagando','Use Skill'))bad++;
  for(const t of ['Domina pela presença: a ameaça vem antes do golpe','Esconde o que sabe, mente primeiro e luta por último','vende os aliados por um preço'])if(!has(t,'Use Skill'))bad++;
  if(!has('cai e se finge de morto para escapar quando puderem','Playing Possum (Performance)'))bad++;
  if(has('recua em ordem, cobrindo-se atrás dos aliados sem avisar','Suppressive Fire'))bad++;
  return bad},
 'equipamento: arma do kit leva os acessórios do kit e a munição especial do kit':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const n0=__catW();let bad=0,vistas=0,sg=0;
  try{for(let i=0;i<400;i++){const c=genNPC(8+i%5,['Operações especiais (spec ops)','Resposta de alta ameaça (HTR)','Guarda-costas'][i%3],'rand','rand');
   c.gear.filter(w=>w.cat==='weapon'&&w.pkn).forEach(w=>{vistas++;
    if(w.pkn==='Ares Alpha Gunner Pack'&&w.n==='Ares Alpha'){if(!w.acc.some(a=>a.n==='Shock Pad'))bad++;if(w.acc.filter(a=>a.n==='Spare Clip').length!==5)bad++}
    if(/Smartgun/.test(w.pkn)&&!w.acc.some(a=>/^Smartgun/.test(a.n)))sg++;
    if(w.pkam&&w.pkam.length&&!w.pkam.some(([n])=>c.gear.some(g=>g.n===n&&g.sub==='Ammunition')))bad+=0})}
  }finally{ITEMS.length=n0}
  if(!vistas)return 'nenhuma arma de kit gerada';
  /* munição especial: pelo menos alguns NPCs com Ares Alpha do kit levam APDS ou Explosive */
  let am=0,tot=0;ITEMS.length;const n1=__catW();try{for(let i=0;i<300;i++){const c=genNPC(10+i%3,'Operações especiais (spec ops)','rand','rand');c.gear.filter(w=>w.pkn==='Ares Alpha Gunner Pack'&&w.n==='Ares Alpha').forEach(()=>{tot++;if(c.gear.some(g=>/^Ammo: (APDS|Explosive)/.test(g.n)))am++})}}finally{ITEMS.length=n1}
  if(tot&&!am)bad++;
  return bad+sg},
 'equipamento: Rocketeer e metralhadora média valem em perfil sem arma de apoio':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const n0=__catW();let hit=0,semX=KIT['Contrabandista']&&!KIT['Contrabandista'].x;
  try{for(let i=0;i<900;i++){const c=genNPC(9+i%4,'Contrabandista','rand','rand');if(c.gear.some(w=>w.cat==='weapon'&&/^(Stoner-Ares M202|Aztechnology Striker)$/.test(w.n)))hit++}}finally{ITEMS.length=n0}
  return semX&&hit>0?0:1},
 'equipamento: nível do arco não passa da FOR nem de 3 + nível (kits e arma de apoio, níveis 1 a 12)':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const n0=__catW();let bad=0,vistos=0;
  const rt=w=>+((/\(Rating (\d+)\)/.exec(w.n)||[])[1])||0;
  try{
   /* 1) direto: kits de arco e sorteio de arma de apoio, para cada FOR e cada nível */
   for(let pr=1;pr<=12;pr++)for(let str=1;str<=10;str++){const c=genNPC(Math.min(pr,12),'Caçador de recompensas (bounty hunter)','rand','rand');c.at.STR=str;eqBowSet(c,pr);const lim=Math.min(xE(c,'STR'),3+pr);
    const pool=poolItems().filter(i=>i[0]==='weapon'),K={wk:[['Basic Bowman Pack',1,0],['Advanced Bowman Pack',1,0]],wkp:1};
    for(let k=0;k<3;k++){const PW=eqPackWeapons(K,pool.concat(eqPoolX()),pr,1e9);if(PW)PW.filter(w=>w.sub==='Bows').forEach(w=>{vistos++;if(rt(w)>lim)bad++});
     const p=eqPickWeapon([['Bows',0,1]],eqPoolX(),pr,1e9,[]);if(p){vistos++;if(rt({n:p[1]})>lim)bad++}}}
   /* 2) pela geração: nenhum arco na ficha passa da FOR final nem de 3 + nível */
   for(let i=0;i<500;i++){const pr=1+i%12,c=genNPC(pr,['Caçador de recompensas (bounty hunter)','Mercenário (merc)'][i%2],'rand','rand'),lim=Math.min(xE(c,'STR'),3+pr);
    c.gear.filter(w=>w.cat==='weapon'&&w.sub==='Bows').forEach(w=>{vistos++;if(rt(w)>lim)bad++})}
  }finally{ITEMS.length=n0}
  return vistos?bad:'nenhum arco gerado'},
 'equipamento: kits Runnerhub, ShadowNET e Bug-out Bag não duplicam SIN, credstick nem droga':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0,rh=0;
  for(let i=0;i<600;i++){const c=genNPC(1+i%12,['Informante / fixer','Contrabandista','Mercenário (merc)','Caçador de recompensas (bounty hunter)','Detetive / investigador'][i%5],'rand','rand');
   const nm=c.gear.map(g=>g.n),dup=a=>a.length!==new Set(a).size;
   if(dup(nm.filter(n=>/^Certified Credstick/.test(n)||n==='Fake SIN')))bad++;
   if(nm.some(n=>/^(Hermes Ikon|Meta Link|Micro-Transceiver|Subvocal Mic|AR Gloves)$/.test(n)))rh++}
  return rh?bad:'nenhum item de kit Runnerhub/ShadowNET'},
 'equipamento: sem weapons.xml importado há aviso e nenhum NPC armado sai sem arma':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;
  if(eqSemWeaponsXml()||eqAvisoArmas())bad++;   // o catálogo completo já vem embutido
  const salvo=ITEMS.slice(),w=ITEMS.filter(i=>i[0]==='weapon'),manter=new Set(w.slice(0,8));
  try{ITEMS.splice(0,ITEMS.length,...salvo.filter(i=>i[0]!=='weapon'||manter.has(i)));   // simula o armazenamento antigo, só com 8 armas
   if(!eqSemWeaponsXml()||!eqAvisoArmas())bad++;
   drawBooks();const av=document.getElementById('armaaviso');if(!av||av.hidden||!av.textContent)bad++;
   const ts=Object.keys(KIT).filter(k=>KIT[k].pw===undefined||KIT[k].pw>=1);
   for(let i=0;i<200;i++){const c=genNPC([1,3,6,9,12][i%5],ts[i%ts.length],'rand','rand');if(!c.gear.some(g=>g.cat==='weapon'&&!g.nat&&!/Unarmed/.test(g.n)))bad++}
  }finally{ITEMS.splice(0,ITEMS.length,...salvo)}
  drawBooks();const a2=document.getElementById('armaaviso');if(eqSemWeaponsXml()||(a2&&!a2.hidden))bad++;
  return bad},
 'aviso HT/RG existe':()=>typeof drawBooksAviso==='function'?0:1,
 'libs embutidas (pdf.js e JSZip)':()=>(document.getElementById('pdfjs-main')&&document.getElementById('pdfjs-worker')&&typeof JSZip==='function')?0:1,
 'catálogo: sem duplicatas, sem itens (2050) nem armaduras de nicho no sorteio':()=>{BOOKS.forEach(b=>SEL.add(b[0]));
  const k=ITEMS.map(i=>i[0]+'|'+i[1]+'|'+i[3]);let bad=k.length-new Set(k).size;
  const ts=Object.keys(TYPES),NO=/\(2050\)|Bunker Gear|Diving|Survival Bubble|Coldsuit|Drysuit|EE Suit|HEL Suit|Magnetic Boots|Team Jersey|Nightshade|Sleeping Tiger|Murder Armor|Macuahuitl|Pole Arm|Halberd|Commlink (Taser|Holdout|Knife)/;
  for(let i=0;i<400;i++){const c=genNPC([1,3,5,8,11][i%5],ts[i%ts.length],'rand','rand');if(c.gear.some(g=>NO.test(g.n)))bad++}return bad},
 'comlinks e drones: seguem o perfil e o nível':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0;const ts=Object.keys(KIT);
  for(let i=0;i<500;i++){const t=ts[i%ts.length],K=KIT[t],pr=[1,3,5,8,11][i%5],c=genNPC(pr,t,'rand','rand');if((c.meta&&META[c.meta]||{}).ai)continue;
   const cl=c.gear.filter(g=>g.cat==='comm'&&g.sub==='Commlinks');if(!cl.length)bad++;
   cl.forEach(g=>{const dr=+((g.st||{}).devicerating)||0;if(dr<1||dr>EQ_CL_DR(pr)+(K.cd||0)+1+1||dr<EQ_CL_DR(pr)+(K.cd||0)-1-1)bad++});
   c.gear.filter(g=>g.cat==='drone'&&g.bs).forEach(g=>{if(!K.dr||!(K.dr.l||[]).some(([rx])=>new RegExp(rx).test(g.n)))bad++})}return bad},
 'perfis: todas as ocupações (28) geram ficha com kit, perfil e notas':()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=Object.keys(TYPES).length<28?1:0;
  Object.keys(TYPES).forEach(t=>{if(!KIT[t]||!OCC_PERFIL[t]||!OCC_DOUTRINA[t]||!OCC_TRACO_W[t])bad++;
   for(let i=0;i<8;i++){const c=genNPC([1,4,7,10][i%4],t,'rand','rand');if(!c.gear.length&&!(META[c.meta]||{}).ai)bad++;ganchoNotas(c)}});return bad},
 /* v45.1/45.2: barra Ajustar, travas por parte, desfazer e atributos por orçamento */
 'barra Ajustar: rerrolar cada parte e desfazer volta exatamente ao estado anterior':async()=>{BOOKS.forEach(b=>SEL.add(b[0]));const J=c=>{const o=JSON.parse(JSON.stringify(c));delete o._id;return o},ty=Object.keys(TYPES),L={weap:'Armas',armor:'Armadura',misc:'Equipamento',imp:'Implantes',skill:'Habilidades',qual:'Qualidades',attr:'Atributos',cond:'Condutas',pers:'Perfil de atuação'},ks=Object.keys(L),w=()=>new Promise(r=>setTimeout(r,30));let bad=0,n=0;
  for(let i=0;i<45;i++){SESSAO.fichas=[genNPC(1+i%10,ty[i%ty.length],'','rand')];renderNPC(SESSAO.fichas);const btn=[...document.querySelectorAll('.ajusta .ajr')].find(x=>x.getAttribute('aria-label')==='Rerrolar só: '+L[ks[i%ks.length]]);if(!btn)continue;const a=J(SESSAO.fichas[0]);btn.click();await w();if(JSON.stringify(a)===JSON.stringify(J(SESSAO.fichas[0])))continue;const u=document.querySelector('.ajusta .ajd');if(u.disabled){bad++;continue}u.click();await w();n++;if(JSON.stringify(a)!==JSON.stringify(J(SESSAO.fichas[0])))bad++}
  return n<20?bad+1:bad},
 'travas por parte: armas e armadura travadas sobrevivem ao "Rerrolar o resto"':async()=>{BOOKS.forEach(b=>SEL.add(b[0]));const W=g=>(g.cat==='weapon'&&!g.nat)||(g.cat==='gear'&&g.sub==='Ammunition'),nm=(c,f)=>c.gear.filter(f).map(g=>g.n).sort().join('|');let bad=0;
  for(let i=0;i<6;i++){SESSAO.fichas=[genNPC(8,'Mercenário (merc)','','rand')];renderNPC(SESSAO.fichas);const a0=nm(SESSAO.fichas[0],W),r0=nm(SESSAO.fichas[0],g=>g.cat==='armor');
   [...document.querySelectorAll('.ajusta .ajp')].filter(x=>/^(Armas|Armadura)$/.test(x.textContent.trim())).forEach(x=>x.querySelector('.ajl').click());
   document.querySelector('.ajusta .aja').click();await new Promise(r=>setTimeout(r,60));const c=SESSAO.fichas[0];if(nm(c,W)!==a0||nm(c,g=>g.cat==='armor')!==r0)bad++;
   const LK=c.lock;if(!(LK.weap&&LK.armor&&!LK.misc&&!LK.gear))bad++}
  return bad},
 'atributos: soma estável por nível, folga do 6 ao 10 e rerrolar só redistribui':()=>{BOOKS.forEach(b=>SEL.add(b[0]));const A=ATTR,S=c=>A.reduce((x,k)=>x+c.at[k],0);let bad=0;
  for(const pr of [2,5,8,10]){const s=[],cap=[];let up=0,dd=0;for(let i=0;i<60;i++){const c=genNPC(pr,'Mercenário (merc)','','Human');s.push(S(c));cap.push(A.every(k=>c.at[k]>=capNat('Human',k,pr))?1:0);
    const n=rerollChar(snapChar(c),'attr');dd=Math.max(dd,Math.abs(S(n)-S(c)));if(A.every(k=>n.at[k]>=c.at[k])&&A.some(k=>n.at[k]>c.at[k]))up++}
   const m=s.reduce((x,y)=>x+y,0)/s.length,sd=Math.sqrt(s.reduce((x,y)=>x+(y-m)**2,0)/s.length);
   if(sd>1.3)bad++;               // a soma não pode oscilar como antes (nível 2: de 17 a 39)
   if(dd>2)bad++;                 // rerrolar atributos mantém o total (±2 de arredondamento do carma)
   if(up>3)bad++;                 // quase nunca "só sobe": o total é redistribuído
   if(pr>=6&&cap.some(x=>x))bad++} // do 6 ao 10 nunca todos no teto: sobra o que redistribuir
  return bad},
 'desfazer: apagar ficha, apagar não favoritas e rerrolar todos voltam; mudar o nível também':async()=>{BOOKS.forEach(b=>SEL.add(b[0]));const w=ms=>new Promise(r=>setTimeout(r,ms)),ids=()=>SESSAO.fichas.map(c=>c._id).join(),als=()=>SESSAO.fichas.map(c=>c.alias).join('|'),sg=()=>SESSAO.fichas.map(c=>JSON.stringify([c._id,c.at,c.gear.map(g=>g.n)])).join();let bad=0;
  UG.length=0;SESSAO.fichas=[1,2,3,4].map(i=>genNPC(3+i,'Mercenário (merc)','','rand'));renderNPC(SESSAO.fichas);const a0=als(),i0=ids(),g0=sg();
  document.querySelectorAll('.sheet')[1].querySelector('.db').click();if(SESSAO.fichas.length!==3)bad++;ugUndo();if(als()!==a0||ids()!==i0)bad++;
  document.getElementById('rrall').click();document.getElementById('rrall').click();await w(100);if(sg()===g0)bad++;if(ids()!==i0)bad++;ugUndo();if(sg()!==g0)bad++;
  document.getElementById('dall').click();document.getElementById('dall').click();if(SESSAO.fichas.length)bad++;ugUndo();if(als()!==a0)bad++;
  await w(700);const r=await IDB.tx('readonly',t=>t.get('__undo'));if(!r||!r.data||!r.data.glob)bad++;
  SESSAO.fichas=[genNPC(5,'Mercenário (merc)','','rand')];renderNPC(SESSAO.fichas);const c0=JSON.stringify(SESSAO.fichas[0].at),pr0=SESSAO.fichas[0].npc.pr;levelAt(0,pr0+1);if(SESSAO.fichas[0].npc.pr!==pr0+1)bad++;document.querySelector('.ajusta .ajd').click();if(SESSAO.fichas[0].npc.pr!==pr0||JSON.stringify(SESSAO.fichas[0].at)!==c0)bad++;
  return bad}
 ,'especializações: catálogo, carma, perfil e bônus de dados':async()=>{BOOKS.forEach(b=>SEL.add(b[0]));let bad=0,tot=0,arma=0,ocup=0;const ty=Object.keys(TYPES);
  for(let i=0;i<300;i++){GEN.metaUsed={};const c=genNPC([2,4,6,8,10][i%5],ty[i%ty.length],'rand','rand'),b=karmaBook(c),sp=c.specs||{};
   Object.entries(sp).forEach(([k,v])=>{tot++;if(!c.sk[k]||!specCanon(k,v))bad++;if((c.specAuto||[]).includes(k)&&c.sk[k]<3)bad++});
   if(Object.keys(sp).length>specMax(c.npc.pr))bad++;if(b.left<0||b.sp!==Object.keys(sp).length*SPEC_K)bad++;
   c.gear.filter(g=>g.cat==='weapon'&&!g.nat).forEach(w=>{const k=specArmaSkill(w);if(k&&sp[k]&&specBonusArma(c,w)){arma++;if(specBonusArma(c,w)!==SPEC_B)bad++}})}
  if(tot<600||arma<20)bad++;
  /* perfil: policial leva Semi-Automatics/Batons mais que Revolvers/Hammers; um mercenário de fuzil leva Assault Rifles */
  let sa=0,rv=0,ar=0,n=0;for(let i=0;i<200;i++){GEN.metaUsed={};const c=genNPC(7,'Polícia (Lone Star / força local)','','rand');if((c.specs||{}).Pistols==='Semi-Automatics')sa++;if((c.specs||{}).Pistols==='Revolvers')rv++}
  if(sa<=rv)bad++;
  /* importar skills.xml troca o catálogo (e um parcial não apaga as outras perícias) */
  const antes=Object.keys(SPK.sk).length,x='<?xml version="1.0"?><chummer><skills><skill><id>7f1c0000-0000-0000-0000-000000000001</id><name>Pistols</name><attribute>AGI</attribute><category>Combat Active</category><specs><spec>Quickdraw Duel</spec></specs><source>SR5</source></skill></skills></chummer>';
  await importFiles([new File([x],'skills.xml')]);if(SPK.sk.Pistols.s.join()!=='Quickdraw Duel'||Object.keys(SPK.sk).length!==antes)bad++;
  /* ficha do Chummer: a especialização entra, e sai o que sumiu da ficha */
  const r=parseSheetXML('<character><alias>T</alias><metatype>Human</metatype><newskills><skills><skill><name>Perception</name><base>5</base><karma>0</karma><isknowledge>False</isknowledge><specs><spec><name>Visual</name></spec></specs></skill></skills></newskills></character>');
  if((r.c.specs||{}).Perception!=='Visual')bad++;
  /* exportação: JSON e XML levam a especialização e o bônus */
  GEN.metaUsed={};const c=genNPC(7,'Polícia (Lone Star / força local)','','rand'),k=Object.keys(c.specs||{})[0];
  if(!k)bad++;else{const j=JSON.parse(chumJSON(c)).characters.character,s=[].concat(j.skills.skill).find(q=>q.name===k);
   if(!s||s.spec!==c.specs[k]||+s.specializedrating!==+s.total+SPEC_B||s.skillspecializations.skillspecialization.specbonus!==String(SPEC_B))bad++;
   if(toXML(c).indexOf('<name>'+k+'</name><specs>')<0)bad++}
  return bad}
};
(async()=>{const b=await pw.chromium.launch(),ctx=await b.newContext({offline:true}),p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/^Warning: \[gerador\]/.test(m.text()))errs.push(m.text())});
 await p.goto('file://'+out);await p.waitForTimeout(800);await p.evaluate(HELP);let fail=0;
 for(const [n,f] of Object.entries(T)){let r;try{r=await p.evaluate(`(${f})()`)}catch(e){r='ERRO '+e.message}console.log((r===0?'ok   ':'FALHA ')+n+(r===0?'':' → '+r));if(r!==0)fail++}
 if(errs.length){console.log('FALHA erros de página:',errs.slice(0,3));fail++}
 await b.close();const v=cp.spawnSync('node',[path.join(__dirname,'validar-fichas.js'),'300'],{encoding:'utf8',env:process.env});console.log((v.status===0?'ok   ':'FALHA ')+'validador de fichas (300 NPCs)'+(v.status===0?'':'\n'+v.stdout));if(v.status!==0)fail++;console.log(fail?fail+' falha(s)':'tudo certo');process.exit(fail?1:0)})();
