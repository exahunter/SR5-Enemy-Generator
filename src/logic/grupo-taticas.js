/* ===== v40: táticas de grupo (banco em data/grupo-taticas.js) ===== */
const gtFill=t=>fillAlt(t,pick);
function gtPar(M,fa,fb){const A=M.filter(c=>c.npc&&fa(c)),B=M.filter(c=>c.npc&&fb(c));
 for(const a of A){const b=B.find(x=>x!==a);if(b)return[a,b]}return null}
/* v42: variantes de abertura/desenvolvimento/ruptura que citam um papel ou recurso só valem se o grupo tem (medido: sem isso, ~15–35% dos grupos citavam motorista, batedor,
 * granada, silenciador, decker ou mago que não existiam). Se nenhuma variante serve, volta a sortear entre todas. A variante declara o que exige com §marca (ver data/grupo-taticas.js);
 * a marca é o que vale, então o texto pode ser traduzido sem mudar o sorteio. */
const gtHas=(M,ids,reSp)=>M.some(c=>ids.includes(rolId(c))||(reSp&&reSp.test((c.npc||{}).sp||''))),gtGear=(M,re)=>M.some(c=>(c.gear||[]).some(x=>re.test(x.n)));
const GT_REQ={drv:M=>gtHas(M,['driver'],/Rigger/),mtx:M=>gtHas(M,['decker','technomancer'],/Decker|Technomancer|Rigger/),mag:M=>gtHas(M,['mage','secmage','priest','adept','mystadept'],/Mage|Mystic|Adept/),
 atr:M=>gtHas(M,['shooter']),bat:M=>gtHas(M,['scout']),gra:M=>gtGear(M,/Grenade|Granada/i),dro:M=>gtHas(M,[],/Rigger/)||gtGear(M,/drone/i),
 sil:M=>gtGear(M,/Silencer|Suppressor/i),nl:M=>gtGear(M,/Stun|Taser|Shock|Gel|Net|Tranq|Narco/i)};
const gtTxt=t=>t.split('§')[0],gtOk=(M,t)=>(t.split('§')[1]||'').split(',').filter(Boolean).every(k=>GT_REQ[k](M));
function grupoTatica(M){const f=[...M].sort((a,b)=>String(a.npc.rid||a.alias).localeCompare(String(b.npc.rid||b.alias)))[0].npc,gk=(M.find(c=>c.npc.gk)||M[0]).npc.gk,comp=gk&&GT_COMP[gk]?gk:'grp',C=GT_COMP[comp],
 sig=JSON.stringify([comp,M.map(c=>[c.alias,(c.npc||{}).role,(c.npc||{}).sp,(c.npc||{}).loy])]);
 if(f.gtat&&f.gtat.sig===sig)return f.gtat;
 const pk=a=>{const v=a.flatMap(s=>{const L=s.split('|'),Q=(REV.get(s)||'').split('|');if(Q.length===L.length)L.forEach((z,i)=>{if(!REV.has(gtTxt(z)))REV.set(gtTxt(z),gtTxt(Q[i]))});return L}),ok=v.filter(x=>gtOk(M,x));return gtFill(gtTxt(pick(ok.length?ok:v)))},lead=M.find(c=>ROLE_LEAD.includes(rolId(c))),
  loyL=M.filter(c=>c.npc.loy),loy=loyL.length?loyL.reduce((s,c)=>s+c.npc.loy,0)/loyL.length:3,
  fogem=M.filter(c=>c.npc.hook&&c.npc.hook.f<1&&c.npc.hook.f>=.5).length;
 const sin=GT_SIN.map(([t,x])=>{const p=t(M);return p?x.replace('{A}',p[0].alias).replace('{B}',p[1].alias):null}).filter(Boolean),
  pap=M.filter(c=>(c.npc||{}).role&&GR_TAC[c.npc.role]).slice(0,6).map(c=>c.alias+' ('+xl(c.npc.role)+'): '+GR_TAC[c.npc.role]);
 const lider=lead?lead.alias:xl('o líder'),
  ruptura=xlf('Se {0} cair, ',lider)+(loy>=4?xl('o grupo se fecha em volta e luta com mais cuidado'):loy>=3?xl('metade segue lutando e a outra metade recua'):xl('o grupo perde o rumo e cada um decide por si'))+
  xl('. Ao romper, ')+pk(C[3])+xl('; sem rota de fuga, ')+pick([xl('o grupo se amontoa no canto mais protegido e segura a posição'),xl('quem não consegue sair se rende ou se esconde atrás dos aliados')])+
  xl('; com aliado ferido, ')+pick([xl('leva o ferido se ele puder andar'),xl('deixa o ferido onde está'),xl('um aliado fica para cobrir o ferido')])+
  xl('; com aliado importante ainda lutando, ')+pick([xl('o grupo adia a retirada até ele cair ou ser coberto'),xl('a retirada começa e ele é deixado para trás'),xl('quem está mais perto o cobre até ele poder sair')])+'.';
 f.gtat={sig,comp,doutrina:C[0],abertura:xl('O grupo ')+pk(C[1]),desenvolvimento:xl('Depois, ')+pk(C[2]),papeis:pap,sinergias:shuffle(sin).slice(0,3),ruptura};
 return f.gtat}
function grupoTaticaTexto(M){const t=grupoTatica(M),L=[xl('Doutrina: ')+t.doutrina,xl('Abertura: ')+t.abertura,xl('Desenvolvimento: ')+t.desenvolvimento];
 if(t.sinergias.length)L.push(xl('Sinergias: ')+t.sinergias.join('; '));if(t.papeis.length)L.push(xl('Papéis: ')+t.papeis.join('; '));L.push(xl('Ruptura: ')+t.ruptura);return L}

/* táticas do grupo nas Notas de cada membro (vai para XML e JSON) */
ganchoNotas.camada('tática do grupo',g=>function(c){let p=[];try{const o=c.npc;if(o&&o.gid&&typeof SESSAO!=='undefined'){const M=(SESSAO.fichas||[]).filter(x=>x&&x.npc&&x.npc.gid===o.gid);
 if(M.length>1){const t=grupoTatica(M),s=t.sinergias.filter(x=>x.includes(c.alias));p=[xl('Tática do grupo (')+(o.gn||xl('grupo'))+'): '+t.doutrina+' '+t.abertura+'. '+t.desenvolvimento+'.'+(s.length?' Sinergia: '+s.join('; ')+'.':'')]}}}catch(e){console.error('tática do grupo',e)}return[...g(c),...p]});
