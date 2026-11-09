/* ===== v52: ESPECIALIZAÇÕES — catálogo, importação, cálculo e geração por perfil =====
 * Catálogo   SPK.sk[perícia] = {c categoria, b livro, s [especializações]}  (data/especializacoes.json; skills.xml importado o substitui)
 * Modelo     c.specs[perícia] = nome da especialização (uma por perícia) · c.specAuto = as que o gerador comprou (as digitadas à mão
 *            e as importadas de uma ficha ficam de fora e nunca são sorteadas de novo)
 * Cálculo    +SPEC_B dados quando o teste usa a especialização: arma que ela cobre (specBonusArma), categoria do feitiço, perícia pura
 * Geração    specComprar(c): gasta a sobra de carma (SPEC_K cada) escolhendo primeiro a PERÍCIA (importância no perfil: ocupação, estilos,
 *            armas, magia) e depois a especialização (pesos de data/especializacoes-perfil.js). Roda de novo no fim da geração
 *            (specRefaz), já com equipamento, magia e personalidade finais. */
const SPN=s=>String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]/g,'').replace(/s$/,'');
const specLista=sk=>((SPK.sk[sk]||{}).s)||[];
const specLivre=x=>/^\[/.test(x);
/* nome do catálogo para um texto digitado/importado ('' se a perícia não tem catálogo ou o texto não bate) */
function specCanon(sk,txt){const n=SPN(SPEC_ALIAS[txt]||txt),l=specLista(sk);return l.find(x=>!specLivre(x)&&SPN(x)===n)||''}
/* a perícia dona de uma especialização (entre as candidatas, depois no catálogo todo) */
function specDona(txt,pref){for(const sk of pref||[]){const n=specCanon(sk,txt);if(n)return[sk,n]}
 for(const sk of Object.keys(SPK.sk)){const n=specCanon(sk,txt);if(n)return[sk,n]}return null}
/* ---- importação do catálogo (skills.xml) ---- */
function specImportaXML(d){const novo={};
 d.querySelectorAll('chummer > skills > skill').forEach(e=>{const n=g(e,'name');if(!n)return;
  novo[n]={c:g(e,'category'),b:g(e,'source')||'SR5',s:[...e.querySelectorAll('specs > spec')].map(x=>x.textContent.trim()).filter(Boolean)}});
 if(!Object.keys(novo).length)return 0;
 Object.assign(SPK.sk,novo);return Object.keys(novo).length}   // une ao embutido: um skills.xml parcial não apaga as outras perícias
importFiles.camada(xl('especializações (skills.xml)'),prox=>async function(files){
 for(const f of files){if(/^skills/i.test(f.name)){try{const d=new DOMParser().parseFromString(await f.text(),'text/xml');specImportaXML(d)}catch(e){avisa('especializações',e)}}}
 return prox(files)});
/* ---- armas: que perícia e que especialização uma arma exige ---- */
function specArmaSkill(w){const s=typeof eqSkillOf==='function'?eqSkillOf(w):'';return s||(w.sub==='Holdouts'?'Pistols':'')}
function specArmaSpec(w){const st=w.st||{},sub=w.sub||'',n=w.n||'';let s=st.spec||'';
 if(!s){if(/Pistols/.test(sub)&&!/Machine/.test(sub))s=/revolver|warhawk|redhawk|magnum/i.test(n)?'Revolvers':'Semi-Automatics';
  else if(sub==='Blades')s=/knife|dagger|razor|blade|claw|stiletto/i.test(n)?'Knives':/sword|katana|rapier|sabre|saber|machete/i.test(n)?'Swords':/axe|hatchet/i.test(n)?'Axes':'';
  else if(sub==='Clubs')s=/baton|stick|nightstick|truncheon/i.test(n)?'Batons':/hammer|sledge|mace/i.test(n)?'Hammers':/\bsap\b/i.test(n)?'Saps':/staff|staves|\bbo\b/i.test(n)?'Staves':'';
  else s=SPEC_ARMA[sub]||''}
 return s}
/* +SPEC_B quando a especialização da perícia da arma é a que a arma exige */
function specBonusArma(c,w){if(!c||!c.specs||!w)return 0;const sk=specArmaSkill(w),sp=sk&&c.specs[sk];if(!sp)return 0;
 const a=specArmaSpec(w);return a&&SPN(SPEC_ALIAS[a]||a)===SPN(SPEC_ALIAS[sp]||sp)?SPEC_B:0}
/* ---- carma ---- */
const specAutoDe=c=>(c.specAuto||[]).filter(k=>c.specs&&c.specs[k]);
function specLimpa(c){specAutoDe(c).forEach(k=>delete c.specs[k]);c.specAuto=[]}
const specMax=pr=>Math.max(1,Math.min(8,Math.ceil((+pr||0)*.8)));
/* ---- perfil: o que pesa na escolha ---- */
function specContexto(c){const o=c.npc||{},T=TYPES[o.type]||{},P=o.pers,sk=c.sk||{},ws=(c.gear||[]).filter(x=>x.cat==='weapon'&&!x.nat),
 occ={};SPEC_OCC.forEach(([re,m])=>{if(re.test(o.type||''))Object.entries(m).forEach(([s,v])=>{occ[s]=occ[s]||{};Object.entries(v).forEach(([k,w])=>occ[s][k]=(occ[s][k]||0)+w)})});
 const styles=((P&&P.s)||[]).map(x=>({k:x.k,f:(+x.p||0)/100,e:ESTILO[x.k]||{}}));
 /* estilo → [perícia, especialização] (o spc de cada ESTILO, ligado à perícia foco do estilo e depois a qualquer perícia do NPC) */
 const sty=[];styles.forEach(x=>{if(!x.e.spc)return;const pref=[...(x.e.sk||[]).filter(s=>sk[s]),...Object.keys(sk)],r=specDona(x.e.spc,pref);if(r&&sk[r[0]])sty.push({sk:r[0],sp:r[1],f:x.f})});
 const wsk=new Set(),wsp=[];ws.forEach(w=>{const s=specArmaSkill(w),p=specArmaSpec(w);if(s&&sk[s]){wsk.add(s);const n=specCanon(s,p);if(n)wsp.push({sk:s,sp:n})}});
 return{c,o,T,sk,styles,occ,sty,ws,wsk,wsp}}
/* o que o NPC tem que vira especialização "livre" ou concreta: sprites, formas complexas, espíritos, categorias de magia, veículos */
function specConcreto(x,s){const c=x.c,o={},add=(k,w)=>{if(k)o[k]=(o[k]||0)+w};
 const cats=(c.spells||[]).map(z=>z[1]),sp=(c.spirits||[]).filter(z=>!z.sprite),spr=(c.spirits||[]).filter(z=>z.sprite);
 if(/^(Spellcasting|Alchemy|Counterspelling|Ritual Spellcasting)$/.test(s)){const k=s==='Counterspelling'?1:s==='Spellcasting'?2.5:1.5;cats.forEach(t=>add(specCanon(s,t),k))}
 if(/^(Summoning|Binding|Banishing)$/.test(s))sp.forEach(z=>add(specCanon(s,String(z.n).replace(/^Spirit of /,'Spirits of ')),s==='Summoning'?4:2));
 if(/^(Compiling|Decompiling|Registering)$/.test(s))spr.forEach(z=>add(String(z.n).replace(/ Sprite$/,' Sprites'),4));
 if(s==='Software'){(c.cf||[]).slice(0,3).forEach(z=>add(Array.isArray(z)?z[0]:z&&z.n,2))}
 if(/^Pilot |Mechanic$/.test(s)){(c.gear||[]).filter(z=>/^(veh|drone)$/.test(z.cat)).forEach(z=>{const t=z.sub||'',n=z.n||'';
  const a=/Bikes/.test(t)?'Bike':/Cars|Trucks/.test(t)?'Wheeled':/Rotorcraft/.test(t)?'Rotary Wing':/Fixed-Wing/.test(t)?'Fixed-Wing':/VTOL/.test(t)?'Vector Thrust':/Boats/.test(t)?'Motorboat':/Submarine/.test(t)?'Submarine':/Anthro/.test(t)?'Biped':'';
  if(/^Pilot Ground/.test(s)&&/Bike|Wheeled/.test(a))add(a,4);else if(/^Pilot Aircraft/.test(s)&&/Rotary|Fixed|Vector/.test(a))add(a==='Vector Thrust'?'Vectored Thrust':a,4);
  else if(/^Pilot Water/.test(s)&&/Motorboat|Submarine/.test(a))add(a,4);else if(/^Pilot Walker/.test(s)&&a==='Biped')add(a,3);
  else if(s==='Automotive Mechanic'&&a==='Wheeled')add('Wheeled',2);
  if(/^Pilot /.test(s)&&z.cat==='drone'&&specLista(s).includes('Remote Operation'))add('Remote Operation',2)})}
 return o}
/* pesos das especializações de UMA perícia para este NPC: {nome: peso} */
function specPesos(x,s){const W={},base=SPEC_GER[s]||{},conc=specConcreto(x,s);
 specLista(s).filter(z=>!specLivre(z)).forEach(z=>W[z]=base[z]!==undefined?base[z]:1);
 Object.entries(conc).forEach(([k,w])=>{W[k]=(W[k]||0)+w});
 Object.entries(x.occ[s]||{}).forEach(([k,w])=>{const n=specCanon(s,k);if(n)W[n]=(W[n]||0)+w});
 x.sty.forEach(z=>{if(z.sk===s)W[z.sp]=(W[z.sp]||0)+9*z.f});
 x.wsp.forEach(z=>{if(z.sk===s)W[z.sp]=(W[z.sp]||0)+5});
 Object.keys(W).forEach(k=>{if(!(W[k]>0))delete W[k]});return W}
/* importância da perícia no perfil: o que ele faz de mais característico recebe a especialização primeiro */
function specImport(x,s){const c=x.c,r=+x.sk[s]||0;let w=Math.max(1,r);
 const ri=(x.T.s||[]).indexOf(s);if(ri>=0)w*=2.2-.2*Math.min(ri,5);
 x.styles.forEach(z=>{const i=(z.e.sk||[]).indexOf(s);if(i>=0)w*=1+3*z.f/(1+i*.3)});
 if(x.sty.some(z=>z.sk===s))w*=1.4;
 if(x.wsk.has(s))w*=1.8;
 if(c.magic&&/^(Spellcasting|Summoning|Binding|Banishing|Counterspelling|Assensing|Alchemy)$/.test(s))w*=1.3;
 if(c.talent==='Technomancer'&&/^(Compiling|Registering|Decompiling)$/.test(s))w*=1.3;
 if(x.o.sp==='Decker'&&/^(Hacking|Cybercombat|Electronic Warfare)$/.test(s))w*=1.5;
 if(x.o.sp==='Rigger'&&/^(Pilot |Gunnery)/.test(s))w*=1.5;
 return w}
/* uma escolha: [perícia, especialização] para o perfil, ou null */
function specEscolhe(c,x){const ks=Object.keys(c.sk||{}).filter(s=>!(c.specs||{})[s]&&specLista(s).length&&(+c.sk[s]||0)>=3&&!/^Exotic/.test(s)&&Object.keys(specPesos(x,s)).length);
 if(!ks.length)return null;const s=wchoose(ks,k=>specImport(x,k)),W=specPesos(x,s),n=wchoose(Object.keys(W),k=>Math.pow(W[k],1.8));return[s,n]}   // o expoente concentra a escolha no que o perfil pede
/* compra especializações com a sobra de carma até o teto do nível (mín = quantas manter no mínimo, ex.: ao refazer) */
function specComprar(c,opt){if(!isGen(c))return 0;const o=c.npc,max=specMax(o.pr);c.specs=c.specs||{};c.specAuto=c.specAuto||[];let b=karmaBook(c),n=0;const x=specContexto(c);
 for(let i=0;i<12&&b.left>=SPEC_K&&Object.keys(c.specs).length<max;i++){const e=specEscolhe(c,x);if(!e)break;c.specs[e[0]]=e[1];c.specAuto.push(e[0]);n++;b=karmaBook(c)}
 if(!Object.keys(c.specs).length)delete c.specs;return n}
/* fim da geração: devolve o carma das especializações sorteadas e compra de novo, agora com o equipamento e a magia finais */
function specRefaz(c){if(!isGen(c))return;specLimpa(c);specComprar(c);const b=karmaBook(c);c.kar=c.npc.kar=Math.max(0,b.left)}
npcPos(xl('especializações pelo perfil final'),c=>{try{specRefaz(c)}catch(e){console.error('especializações',e)}});
/* ---- texto de apoio (ficha) ---- */
const specNota=(c,s)=>{const x=(c.specs||{})[s];return x?x+' (+'+SPEC_B+')':''};
