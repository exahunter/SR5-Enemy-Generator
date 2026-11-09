/* ===== Ficha: o que aparece de cara e o que fica em "Mais detalhes" =====
   Roda depois de todos os decoradores que acrescentam linhas à ficha (ganchos, personalidade, condutas, extras) e reorganiza
   o que já está desenhado, sem remover nada: só muda a ordem e o que fica aberto.
   De cara: números de combate (defesa, resistência, limites), habilidades, magia/matrix, armas, equipamento, implantes,
   qualidades, conduta em combate e motivação. Em "Mais detalhes": carma, dinheiro, essência, cultura, vínculos, contatos, SIN,
   estilo de vida, drogas e o que não estiver classificado. */
(()=>{
 const E_=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 const rx=a=>new RegExp('^('+a.map(rxEsc).join('|')+')');
 /* o código acha linhas da ficha pelo texto do rótulo: tudo abaixo usa o texto no idioma da tela (xl), igual ao que o desenho da ficha escreveu */
 const RX_DANO=new RegExp('^'+rxEsc(xl('Dano'))+' '),ARMAS=xl('Armas'),RX_HAB=rx([xl('Habilidades')]),RX_ESP=rx([xl('Especializações')]),RX_IMP=rx([xl('Implantes')]),RX_TRAD=rx([xl('Tradição')]),RX_FEIT=rx([xl('Feitiços')]),RX_CF=rx([xl('Formas complexas')]),RX_SPR=rx([xl('Sprites registrados')]),RX_VEIC=rx([xl('Veículos e drones')]),
  RX_DRENO=new RegExp(rxEsc(xl('dreno'))+'\\s+([A-Z]{3}\\s*\\+\\s*[A-Z]{3})\\s*\\((\\d+)\\s*'+rxEsc(xl('dados'))+'\\)');
 const STATS=rx([xl('Defesa'),xl('Resistência a dano'),xl('Limites')]);
 /* ordem de exibição na parte de cima (cada grupo mantém a ordem em que as linhas já estavam) */
 const TOP=[rx([xl('Tradição'),'Stream',xl('Magia efetiva'),xl('Ressonância efetiva'),'Matrix',xl('Espíritos vinculados'),xl('Poderes dos espíritos'),'Mentor spirit','Paragon','Vessel']),
  rx([xl('Equipamento')]),rx([xl('\u0000nunca')]),rx([xl('Veículos e drones'),xl('Programas de IA')]),rx([xl('Qualidades')]),rx([xl('Em combate'),xl('Motivação'),xl('Peculiaridade')])];
 const isWeapon=r=>r.matches('.row')&&RX_DANO.test((r.children[1]||{}).textContent||'');
 decorateSheet((sh,c)=>{const sec=sh.querySelector('.sec');if(!sec||sh.dataset.org)return;sh.dataset.org=1;
  const more=sec.querySelector(':scope > details.more'),main=sec.querySelector(':scope > .main'),stats=sec.querySelector(':scope > .stats');
  const items=[...(more?[...more.children].filter(e=>e.tagName!=='SUMMARY'):[]),...[...sec.children].filter(e=>e.matches('.row,.note'))];
  const lab=e=>e.matches('.row')&&e.firstElementChild?e.firstElementChild.textContent.trim():'';
  /* unidades: uma linha + as notas que a seguem (acessórios da arma); o título "Armas" acompanha a primeira arma */
  const U=[];let cur=null;
  items.forEach(e=>{if(e.matches('.row')){cur={rows:[e],label:lab(e),w:isWeapon(e)};U.push(cur)}
   else if(cur&&!cur.head)cur.rows.push(e);
   else{cur={rows:[e],label:'',head:e.textContent.trim()===ARMAS};U.push(cur)}});
  for(let i=0;i<U.length-1;i++)if(U[i].head){U[i+1].rows.unshift(...U[i].rows);U[i+1].hd=1;U[i].rows=[]}
  const st=[],top=TOP.map(()=>[]),wp=[],low=[];
  U.forEach(u=>{if(!u.rows.length)return;
   if(STATS.test(u.label))st.push(u);
   else if(u.w||u.hd)wp.push(u);
   else{const k=TOP.findIndex(r=>r.test(u.label));if(k>=0)top[k].push(u);else low.push(u)}});
  /* ---- bloco de combate compacto (Init, Defesa, Resist., Limites, Monitor) no lugar dos cartões ---- */
  const val=u=>u&&u.rows[0]&&u.rows[0].lastElementChild?u.rows[0].lastElementChild.textContent.replace(/\s+/g,' ').trim():'';
  const fromStats=l=>{const r=[...sh.querySelectorAll('.sec .stats .row')].find(x=>x.firstElementChild.textContent.trim().startsWith(l));return r?r.lastElementChild.textContent.replace(/\s+/g,' ').trim():''};
  const ini=fromStats(xl('Iniciativa')),mon=fromStats('Monitor'),mi=ini.match(/(\d+)\s*\+\s*(\d+)d6/),
   def=val(st.find(u=>u.label.startsWith(xl('Defesa')))),res=val(st.find(u=>u.label.startsWith(xl('Resistência a dano')))),lim=val(st.find(u=>u.label.startsWith(xl('Limites'))));
  if(mi||st.length){const L1=[mi?'<b>Init</b> '+mi[2]+'d6+'+mi[1]:(ini?'<b>Init</b> '+E_(ini):''),def&&xl('<b>Defesa</b> ')+E_(def),res&&xl('<b>Resist.</b> ')+E_(res),lim&&xl('<b>Limites</b> ')+E_(lim)].filter(Boolean);
   const w=document.createElement('div');w.className='cmb';w.innerHTML='<div class="cl">'+L1.map(x=>'<span class="ci">'+x+'</span>').join(' ')+'</div>'+(mon?'<div class="cl"><b>Monitor</b> '+E_(mon)+'</div>':'');
   const anchor=sec.querySelector(':scope > .stats');(anchor||sec.firstElementChild).before(w);sec.querySelectorAll(':scope > .stats').forEach(x=>x.remove())}
  st.forEach(u=>u.rows.forEach(r=>r.remove()));
  const cmb=sec.querySelector(':scope > .cmb');
  let m=main;if(!m){m=document.createElement('div');m.className='main';(cmb||sec.firstElementChild).after(m)}
  /* ---- armas: "Nome — Ataque · Prec. · Dano · PA · Modo" ---- */
  const ORD=[new RegExp('^'+rxEsc(xl('Ataque'))),new RegExp('^'+rxEsc(xl('Prec.'))),new RegExp('^'+rxEsc(xl('Dano'))),new RegExp('^'+rxEsc(xl('PA'))+'\\b'),new RegExp('^'+rxEsc(xl('CR'))+'\\b'),/^(SS|SA|BF|FA)([\/](SS|SA|BF|FA))*$/];
  const box=document.createElement('div');box.className='wbox';
  wp.forEach(u=>u.rows.forEach(r=>{
   if(r.matches('.row')){const nm=r.firstElementChild.innerHTML,t=r.lastElementChild.textContent.split(' · ').map(x=>x.trim()).filter(Boolean),o=[];
    ORD.forEach(rg=>t.filter(x=>rg.test(x)).forEach(x=>o.push(/^(SS|SA|BF|FA)/.test(x)?xl('Modo')+' '+x:x)));t.forEach(x=>{if(!ORD.some(rg=>rg.test(x)))o.push(x)});
    r.className='row wrow';r.innerHTML='<span class="wn">'+nm+'</span> <span class="wd">— '+o.map(E_).join(' · ')+'</span>'}
   else if(r.textContent.trim()===ARMAS)r.classList.add('wh');
   box.appendChild(r)}));
  const arm=(c.gear||[]).filter(g=>g.cat==='armor').map(g=>g.n);
  if(arm.length)box.insertAdjacentHTML('beforeend',xl('<div class="row wrow"><span class="wn">Armadura</span> <span class="wd">— ')+arm.map(E_).join(', ')+'</span></div>');
  if(box.children.length)m.before(box);
  /* ---- habilidades com os dados que ele rola (valor da perícia + atributo ligado) ---- */
  const dv=(()=>{try{return derived(c)}catch(e){return{}}})();
  const attr=k=>k==='MAG'?(+c.magic||0):(dv[k]!==undefined&&k in dv?+dv[k]:+((c.at||{})[k])||0);
  const pool=n=>{const a=SKA[n];return a&&c.sk&&c.sk[n]!==undefined?[(+c.sk[n]||0)+attr(a),a,attr(a)]:null};
  m.querySelectorAll('.row').forEach(r=>{const l=r.firstElementChild;if(!l)return;const t=l.textContent.trim();
   if(RX_HAB.test(t)){l.insertAdjacentHTML('beforeend',xl(' <span class="note">(valor → dados que rola)</span>'));
    r.querySelectorAll('.chip').forEach(ch=>{const n=(ch.querySelector('.bk')||ch).textContent.replace(/\s*\d+\s*$/,'').trim(),p=pool(n);if(p)ch.insertAdjacentHTML('beforeend','<span class="pool rg">'+E_(n)+': '+c.sk[n]+' + '+p[1]+' '+p[2]+' = <b>'+p[0]+xl(' dados</b></span>'))})}
   else if(RX_ESP.test(t)){r.querySelectorAll('.chip').forEach(ch=>{const q=ch.textContent.match(/^(.+?) \((.+)\)\s*$/),p=q&&pool(q[1].trim());if(p)ch.insertAdjacentHTML('beforeend',xl('<span class="pool rg">com a especialização (+2): <b>')+(p[0]+2)+xl(' dados</b></span>'))})}});
  /* ---- implantes: só os que fazem algo e não estão calculados na ficha; a lista completa vai para "Mais detalhes" ---- */
  const CALC=/^(Wired Reflexes|Reaction Enhancers|Muscle (Replacement|Augmentation|Toner)|Dermal Plating|Orthoskin)\b/;
  const imp=U.find(u=>RX_IMP.test(u.label));
  if(imp&&imp.rows[0]){const vr=imp.rows[0].lastElementChild,items=vr.innerHTML.split(/, (?![^()\[\]]*[)\]])/).filter(Boolean);
   const tx=h=>h.replace(/<[^>]+>/g,'').trim(),act=items.filter(h=>!CALC.test(tx(h)));
   if(act.length&&act.length<=items.length){const rr=document.createElement('div');rr.className='row';
    rr.innerHTML=xl('<span>Implantes ativos <span class="note">(os que alteram dados, iniciativa ou armadura já estão nos números)</span></span><span>')+act.map(h=>h.replace(/\s*\[[\d.]+\]/g,'').replace(/ \((Standard|Alphaware|Betaware|Deltaware|Used)\)/g,'')).join(', ')+'</span>';
    top[2].push({rows:[rr],label:xl('Implantes ativos')})}}
  /* magia/matrix, implantes ativos, equipamento... depois das habilidades */
  [0,2,1,3,4,5].forEach(k=>top[k].forEach(u=>u.rows.forEach(r=>m.appendChild(r))));
  /* ---- feitiços: uma linha por feitiço, com os dados que ele rola e o dreno ---- */
  const trad=[...m.querySelectorAll('.row')].find(r=>RX_TRAD.test(r.firstElementChild.textContent)),
   tm=trad&&trad.lastElementChild.textContent.match(RX_DRENO),
   MAGv=+c.magic||0,spc=(+(c.sk||{}).Spellcasting||0),spec=(c.specs||{}).Spellcasting,
   TY={M:'Mana',P:xl('Física')},DU={I:xl('Instantânea'),S:xl('Sustentada'),P:xl('Permanente')},DM={P:xl('Dano físico'),S:xl('Dano atordoante')},
   CAT={Combat:xl('Combate'),Detection:xl('Detecção'),Health:xl('Saúde'),Illusion:xl('Ilusão'),Manipulation:xl('Manipulação')},
   rg=r=>String(r||'').replace(/\bLOS\b/,xl('LDV')).replace(/^T\b/,xl('Toque')).replace(/\bT\b/,xl('Toque')).replace(/\(A\)/,xl('(área)')),
   dvt=v=>String(v||'').replace(/-/g,'−'),
   /* dreno já calculado: lança na Força = Magia efetiva (mínimo 2); acima da Magia o dreno viraria físico */
   drn=v=>{const q=String(v||'').match(/^F\s*([+-]\s*\d+)?$/i);if(!q||!MAGv)return'';const n=Math.max(2,MAGv+(+String(q[1]||0).replace(/\s/g,'')));return' = '+n+xl(' <span class="note">(Força ')+MAGv+')</span>'};
  m.querySelectorAll('.row').forEach(r=>{const l=r.firstElementChild;if(!l)return;
   if(RX_FEIT.test(l.textContent.trim())&&(c.spells||[]).length&&spc){
    const mt=((c.mentor&&c.mentor.fx)||[]).filter(f=>f.t==='sp');
    const lines=c.spells.map(([n,cat,src,id])=>{const d=(typeof xSpellData==='function'&&xSpellData(n,id))||{},
      sp2=spec&&String(spec).toLowerCase()===String(cat).toLowerCase()?2:0,mb=mt.filter(f=>f.n===cat).reduce((a,f)=>a+f.v,0),pl=spc+MAGv+sp2+mb,
      bits=[CAT[cat]||cat,d.type&&(TY[d.type]||d.type),d.range&&rg(d.range),d.duration&&(DU[d.duration]||d.duration),d.damage&&d.damage!=='0'&&(DM[d.damage]||d.damage)].filter(Boolean);
      return'<div class="ml"><b>'+E_(n)+'</b>'+xl(' — Rola ')+pl+(sp2||mb?xl(' <span class="note">(inclui ')+[sp2&&xl('+2 especialização'),mb&&'+'+mb+' mentor'].filter(Boolean).join(', ')+')</span>':'')+' · '+bits.map(E_).join(' · ')+(d.dv?xl(' · Dreno ')+E_(dvt(d.dv))+drn(d.dv):'')+'</div>'}).join('');
    l.insertAdjacentHTML('beforeend',xl(' <span class="note">(rola = Spellcasting ')+spc+' + MAG '+MAGv+(tm?xl(' · resiste ao dreno com ')+tm[2]+xl(' dados (')+E_(tm[1])+')':'')+')</span>');
    r.lastElementChild.outerHTML='<div class="mls">'+lines+'</div>'}
   /* ---- tecnomante: formas complexas com alvo e os dados de Threading / Fade ---- */
   else if(RX_CF.test(l.textContent.trim())&&(c.cf||[]).length){
    const RES=+(c.at||{}).RES||0,WIL=+(c.at||{}).WIL||0,sw=+((c.sk||{}).Software)||0,stm=[...m.querySelectorAll('.row')].find(x=>/^Stream/.test(x.firstElementChild.textContent)),
     fm=stm&&stm.lastElementChild.textContent.match(/dreno\s+([A-Z]{3}\s*\+\s*[A-Z]{3})\s*\((\d+)\s*dados\)/),
     TG={Self:xl('Si mesmo'),Persona:'Persona',Device:xl('Dispositivo'),File:xl('Arquivo'),Sprite:'Sprite',Host:'Host',Icon:xl('Ícone')};
    l.insertAdjacentHTML('beforeend',' <span class="note">(threading = Software '+sw+' + RES '+RES+' = '+(sw+RES)+xl(' · resiste ao Fade com ')+(fm?fm[2]+xl(' dados (')+E_(fm[1])+')':(WIL+RES)+xl(' dados (WIL + RES)'))+')</span>');
    r.lastElementChild.outerHTML='<div class="mls">'+c.cf.map(f=>'<div class="ml"><b>'+E_(f[0])+'</b>'+(f[1]?xl(' — alvo: ')+E_(TG[f[1]]||f[1]):'')+'</div>').join('')+'</div>'}
   else if(RX_SPR.test(l.textContent.trim())){
    const parts=r.lastElementChild.textContent.split(/(?<=\)); (?=[A-Z])/).filter(Boolean);
    if(parts.length>1)r.lastElementChild.outerHTML='<div class="mls">'+parts.map(x=>'<div class="ml">'+E_(x)+'</div>').join('')+'</div>'}
   /* ---- rigger: um veículo/drone por linha + dados de pilotagem e artilharia ---- */
   else if(RX_VEIC.test(l.textContent.trim())){
    const parts=r.lastElementChild.textContent.split(/(?<=\)); (?=[A-Z])/).filter(Boolean),at=c.at||{},REAv=(dv&&+dv.REA)||+at.REA||0,AGIv=(dv&&+dv.AGI)||+at.AGI||0,
     cr=(c.gear||[]).find(g=>/Control Rig/.test(g.n)),crr=cr?(+cr.rt||1):0,
     pl=Object.entries(c.sk||{}).filter(([n])=>/^(Pilot |Gunnery)/.test(n)).map(([n,v])=>{const a=/^Gunnery/.test(n)?AGIv:REAv,k=/^Gunnery/.test(n)?'AGI':'REA';return'<b>'+E_(n)+'</b> '+v+' → '+(v+a+crr)+' <span class="note">(+'+k+' '+a+(crr?' +Control Rig '+crr+xl(' em RV'):'')+')</span>'});
    r.lastElementChild.outerHTML='<div class="mls">'+parts.map(x=>'<div class="ml">'+E_(x)+'</div>').join('')+pl.map(x=>'<div class="ml">'+x+'</div>').join('')+'</div>'}
   /* ---- Matrix: deck, defesa e dados de cada perícia, programas ---- */
   else if(/^Matrix$/.test(l.textContent.trim())&&typeof dkDecks==='function'){
    const D=dkDecks(c.gear).sort((a,b)=>dkDR(b)-dkDR(a))[0],a=D&&dkAttrs(D);if(!D||!a)return;const dr=dkDR(D),at=c.at||{},INT=+at.INT||0,LOG=+at.LOG||0,
     sk=n=>+((c.sk||{})[n])||0,pg=(c.gear||[]).filter(x=>x.cat==='prog').map(x=>E_(x.n));
    const P=[['Hacking','Hacking',LOG,xl('Ataque')+' '+a.A+' / Sleaze '+a.S],['Cybercombat','Cybercombat',LOG,xl('Ataque')+' '+a.A],['Electronic Warfare','Electronic Warfare',LOG,'Sleaze '+a.S+' / Proc. '+a.D],['Computer','Computer',LOG,xl('Proc. dados ')+a.D]]
      .filter(x=>sk(x[1])).map(x=>'<b>'+x[0]+'</b> '+sk(x[1])+' → '+(sk(x[1])+x[2])+' <span class="note">(+LOG '+x[2]+xl(' · limite ')+x[3]+')</span>');
    const L=['<b>Deck</b> '+E_(D.n)+' (DR '+dr+') — '+xl('Ataque')+' '+a.A+' · Sleaze '+a.S+xl(' · Proc. dados ')+a.D+' · Firewall '+a.F,
     '<b>Init Matrix</b> '+(a.D+INT)+'+2d6 <span class="note">(hot-sim '+(a.D+INT)+'+3d6)</span> · <b>Monitor</b> '+(8+Math.ceil(dr/2))+xl(' · <b>Defesa</b> ')+(INT+a.F)+' <span class="note">(INT '+INT+' + Firewall '+a.F+xl(')</span> · <b>Resist. dano</b> ')+(dr+a.F)+' <span class="note">(DR '+dr+' + Firewall '+a.F+')</span>'];
    P.forEach(x=>L.push(x));if(pg.length)L.push('<b>'+xl('Programas')+'</b> '+pg.join(', '));
    r.lastElementChild.outerHTML='<div class="mls">'+L.map(x=>'<div class="ml">'+x+'</div>').join('')+'</div>'}});
  /* conduta em combate e personalidade logo abaixo do bloco principal */
  const pcd=sec.querySelector(':scope > details.pcd'),pers=sec.querySelector(':scope > .pers');
  if(pcd)m.after(pcd);if(pers)(pcd||m).after(pers);
  /* o resto vai para "Mais detalhes" (fechado) */
  let d=more;if(!d){d=document.createElement('details');d.className='more';d.innerHTML='<summary></summary>';sec.appendChild(d)}
  low.forEach(u=>u.rows.forEach(r=>d.appendChild(r)));
  const n=[...d.children].filter(e=>e.matches('.row')).length,s=d.querySelector('summary');
  if(n){s.textContent=xl('Mais detalhes (')+n+')';sec.appendChild(d)}else d.remove()});
})();
