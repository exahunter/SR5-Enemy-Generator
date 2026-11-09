/* ===== Ataque desarmado e armas naturais no inventário =====
   Todo personagem recebe "Unarmed Attack" (como o Chummer faz); critters recebem também uma arma por poder Natural Weapon
   (Bite, Claws, Horns…), com dano/PA/alcance lidos do campo de seleção do poder. Os itens levam nat:1 (custo 0, não contam como arma comprada). */
Object.assign(XSKW,{Unarmed:'Unarmed Combat'});
const NAT_DEF={damage:'({STR}+0)S',ap:'0',reach:'0'};   // padrão do ataque desarmado quando o weapons.xml do Chummer não foi importado
const natItem=(n,dmg,ap,reach,note)=>({cat:'weapon',n,cost:0,src:'SR5',ess:0,id:'',sub:'Unarmed',nat:1,
 st:{damage:dmg,ap:String(ap||0),mode:'0',rc:'0',ammo:'0',accuracy:'Physical',reach:String(reach||0),conceal:'0',avail:'0',type:'Melee'}});
function natParse(p,F){const x=(p.x||'').trim(),pn=p.n.replace(/^Fraqueza: /,'');
 const dv=/DV\s*[:=]?\s*([^|;]+?)(?=\s*(?:[|;]|,?\s*(?:AP|Reach)\b|\)\s*$|$))/i.exec(x),ap=/AP\s*[:=]?\s*(-?\d+)/i.exec(x),rc=/Reach\s*[:=]?\s*(\d+)/i.exec(x);
 let d=dv?dv[1].trim().replace(/\{?STR\}?/g,'{STR}').replace(/\{?\bF(?:orce)?\b\}?/g,String(F)):'';
 if(d&&!/[PS]\s*$/i.test(d))d+='P';
 let nm=x.split(/\b(?:DV|AP|Reach)\b/i)[0].replace(/[\s(:|;,]+$/,'').replace(/^[\s(]+/,'').trim();
 if(!nm){const m=/\(([^)]+)\)/.exec(pn);nm=m?m[1]:'Natural Weapon'}
 return natItem(nm,d||'({STR}+0)P',ap?ap[1]:0,rc?rc[1]:0)}
function armaNatural(c){if(!c||!c.gear||(META[c.meta]||{}).ai)return;
 c.gear=c.gear.filter(x=>!x.nat);
 const kh=(c.powers||[]).some(p=>p.n==='Killing Hands');
 const row=(typeof ITEMS!=='undefined'?ITEMS:[]).find(i=>i[0]==='weapon'&&i[1]==='Unarmed Attack'),s=row&&row[7]||{};
 let dmg=s.damage||NAT_DEF.damage;if(kh)dmg=dmg.replace(/S\s*$/,'P');
 const u=natItem('Unarmed Attack',dmg,s.ap||NAT_DEF.ap,s.reach||NAT_DEF.reach);if(row){u.id=row[5]||'';u.src=row[3]||'SR5'}
 const out=[u];
 if(c.crit)(c.powers||[]).forEach(p=>{if(/Natural Weapon/i.test(p.n)&&!/Improved Natural Armor/i.test(p.n)&&!/^Fraqueza/.test(p.n))out.push(natParse(p,c.crit.force))});
 c.gear.unshift(...out)}
genCritter.camada(xl('arma natural'),g=>function(...a){const c=g(...a);armaNatural(c);return c});
npcPos(xl('arma natural'),c=>armaNatural(c));
renderNPC.camada(xl('arma natural'),r=>function(L){L.forEach(armaNatural);return r(L)});
