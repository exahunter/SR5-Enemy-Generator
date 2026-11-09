{const BW={},BA={};
 ITEMS.forEach(i=>{const w=BW[i[1]],r=BA[i[1]];if(w){i[6]=w[0];i[7]={damage:w[1],ap:w[2],mode:w[3],rc:w[4],ammo:w[5],accuracy:w[6],avail:w[7],type:w[0]==='Blades'?'Melee':'Ranged',reach:i[1]==='Katana'?'1':i[1]==='Combat Axe'?'2':'0',conceal:'0'}}if(r){i[6]='Armor';i[7]={armor:r,armorcapacity:r,avail:'0'}}})}
const CORE=['Human','Elf','Dwarf','Ork','Troll'];
(()=>{const add=(n,p,grp,sp)=>{const P=META[p];META[n]={cat:P.cat,lim:Object.assign({},P.lim),sp:sp||{A:7,B:4,C:1,D:0},grp,par:grp==='Submetatipos'?p:'',approx:1}};
[['Dryad','Elf'],['Nocturna','Elf'],['Wakyambi','Elf'],['Xapiri Thëpë','Elf'],['Gnome','Dwarf'],['Hanuman','Dwarf'],['Koborokuru','Dwarf'],['Menehune','Dwarf'],['Hobgoblin','Ork'],['Ogre','Ork'],['Oni','Ork'],['Satyr','Ork'],['Cyclops','Troll'],['Fomorian','Troll'],['Giant','Troll'],['Minotaur','Troll'],['Nartaki','Human']].forEach(([n,p])=>add(n,p,'Submetatipos'));
[['Centaur','Troll'],['Naga','Troll'],['Pixie','Elf'],['Sasquatch','Troll']].forEach(([n,p])=>add(n,p,'Metasapientes',{A:7}))})();
const SPIRITS=['Spirit of Air','Spirit of Beasts','Spirit of Earth','Spirit of Fire','Spirit of Man','Spirit of Water'];
