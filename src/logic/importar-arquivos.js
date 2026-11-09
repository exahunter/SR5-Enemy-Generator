const importFiles=comCamadas('importFiles',importFilesBase);
async function importFilesBase(files){let n=0;const flags=FL;
 for(const f of files){const d=new DOMParser().parseFromString(await f.text(),'text/xml'),nm=f.name.toLowerCase(),all=s=>[...d.querySelectorAll(s)];
  if(nm.startsWith('skills'))all('chummer > skills > skill').forEach(e=>DATA.sid[g(e,'name')]=g(e,'id'));
  else if(nm.startsWith('ranges'))all('chummer > ranges > range').forEach(e=>{const n=g(e,'name');if(n)ALC.r[n]=['min','short','medium','long','extreme'].map(k=>g(e,k)||'0')});
  else if(nm.startsWith('weapons'))all('chummer > weapons > weapon').forEach(e=>addItem('weapon',e));
  else if(nm.startsWith('armor'))all('chummer > armors > armor').forEach(e=>addItem('armor',e));
  else if(nm.startsWith('cyberware'))all('chummer > cyberwares > cyberware').forEach(e=>addItem('cyber',e));
  else if(nm.startsWith('vehicles'))all('chummer > vehicles > vehicle').forEach(e=>{const c=g(e,'category');if(/Drone/.test(c)){if(!/Missile/.test(c))addItem('drone',e)}else if(/^(Bikes|Cars|Trucks|Boats|Submarines|Rotorcraft|VTOL|Fixed-Wing)/.test(c))addItem('veh',e)});
  else if(nm.startsWith('gear'))all('chummer > gears > gear').forEach(e=>{const c=g(e,'category');if(/Commlink|Cyberdeck|Command/.test(c))addItem('comm',e);else if(/^(Hacking|Common) Programs$/.test(c))addItem('prog',e);else if(/^(Electronics|Tools|Survival Gear|Security Devices|Sensors|Communications|Stealth)/.test(c))addItem('gear',e)});
  else if(nm.startsWith('metatypes'))all('chummer > metatypes > metatype').forEach(e=>addMeta(e));
  else if(nm.startsWith('critters'))all('chummer > metatypes > metatype').forEach(e=>{addCrit(e);if(/Spirit/.test(g(e,'category'))){if(!flags.sp){flags.sp=1;SPIRITS.length=0}SPIRITS.push(g(e,'name'))}});
  else if(nm.startsWith('qualities'))all('chummer > qualities > quality').forEach(e=>{if(!fresh('q|'+g(e,'id')+g(e,'name')))return;if(e.querySelector(':scope > required, :scope > forbidden'))return;if(e.querySelector(':scope > bonus > selecttext, :scope > bonus > selectattributes, :scope > bonus > selectskill, :scope > bonus > selectweapon, :scope > bonus > selectside, :scope > bonus > selectmentorspirit'))return;const k=Math.abs(parseInt(g(e,'karma')));if(!k)return;const t=g(e,'category')==='Negative'?NEG:POS;if(!flags[t===NEG?'n':'p']){flags[t===NEG?'n':'p']=1;t.length=0}const s=g(e,'source');FOUND.add(s);t.push([g(e,'name'),k,s,g(e,'id'),qBonus(e),g(e,'page')])});
  else if(nm.startsWith('spells'))all('chummer > spells > spell').forEach(e=>{if(!fresh('s|'+g(e,'id')+g(e,'name')))return;if(!flags.s){flags.s=1;SPELLS.length=0}const s=g(e,'source');FOUND.add(s);SPELLS.push([g(e,'name'),g(e,'category'),s,g(e,'id')])});
  else continue;n++}
 FOUND.delete('');FOUND.forEach(c=>{if(!BOOKS.some(b=>b[0]===c))BOOKS.push([c,c]);SEL.add(c)});
 drawBooks();fillMeta();fillCrit();saveStore();drawStored();return n}
