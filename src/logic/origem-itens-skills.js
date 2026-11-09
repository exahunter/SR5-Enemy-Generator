/* alcances (ranges.xml): a arma aponta para uma tabela por <range>; sem isso vale a categoria (ALC.c cobre os nomes diferentes).
 * Faixas no formato do Chummer: curto "min-curto", médio "curto+1-médio"…; fórmulas com {STR} usam a FOR total do NPC
 * (arco: o menor entre a FOR e o nível do arco). Arma corpo a corpo, granada sem tabela etc. ficam nulas. */
function xRng(nm,cat,STR,wn,alt){
const T=ALC.r,k=T[nm]?nm:(!alt&&!nm&&(T[cat]?cat:ALC.c[cat]))||'',t=T[k];
const nul={name:alt?null:(cat||null),name_english:alt?null:(cat||null),short:null,medium:null,long:null,extreme:null};
if(!t)return nul;
const st=/^Bows$/.test(k)?Math.min(STR,+((/\(Rating (\d+)\)/.exec(wn||'')||[])[1])||STR):STR;
const v=e=>{e=String(e).replace(/\{STR\}/g,st);if(!/^[0-9+\-*\/.() ]+$/.test(e))return -1;try{return Math.floor(Function('return '+e)())}catch(x){return -1}};
const m=v(t[0]),n=[1,2,3,4].map(i=>v(t[i]));
const f=(a,b)=>b<0?null:a+'-'+b;
return{name:k,name_english:k,short:f(Math.max(m,0),n[0]),medium:n[1]<0||n[0]<0?null:f(n[0]+1,n[1]),long:n[2]<0||n[1]<0?null:f(n[1]+1,n[2]),extreme:n[3]<0||n[2]<0?null:f(n[2]+1,n[3])}}
/* acabamento por tipo de item — o que o wrapper fazia com Object.assign */
const xFinish={
gear:o=>Object.assign(o,{qty:o.qty||'1',gearname:null,location:null,wirelesson:'False'}),
armor:o=>Object.assign(o,{armorname:null,location:null,wirelesson:'True'}),
cyber:(o,c,i)=>Object.assign(o,{grade:i.gr||i.grade||o.grade||'Standard',rating:xS(i.rt||0),location:null}),
weapon:(o,c)=>{const cat=o.category||'',mel=XMEL.includes(cat)||o.type==='Melee',sk=XSKW[cat]||o.useskill||'',
rt=(c.sk||{})[sk]||0,AGI=xE(c,'AGI'),STR=xE(c,'STR'),pool=xS(Math.max(0,rt+AGI-(rt?0:1))),dd=xDmg(o.damage,STR);
if(o.damage!=null){o.rawdamage=o.damage;o.damage=dd;o.damage_english=dd;o.damage_noammo=dd;o.damage_noammo_english=dd}
return Object.assign(o,{type:o.type||(mel?'Melee':'Ranged'),skill:sk||null,dicepool:pool,dicepool_noammo:pool,
weaponname:null,location:null,availablemounts:o.availablemounts||'None',availableammo:'0',currentammo:'None',
currentammo_english:'None',clips:null,wirelesson:'True',notes:o.notes||null,
ranges:xRng(o.range||(ALC.w[o.name]||[])[0]||'',cat,STR,o.name),
alternateranges:xRng(o.alternaterange||(ALC.w[o.name]||[])[1]||'',null,STR,o.name,1)})},
drone:o=>o};
xFinish.comm=xFinish.gear;xFinish.auto=xFinish.gear;xFinish.prog=xFinish.gear;xFinish.veh=xFinish.drone;xFinish.bio=xFinish.cyber;
function xItemRow(i,c){
const o=Object.assign({guid:i.g||xU(),sourceid:i.id||XZ,name:i.n,name_english:i.n,fullname:i.n,fullname_english:i.n,
category:i.sub||null,category_english:i.sub||null,cost:xS(i.cost),owncost:xS(i.cost),source:i.src,equipped:'True'},i.st||{});
if(i.cat==='cyber'||i.cat==='bio')o.ess=xS(i.ess);
if(i.qty)o.qty=xS(i.qty);if(i.fk||(i.eqd&&i.rt))o.rating=xS(i.rt);
const r=eqJson(i,(xFinish[i.cat]||xFinish.gear)(o,c,i));
if(i.cat!=='drone'&&i.cat!=='veh'){r.name_english=r.name;r.fullname=r.name;r.fullname_english=r.name;r.category_english=r.category||null}
return r}
function xAttrRows(c){
const a=c.at||{},S=xS,aw=!!c.magic,tm=c.talent==='Technomancer'||!!(a.RES&&!c.magic),out=[];
['STR','CHA','INT','AGI','REA','ESS','EDG','LOG','BOD','WIL',...(aw?['MAG']:[]),...(tm?['RES']:[])].forEach(k=>{
let mn,mx,v;
if(k==='ESS'){mn=1;mx=6;v=1}else{[mn,mx]=lim(c.meta,k);v=a[k]!==undefined?a[k]:(k==='RES'?1:mn)}
const sp=k==='ESS'||k==='EDG'||k==='MAG'||k==='RES';
out.push({name_english:k,name:k,base:S(v),total:S(sp?v:xE(c,k)),min:S(mn),max:S(mx),
aug:S(sp?mx:limA(c.meta,k,c.npc&&c.npc.pr)),bp:'0',metatypecategory:sp?'Special':'Standard'})});
return out}
function xSkillRows(c){
const a=c.at||{},A=k=>+a[k]||0,S=xS,G=typeof SKGRP!=='undefined'?SKGRP:{},out=[];
Object.entries(c.sk||{}).forEach(([n,r])=>{const k=SKA[n]||'AGI',av=a[k]||0,tot=(+r||0)+av,g=G[n]||'None';
out.push({guid:xU(),suid:DATA.sid[n]||XZ,name:n,name_english:n,skillgroup:g,skillgroup_english:g,
skillcategory:SKCAT[n]||null,skillcategory_english:SKCAT[n]||null,grouped:'False',default:'True',
requiresgroundmovement:'False',requiresswimmovement:'False',requiresflymovement:'False',
rating:S(r),ratingmax:'6',specializedrating:S(tot+(c.specs&&c.specs[n]?SPEC_B:0)),total:S(tot),knowledge:'False',
exotic:/^Exotic/.test(n)?'True':'False',buywithkarma:'False',base:S(r),karma:'0',spec:(c.specs&&c.specs[n])||null,
attribute:k,displayattribute:k,notes:null,source:'SR5',page:null,attributemod:S(av),
ratingmod:'0',poolmod:'0',islanguage:'False',isnativelanguage:'False',bp:'0',skillspecializations:(c.specs&&c.specs[n])?{skillspecialization:{guid:xU(),name:c.specs[n],name_english:c.specs[n],free:'False',expertise:'False',specbonus:S(SPEC_B)}}:null})});
const kn=(n,t,rt,att,lang,nat)=>{const av=A(att);return{guid:xU(),suid:null,name:n,name_english:n,
skillgroup:'None',skillgroup_english:'None',skillcategory:t,skillcategory_english:t,grouped:'False',default:'False',
requiresgroundmovement:'False',requiresswimmovement:'False',requiresflymovement:'False',rating:S(rt),ratingmax:'12',
specializedrating:nat?'2147483647':S(rt+av),total:nat?'2147483647':S(rt+av),knowledge:'True',exotic:'False',
buywithkarma:'False',base:S(rt),karma:'0',spec:null,attribute:att,displayattribute:att,notes:null,source:null,page:null,
attributemod:S(av),ratingmod:'0',poolmod:'0',islanguage:lang?'True':'False',isnativelanguage:nat?'True':'False',
bp:'0',skillspecializations:null}};
(c.know||[]).forEach(n=>{const t=xKnowType(n);out.push(kn(n,t,1,t==='Academic'||t==='Professional'?'LOG':'INT',false,false))});
if(c.lang)out.push(kn(c.lang,'Language',0,'INT',true,true));
return out}
