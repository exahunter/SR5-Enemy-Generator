/* ===== Histórico de vida: módulos de vida (lifemodules.xml do Chummer) =====
 * Cada NPC ganha um módulo por etapa (Nacionalidade, Infância, Adolescência, Educação superior opcional, Vida adulta),
 * escolhido por peso: ocupação, especialização, perícias do NPC e requisitos (talento, metatipo). Só entram módulos dos livros marcados (okSrc).
 * Texto narrativo do Chummer não é usado (inglês, com macros); aqui vão nome do módulo, versão e livro/página. Não mexe em regras da ficha. */
const LM_ET=[['Nationality',xl('Nacionalidade')],['Formative Years',xl('Infância')],['Teen Years',xl('Adolescência')],['Further Education',xl('Educação superior')],['Real Life',xl('Vida adulta')]];
const LM_TIPO={'Civil (cidadão comum)':/Regular Job/,'Wage slave (funcionário corporativo)':/Regular Job|Corporate/,'Executivo / Mr. Johnson':/Corporate|Think Tank/,'Político / burocrata':/Think Tank|Political Activist|Government Agent|Corporate/,
 'Cientista':/Think Tank|Postgraduate|Corporate/,'Técnico / engenheiro':/Regular Job|Corporate|Drone Hobbyist|IT Ace/,'Médico / street doc':/Street Doc|Regular Job/,'Arruaceiro / manifestante':/Political Activist|Urban Brawler|Drifter|Ganger/,
 'Ganger de rua (gangue)':/Ganger|Urban Brawler|Drifter|Pit Fighter/,'Sindicato (máfia, yakuza, vory)':/Organized Crime|Ganger|Assassin/,'Cultista / fanático':/Ritual Killer|Terrorist|Drifter|Bocor/,
 'Contrabandista':/Drifter|Getaway Driver|Pirate|Organized Crime|Shadow Work/,'Segurança corporativa (rent-a-cop)':/Corporate|Law Enforcement|Regular Job/,'Polícia (Lone Star / força local)':/Law Enforcement/,
 'Guarda-costas':/Law Enforcement|Corporate|Tour of Duty|Guardian Angel|Bounty/,'Detetive / investigador':/Private Investigator|Law Enforcement/,'Resposta de alta ameaça (HTR)':/Corporate|Tour of Duty|Law Enforcement|Covert/,
 'Operações especiais (spec ops)':/Covert Operations|Tour of Duty|Government Agent/,'Mercenário (merc)':/Tour of Duty|Shadow Work|Covert/,'Caçador de recompensas (bounty hunter)':/Bounty Hunter/,
 'Motorista / piloto':/Getaway Driver|Drifter|Regular Job|Pirate|Drone Hobbyist/,'Informante / fixer':/Shadow Work|Organized Crime|Regular Job|Matrix Ghost|Hacker/};
const LM_SP={Rigger:/Drone Hobbyist|Getaway Driver|Pirate/,Decker:/Hacker|IT Ace|Matrix Ghost|Otaku|High-Profile Hack/,Technomancer:/Technomancer|Otaku|Matrix Ghost/};
const lmReq=(r,c)=>!r||(!(r.q&&!r.q.includes(c.talent))&&!(r.m&&!r.m.includes(c.meta)));
function genHist(c){const o=c.npc;if(!o||c.crit)return;const M=META[c.meta]||{};if(M.ai||M.sh){o.hist=[];return}
 const pr=o.pr||1,tp=LM_TIPO[o.type],sp=LM_SP[o.sp],mago=['Magician','Adept','Mystic Adept'].includes(c.talent),sk=c.sk||{};
 const peso=(m,et)=>{let w=1;if(et==='Real Life'){if(mago&&/Street Magic/.test(m.n))w+=4}
  if(m.rq&&m.rq.q)w+=8;                                                           // Educação mágica: casa com o talento
  w+=Math.min(5,(m.sk||[]).filter(s=>(sk[s]||0)>=3).length)*(et==='Real Life'?.8:.5);return w};
 /* sem versão compatível (ex.: Tír Tairngire para ciclope) ou sem livro, o módulo não entra */
 const H=[],usados=new Set(),tira=(et)=>{const P=LMD.filter(m=>m.s===et&&m.b&&okSrc(m.b)&&!usados.has(m.i)&&lmReq(m.rq,c)&&!/^Skipped/.test(m.n)&&(!m.v||m.v.some(v=>lmReq(v.rq,c))));if(!P.length)return null;
  const af=et==='Real Life'?P.filter(x=>(tp&&tp.test(x.n))||(sp&&sp.test(x.n))):[],m=wchoose(af.length&&Math.random()<.7?af:P,x=>peso(x,et)),V=(m.v||[]).filter(v=>lmReq(v.rq,c)),v=V.length?pick(V):null;usados.add(m.i);return{e:et,n:m.n,v:v?v.n:'',b:m.b,p:m.p}};
 for(const [et] of LM_ET){if(et==='Further Education'&&Math.random()>=Math.min(.85,.3+pr*.05))continue;
  const h=tira(et);if(h)H.push(h);
  if(et==='Real Life'&&pr>=6&&Math.random()<.5){const h2=tira(et);if(h2)H.push(h2)}}
 o.hist=H}
const histOf=c=>{const o=c&&c.npc;if(!o||c.crit)return null;if(o.hist===undefined)try{genHist(c)}catch(e){avisa('historico',e);o.hist=[]}return o.hist&&o.hist.length?o.hist:null};
function histLinha(c){const H=histOf(c);if(!H)return'';const por={};H.forEach(h=>(por[h.e]=por[h.e]||[]).push(h));
 return LM_ET.filter(([e])=>por[e]).map(([e,rot])=>rot+': '+por[e].map(h=>h.n+(h.v&&h.v!==h.n?' – '+h.v:'')+(h.b?' ['+h.b+(h.p?' '+h.p:'')+']':'')).join(' + ')).join(' · ')}
genGancho.camada(xl('histórico de vida'),g=>function(c){g(c);try{genHist(c)}catch(e){avisa('historico',e)}});
ganchoNotas.camada(xl('histórico de vida'),g=>function(c){const r=g(c),h=histLinha(c);return h?r.concat([xl('Histórico de vida: ')+h]):r});
