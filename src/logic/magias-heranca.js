(function(){
 const i=POS.findIndex(o=>o[0]==='Double-Jointed');
 if(i>=0)POS[i]=['Double-Jointed',6,'SR5','db579224-99c7-48e0-84ab-77a987a84f4a',[['Skill','Escape Artist',2,'']]];
 const NID={'Bad Luck':['bc5f41ca-1549-4367-9c12-afa403182f8c',[['Notoriety','',1,'']]],'Combat Paralysis':['62c7ed8f-b534-41e3-84ac-29534826d476',[['Notoriety','',1,'']]],'Distinctive Style':['a030d7e2-755b-4f71-b848-ad9772fba242'],'Uncouth':['f0873c37-4f09-41cd-be81-88e8df5b42ae',[['Notoriety','',1,'']]],'Sensitive System':['13fd45c3-e031-4452-8bf8-31829d2401f9'],'Social Stress':['8ba2830a-3f10-4877-9752-93be051b205b']};
 NEG.forEach((o,k)=>{if(o[0]==='Insomnia')NEG[k]=['Insomnia (Basic)',10,'SR5','0cf25fda-725b-49fd-a8cf-de589e938065'];else if(NID[o[0]]&&!o[3])NEG[k]=[o[0],o[1],o[2]||'SR5',NID[o[0]][0],NID[o[0]][1]||[]]});
 const ren=(obj,a,b)=>{if(obj&&obj[a]!==undefined){obj[b]=obj[a];delete obj[a]}};
 [QAFF['Samurai de rua'].pos,QAFF['Adepto físico'].pos].forEach(p=>ren(p,'Double-Jointed','Double-Jointed'));
 [QMAGE.neg,QAFF['Decker'].neg,QAFF['Rigger'].neg].forEach(p=>ren(p,'Insomnia','Insomnia (Basic)'))})();
const SPX={};
Object.entries(EMB.SP).forEach(([n,d])=>{SPX[d.id]=d;const i=SPELLS.findIndex(s=>s[0]===n);if(i>=0)SPELLS[i]=[n,d.c,d.src,d.id]});
(EMB.XM||[]).forEach(x=>{
 if(x.par&&!META[x.par])META[x.par]={cat:x.cat,lim:{},sp:{},id:x.pid,hid:1,src:x.src};
 if(!META[x.k])META[x.k]={cat:x.cat,lim:x.lim,sp:x.sp,kc:x.kc,id:x.id,src:x.src,par:x.par,mv:x.mv,grp:'Formas especiais',fx:1,ai:x.ai?1:0,sh:x.sh?1:0}});
try{fillMeta()}catch(e){avisa('magias-heranca',e)}
function applyHeritage(){
 for(const [n,d] of Object.entries(EMB.MT)){
  const m=META[n];if(!m)continue;
  if(d.sp)m.sp=Object.assign({},d.sp);
  m.kc=Object.assign({},d.kc||{});
  if(m.approx||!m.id){
   if(m.approx){m.lim=Object.assign({},d.lim);m.src=d.src;delete m.approx}
   if(!m.id)m.id=d.id}
  if(d.cat==='Metasapient')m.cat='Metasapient'}}
applyHeritage();
