const U=h=>h.replace(/(.{8})(.{4})(.{4})(.{4})/,'$1-$2-$3-$4-');
for(const k in EMB.SP){const a=EMB.SP[k].split('|');EMB.SP[k]={id:U(a[0]),c:a[1],src:a[2],pg:a[3],d:a[4],t:a[5],r:a[6],dm:a[7],du:a[8],dv:a[9]}}
EMB.MA=EMB.MA.map(a=>({id:U(a[0]),n:a[1],s:a[2],p:a[3],c:a[4],q:a[5],sk:a[6],sp:a[7],t:a[8],a:a[9],g:a[10]}));
for(const k in EMB.TECH){const a=EMB.TECH[k];EMB.TECH[k]={id:U(a[0]),s:a[1],p:a[2],m:a[3]}}
for(const k in EMB.PW){const a=EMB.PW[k];EMB.PW[k]={id:U(a[0]),pts:a[1],lv:a[2],mx:a[3],lim:a[4],x:a[5],act:a[6],pg:a[7],aw:a[8],src:a[9]}}
const BOOK_OLD_BAD=['BBB','BOL','SSo','VG','SG2'];
function fixBooks(){
 const off=new Map(EMB.BOOKS),L=[['SR5',xl('Shadowrun 5ª edição')]];
 EMB.BOOKS.forEach(([c,n])=>{if(c!=='SR5')L.push([c,n])});
 BOOKS.forEach(([c,n])=>{if(!off.has(c)&&!BOOK_OLD_BAD.includes(c))L.push([c,n])});
 BOOKS.length=0;BOOKS.push(...L);
 [...SEL].forEach(c=>{if(!BOOKS.some(b=>b[0]===c))SEL.delete(c)});SEL.add('SR5');
 drawBooks()}
SEL.add('RG');SEL.add('HT');fixBooks();
