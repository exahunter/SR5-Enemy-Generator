/* ===== v44: perfis novos — dados que complementam tipos-npc.js =====
 * Paramédico (resposta médica), espião, traficante, leão-de-chácara, jornalista e soldado de força corporativa (SecOps).
 * Cada ocupação precisa de: TYPES (tipos-npc.js) · KIT (equipamento) · OCC_PERFIL/OCC_ESTILO_W/OCC_TRACO_W/OCC_DOUTRINA (condutas e personalidade)
 * · PW_PAPEL (poderes) · LM_TIPO (histórico) · IT_F (implantes). Carrega depois de kits-ocupacao.js. */
{const N={PA:'Paramédico / socorrista (resposta médica)',ES:'Espião / agente de infiltração',TR:'Traficante / dealer de rua',LC:'Leão-de-chácara (segurança de casa noturna)',JO:'Jornalista / repórter',SO:'Soldado de força corporativa (SecOps)'};
 const HO='Holdouts',LP='Light Pistols',HP='Heavy Pistols',TA='Tasers',MP='Machine Pistols',SM='Submachine Guns',AR='Assault Rifles',SPR='Sporting Rifles',SG='Shotguns',LMG='Light Machine Guns',BL='Blades',CL='Clubs';
 /* equipamento */
 KIT[N.PA]={pw:.35,w:[[LP+'|'+TA,0,3],[HO,0,1]],a:0,
  ar:{p:.55,l:[['Armor Vest',3],['Lined Coat',2],['Armor Clothing',2],['Urban Explorer Jumpsuit',1,2]],h:.2},
  md:{'Chemical Protection':.3,'Auto-Injector':.15,'Pneumatic Anti-Shock Garment':.2},
  g:[['Medkit',1],['Medkit Supplies',.95,0,[3,6]],['Biomonitor',.7],['Disposable Syringe',.8,0,[2,5]],['Slap Patch, Trauma Patch',.9,0,[2,5]],['Slap Patch, Antidote Patch',.5,0,[1,3]],['Slap Patch, Stim Patch',.5,2,[1,3]],['HemostatiX Dressing',.5,0,[1,4]],['STATscan',.4,3],['Flashlight',.7],['Micro-Transceiver',.9],['Earbuds',.4],['Respirator',.3],['@cred',.4,0,0]],
  pk:[['Medic Pack',1,0],['Medical Patches Pack',.6,1]]};
 KIT[N.ES]={pw:.7,w:[[HO+'|'+LP,0,3],[TA,0,1],[HP,4,1]],s:[[HO,0,1]],sp:.3,m:[[BL,0,1]],mp:.2,a:2,cl:[1,2],
  am:[['Ammo: Gel Rounds',.1,0],['Ammo: Subsonic',.3,3],['Ammo: Hollow Points',.1,3]],
  ar:{p:.7,l:[['Lined Coat',3],['Armor Clothing',3],['Actioneer Business Clothes',2,2],['Chameleon Suit',1,4]]},
  md:{'Concealed Pocket':.5,'Faraday Pocket':.3,'Shock Frills':.15,'Feedback Clothing':.1},
  g:[['@cred',1,0,2],['Glasses',.6],['Earbuds',.7],['Subvocal Mic',.7,2],['Micro-Transceiver',.5],['Camera, Micro',.5],['Bug Scanner',.5,2],['White Noise Generator',.4,3],['Tag Eraser',.35,3],['Lockpick Set',.3],['Maglock Passkey',.25,4],['Sequencer',.2,4],['Microphone, Directional',.3,3],['Single Sensor',.25,3],['Electronic Paper',.3]],
  wkp:.35,wk:[['Subtle Pistol Pack',2,1],['Browning And Beretta Pistol Pack',1,0]],ak:[['Stylish Suit Pack',1,0],['City Slicker Pack',1,0],['Nightbird Pack',.5,4]],
  pk:[['Surveillance Pack',.6,0],['Eavesdropper Pack',.5,1],['Infiltration Pack',.4,1],['Breaking and Entering Pack',.15,2],['Jammer Pack',.2,3]]};
 KIT[N.TR]={pw:.7,w:[[LP+'|'+HP+'|'+HO,0,3],[MP,2,1],[SG,3,1]],s:[[HO+'|'+LP,0,1]],sp:.3,m:[[BL+'|'+CL,0,1]],mp:.5,a:1,cl:[1,2],
  am:[['Ammo: Gel Rounds',.15,0],['Ammo: Hollow Points',.1,3]],
  ar:{p:.6,l:[['Armor Clothing',3],['Lined Coat',3],['Armor Vest',2],['Armor Jacket',1,2]],h:.05},
  md:{'Concealed Pocket':.4,'Shock Frills':.05},
  g:[['@cred',1,0,1],['Glasses',.3],['Earbuds',.4],['Micro-Transceiver',.5],['Flashlight',.3],['Lighter',.3],['Hidden Compartment',.35],['Tag Eraser',.3,2],['Bug Scanner',.15,3],['GPS Monitor',.15],['Disposable Syringe',.2,0,[1,3]]],
  wkp:.4,wk:[['Colt Pistol Pack',2,0],['Street Slugger Pack',1,0],['Big Boom Pistol Pack',1,1],['Intro Runner Pack',.6,0]],ak:[['City Slicker Pack',2,0],['Go Anywhere Jacket Pack',1,1]],
  pk:[['Medical Patches Pack',.1,1],['Bug-out Bag',.1,0]]};
 KIT[N.LC]={pw:.8,w:[[CL,0,3],[TA,0,2],[LP+'|'+HP,2,1]],s:[[TA+'|'+CL,0,1]],sp:.4,a:1,cl:[1,2],
  am:[['Ammo: Gel Rounds',.5,0]],
  ar:{p:.75,l:[['Armor Vest',3],['Armor Jacket',2,1],['Lined Coat',2],['Armor Clothing',1]]},
  md:{'Shock Frills':.15},
  g:[['Flashlight',.7],['Earbuds',.8],['Micro-Transceiver',.9],['Restraint, Plastic',.5,0,[1,2]],['Glasses',.3],['Medkit',.15,2],['Biometric Reader',.1,3],['@cred',.5,0,0]],
  wkp:.3,wk:[['Street Slugger Pack',1,0],['Light Security Pack',1,0]],ak:[['City Slicker Pack',1,0],['Go Anywhere Jacket Pack',1,1]]};
 KIT[N.JO]={pw:.05,w:[[HO+'|'+TA,0,1]],a:0,
  ar:{p:.3,l:[['Armor Clothing',3],['Lined Coat',2],['Armor Vest',1,1],['Urban Explorer Jumpsuit',1,2]],h:.1},
  md:{'Concealed Pocket':.2},
  g:[['@cred',.8,0,1],['Glasses',.6],['Earbuds',.7],['Camera, Micro',.8],['Microphone, Directional',.5,2],['Subvocal Mic',.3,2],['Electronic Paper',.6],['Micro-Transceiver',.4],['Flashlight',.3],['Binoculars',.3],['Single Sensor',.15,3],['AR Gloves',.2],['Trid Projector',.1,2]],
  ak:[['City Slicker Pack',2,0]],pk:[['Surveillance Pack',.35,1],['Eavesdropper Pack',.25,2],['ShadowNET starter pack',.15,0],['Bug-out Bag',.1,0]]};
 KIT[N.SO]={w:[[AR,0,3],[SM,0,2],[SG,3,1],[LMG,7,1]],s:[[HP+'|'+LP,0,1]],sp:.7,m:[[BL+'|'+CL,0,1]],mp:.25,a:3,cl:[2,4],
  am:[['Ammo: APDS',.2,3],['Ammo: Gel Rounds',.3,0],['Ammo: Flechette Rounds',.1,3],['Ammo: Explosive Rounds',.1,6]],
  ar:{p:1,l:[['Armor Jacket',3],['Full Body Armor',2,5],['Urban Explorer Jumpsuit',1,2],['Armor Vest',1]],h:.6},
  md:{'Chemical Protection':.2,'Fire Resistance':.15,'Insulation':.15,'Shock Frills':.1,'Gear Access':.15},
  g:[['Micro-Transceiver',1],['Earbuds',.5],['Medkit',.5,0],['Slap Patch, Trauma Patch',.5,0,[1,3]],['Binoculars',.2],['Flashlight',.4],['Gas Mask',.2],['Goggles',.2],['Restraint, Plastic',.5,0,[1,3]],['@cred',.5,0,0]],
  wkp:.6,wk:[['Squad Weapon Assault Pack',2,3],['Ares Alpha Gunner Pack',1,4],['Smartgun Pack',1.5,2],['Heavy Security Pack',2,1],['Light Security Pack',1,0]],ak:[['Go Anywhere Jacket Pack',2,0]],
  pk:[['Medical Patches Pack',.15,1],['Tacticool Helmet Pack',.15,2]]};
 /* comlink e drones */
 const D=(n,cd,dr)=>{KIT[n].cd=cd;KIT[n].dr=dr};
 D(N.PA,0,{p:.4,m:2,l:[['Medicart|Caduceus|Dustoff',3,3],['Kanmushi|Fly-Spy|Ocular',1]]});
 D(N.ES,1,{p:.4,m:1,l:[['Flying Eye|Fly-Spy|Kanmushi|Microskimmer|Noizquito|Goldfish|Guppy|Dragonfly|Condor|Pigeon|Ocular|Hugin|Munin|Libelle|Pilalux|Tegenaria|Araneus|Nachtaal|Gerbil',4],['Roto-drone|Ferret|Doberman',1,3]]});
 D(N.TR,0,{p:.1,m:2,l:[['Goldfish|Guppy|Flying Eye|Fly-Spy|Condor|Noizquito|Krime Runner',2],['Roto-drone|Pigeon',1,3]]});
 D(N.LC,0,{p:.08,m:3,l:[['Fly-Spy|Flying Eye|Doberman',1]]});
 D(N.JO,1,{p:.5,m:1,l:[['Flying Eye|Fly-Spy|Pigeon|Dragonfly|Condor|Kanmushi|Microskimmer|Ocular|CU\\^3|Noizquito',4],['Roto-drone',1,4]]});
 D(N.SO,0,{p:.35,m:2,n2:.15,l:[['Doberman|Roto-drone|Gun Turret|Sentry V|Dalmatian|Knight Errant|Evo Proletarian',3],['Fly-Spy|Dragonfly|Flying Eye|Condor',2],['Steel Lynx|Paladin|Hovawart|Cheetah|Duelist',1,6]]});
 /* perfil de ocupação (lealdade, coordenação, volatilidade, tática) e tabelas de sorteio */
 Object.assign(OCC_PERFIL,{[N.PA]:{loy:4,co:.55,vo:.15,tt:.35,tg:['SEG','CORP']},[N.ES]:{loy:2.8,co:.45,vo:.2,tt:.5,tg:['SOMB','CORP']},[N.TR]:{loy:2.8,co:.3,vo:.5,tt:.2,tg:['GANG','CRIM']},
  [N.LC]:{loy:3.6,co:.4,vo:.3,tt:.25,tg:['SEG','GANG']},[N.JO]:{loy:3,co:.2,vo:.3,tt:.1,tg:['CIV','SOMB']},[N.SO]:{loy:4.5,co:.7,vo:.12,tt:.65,tg:['SEG','SOLD','CORP']}});
 Object.assign(OCC_ESTILO_W,{[N.PA]:{medico:3,protetor:1.5,sobrevivente:1.3},[N.ES]:{furtivo:2.5,trambiqueiro:2,observador:2,manipulador:1.5,ladino:1.5,diplomata:1.3},
  [N.TR]:{ladino:2,trambiqueiro:1.5,intimidador:1.5,combatequimico:1.5,fugitivo:1.5,bando:1.2},[N.LC]:{intimidador:2.5,cassetete:2.5,sentinela:2,marcial:1.5,protetor:1.5},
  [N.JO]:{observador:2.5,diplomata:2,trambiqueiro:1.5,furtivo:1.3,ladino:1},[N.SO]:{esquadrao:3,fuzileiro:2.5,sentinela:2,patrulheiro:1.5,atirador:1.5,escopeteiro:1.2,medico:.8}});
 Object.assign(OCC_TRACO_W,{[N.PA]:{gentil:1.8,protetor:1.7,disciplinado:1.4,estoico:1.3,exausto:1.3,pragmatico:1.2},[N.ES]:{calculista:2,frio:1.6,paranoico:1.6,profissional:1.6,cauteloso:1.5,solitario:1.3,leal:.6},
  [N.TR]:{ganancioso:2,oportunista:1.6,paranoico:1.5,cauteloso:1.3,viciado:1.3,impulsivo:1.2,honrado:.6},[N.LC]:{estoico:1.6,vigilante:1.6,agressivo:1.4,veterano:1.4,orgulhoso:1.3,temerario:1.2},
  [N.JO]:{curioso:2.5,teimoso:1.5,idealista:1.5,temerario:1.4,ansioso:1.2,obediente:.5},[N.SO]:{disciplinado:2,coordenado:2,profissional:1.8,tatico:1.6,obediente:1.5,leal:1.5,rebelde:.4}});
 Object.assign(OCC_DOUTRINA,{[N.PA]:xl('estabiliza o ferido antes de tudo, recusa lado e só reage para proteger o paciente'),[N.ES]:xl('evita o confronto, observa, copia o que puder e some antes que alguém perceba que estava lá'),
  [N.TR]:xl('trata a rua como negócio: foge de briga que não paga, mas defende o ponto e o estoque a qualquer custo'),[N.LC]:xl('resolve na porta: separa, expulsa e só escala se o cliente insistir; protege o local e a equipe'),
  [N.JO]:xl('quer a história, não a briga: foge para filmar de longe e só reage se acuado'),[N.SO]:xl('age em formação sob ordens: cobre setores, comunica tudo no rádio e recua em bloco quando a missão acaba')});
 /* poderes, histórico de vida e implantes */
 Object.assign(PW_PAPEL,{[N.PA]:'tecnico',[N.ES]:'furtivo',[N.TR]:'furtivo',[N.LC]:'lutador',[N.JO]:'investigador',[N.SO]:'soldado'});
 Object.assign(LM_TIPO,{[N.PA]:/Street Doc|Regular Job|Law Enforcement/,[N.ES]:/Covert Operations|Corporate|Government Agent|Shadow Work/,[N.TR]:/Drifter|Organized Crime|Shadow Work|Ganger/,
  [N.LC]:/Pit Fighter|Urban Brawler|Regular Job|Law Enforcement/,[N.JO]:/Regular Job|Think Tank|Political Activis|Private Investigator/,[N.SO]:/Corporate|Tour of Duty|Law Enforcement/});
 Object.assign(IT_F,{[N.PA]:.3,[N.ES]:.5,[N.TR]:.25,[N.LC]:.4,[N.JO]:.2,[N.SO]:.8});}
