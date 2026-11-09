/* ===== v50: edição manual da ficha e ficha em branco =====
   Sem guia nem assistente: um botão discreto "Ficha em branco" ao lado de "Importar fichas" e, em cada ficha, um painel
   recolhido "Editar" (metatipo, perícias, conhecimentos, qualidades, equipamento, magia, carma e nuyen).
   Tudo mexe direto no objeto da ficha (sem recalcular o que o gerador sorteou) e grava na hora. Os atributos e o nome
   continuam sendo editados na própria ficha (editar-ficha.js). */
(()=>{
 const E=x=>esc(String(x==null?'':x)),OPEN=new Set();
 const metas=()=>Object.keys(META).filter(n=>!META[n].hid&&!META[n].ai);
 const lc=s=>String(s||'').toLowerCase();
 function blankNPC(sel){
  const meta=META[sel]&&!META[sel].ai?sel:'Human',at={};
  ATTR.forEach(k=>at[k]=lim(meta,k)[0]);at.EDG=lim(meta,'EDG')[0];
  return{_id:newNpcId(),alias:'Novo NPC',arch:'NPC',meta,P:{meta:'A',attr:'A',skill:'A',res:'A',magic:'E'},at,sk:{},know:[],q:[],spells:[],powers:[],magic:0,talent:'',pp:0,
   nuyen:0,nuyenLeft:0,gear:[],ess:6,spirits:[],books:[...SEL],ak:{},kar:0,lang:'',npc:{pr:0,type:'Manual',sp:'',manual:1}}}
 function addBlank(){
  const sel=(document.getElementById('meta')||{}).value,c=blankNPC(sel);
  SESSAO.fichas=capN([...SESSAO.fichas,c]);OPEN.add(c._id);saveN();renderNPC(SESSAO.fichas);
  const sh=sheetOf(c);if(sh){sh.scrollIntoView({block:'start'});flashSheet(c)}}
 const bt=document.getElementById('impc');
 if(bt&&!document.getElementById('blankb')){bt.insertAdjacentHTML('afterend',xl('<button type="button" id="blankb" title="Cria uma ficha vazia para preencher à mão">Ficha em branco</button>'));document.getElementById('blankb').onclick=addBlank}

 const save=c=>{try{window.BOOKTIP&&BOOKTIP.close()}catch(e){avisa('ficha-manual',e)}saveN();OPEN.add(c._id);keepScroll(()=>renderNPC(SESSAO.fichas))};
 window.fichaSalvar=save;
 const num=(v,lo,hi)=>Math.max(lo,Math.min(hi,Math.round(+v||0)));
 const ess=c=>{c.ess=+(6-(c.gear||[]).reduce((s,x)=>s+(+x.ess||0),0)).toFixed(2)};
 const isG=c=>typeof isGen==='function'&&isGen(c);
 const qList=()=>[...POS.map(o=>[o,'Positive']),...NEG.map(o=>[o,'Negative'])];
 function gearFrom(i){const g={cat:i[0],n:i[1],cost:i[2],src:i[3]||'SR5',ess:i[4]||0,id:i[5]||'',sub:i[6]||'',st:Object.assign({},i[7]||{})};if(i[0]==='comm'||i[0]==='drone')g.bs=1;if(i[0]==='weapon'&&/F/.test(String((i[7]||{}).avail||'')))g.ilegal=1;return g}

 function html(c){
  const sk=Object.entries(c.sk||{}),sp=c.specs||{},o=c.npc||{},gen=isG(c);
  const row=(l,b)=>`<div class="er"><span class="el">${l}</span><div class="eb">${b}</div></div>`;
  const inp=(a,v,w,x)=>`<input ${a} value="${E(v)}" ${w?'style="width:'+w+'px"':''} ${x||''}>`;
  const X=(a,i)=>xlf('<button type="button" class="ex" data-a="{0}" data-i="{1}" title="Remover" aria-label="Remover">×</button>',a,i);
  const skl=sk.map(([n,r],i)=>`<span class="ec"><span class="cn">${E(n)}</span> <input type="number" min="0" max="24" value="${E(r)}" data-a="skr" data-n="${E(n)}"> <input type="text" placeholder="espec." value="${E(sp[n]||'')}" data-a="sks" data-n="${E(n)}" class="esp" list="spl${i}"><datalist id="spl${i}">${specLista(n).filter(z=>!specLivre(z)).map(z=>'<option value="'+E(z)+'">').join('')}</datalist>${X('skx',i).replace('data-i=','data-n="'+E(n)+'" data-i=')}</span>`).join('');
  const ql=(c.q||[]).map((q,i)=>`<span class="ec ${q.t==='Positive'?'':'ng'}"><span class="cn">${E(q.n)}</span> (${q.t==='Positive'?'+':'−'}${E(q.c)})${X('qx',i)}</span>`).join('');
  const gl=(c.gear||[]).map((g,i)=>`<span class="ec"><span class="cn">${E(eqLabel(g))}</span>${g.cat==='cyber'||g.cat==='bio'?'':` <input type="number" min="1" max="999" value="${E(g.qty||1)}" data-a="gq" data-i="${i}" title="Quantidade">`}${X('gx',i)}</span>`).join('');
  const spl=(c.spells||[]).map((s,i)=>`<span class="ec"><span class="cn">${E(s[0])}</span>${X('spx',i)}</span>`).join('');
  const pwl=(c.powers||[]).map((p,i)=>`<span class="ec"><span class="cn">${E(p.n)}</span>${p.l?' '+E(p.l):''}${X('pwx',i)}</span>`).join('');
  const magic=c.at.MAG!==undefined||c.at.RES!==undefined||c.talent;
  return xl(`<summary>Editar ficha</summary><div class="edb">`)+
   row(xl('Metatipo'),`<select data-a="meta">${metas().map(m=>`<option${m===c.meta?' selected':''}>${E(m)}</option>`).join('')}</select>`)+
   row(xl('Perícias'),xlf('<div class="el2" data-g="sk">{0}</div><div class="ea"><span class="eaw"><input autocomplete="off" placeholder="perícia" data-f="sk" class="ei"><div class="eac" data-r="sk" hidden></div></span><input type="number" min="1" max="24" value="3" data-f="skv" style="width:56px"><button type="button" data-a="ska">+</button></div>',skl||xl('<span class="note">nenhuma</span>')))+
   row(xl('Conhecimentos'),xlf('<input type="text" value="{0}" data-a="know" class="ew" placeholder="separados por vírgula"><input type="text" value="{1}" data-a="lang" placeholder="idioma nativo" style="width:150px">',E((c.know||[]).join(', ')),E(c.lang||'')))+
   row(xl('Qualidades'),xlf('<div class="el2" data-g="q">{0}</div><div class="ea"><span class="eaw"><input autocomplete="off" placeholder="qualidade" data-f="q" class="ei"><div class="eac" data-r="q" hidden></div></span><input type="number" min="0" max="40" value="5" data-f="qc" style="width:56px" title="Carma"><select data-f="qt"><option value="Positive">+</option><option value="Negative">−</option></select><button type="button" data-a="qa">+</button></div>',ql||xl('<span class="note">nenhuma</span>')))+
   row(xl('Equipamento'),xlf('<div class="el2" data-g="g">{0}</div><div class="ea"><span class="eaw"><input type="search" autocomplete="off" placeholder="buscar item (arma, armadura, gear, cyber…)" data-f="g" class="ei"><div class="eac" data-r="g" hidden></div></span><button type="button" data-a="gc" title="Item personalizado com o nome digitado">personalizado</button><input type="number" min="0" value="0" data-f="gcost" style="width:80px" title="Custo em ¥"></div>',gl||xl('<span class="note">nenhum</span>')))+
   row(xl('Magia'),`<select data-a="talent">${[['',xl('Mundano')],['Magician',xl('Mago')],['Adept',xl('Adepto')],['Mystic Adept',xl('Adepto místico')],['Technomancer',xl('Tecnomante')]].map(([v,l])=>`<option value="${v}"${(c.talent||'')===v?' selected':''}>${l}</option>`).join('')}</select> ${magic?`<label class="note">MAG/RES <input type="number" min="0" max="30" value="${E(c.talent==='Technomancer'?c.at.RES:c.at.MAG||0)}" data-a="mag" style="width:56px"></label>`:''}`+
    (c.talent&&c.talent!=='Adept'&&c.talent!=='Technomancer'?xlf('<div class="el2" data-g="sp">{0}</div><div class="ea"><span class="eaw"><input autocomplete="off" placeholder="feitiço" data-f="sp" class="ei"><div class="eac" data-r="sp" hidden></div></span><button type="button" data-a="spa">+</button></div>',spl||xl('<span class="note">nenhum feitiço</span>')):'')+
    (c.talent==='Adept'||c.talent==='Mystic Adept'?xlf('<div class="el2" data-g="pw">{0}</div><div class="ea"><span class="eaw"><input autocomplete="off" placeholder="poder de adepto" data-f="pw" class="ei"><div class="eac" data-r="pw" hidden></div></span><input type="number" min="1" max="6" value="1" data-f="pwl" style="width:56px"><button type="button" data-a="pwa">+</button></div>',pwl||xl('<span class="note">nenhum poder</span>')):''))+
   row(gen?xl('Carma / Nuyen (totais)'):xl('Carma / Nuyen'),`<label class="note">${xl('Carma')} <input type="number" min="0" value="${E(gen?o.kt:(c.kar??0))}" data-a="kar" style="width:80px"></label> <label class="note">Nuyen ¥ <input type="number" min="0" value="${E(gen?(o.nyTot!=null?o.nyTot:nuyenBook(c).tot):(c.nuyen||0))}" data-a="ny" style="width:110px"></label>`)+
   `</div>`}

 decorateSheet((sh,c)=>{if(c.crit)return;const sec=sh.querySelector('.sec');if(!sec||sec.querySelector(':scope > details.edt'))return;
  const d=document.createElement('details');d.className='edt';d.innerHTML=html(c);d.open=OPEN.has(c._id);sec.appendChild(d);
  d.addEventListener('toggle',()=>{d.open?OPEN.add(c._id):OPEN.delete(c._id)});
  const q=s=>d.querySelector(s),val=s=>(q(s)||{}).value||'';
  /* autocompletar HUD: lista própria (no lugar do datalist do navegador) e a nota do livro ao passar o mouse */
  const B=()=>window.BOOKTIP,nop=n=>{try{return window.PDFNOTES.nop(n)}catch(e){return n}};
  const uniq=a=>{const m=new Set();return a.filter(x=>!m.has(lc(x.n))&&m.add(lc(x.n)))};
  const SRC={
   sk:()=>uniq(Object.keys(SKCAT).filter(k=>!/Knowledge|Language/i.test(SKCAT[k]||'')).sort().map(n=>({n,tag:(SKA||{})[n]||'',kind:'skill',names:[n],info:[t('skill.attr',{k:(SKA||{})[n]||'—'})]}))),
   q:()=>uniq(qList().map(([o,t])=>({n:o[0],tag:(t==='Positive'?'+':'−')+o[1],neg:t!=='Positive',kind:'quality',names:[nop(o[0]),o[0]],src:o[2]||'',page:o[5]||(typeof QPG!=='undefined'&&QPG[o[3]])||'',info:[xl('Qualidade ')+(t==='Positive'?'positiva':'negativa')+' · '+o[1]+xl(' de carma')]})).sort((a,b)=>a.n.localeCompare(b.n))),
   sp:()=>uniq(SPELLS.map(x=>({n:x[0],tag:x[1]||'',kind:'spell',names:[x[0]],src:x[2]||'',info:['Categoria: '+(x[1]||'—')]}))).sort((a,b)=>a.n.localeCompare(b.n)),
   pw:()=>POWERS.map(x=>({n:x[0],tag:x[1]+' PP',kind:'power',names:[x[0]],info:['Custo '+x[1]+xl(' PP por nível · máx. ')+(x[2]||6)]})),
   g:()=>ITEMS.map(i=>({n:i[1],tag:i[0]+' · '+fmtNy(i[2]),kind:(B()&&B().kof[i[0]])||'gear',names:[i[1]],src:i[3]||'',page:(i[7]||{}).page||'',id:i[5]||'',info:B()?B().lines({st:i[7],cost:i[2],ess:i[4]}):[]}))};
  const cache={};
  d.querySelectorAll('.eac').forEach(box=>{
   const k=box.dataset.r,inp=box.parentNode.querySelector('.ei');let cur=[],act=-1;
   const close=()=>{box.hidden=true;act=-1;if(B())B().close()};
   const mark=n=>{[...box.children].forEach((b,i)=>b.classList.toggle('on',i===n));act=n;const b=box.children[n];if(b){b.scrollIntoView({block:'nearest'});if(B())B().show(b)}};
   const draw=()=>{
    const t=lc(inp.value).trim();
    if(k==='g'&&t.length<2){close();return}
    const all=cache[k]||(cache[k]=SRC[k]()),pre=[],mid=[];
    all.forEach(x=>{const n=lc(x.n);if(!t||n.startsWith(t))pre.push(x);else if(n.includes(t))mid.push(x)});
    cur=pre.concat(mid).slice(0,k==='g'?40:80);
    if(!cur.length){box.innerHTML='<div class="eno">nada encontrado</div>';box.hidden=false;return}
    box.innerHTML=cur.map((x,i)=>`<button type="button" class="eo${x.neg?' ng':''}" tabindex="-1" data-i="${i}" data-side="1"${k==='g'?` data-a="gadd" data-id="${E(x.id||x.n)}" data-n="${E(x.n)}"`:''}><span class="en">${E(x.n)}</span><span class="et">${E(x.tag)}</span></button>`).join('');
    [...box.children].forEach((b,i)=>{const x=cur[i];if(B())B().attach(b,B().ent(x.n,x.kind,x.names,x.src,x.page,x.info))});
    box.hidden=false;act=-1};
   inp.addEventListener('input',draw);
   inp.addEventListener('focus',draw);
   inp.addEventListener('blur',()=>setTimeout(close,120));
   inp.addEventListener('keydown',ev=>{
    if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){if(box.hidden)draw();if(!cur.length)return;ev.preventDefault();mark((act+(ev.key==='ArrowDown'?1:-1)+cur.length)%cur.length)}
    else if(ev.key==='Escape'){close()}
    else if(ev.key==='Enter'){ev.preventDefault();
     if(act>=0&&!box.hidden){const x=cur[act];if(k==='g'){box.children[act].click();return}inp.value=x.n;close();return}
     const add=inp.closest('.ea').querySelector(k==='g'?'button[data-a=gc]':'button[data-a$="a"]');if(add)add.click()}});
   box.addEventListener('mousedown',ev=>ev.preventDefault());
   box.addEventListener('click',ev=>{const b=ev.target.closest('.eo');if(!b||k==='g')return;inp.value=cur[+b.dataset.i].n;close();inp.focus()});
  });
  /* chips já adicionados: o nome também mostra a nota do livro */
  if(B()){
   const KOF=B().kof,grp=g=>d.querySelectorAll('.el2[data-g='+g+'] .ec .cn');
   grp('sk').forEach((el,i)=>{const n=Object.keys(c.sk||{})[i];if(n)B().attach(el,B().ent(n,'skill',[n],'','',[t('skill.info',{k:(SKA||{})[n]||'—',r:c.sk[n]})]))});
   grp('q').forEach((el,i)=>{const o=(c.q||[])[i];if(o)B().attach(el,B().ent(o.n,'quality',[nop(o.n),o.n],o.s,o.pg,[xl('Qualidade ')+(o.t==='Positive'?'positiva':'negativa')+' · '+o.c+xl(' de carma')]))});
   grp('g').forEach((el,i)=>{const g=(c.gear||[])[i];if(g)B().attach(el,B().ent(g.n,KOF[g.cat]||'gear',[g.n],g.src,(g.st||{}).page,B().lines(g)))});
   grp('sp').forEach((el,i)=>{const x=(c.spells||[])[i];if(x)B().attach(el,B().ent(x[0],'spell',[x[0]],x[2],'',['Categoria: '+(x[1]||'—')]))});
   grp('pw').forEach((el,i)=>{const x=(c.powers||[])[i];if(x)B().attach(el,B().ent(x.n,'power',[x.n],'','',[xl('Nível ')+(x.l||'—')]))})}
  d.onchange=ev=>{const t=ev.target,a=t.dataset.a;if(!a)return;
   if(a==='meta'){c.meta=t.value;ATTR.concat('EDG').forEach(k=>{const[l,h]=lim(c.meta,k);c.at[k]=num(c.at[k],l,h)});return save(c)}
   if(a==='skr'){const v=num(t.value,0,24);if(v)c.sk[t.dataset.n]=v;else{delete c.sk[t.dataset.n];if(c.specs)delete c.specs[t.dataset.n]}return save(c)}
   if(a==='sks'){c.specs=c.specs||{};const v=t.value.trim();if(v)c.specs[t.dataset.n]=specCanon(t.dataset.n,v)||v;else delete c.specs[t.dataset.n];c.specAuto=(c.specAuto||[]).filter(k=>k!==t.dataset.n);return save(c)}
   if(a==='know'){c.know=t.value.split(',').map(s=>s.trim()).filter(Boolean);return save(c)}
   if(a==='lang'){c.lang=t.value.trim();return save(c)}
   if(a==='gq'){const g=c.gear[+t.dataset.i];if(g){g.qty=num(t.value,1,999);if(g.qty===1)delete g.qty}return save(c)}
   if(a==='talent'){c.talent=t.value;const v=c.talent==='Technomancer'?'RES':'MAG';delete c.at.MAG;delete c.at.RES;c.magic=0;c.pp=0;
    if(c.talent){c.at[v]=1;if(v==='MAG')c.magic=1;if(c.talent==='Adept'||c.talent==='Mystic Adept')c.pp=c.talent==='Adept'?1:0}
    if(c.talent==='Adept'||c.talent==='Technomancer')c.spells=[];return save(c)}
   if(a==='mag'){const k=c.talent==='Technomancer'?'RES':'MAG',v=num(t.value,1,30);c.at[k]=v;if(k==='MAG'){c.magic=v;if(c.talent==='Adept')c.pp=v}return save(c)}
   if(a==='kar'){const o=c.npc;if(isG(c))o.kt=t.value===''?karmaTotal(o.pr,o.fo??1):num(t.value,0,99999);else c.kar=num(t.value,0,99999);return save(c)}
   if(a==='ny'){const o=c.npc;if(isG(c)){if(t.value==='')delete o.nyTot;else o.nyTot=num(t.value,0,1e9)}else c.nuyen=c.nuyenLeft=num(t.value,0,1e9);return save(c)}};
  d.onclick=ev=>{const b=ev.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a,i=+b.dataset.i;
   if(a==='skx'){delete c.sk[b.dataset.n];if(c.specs)delete c.specs[b.dataset.n];if(c.skX)delete c.skX[b.dataset.n];return save(c)}
   if(a==='ska'){const n=val('[data-f=sk]').trim();if(!n)return;const hit=Object.keys(SKCAT).find(k=>lc(k)===lc(n))||n;c.sk[hit]=num(val('[data-f=skv]'),1,24);return save(c)}
   if(a==='qx'){c.q.splice(i,1);return save(c)}
   if(a==='qa'){const n=val('[data-f=q]').trim();if(!n)return;const cat=qList().find(([o])=>lc(o[0])===lc(n));
    if(cat){const[o,t]=cat;c.q.push({n:o[0],c:o[1],id:o[3]||'',s:o[2]||'SR5',t,bn:o[4]||[],pg:o[5]||(typeof QPG!=='undefined'&&QPG[o[3]])||''})}
    else c.q.push({n,c:num(val('[data-f=qc]'),0,40),id:'',s:'',t:val('[data-f=qt]')||'Positive',bn:[],pg:''});return save(c)}
   if(a==='gx'){const g=c.gear.splice(i,1)[0];if(g&&g.ess)ess(c);return save(c)}
   if(a==='gadd'){const it=ITEMS.find(x=>(x[5]||x[1])===b.dataset.id&&x[1]===b.dataset.n);if(!it)return;c.gear.push(gearFrom(it));if(it[4])ess(c);return save(c)}
   if(a==='gc'){const n=val('[data-f=g]').trim();if(!n)return;c.gear.push({cat:'gear',n,cost:num(val('[data-f=gcost]'),0,1e9),src:'',ess:0,id:'',sub:'',st:{}});return save(c)}
   if(a==='spx'){c.spells.splice(i,1);return save(c)}
   if(a==='spa'){const n=val('[data-f=sp]').trim(),s=SPELLS.find(x=>lc(x[0])===lc(n));if(!s)return say(xl('Feitiço não encontrado no catálogo.'));if(!c.spells.some(x=>x[0]===s[0]))c.spells.push(s.slice(0,4));return save(c)}
   if(a==='pwx'){c.powers.splice(i,1);return save(c)}
   if(a==='pwa'){const n=val('[data-f=pw]').trim(),p=POWERS.find(x=>lc(x[0])===lc(n));if(!p)return say(xl('Poder não encontrado no catálogo.'));const l=num(val('[data-f=pwl]'),1,p[2]||6);c.powers=c.powers.filter(x=>x.n!==p[0]);c.powers.push({n:p[0],l,pp:+(l*p[1]).toFixed(2)});return save(c)}}})
})();
