function jsonBase(c){
const a=c.at||{},S=xS,M=META[c.meta]||{},bs=M.par||c.meta,aw=!!c.magic,
adp=['Adept','Mystic Adept'].includes(c.talent)||(!c.talent&&c.arch==='Adepto físico'),
tm=c.talent==='Technomancer'||!!(a.RES&&!c.magic),d=derived(c),P=c.P||{},sp=(M.sp&&M.sp[P.meta])||0,
it=k=>(c.gear||[]).filter(i=>k.includes(i.cat)).map(i=>xItemRow(i,c)),
sk=xSkillRows(c),
ch={settings:(document.getElementById('cset')||{}).value||'default.xml',buildmethod:'Priority',
metatype:bs,metatype_english:bs,metatype_guid:(META[bs]||{}).id||XZ,
metavariant:M.par?(M.mv||c.meta):null,metavariant_english:M.par?(M.mv||c.meta):null,metavariant_guid:(M.par&&M.id)||XZ,
prioritymetatype:P.meta,priorityattributes:P.attr,priorityspecial:P.magic,priorityskills:P.skill,priorityresources:P.res,
primaryarm:'Right',name:'Unnamed Character',alias:c.alias,
limitphysical:S(d.lf),limitmental:S(d.lm),limitsocial:S(d.ls),karma:String(kmLeft(c)),special:S(sp),totalspecial:S(sp),
attributes:['0',{attributecategory_english:'Standard',attribute:xAttrRows(c)}],
totalattributes:S(AP[P.attr]||0),edgeremaining:S(a.EDG),created:'False',
nuyen:nyArquivo(nyLeft(c)),
adept:aw&&adp?'True':'False',magician:aw&&(c.talent?c.talent!=='Adept':!adp)?'True':'False',
technomancer:tm?'True':'False',ai:M.ai?'True':'False',critter:'False',totaless:(c.ess??6).toFixed(2),
physicalcm:S(d.fis),stuncm:S(d.atu),magenabled:aw?'True':'False',initiategrade:'0',
resenabled:tm?'True':'False',depenabled:M.ai?'True':'False',
skills:{skill:sk.length===1?sk[0]:sk},contacts:null,lifestyles:null};
xPut(ch,'spells','spell',(c.spells||[]).map(([n,cat,src,id])=>xSpellRow(n,cat,src,id)));
xPut(ch,'powers','power',(c.powers||[]).map(p=>({guid:xU(),name:p.n,rating:S(p.l)})));
xPut(ch,'spirits','spirit',(c.spirits||[]).map(x=>({guid:xU(),name:x.n,force:S(x.force),services:S(x.svc??x.force),bound:'True'})));
xPut(ch,'armors','armor',it(['armor']));
xPut(ch,'weapons','weapon',it(['weapon']));
xPut(ch,'cyberwares','cyberware',it(['cyber','bio']));
xPut(ch,'gears','gear',it(['gear','comm','auto','prog']));
xPut(ch,'vehicles','vehicle',it(['drone','veh']));
xPut(ch,'qualities','quality',(c.q||[]).map(o=>({guid:xU(),sourceid:o.id||XZ,name:o.n,name_english:o.n,fullname:o.n,
extra:o.x||null,bp:S(o.t==='Negative'?-o.c:o.c),qualitytype:o.t,qualitytype_english:o.t,qualitysource:'Selected',
metagenic:'False',source:o.s||'SR5',page:o.pg||null,notes:null})));
const st=xStats(c);for(const k in st)if(ch[k]==null)ch[k]=st[k];
['gender','age','eyes','height','weight','skin','hair','description','background','concept','notes','playername',
'gamenotes','groupname','groupnotes'].forEach(k=>{if(ch[k]===undefined)ch[k]=null});
if(c.talent&&c.talent!=='Adept'){
if(ch.technomancer==='True'){const WIL=+a.WIL||0;ch.tradition={name:'Default',name_english:'Default',drain:'WIL + RES',drainvalue:S(WIL+(+a.RES||0)),istechnomancertradition:'True'}}
else{const ti=tradInfo(c),sp=ti.sp||{};ch.tradition={name:ti.n,name_english:ti.n,drain:ti.dr.replace(/[{}]/g,''),drainvalue:S(tradDrain(c,ti)),
spiritcombat:sp.Combat,spiritdetection:sp.Detection,spirithealth:sp.Health,spiritillusion:sp.Illusion,spiritmanipulation:sp.Manipulation,istechnomancertradition:'False'}}}
return {'?xml':{'@version':'1.0','@encoding':'utf-8'},characters:{character:ch}}}
