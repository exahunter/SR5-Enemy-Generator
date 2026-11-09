// Efeitos de implantes e poderes nas estatísticas (SR5): REA/STR/AGI, dados de iniciativa e armadura.
// Fontes de Reação/iniciativa não se acumulam: vale a maior (Wired Reflexes, Reaction Enhancers, Improved Reflexes).
function augm(c){const r={REA:0,STR:0,AGI:0,id:0,AR:0};let wr=0,re=0,ir=0;
 (c.gear||[]).forEach(x=>{if(x.cat!=='cyber'&&x.cat!=='bio')return;const l=Math.max(1,+x.rt||1),n=x.n;
  if(n==='Wired Reflexes')wr=Math.max(wr,l);else if(n==='Reaction Enhancers')re=Math.max(re,l);
  else if(n==='Muscle Replacement'){r.STR+=l;r.AGI+=l}else if(n==='Muscle Augmentation')r.STR+=l;else if(n==='Muscle Toner')r.AGI+=l;
  else if(n==='Dermal Plating'||n==='Orthoskin')r.AR+=l});
 (c.powers||[]).forEach(p=>{if(p.n==='Improved Reflexes')ir=Math.max(ir,+p.l||0)});
 r.REA=Math.max(wr,re,ir);r.id=Math.max(wr,ir);return r}
function derived(c){const a=c.at,u=augm(c),E=k=>u[k]?Math.min(limA(c.meta,k,c.npc&&c.npc.pr),a[k]+u[k]):a[k],REA=E('REA'),STR=E('STR'),AGI=E('AGI'),spirit=!!(c.crit&&/Spirit/.test(c.crit.cat||'')),ess=c.ess??6;return{
 REA,STR,AGI,fis:8+Math.ceil(a.BOD/2),atu:8+Math.ceil(a.WIL/2),ini:REA+a.INT,dice:c._ddice??(spirit?2:Math.min(5,1+u.id)),
 lf:Math.ceil((STR*2+a.BOD+REA)/3),lm:Math.ceil((a.LOG*2+a.INT+a.WIL)/3),ls:Math.ceil((a.CHA*2+a.WIL+ess)/3)}}
