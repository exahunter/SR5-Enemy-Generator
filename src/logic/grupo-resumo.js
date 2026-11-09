/* ===== Grupos: cultura em comum, uniforme padrão, ganchos e resumo ===== */
const GR_UNI=new Set(['patrulha','corp','elite','specops','merc','gangue','cacadores']);
const GR_CORES=['preto','cinza-urbano','azul-marinho','verde-oliva','vinho','branco e preto','camuflagem urbana','cinza e laranja'];
const GR_TAC={Líder:xl('o líder coordena e mantém o moral'),Chefe:xl('o chefe dita o ritmo e os outros o seguem'),Sargento:xl('o sargento mantém a formação'),Supervisor:xl('o supervisor coordena à distância'),Atirador:xl('atiradores cobrem à distância'),Batedor:xl('o batedor abre caminho e dá o alerta'),Motorista:xl('o motorista garante a fuga'),Decker:xl('o decker controla câmeras, portas e comunicação'),Mago:xl('o mago apoia com magias e espíritos'),'Mago de segurança':xl('o mago de segurança vigia o astral'),Adepto:xl('o adepto parte para o corpo a corpo'),Tecnomante:xl('o tecnomante domina a Matrix'),'Médico de campo':xl('o médico de campo mantém os feridos de pé'),Armeiro:xl('o armeiro leva armas extras'),Capanga:xl('os capangas fazem volume e flanqueiam'),Novato:xl('os novatos hesitam sob fogo'),'Guarda-costas':xl('os guarda-costas fecham em volta do alvo'),VIP:xl('o VIP tenta fugir assim que o tiroteio começa')};
genGroup.camada(xl('resumo do grupo'),_ggr=>function(n,pr,type0,metaSel){let L;
 GEN.metaUsed={}; /* v35: o grupo começa sem histórico de metatipos; sem isto a mesma semente dava grupos diferentes */
 GEN.cultHint={c:wchoose(Object.keys(NM_CULT),k=>NM_CULT[k].w),p:.6};
 try{L=_ggr(n,pr,type0,metaSel)}finally{GEN.cultHint=null}
 grupoFinish(L);return L});
function grupoFinish(L){const C=COMPS[GEN.comp]||COMPS.grp,gid='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
 L.forEach(c=>{if(!c.npc)return;c.npc.gid=gid;c.npc.gn=C[0];c.npc.gk=GEN.comp;genGancho(c)});
 if(GR_UNI.has(GEN.comp)){
  const lead=[...L].filter(c=>c.gear&&!(META[c.meta]||{}).ai&&c.gear.some(x=>x.cat==='armor')).sort((a,b)=>b.npc.pr-a.npc.pr)[0];
  if(lead){const arm=lead.gear.filter(x=>x.cat==='armor'),cor=pick(GR_CORES),txt=arm.map(x=>x.n).join(' + ')+' ('+cor+')';
   const custo=arm.reduce((t,x)=>t+(+x.cost||0)+(x.mods||[]).reduce((u,m)=>u+(+m.cost||0),0),0);
   L.forEach(c=>{if(!c.gear||c===lead||(META[c.meta]||{}).ai||custo>resNuyen(c.npc.pr)*.15)return;c.gear=c.gear.filter(x=>x.cat!=='armor').concat(JSON.parse(JSON.stringify(arm)));c.npc.unif=txt});
   lead.npc.unif=txt}}
 L.forEach(c=>karmaFinish(c))}
function grupoAmeaca(M){const t=M.reduce((s,c)=>s+(+c.npc.pr||0)+2+(+c.magic>0?2:0)+((c.npc.sp==='Decker'||c.npc.sp==='Rigger'||c.npc.sp==='Technomancer')?1:0),0),
 l=t<12?xl('Baixa'):t<30?xl('Moderada'):t<60?xl('Alta'):xl('Extrema');return{t,l}}
/* dados do resumo do grupo (usados pelo cartão da ficha e pela exportação em texto) */
function grupoDados(M){const f=M[0].npc,A=grupoAmeaca(M),pr=M.reduce((s,c)=>s+(+c.npc.pr||0),0)/M.length,
 ini=Math.round(M.reduce((s,c)=>{const d=derived(c);return s+d.ini+3.5*d.dice},0)/M.length),
 cul={};M.forEach(c=>{const k=(c.npc.nm||{}).cult;if(k)cul[k]=(cul[k]||0)+1});
 const cs=Object.entries(cul).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>xl(k)+' ('+v+')').join(', '),
 ny=M.reduce((s,c)=>{const b=nuyenBook(c);return s+(b?b.tot:0)},0),loy=M.filter(c=>c.npc.loy);
 const rs=[...new Set(M.map(c=>c.npc.role).filter(Boolean))],tac=rs.map(r=>GR_TAC[r]).filter(Boolean),
 fogem=M.filter(c=>{const h=c.npc.hook;return h&&h.f<1}).length,rende=M.filter(c=>c.npc.hook&&c.npc.hook.rd).length,
 rf=M.filter(c=>c.npc.hook&&c.npc.hook.rf).length;
 return{f,A,pr,ini,cs,ny,loy,tac,fogem,rende,rf,n:M.length,
  moral:t('grupo.moral',{f:fogem,t:M.length,r:rende,rf})+(loy.length?' · '+t('loy.media',{n:fmtDec(loy.reduce((s,c)=>s+c.npc.loy,0)/loy.length,1)}):'')}}
function grupoCardHTML(M){const D=grupoDados(M),{f,A,pr,ini,cs,ny,tac}=D,r=(a,b)=>`<div class="row"><span>${a}</span><span>${b}</span></div>`;
 return xlf('<div class="gcard" data-gid="{0}"><h3>{1} <span class="chip k">{2} pessoas · nível médio {3}</span><span class="gx"><button class="gcopy" type="button">Copiar resumo</button><button class="gdl" type="button">Baixar .txt</button></span></h3>',esc(f.gid),esc(f.gn||xl('Grupo')),M.length,fmtDec(pr,1))+
  r(xl('Ameaça'),xlf('<b>{0}</b> <span class="note">(pontuação {1}: nível+2 por pessoa, mais 2 por desperto e 1 por decker, rigger ou tecnomante)</span>',A.l,A.t))+
  r(xl('Iniciativa média'),ini+xl(' (com dados)'))+(f.vinc?r(xl('Vínculo'),esc(f.vinc)):'')+(cs?r(xl('Origem cultural'),esc(cs)):'')+
  (f.unif?r(xl('Equipamento padrão'),esc(f.unif)):'')+r(xl('Recursos somados'),fmtNy(ny))+
  (()=>{try{const T=grupoTatica(M);return r(xl('Doutrina'),esc(T.doutrina))+r(xl('Abertura'),esc(T.abertura))+r(xl('Desenvolvimento'),esc(T.desenvolvimento))+(T.sinergias.length?r(xl('Sinergias'),esc(T.sinergias.join('; '))):'')+(T.papeis.length?r(xl('Papéis'),esc(T.papeis.join('; '))):'')+r(xl('Ruptura'),esc(T.ruptura))}catch(e){avisa('grupo-taticas',e);return tac.length?r(xl('Tática'),esc(tac.join('; '))):''}})()+
  r(xl('Moral'),esc(D.moral))+'</div>'}
/* o mesmo resumo em texto puro (botões "Copiar resumo" e "Baixar .txt") */
function grupoTexto(M){const D=grupoDados(M),f=D.f,L=[];
 L.push((f.gn||xl('Grupo'))+' — '+D.n+xl(' pessoas · nível médio ')+fmtDec(D.pr,1));
 L.push(xl('Ameaça: ')+D.A.l+xl(' (pontuação ')+D.A.t+')',xl('Iniciativa média: ')+D.ini+xl(' (com dados)'));
 if(f.vinc)L.push(xl('Vínculo: ')+f.vinc);if(D.cs)L.push(xl('Origem cultural: ')+D.cs);if(f.unif)L.push(xl('Equipamento padrão: ')+f.unif);
 L.push(xl('Recursos somados: ')+fmtNy(D.ny));try{L.push(...grupoTaticaTexto(M))}catch(e){avisa('grupo-taticas',e);if(D.tac.length)L.push(xl('Tática: ')+D.tac.join('; '))}L.push(xl('Moral: ')+D.moral,'',xl('Membros:'));
 M.forEach(c=>L.push('- '+c.alias+' ('+xl((c.npc||{}).type||c.arch||'')+xl(', nível ')+((c.npc||{}).pr||0)+')'));
 return L.join('\n')}
async function grupoCopiar(M){const t=grupoTexto(M),m=document.getElementById('msg');
 try{await navigator.clipboard.writeText(t);if(m)m.textContent=xl('Resumo do grupo copiado.')}
 catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(x){avisa('grupo-resumo',x)}a.remove();if(m)m.textContent=ok?xl('Resumo do grupo copiado.'):xl('Não foi possível copiar; use "Baixar .txt".')}}
const grupoBaixar=M=>saveF('resumo_'+((M[0].npc.gn||xl('grupo')).replace(/[^\w-]+/g,'_')||xl('grupo'))+'.txt',grupoTexto(M));
