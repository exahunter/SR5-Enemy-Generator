/* ===== ORIGEM: forma final dos dados, comum a xmlBase e jsonBase =====
   Nada aqui é "conserto depois": é o formato que o Chummer/Foundry leem. */
const XZ='00000000-0000-0000-0000-000000000000',xU=()=>crypto.randomUUID(),xS=String;
const XSKW={'Light Pistols':'Pistols','Heavy Pistols':'Pistols','Machine Pistols':'Pistols','Hold-Outs':'Pistols','Tasers':'Pistols','Submachine Guns':'Automatics','Assault Rifles':'Automatics','Machine Guns':'Heavy Weapons','Shotguns':'Longarms','Sniper Rifles':'Longarms','Sporting Rifles':'Longarms','Blades':'Blades','Clubs':'Clubs','Bows':'Archery','Crossbows':'Archery','Throwing Weapons':'Throwing Weapons','Unarmed':'Unarmed Combat','Exotic Melee Weapons':'Exotic Melee Weapon','Exotic Ranged Weapons':'Exotic Ranged Weapon','Assault Cannons':'Heavy Weapons','Grenade Launchers':'Heavy Weapons','Missile Launchers':'Heavy Weapons'};
window.__SKW=XSKW;
const XMEL=['Blades','Clubs','Unarmed','Exotic Melee Weapons','Cyberweapons'];
const XKT={'Magical Theory':'Academic','Corporate Politics':'Professional','Security Companies':'Professional','Mercenary Teams':'Professional',...KTX};
const xKnowType=n=>XKT[n]||'Street';
const xArr=v=>v==null?[]:Array.isArray(v)?v:[v];
/* coleções do Chummer: 0 -> null, 1 -> {g:objeto}, 2+ -> {g:[...]} (invariante mantido na origem) */
const xPut=(o,k,g,l)=>{o[k]=l.length?{[g]:l.length===1?l[0]:l}:null;return o[k]};
const xList=(o,k,g)=>xArr(o[k]&&o[k][g]);
const xAdd=(o,k,g,it)=>xPut(o,k,g,xList(o,k,g).concat([it]));
const xAttrList=ch=>{const b=Array.isArray(ch.attributes)?ch.attributes[1]:(ch.attributes||(ch.attributes={}));b.attribute=xArr(b.attribute);return b.attribute};
const xAttrSet=(ch,o)=>{const L=xAttrList(ch),i=L.findIndex(x=>x.name===o.name);i<0?L.push(o):Object.assign(L[i],o)};
const xE=(c,k)=>{const U=augm(c),v=+((c.at||{})[k])||0;return U[k]?Math.min(limA(c.meta,k,c.npc&&c.npc.pr),v+U[k]):v};
const xDmg=(d,str)=>{if(d==null||d==='')return d;const t=String(d).replace(/\{STR\}/g,str),m=/^\(([^)]*)\)(.*)$/.exec(t);
if(m&&/^[\d+\-*\s]+$/.test(m[1])){try{return String(Function('return ('+m[1]+')')())+m[2]}catch(e){avisa('origem-helpers',e)}}return t};
/* dados de feitiço: uma fonte só para XML e JSON.
   Tabela embutida (SPD) + dados do Chummer do usuário (SPX) / índice embutido (EMB.SP); o dado importado vence, a tabela embutida completa o que faltar (ex.: descritores) */
function xSpellData(n,id){
const d=(typeof SPD!=='undefined'&&SPD[id])||null,
s=(typeof SPX!=='undefined'&&SPX[id])||(typeof EMB!=='undefined'&&EMB.SP&&EMB.SP[n])||null;
if(!d&&!s)return null;
const D=d||[],S=s||{};
return{type:S.t||D[0]||'',range:S.r||D[1]||'',duration:S.du||D[2]||'',dv:S.dv||D[3]||'',damage:S.dm||D[4]||'',descriptors:S.d||D[5]||null,page:S.pg||D[6]||null,src:S.src||null}}
function xSpellRow(n,cat,src,id){const d=xSpellData(n,id),
o={guid:xU(),sourceid:id||XZ,name:n,name_english:n,category:cat,category_english:cat,source:src||(d&&d.src)||'SR5',extra:null,limited:'False',extended:'False'};
if(d)Object.assign(o,{descriptors:d.descriptors,type:d.type,range:d.range,damage:d.damage,duration:d.duration,dv:d.dv,page:d.page});
return o}
