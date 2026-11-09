/* ===== v40: condutas de combate de critters e espíritos (banco em data/critter-condutas.js) =====
 * Temperamento sorteado uma vez por ficha (predador, territorial, presa, emboscador, sapiente; espírito para Spirits; sprite para Sprites).
 * 3 condutas com a vida alta (abordagem, terreno, poder) e 3 com a vida baixa (ferido → muito ferido → quase caindo; o último é o que faz quando sabe que está quase morto).
 * Ficam em c.critCond; refeitas se mudar meta, Força, poderes ou perícias.
 * v41: a 2ª e a 3ª conduta da vida alta e o passo 2 da vida baixa podem vir de uma HABILIDADE da ficha (data/critter-acoes.js: CC_SK_H, CC_SK_L);
 * toda conduta é ligada às ações do livro (actions.xml), à perícia (com o rating da ficha) e ao poder que a motivou, na ficha e nas notas do Chummer. */
const ccFill=t=>t.replace(/\{([^{}]*\|[^{}]*)\}/g,(m,a)=>pick(a.split('|')));
function ccTemp(c){
 const cat=(c.crit&&c.crit.cat)||'',pw=(c.powers||[]).map(p=>p.n),nm=String(c.meta||'');
 if(/Spirit/.test(cat))return'espirito';
 if(/Sprite/.test(cat))return'sprite';
 /* v43: Watcher, Homunculus e Corps Cadavre (categoria Ritual) são criados por um mago para servir: temperamento próprio, sem fuga nem vontade própria */
 if(/Ritual/.test(cat))return'servo';
 /* v42: quase todo Ritual/Infected/Extraplanar tem o poder Sapience; ele sozinho dá sapiente só em ~35% dos casos (o resto sorteia como os demais) */
 if(/Shedim|Dracoform/.test(cat)||/Dragon|Drake|Sasquatch|Naga|Centaur|Ghoul|Goblin|Banshee|Harpy|Merrow|Gnome|Troll|Ogre|Vampire|Nosferatu|Loup-Garou|Fomoraig|Dzoo/i.test(nm)||(pw.includes('Sapience')&&Math.random()<.35))return'sapiente';
 const has=re=>pw.some(n=>re.test(n)),W={predador:4,territorial:2.5,presa:1,emboscador:1};
 if(has(/Concealment|Camouflage/))W.emboscador+=3;
 if(has(/Venom|Fear|Paralyzing|Engulf|Natural Weapon/))W.predador+=2;
 if(!has(/Natural Weapon|Venom|Elemental/))W.presa+=2;
 /* v42: pelo nome (medido: Horse, Giraffe, Pegasus e Unicorn saíam ~55% predador, Bear e Boar também) */
 if(/Horse|Giraffe|Pegasus|Unicorn|Deer|Cow\b|Goat|Rabbit|Hare|Squirrel|Dot-Camel|Sloth|Peryton/i.test(nm)){W.presa+=4;W.territorial+=1.5;W.predador=Math.max(.5,W.predador-3)}
 if(/Bear|Boar|Razorback|Elephant|Pachyderm|Wolverine|Juggernaut|Behemoth|Hellcow|Rhino/i.test(nm)){W.territorial+=3;W.predador=Math.max(1,W.predador-1.5)}
 if(/Snake|Spider|Alligator|Crocodil|Lobster|Basilisk|Cockatrice|Squid|Scorpion|Leech/i.test(nm)){W.emboscador+=3.5;W.predador=Math.max(1.5,W.predador-1.5)}
 if(/\bRat\b|Cockroach|Ferret|Raccoon|Domestic Cat|Crow|Digit/i.test(nm)){W.presa+=2;W.territorial+=.5;W.predador=Math.max(1.5,W.predador-1.5)}
 return wchoose(Object.entries(W),x=>x[1])[0]}
/* habilidade da lista ("A|B") que o critter tem de fato, ou undefined */
const ccSkOf=(c,sks)=>sks.split('|').find(x=>(+(c.sk||{})[x]||0)>0);
function ccBuild(c){
 const pw=(c.powers||[]).map(p=>p.n.replace(/^Fraqueza: /,'')),tp=ccTemp(c),sk=c.sk||{};
 const used=[],hiS=[null,null,null],hiA=[null,null,null],hiP=[null,null,null],loS=[null,null,null],loA=[null,null,null];
 const a=ccFill(pick(CC_HI_A[tp])),elig=CC_HI_P.filter(([re])=>pw.some(n=>re.test(n))),
  TT=tp==='sprite'?CC_HI_TS:tp==='servo'?CC_HI_TV:CC_HI_T,t=pick(TT),t2=pick(TT.filter(x=>x!==t)),tpx=tp==='sprite'||tp==='servo'?'espirito':tp;
 const pickH=()=>{const el=CC_SK_H.filter(o=>!used.includes(o[0])&&ccSkOf(c,o[0])&&!o[4].includes(tpx));return el.length?wchoose(el,o=>o[3]):null},
  take=(o,i)=>{const s=ccSkOf(c,o[0]);used.push(o[0]);hiS[i]={s,r:+sk[s]||0};hiA[i]=o[2];return ccFill(o[1])};
 /* 2ª conduta: habilidade (70% quando o critter tem alguma que cabe no temperamento) ou terreno */
 const s2=Math.random()<.7?pickH():null,h2=s2?take(s2,1):ccFill(t);
 /* 3ª conduta: poder; com poder e habilidade disponíveis, 35% das vezes vem a habilidade; sem poder, habilidade antes do terreno */
 let h3;
 if(elig.length){const s3=Math.random()<.35?pickH():null;
  if(s3)h3=take(s3,2);else{const e=pick(elig);h3=ccFill(e[1]);hiP[2]=pw.filter(n=>e[0].test(n)).filter((n,i,l)=>l.indexOf(n)===i).slice(0,2)}}
 else{const s3=pickH();h3=s3?take(s3,2):ccFill(t2)}
 const d=derived(c),fis=Math.max(5,d.fis),atu=Math.max(5,d.atu);
 let tB=Math.max(3,Math.min(fis-2,Math.round(fis*.7)));const tA=Math.max(1,Math.min(tB-1,Math.round(tB*.55))),tC=fis-1;
 const at=(n,i)=>{const s=Math.min(atu-1,Math.round(atu*[.6,.8,.9][i]));return traduz('cond.caixas',{n,f:fis,s,a:atu})};
 const L=CC_LO[tp],foge=(tp==='presa'||tp==='emboscador'||(tp==='sapiente'&&Math.random()<.4)||Math.random()<.15)&&tp!=='espirito'&&tp!=='sprite'&&tp!=='servo',
  s1=ccFill(L[0][0]),s3=ccFill(CC_LAST[tp]);
 /* passo 2 da vida baixa: fuga (com os 3 desfechos), recuo do temperamento ou recuo/reação de uma habilidade da ficha */
 let s2t;
 if(foge)s2t=ccFill(CC_FUGA[0]);
 else{const cand=[{t:L[1][0]},{t:L[2][0]},...CC_SK_L.filter(o=>ccSkOf(c,o[0])&&!o[3].includes(tpx)).map(o=>({t:o[1],o}))],ch=wchoose(cand,x=>x.o?1.5:1);
  s2t=ccFill(ch.t);if(ch.o){const s=ccSkOf(c,ch.o[0]);loS[1]={s,r:+sk[s]||0};loA[1]=ch.o[2]}}
 return{tp,hi:[a,h2,h3],lo:[at(tA,0)+s1,at(tB,1)+s2t,at(tC,2)+s3],hiS,hiA,hiP,loS,loA}}
function critCondOf(c){
 if(!c||!c.crit)return null;
 const sig=JSON.stringify(['v43',c.meta,c.crit.force,(c.powers||[]).map(p=>p.n),Object.keys(c.sk||{})]);
 if(c.critCond&&c.critCond.sig===sig)return c.critCond;
 try{c.critCond=Object.assign({sig},ccBuild(c))}catch(e){console.error('condutas de critter',e);return null}
 return c.critCond}
/* ---- v41: ligação das condutas com as ações do livro (actions.xml), a perícia e o poder da ficha ---- */
const ccStrip=t=>String(t||'').replace(/^Com .*?primeiro\): /,'');
/* até 2 ações do livro: as da própria habilidade (forced) ou as que o texto descreve (CCR); só de livro marcado */
function ccRefs(c,t,forced){
 const ok=n=>{const a=ACO[n];return a&&okSrc(a[2])};let r=[];
 if(forced&&forced.length)r=forced.slice();
 else{const l=ccStrip(t).replace(/foge s[óo] quando.*$/i,'').split(';')[0].toLowerCase(),hit=[];
  for(const[re,ns,stop]of CCR){const m=re.exec(l);if(!m)continue;if(stop){r=ns.slice();hit.length=0;break}hit.push([m.index,ns])}
  if(!r.length)hit.sort((x,y)=>x[0]-y[0]).forEach(([,ns])=>ns.forEach(n=>{if(!r.includes(n))r.push(n)}))}
 r=r.map(n=>n==='Sprint'&&!(+(c.sk||{}).Running>0)?'Run':n);   // Sprint (STR + Running) exige a perícia
 return[...new Set(r.filter(ok))].slice(0,2)}
/* tudo que uma conduta cita: ações, perícia (com o rating da ficha) e poder (com a ação do poder, de CPW) */
function ccInfo(c,k,part,i){const t=k[part][i],forced=(k[part+'A']||[])[i]||null,S=(k[part==='hi'?'hiS':'loS']||[])[i]||null,PW=part==='hi'?((k.hiP||[])[i]||[]):[];
 const pw=PW.map(n=>{const p=(c.powers||[]).find(x=>x.n===n),D=(typeof CPW!=='undefined'&&CPW[n])||{};return n+(p&&p.x?' ('+p.x+')':'')+(D.act&&D.act!=='Auto'?' — '+D.act:'')});
 return{ac:ccRefs(c,t,forced),sk:S,pw}}
const ccSuf=(c,k,part,i)=>{const o=ccInfo(c,k,part,i),b=[];if(o.ac.length)b.push(xl('ação: ')+o.ac.join('; '));if(o.sk)b.push(xl('perícia: ')+o.sk.s+' '+o.sk.r);if(o.pw.length)b.push(xl('poder: ')+o.pw.join(', '));return b.length?' ['+b.join(' · ')+']':''};
const ccHtml=(c,k,part,i)=>{const o=ccInfo(c,k,part,i),b=[];
 if(o.ac.length)b.push(o.ac.map(n=>'<span title="'+esc(acTipo(n))+'">'+esc(n)+'</span>').join(' · '));
 if(o.sk)b.push(xl('<span title="perícia da ficha que sustenta esta conduta">')+traduz('cond.pericia',{p:esc(o.sk.s),r:o.sk.r})+'</span>');
 if(o.pw.length)b.push(xl('<span title="poder da ficha que motivou esta conduta">poder ')+o.pw.map(esc).join(', ')+'</span>');
 return b.length?' <span class="note">['+b.join(' · ')+']</span>':''};
/* linhas "Ação (tipo, livro p.N; reserva X; limite Y)" de tudo que as condutas citam, mais as duas defesas básicas */
function acResumoCrit(c){const k=critCondOf(c);if(!k)return[];const seen=[];
 ['hi','lo'].forEach(part=>k[part].forEach((t,i)=>ccInfo(c,k,part,i).ac.forEach(n=>{if(!seen.includes(n))seen.push(n)})));
 ['Melee Defense','Ranged Defense'].forEach(n=>{if(ACO[n]&&okSrc(ACO[n][2])&&!seen.includes(n))seen.push(n)});
 return seen.map(n=>acLinha(n,c))}
function critCondNotas(c){const k=critCondOf(c);if(!k)return[];
 const R=[];try{const r=acResumoCrit(c);if(r.length)R.push(xl('Ações do livro citadas nas condutas: ')+r.join(' · '))}catch(e){avisa('acoes-critter',e)}
 return[xl('Temperamento: ')+CC_TEMP[k.tp],xl('Condutas com a vida alta: ')+k.hi.map((t,i)=>(i+1)+') '+t+ccSuf(c,k,'hi',i)).join(' · '),xl('Condutas com a vida baixa: ')+k.lo.map((t,i)=>(i+1)+') '+t+ccSuf(c,k,'lo',i)).join(' · '),...R]}
ganchoNotas.camada('condutas-critter',g=>function(c){let p=[];try{p=critCondNotas(c)}catch(e){console.error('critCondNotas',e)}return[...g(c),...p]});
