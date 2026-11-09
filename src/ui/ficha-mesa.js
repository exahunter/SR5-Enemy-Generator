/* ===== v46: modo mesa — ficha compacta para o mestre usar na partida (tela e impressão) =====
   Cada ficha ganha um bloco .mesa (escondido no modo normal): números de combate, armas com a reserva de dados,
   caixas de dano (físico e atordoamento, penalidade conforme a configuração), perícias mais fortes e as condutas.
   O botão "Modo mesa" mostra só esse bloco; "Imprimir mesa" imprime nele (2 fichas por linha). */
(()=>{
 const KEY='sr5-modo-mesa',E=x=>esc(String(x==null?'':x)),ls=f=>{try{return f()}catch(e){return null}};
 const li=(a,lo)=>(a||[]).map(t=>{const i=lo?String(t).indexOf(': '):-1;return i>0?'<li><b>'+E(t.slice(0,i+1))+'</b>'+E(t.slice(i+2))+'</li>':'<li>'+E(t)+'</li>'}).join('');
 function bloco(c){
  const d=derived(c),a=c.at||{},u=augm(c),arm=eqArm(c)+u.AR,SW=window.__SKW||{},sk=c.sk||{};
  const nums=['<span><b>Init</b> '+d.ini+'+'+d.dice+'d6</span>',xl('<span><b>Defesa</b> ')+(d.REA+a.INT)+'</span>',xl('<span><b>Resist.</b> ')+(a.BOD+arm)+' <small>(arm. '+arm+')</small></span>',xl('<span><b>Limites</b> ')+d.lf+' / '+d.lm+' / '+d.ls+'</span>'].join('');
  /* armas: dados = perícia + AGI (−1 sem a perícia), igual ao "Ataque" da ficha completa */
  const SKX={Holdouts:'Pistols','Light Machine Guns':'Heavy Weapons','Medium Machine Guns':'Heavy Weapons','Heavy Machine Guns':'Heavy Weapons'},   // o mapa da ficha completa (__SKW) não tem estes tipos
   skOf=w=>SW[w.sub]||SKX[w.sub]||(/Machine Gun/.test(w.sub||'')?'Heavy Weapons':/^Grenade/.test(w.n||'')?'Throwing Weapons':''),
   acc=x=>/^Physical$/i.test(x||'')?xl('Fís ')+d.lf:(x||'–'),pa=x=>!x||x==='-'?'–':x,
   last=s=>s.ammo&&s.ammo!=='0'?s.ammo:(+s.reach>0?'Alc. '+s.reach:'–');
  const ws=(c.gear||[]).filter(g=>g.cat==='weapon'),wsk=new Set();
  const wrows=ws.map(w=>{const s=w.st||{},k=skOf(w),rt=k?+(sk[k]||0):0;if(k)wsk.add(k);const pool=k?Math.max(0,d.AGI+rt-(rt?0:1)+(rt?specBonusArma(c,w):0)):'–';
   return'<tr><td>'+E(w.n)+'</td><td class="dp">'+pool+'</td><td>'+E(acc(s.accuracy))+'</td><td>'+E(s.damage?dmgEval(s.damage,d.STR):'–')+'</td><td>'+E(pa(s.ap))+'</td><td>'+E(s.mode&&s.mode!=='0'?s.mode:'–')+'</td><td>'+E(s.rc&&s.rc!=='0'?s.rc:'–')+'</td><td>'+E(last(s))+'</td></tr>'}).join('');
  const wt=wrows?xl('<table class="mw"><thead><tr><th>Arma</th><th>Dados</th><th>Prec.</th><th>Dano</th><th>PA</th><th>Modo</th><th>CR</th><th>Mun.</th></tr></thead><tbody>')+wrows+'</tbody></table>':xl('<div class="note">Sem arma.</div>');
  /* perícias mais fortes (fora as das armas), com os dados que ele rola */
  const attr=k=>k==='MAG'?(+c.magic||0):(k in d?+d[k]:+(a[k]||0));
  const top=Object.entries(sk).filter(([n])=>SKA[n]&&!wsk.has(n)&&!/^(Pilot |Gunnery)/.test(n)).map(([n,v])=>[n,(+v||0)+attr(SKA[n])]).sort((x,y)=>y[1]-x[1]).slice(0,6);
  const sks=top.length?xl('<div class="ms"><b>Dados</b> ')+top.map(x=>E(x[0])+' '+x[1]).join(' · ')+'</div>':'';
  const mon=danoHTML(c);   // caixas clicáveis (logic em ui/caixas-dano.js), as mesmas da ficha completa
  let k=null;try{k=c.crit?critCondOf(c):condOf(c)}catch(e){console.error('modo mesa: condutas',e)}
  const cond=k?'<div class="mh">'+(c.crit?(typeof CC_TEMP!=='undefined'&&CC_TEMP[k.tp]?xl('Temperamento: ')+E(CC_TEMP[k.tp]):''):(k.pf?t('mesa.perfil',{pf:E(k.pf),n:E(k.loy)}):''))+xl('</div><div class="mc"><div><b>Vida alta</b><ol>')+li(k.hi)+xl('</ol></div><div><b>Vida baixa</b><ol>')+li(k.lo,1)+'</ol></div></div>':'';
  return'<div class="mesa"><div class="mn">'+nums+'</div>'+wt+sks+'<div class="mm">'+mon+'<div class="note">'+t('fer.nota',{r:ferRegra()})+'</div></div>'+cond+'</div>'}
 decorateSheet((sh,c)=>{const sec=sh.querySelector('.sec');if(!sec||sec.querySelector(':scope > .mesa'))return;
  try{sec.insertAdjacentHTML('beforeend',bloco(c))}catch(e){console.error('modo mesa',e)}});
 const apply=on=>{document.body.classList.toggle('modo-mesa',!!on);const b=document.getElementById('mesab');if(b)b.textContent=on?xl('Sair do modo mesa'):xl('Modo mesa')};
 decoratePage((L,out)=>{const bar=out.querySelector(':scope > .toolbar, :scope > .actions');if(!bar||bar.querySelector('#mesab'))return;
  const h='<button id="mesab">Modo mesa</button><button id="mesap">'+xl('Imprimir mesa')+'</button>',p=document.getElementById('prt');
  if(p)p.insertAdjacentHTML('afterend',h);else bar.insertAdjacentHTML('beforeend',h);
  document.getElementById('mesab').onclick=()=>{const v=!document.body.classList.contains('modo-mesa');apply(v);ls(()=>localStorage.setItem(KEY,v?'1':'0'))};
  document.getElementById('mesap').onclick=()=>{const was=document.body.classList.contains('modo-mesa'),undo=()=>{apply(was);window.removeEventListener('afterprint',undo)};apply(true);window.addEventListener('afterprint',undo);window.print()};
  apply(ls(()=>localStorage.getItem(KEY))==='1')});
})();
