/* ===== v45.2: desfazer que sobrevive a recarregar a página, e desfazer de apagar / rerrolar todos =====
   Por ficha: a pilha (UNDO, em rerrolar.js) é gravada no IndexedDB ('__undo') por _id e restaurada ao abrir. Cobre rerrolar parte/tudo, condutas e mudar o nível.
   Da sessão: UG guarda as últimas 6 ações que mexem em várias fichas ou que fazem a ficha sumir (apagar uma, apagar todas, rerrolar todos).
   Cada item é uma cópia da ficha antes da ação: {c, i (posição), rep (substitui a ficha de mesmo _id) ou reinsere na posição i}. */
const UG=[],UG_MAX=6;let _usv=0;
function undoSave(){clearTimeout(_usv);_usv=setTimeout(()=>{const m={};(SESSAO.fichas||[]).forEach(c=>{const st=c._id&&UNDO.get(c);if(st&&st.length)m[c._id]=st});IDB.tx('readwrite',t=>t.put({name:'__undo',size:0,data:{sheets:m,glob:UG}})).catch(()=>{})},400)}
async function undoLoad(){try{const r=await IDB.tx('readonly',t=>t.get('__undo')),d=r&&r.data;if(!d)return;UG.length=0;(d.glob||[]).slice(-UG_MAX).forEach(e=>UG.push(e));
 SESSAO.fichas.forEach(c=>{const s=d.sheets&&c._id&&d.sheets[c._id];if(s&&s.length)UNDO.set(c,s)})}catch(e){avisa('desfazer',e)}}
const ugItem=(c,i,rep)=>({c:snapChar(c),i:i||0,rep:!!rep});
function ugPush(label,items){if(!items.length)return;UG.push({label,ts:Date.now(),items});while(UG.length>UG_MAX)UG.shift();undoSave();ugToast()}
function ugUndo(){const e=UG.pop();if(!e){say(xl('Nada para desfazer.'));return}
 const L=SESSAO.fichas;let n=0;
 e.items.filter(x=>x.rep).forEach(x=>{const j=L.findIndex(c=>c._id===x.c._id);if(j>=0){flagsTo(L[j],x.c);L[j]=x.c;n++}});
 e.items.filter(x=>!x.rep).sort((a,b)=>a.i-b.i).forEach(x=>{if(!L.some(c=>c._id===x.c._id)){L.splice(Math.min(x.i,L.length),0,x.c);n++}});
 SESSAO.fichas=favFirst(L);undoSave();saveN();keepScroll(()=>renderNPC(SESSAO.fichas));ugToast(1);
 say('Desfeito: '+e.label+' ('+n+xl(' ficha')+(n===1?'':'s')+(n<e.items.length?'; '+(e.items.length-n)+xl(' já tinham mudado ou voltado'):'')+').')}
/* aviso fixo no rodapé com o botão Desfazer (10 s); o botão da barra de cima fica enquanto houver o que desfazer */
function ugToast(quiet){let e=document.getElementById('ugbar');if(!UG.length||quiet){if(e)e.classList.remove('on');return}
 if(!e){e=document.createElement('div');e.id='ugbar';e.setAttribute('role','status');document.body.appendChild(e)}
 e.innerHTML='<span></span><button type="button">Desfazer</button>';e.firstChild.textContent=UG[UG.length-1].label;e.lastChild.onclick=ugUndo;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),10000)}
