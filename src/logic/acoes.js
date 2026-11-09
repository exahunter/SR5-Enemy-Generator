/* ===== v38: ações reais do livro (actions.xml) nas táticas, condutas e notas =====
 * ACOES (data/acoes.json, gerado por tools/gen_acoes.py): [nome, tipo, fonte, página, dados, limite, custo de iniciativa].
 * ACR (data/acoes-regras.js) liga o texto de uma tática/conduta à ação. Só vale ação cujo livro está marcado (okSrc).
 *  acRefs(texto)   até 2 nomes de ação que a primeira oração do texto descreve
 *  acSuf(texto)    " [Fire Burst Fire]" para as notas; acHtml(texto) o mesmo para a ficha, com tipo e página no title
 *  acResumo(c)     linhas "Ação (tipo, livro p.N; reserva X, limite Y)" de tudo que as táticas e condutas do NPC citam + defesas */
const ACO=Object.fromEntries(ACOES.map(a=>[a[0],a]));
const AC_TIPO={Simple:xl('Ação Simples'),Complex:xl('Ação Complexa'),Free:xl('Ação Livre'),Interrupt:xl('Interrupção'),No:xl('Teste de defesa'),Extended:xl('Ação Estendida')};
function acRefs(t){const l=String(PTOF.get(t)||REV.get(t)||t||'').split(';')[0].toLowerCase(),r=[];   /* as regras ACR leem português: em inglês usa o mesmo sorteio no original pt */
 for(const[re,ns]of ACR)if(re.test(l))ns.forEach(n=>{const a=ACO[n];if(a&&okSrc(a[2])&&!r.includes(n))r.push(n)});
 return r.slice(0,2)}
function acTipo(n){const a=ACO[n];return[(AC_TIPO[a[1]]||a[1])+(a[6]?' (−'+a[6]+xl(' Iniciativa)'):''),a[2]+(a[3]?' p.'+a[3]:'')].join(', ')}
const acSuf=t=>{const r=acRefs(t);return r.length?' ['+r.join('; ')+']':''};
const acHtml=t=>{const r=acRefs(t);return r.length?' <span class="note">['+r.map(n=>'<span title="'+esc(acTipo(n))+'">'+esc(n)+'</span>').join(' · ')+']</span>':''};
/* reserva de dados: só quando a fórmula antes do "v." usa atributos e perícias que o NPC tem */
function acPool(n,c){const a=ACO[n],d=a&&a[4];if(!d)return null;const e=d.split(/ v\. /)[0],sk=c.sk||{},SW=window.__SKW||{},W=(c.gear||[]).find(x=>x.cat==='weapon'&&!x.nat);let ok=true;
 const s=e.replace(/\{([^{}]*)\}/g,(m,k)=>{k=k.trim();
  if(/^(BOD|AGI|REA|STR|CHA|INT|LOG|WIL|MAG|RES)$/.test(k)){const v=xE(c,k);if(!v&&/^(MAG|RES)$/.test(k))ok=false;return v}
  if(/^Improvement Value:/.test(k))return 0;
  const nm=k==='Weapon: Skill'?(c.crit?(/^(Fire|Load and Fire|Suppressive|Enhanced Suppression|Flechette)/.test(n)?'Exotic Ranged Weapon':'Unarmed Combat'):(W&&SW[W.sub])):k.replace(/^Spell: /,'');
  if(nm&&sk[nm]>0)return sk[nm]+(k==='Weapon: Skill'&&W&&!c.crit?specBonusArma(c,W):0);ok=false;return 0});
 if(!ok||!/^[0-9+\-*\/ ().]+$/.test(s))return null;try{return Math.max(0,Math.floor(Function('return '+s)()))}catch(x){return null}}
const AC_LIM={'Weapon: Accuracy':xl('Precisão da arma'),'Weapon: Limit':xl('da arma'),Physical:xl('Físico'),Mental:'Mental',Social:'Social','Icon: Attack':xl('Ataque'),'Icon: Firewall':'Firewall','Icon: Sleaze':'Sleaze','Icon: Data Processing':xl('Processamento')};
const acLim=l=>l?String(l).replace(/\{([^{}]*)\}/g,(m,k)=>AC_LIM[k.trim()]||k.trim()):'';
function acLinha(n,c){const a=ACO[n],p=acPool(n,c);let l=acLim(a[5]);if(c.crit)l=l.replace(/^da arma$/,xl('da arma natural'));return n+' ('+acTipo(n)+(p!==null?xl('; reserva ')+p:'')+(l?xl('; limite ')+l:'')+')'}
/* tudo que as táticas (abertura) e as condutas do NPC citam, mais as duas defesas básicas */
function acResumo(c){const o=c.npc;if(!o||c.crit)return[];const seen=[],add=t=>acRefs(t).forEach(n=>{if(!seen.includes(n))seen.push(n)});
 let T=null;try{T=persTactics(c)}catch(e){avisa('acoes',e)}
 if(T)T.open.forEach(x=>add(x.t));
 const k=condOf(c);if(k){k.hi.forEach(add);k.lo.forEach(add)}
 ['Ranged Defense','Melee Defense'].forEach(n=>{if(ACO[n]&&okSrc(ACO[n][2])&&!seen.includes(n))seen.push(n)});
 return seen.map(n=>acLinha(n,c))}
ganchoNotas.camada(xl('ações do livro'),g=>function(c){let p=[];try{const r=acResumo(c);if(r.length)p=[xl('Ações do livro citadas nas táticas e condutas: ')+r.join(' · ')]}catch(e){avisa('acoes',e)}return[...g(c),...p]});
