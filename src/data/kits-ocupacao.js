/* ===== Perfis de equipamento por ocupação (v25) =====
 * Usados por logic/equipamento.js. Nomes de itens são os do Chummer (EQ); o que não existir ou não estiver
 * nos livros marcados é pulado em silêncio.
 *  pw   chance de portar arma (sem 'pw' = sempre armado)
 *  w    arma principal: [[categorias(regex), pr mínimo, peso],…]      s  arma secundária (sidearm)  sp  chance
 *  m    arma branca: mesma forma                                       mp chance
 *  a    nível de acessórios 0..3 (0 = nada, 3 = tático)   cl  [min,max] de carregadores extras
 *  am   munição especial: [[nome, chance, pr mínimo],…]
 *  x    arma de apoio (v34): arcos, bestas, lançadores, metralhadoras médias/pesadas e canhões de assalto — mesma forma de 'w'; xp = chance
 *  ar   armadura: {p:chance, l:[[nome,peso,pr mín.],…], h:chance de capacete}
 *  md   mods de armadura: {nome: chance}
 *  g    gear: [nome | [nome, chance(=1), pr mín.(=0), [qtd mín,máx]]]   '@cred' = credstick conforme o nível, [@cred,p,pr,riqueza]
 */
const KIT=(()=>{const HO='Holdouts',LP='Light Pistols',HP='Heavy Pistols',TA='Tasers',MP='Machine Pistols',SM='Submachine Guns',AR='Assault Rifles',SN='Sniper Rifles',SPR='Sporting Rifles',SG='Shotguns',CB='Carbines',LMG='Light Machine Guns',BL='Blades',CL='Clubs';
return {
'Civil (cidadão comum)':{pw:.12,w:[[HO+'|'+LP+'|'+TA,0,3],[CL,0,1]],a:0,
 ar:{p:.1,l:[['Armor Clothing',3],['Lined Coat',1,2]]},
 g:[['@cred',.8,0,0],['Glasses',.35],['Earbuds',.4],['Flashlight',.25],['Camera, Micro',.1],['Mini-Multitool',.2],['Lighter',.3],['Survival Kit',.05]]},
'Wage slave (funcionário corporativo)':{pw:.3,w:[[HO+'|'+LP+'|'+TA,0,3],[HP,3,1]],a:1,
 ar:{p:.25,l:[['Armor Clothing',3],['Actioneer Business Clothes',2,2],['Lined Coat',1,2]]},
 md:{'Shock Frills':.1},
 g:[['@cred',1,0,1],['Glasses',.5],['Earbuds',.4],['Electronic Paper',.4],['AR Gloves',.2],['Subvocal Mic',.25,3],['Micro-Transceiver',.2],['Trid Projector',.1,2],['White Noise Generator',.12,4]]},
'Executivo / Mr. Johnson':{pw:.4,w:[[HO+'|'+LP,0,3],[HP,3,2]],a:2,
 ar:{p:.75,l:[['Actioneer Business Clothes',4],['Armor Clothing',2],['Lined Coat',1,2],['Mortimer of London: Berwick Suit',1,4],['Mortimer of London: Summit Suit',1,5],['Vashon Island: Synergist Business Line',1,4]]},
 md:{'Shock Frills':.35,'Feedback Clothing':.2,'Concealed Pocket':.3,'Faraday Pocket':.2,'Electrochromic Clothing':.15},
 g:[['@cred',1,0,2],['Glasses',.75],['Earbuds',.6],['Subvocal Mic',.55,2],['Micro-Transceiver',.4],['White Noise Generator',.5,3],['Bug Scanner',.4,4],['Electronic Paper',.5],['AR Gloves',.25],['Trid Projector',.3],['Tag Eraser',.2,5]]},
'Político / burocrata':{pw:.15,w:[[HO+'|'+LP,0,1]],a:1,
 ar:{p:.55,l:[['Actioneer Business Clothes',3],['Armor Clothing',2],['Mortimer of London: Berwick Suit',1,4],[xl('Zoé: Executive Suite'),1,5]]},
 md:{'Shock Frills':.25,'Feedback Clothing':.25,'Concealed Pocket':.2},
 g:[['@cred',1,0,2],['Glasses',.6],['Earbuds',.7],['Subvocal Mic',.5,2],['Micro-Transceiver',.4],['White Noise Generator',.5,3],['Bug Scanner',.5,4],['Electronic Paper',.5],['Camera, Micro',.15]]},
'Cientista':{pw:.2,w:[[LP+'|'+TA,0,1]],a:1,
 ar:{p:.35,l:[['Armor Clothing',2],['Lined Coat',2],['Urban Explorer Jumpsuit',1,2]]},
 md:{'Chemical Protection':.55,'Fire Resistance':.3,'Insulation':.25,'Radiation Shielding':.35,'Nonconductivity':.2},
 g:[['@cred',.7,0,1],['Glasses',.7],['Electronic Paper',.5],['Biomonitor',.35],['Disposable Syringe',.3,0,[1,3]],['Respirator',.4],['Gas Mask',.25],['Chemsuit',.25,2],['Medkit',.25,2],['Earbuds',.4],['Trid Projector',.15]]},
'Técnico / engenheiro':{pw:.5,w:[[LP+'|'+TA,0,2],[CL,0,1],[HP,3,1]],a:1,
 ar:{p:.5,l:[['Armor Clothing',2],['Armor Vest',2],['Urban Explorer Jumpsuit',2,2],['Lined Coat',1]]},
 md:{'Insulation':.3,'Nonconductivity':.35,'Chemical Protection':.2,'Gear Access':.3,'Attachable Gear Access':.2},
 g:['Tool Kit',['Miniwelder',.35],['Miniwelder Fuel Canister',.3,0,[1,2]],['Flashlight',.6],['Glasses',.4],['Goggles',.4],['Earbuds',.3],['Mini-Multitool',.5],['Crowbar',.25],['Lockpick Set',.2],['Sequencer',.15,4],['Maglock Passkey',.2,4],['Single Sensor',.2,2],['Glue Sprayer',.2],['@cred',.6,0,0]]},
'Médico / street doc':{pw:.3,w:[[LP+'|'+HO+'|'+TA,0,1]],a:1,
 ar:{p:.35,l:[['Armor Clothing',2],['Lined Coat',2],['Armor Vest',1]]},
 md:{'Chemical Protection':.35,'Auto-Injector':.15,'Pneumatic Anti-Shock Garment':.15,'Concealed Pocket':.25},
 g:[['Medkit',1],['Medkit Supplies',.9,0,[2,5]],['Biomonitor',.6],['Disposable Syringe',.8,0,[1,4]],['Slap Patch, Trauma Patch',.8,0,[1,4]],['Slap Patch, Antidote Patch',.6,0,[1,3]],['Slap Patch, Stim Patch',.3,2,[1,2]],['Slap Patch, Tranq Patch',.3,3,[1,2]],['STATscan',.35,5],['HemostatiX Dressing',.3,0,[1,3]],['Flashlight',.4],['Glasses',.3],['@cred',.6,0,0]]},
'Arruaceiro / manifestante':{pw:.5,w:[[CL,0,3],[BL,0,2],[LP,1,1]],a:0,
 ar:{p:.5,l:[['Armor Clothing',2],['Armor Vest',2],['Lined Coat',1]],h:.4},
 g:[['Gas Mask',.4],['Respirator',.3],['Goggles',.3],['Lighter',.5],['Micro-Transceiver',.3],['Flashlight',.3],['@cred',.5,0,0],['Light Stick',.2],['Earbuds',.2]]},
'Ganger de rua (gangue)':{w:[[LP+'|'+HP,0,3],[MP,2,2],[SM,3,1],[SG,3,1]],s:[[LP+'|'+HP,0,1]],sp:.4,m:[[BL+'|'+CL,0,1]],mp:.6,a:1,cl:[1,2],
 am:[['Ammo: Gel Rounds',.15,0],['Ammo: Hollow Points',.2,3],['Ammo: Tracer',.05,4]],
 ar:{p:.85,l:[['Armor Clothing',2],['Armor Vest',3],['Lined Coat',3],['Armor Jacket',2,2]],h:.2},
 md:{'Shock Frills':.08,'Concealed Pocket':.15},
 g:[['@cred',.7,0,0],['Lighter',.4],['Micro-Transceiver',.4],['Flashlight',.3],['Earbuds',.3],['Glasses',.25],['Gas Mask',.15],['Light Stick',.1]]},
'Sindicato (máfia, yakuza, vory)':{w:[[HP,0,3],[SM+'|'+MP,2,2],[SG,3,1],[AR,5,1]],s:[[LP+'|'+HP,0,1]],sp:.4,m:[[BL,0,1]],mp:.5,a:2,cl:[1,3],
 am:[['Ammo: Hollow Points',.3,2],['Ammo: Gel Rounds',.1,0],['Ammo: Subsonic',.15,4],['Ammo: APDS',.1,5],['Ammo: Explosive Rounds',.1,6]],
 ar:{p:.9,l:[['Lined Coat',3],['Armor Jacket',3],['Actioneer Business Clothes',2,2],['Armor Vest',2],['Vashon Island: Synergist Business Line Longcoat',1,5]],h:.05},
 md:{'Shock Frills':.2,'Feedback Clothing':.1,'Concealed Pocket':.3,'Shock Weave':.1},
 g:[['@cred',1,0,1],['Glasses',.4],['Earbuds',.3],['Subvocal Mic',.3,3],['Micro-Transceiver',.5],['Bug Scanner',.3,4],['Tag Eraser',.2,3],['Flashlight',.2],['Lighter',.3]]},
'Cultista / fanático':{pw:.7,w:[[BL,0,3],[LP+'|'+HP,1,2],[CL,0,1]],a:1,
 am:[['Ammo: Hollow Points',.1,3]],
 ar:{p:.45,l:[['Armor Clothing',2],['Lined Coat',2],['Armor Vest',1]]},
 g:[['@cred',.5,0,0],['Micro-Transceiver',.3],['Light Stick',.3],['Flashlight',.3],['Lighter',.3],['Earbuds',.2],['Magnesium Torch',.1]]},
'Contrabandista':{w:[[LP+'|'+HP,0,3],[SM+'|'+MP,2,2],[SG,3,1]],s:[[HO+'|'+LP,0,1]],sp:.3,m:[[BL,0,1]],mp:.3,a:1,cl:[1,2],
 am:[['Ammo: Gel Rounds',.15,0],['Ammo: Hollow Points',.1,3]],
 ar:{p:.8,l:[['Lined Coat',3],['Armor Vest',2],['Armor Jacket',2,2],['Urban Explorer Jumpsuit',1,2]]},
 md:{'Concealed Pocket':.5,'Faraday Pocket':.3,'Attachable Gear Access':.2},
 g:[['@cred',.9,0,1],['Hidden Compartment',.5],['Tag Eraser',.4,2],['Bug Scanner',.3,3],['Compass',.2],['GPS Monitor',.3],['Goggles',.3],['Flashlight',.5],['Lockpick Set',.25],['Micro-Transceiver',.5],['Earbuds',.3],['Glasses',.3]]},
'Segurança corporativa (rent-a-cop)':{w:[[LP+'|'+HP,0,3],[SM,3,1],[TA,0,1],[CL,0,1]],s:[[CL+'|'+TA,0,1]],sp:.6,a:1,cl:[1,2],
 am:[['Ammo: Gel Rounds',.5,0],['Ammo: Hollow Points',.1,3]],
 ar:{p:1,l:[['Armor Vest',3],['Armor Jacket',3,1],['Lined Coat',1],['Armor Clothing',1]],h:.3},
 md:{'Shock Frills':.1},
 g:[['Flashlight',.9],['Restraint, Plastic',.8,0,[1,3]],['Micro-Transceiver',.8],['Earbuds',.4],['Glasses',.3],['Binoculars',.2,2],['Medkit',.2,2],['@cred',.5,0,0]]},
'Polícia (Lone Star / força local)':{w:[[HP+'|'+LP,0,3],[SM,3,1],[SG,3,1]],s:[[TA,0,2],[LP,0,1]],sp:.6,m:[[CL,0,1]],mp:.6,a:2,cl:[2,3],
 am:[['Ammo: Gel Rounds',.6,0],['Ammo: Hollow Points',.15,3],['Ammo: Flechette Rounds',.1,5]],
 ar:{p:1,l:[['Armor Jacket',3],['Armor Vest',3],['Lined Coat',2],['Urban Explorer Jumpsuit',1,3]],h:.4},
 md:{'Shock Frills':.1},
 g:[['Restraint, Plastic',1,0,[2,4]],'Flashlight','Micro-Transceiver',['Earbuds',.5],['Medkit',.35,2],['Binoculars',.2,2],['Glasses',.3],['Bug Scanner',.1,5],['Biometric Reader',.15,3],['@cred',.5,0,0]]},
'Guarda-costas':{w:[[HP,0,3],[SM+'|'+MP,2,2],[AR,6,1]],s:[[LP+'|'+HP,0,1]],sp:.5,m:[[CL+'|'+BL,0,1]],mp:.2,a:3,cl:[2,3],
 am:[['Ammo: Gel Rounds',.35,0],['Ammo: Hollow Points',.15,2],['Ammo: APDS',.1,6]],
 ar:{p:1,l:[['Armor Jacket',3],['Actioneer Business Clothes',3],['Lined Coat',2],['Full Body Armor',1,7],['Armor Vest',1],['Mortimer of London: Greatcoat Coat',1,5]],h:.15},
 md:{'Shock Frills':.3,'Feedback Clothing':.15,'Concealed Pocket':.3,'Chemical Protection':.15},
 g:[['Glasses',.55],['Earbuds',.65],['Subvocal Mic',.55,2],['Micro-Transceiver',.6],['Medkit',.45,2],['Bug Scanner',.3,3],['Flashlight',.35],['Binoculars',.1,3],['Slap Patch, Trauma Patch',.4,0,[1,3]],['@cred',.8,0,1]]},
'Detetive / investigador':{pw:.6,w:[[LP+'|'+HP,0,3],[HO,0,1],[TA,0,1]],a:1,cl:[1,2],
 am:[['Ammo: Gel Rounds',.1,0]],
 ar:{p:.6,l:[['Lined Coat',3],['Armor Clothing',2],['Armor Vest',1],['Actioneer Business Clothes',1,3]]},
 md:{'Concealed Pocket':.4,'Faraday Pocket':.2},
 g:[['Camera, Micro',.6],['Binoculars',.5],['Earbuds',.5],['Micro-Transceiver',.5],['Glasses',.4],['Bug Scanner',.35,2],['Tag Eraser',.25,3],['Subvocal Mic',.3,2],['Lockpick Set',.3],['Flashlight',.6],['Microphone, Directional',.2,3],['Electronic Paper',.3],['Single Sensor',.15,3],['@cred',.7,0,1]]},
'Resposta de alta ameaça (HTR)':{w:[[AR,0,3],[SM,0,2],[SG,2,1],[LMG,7,1]],s:[[HP,0,1]],sp:.8,m:[[BL,0,1]],mp:.2,a:3,cl:[3,4],
 am:[['Ammo: APDS',.3,3],['Ammo: Gel Rounds',.3,0],['Ammo: Explosive Rounds',.2,6],['Ammo: Flechette Rounds',.2,3]],
 ar:{p:1,l:[['Full Body Armor',3],['Armor Jacket',2],['Chameleon Suit',1,5]],h:.85},
 md:{'Chemical Protection':.4,'Fire Resistance':.3,'Insulation':.3,'Shock Weave':.15,'Gear Access':.2},
 g:[['Gas Mask',.6],['Micro-Transceiver',1],['Earbuds',.5],['Medkit',.7,0],['Slap Patch, Trauma Patch',.7,0,[1,3]],['Binoculars',.3],['Restraint, Plastic',.8,0,[2,4]],['Restraint, Metal',.3],['Flashlight',.3],['Micro Flares',.15],['Bug Scanner',.15,5],['Goggles',.3]]},
'Operações especiais (spec ops)':{w:[[AR,0,3],[SM,0,1],[SN,4,2],[CB,0,1]],s:[[HP,0,1]],sp:.9,m:[[BL,0,1]],mp:.6,a:3,cl:[3,4],
 am:[['Ammo: APDS',.4,3],['Ammo: Subsonic',.3,3],['Ammo: Explosive Rounds',.2,6],['Ammo: Tracer',.1,3]],
 ar:{p:1,l:[['Full Body Armor',3],['Chameleon Suit',3,3],['Armor Jacket',1]],h:.85},
 md:{'Chemical Protection':.4,'Insulation':.3,'Thermal Damping':.2,'Shock Weave':.2,'Gear Access':.3,'Nonconductivity':.2},
 g:[['Micro-Transceiver',1],['Earbuds',.5],['Medkit',.7],['Slap Patch, Trauma Patch',.6,0,[1,3]],['Gas Mask',.4],['Climbing Gear',.3],['Rappelling Gloves',.3],['Binoculars',.4],['Goggles',.4],['Survival Kit',.2],['Tag Eraser',.2,4],['Jammer, Directional',.15,5],['Bug Scanner',.2,4],['Flashlight',.3],['Micro Flares',.2]]},
'Mercenário (merc)':{w:[[AR,0,3],[SM,0,1],[SG,1,1],[LMG,5,1],[SN,4,1]],s:[[HP+'|'+LP,0,1]],sp:.8,m:[[BL,0,1]],mp:.5,a:3,cl:[2,4],
 am:[['Ammo: APDS',.25,3],['Ammo: Explosive Rounds',.15,6],['Ammo: Gel Rounds',.1,0],['Ammo: Flechette Rounds',.15,3],['Ammo: Tracer',.1,3]],
 ar:{p:1,l:[['Armor Jacket',3],['Full Body Armor',2,4],['Lined Coat',1],['Armor Vest',1],['Urban Explorer Jumpsuit',1,2]],h:.5},
 md:{'Chemical Protection':.25,'Fire Resistance':.2,'Gear Access':.2},
 g:[['Medkit',.55],['Slap Patch, Trauma Patch',.5,0,[1,2]],['Survival Kit',.3],['Flashlight',.5],['Micro-Transceiver',.7],['Gas Mask',.3],['Compass',.3],['Binoculars',.35],['Several Days\' Worth of Ration Bars',.5],['Climbing Gear',.15],['Earbuds',.3],['@cred',.5,0,0]]},
'Caçador de recompensas (bounty hunter)':{w:[[HP,0,3],[SPR+'|'+SN,3,1],[SG,2,1],[SM,3,1]],s:[[TA,0,2],[LP,0,1]],sp:.6,m:[[BL+'|'+CL,0,1]],mp:.4,a:2,cl:[1,3],
 am:[['Ammo: Gel Rounds',.4,0],['Ammo: Hollow Points',.15,2],['Ammo: Tracker Rounds, Security Tag',.1,4]],
 ar:{p:1,l:[['Armor Jacket',3],['Lined Coat',3],['Armor Vest',2],['Urban Explorer Jumpsuit',1,3]],h:.15},
 md:{'Concealed Pocket':.2},
 g:[['Restraint, Plastic',1,0,[2,4]],['Restraint, Metal',.4],['Binoculars',.5],['GPS Monitor',.3],['Medkit',.3,2],['Flashlight',.6],['Micro-Transceiver',.7],['Earbuds',.4],['Glasses',.3],['Bug Scanner',.15,4],['Tag Eraser',.15,4],['@cred',.6,0,1]]},
'Motorista / piloto':{pw:.5,w:[[LP+'|'+HP,0,3],[SM+'|'+MP,3,1]],a:1,cl:[1,2],
 ar:{p:.7,l:[['Lined Coat',3],['Armor Jacket',2],['Armor Vest',2],['Armor Clothing',1]],h:.1},
 g:['Tool Kit',['Goggles',.5],['Glasses',.4],['Earbuds',.5],['Micro-Transceiver',.7],['Flashlight',.5],['Medkit',.25],['GPS Monitor',.3],['Compass',.2],['@cred',.7,0,1]]},
'Informante / fixer':{pw:.6,w:[[HO+'|'+LP,0,3],[HP,2,1],[BL,0,1]],a:1,cl:[1,2],
 ar:{p:.6,l:[['Armor Clothing',3],['Lined Coat',3],['Actioneer Business Clothes',1,2]]},
 md:{'Concealed Pocket':.4,'Faraday Pocket':.3,'Shock Frills':.1},
 g:[['@cred',1,0,1],['Glasses',.5],['Earbuds',.6],['Subvocal Mic',.5,2],['Micro-Transceiver',.5],['White Noise Generator',.35,3],['Bug Scanner',.3,3],['Tag Eraser',.25,3],['Electronic Paper',.3],['Camera, Micro',.25]]}
};})();
/* v34: armas de apoio ficam fora do sorteio normal (EQ_MELEE_OUT); só os perfis abaixo as sorteiam, em eqBuild (K.x / K.xp) */
{const BO='Bows|Crossbows',GL='Grenade Launchers',ML='Missile Launchers',MG='Medium Machine Guns|Heavy Machine Guns',AC='Assault Cannons';
 const X=(n,x,xp)=>{if(KIT[n])Object.assign(KIT[n],{x,xp})};
 X('Resposta de alta ameaça (HTR)',[[GL,3,3],[MG,7,2],[ML,8,1],[AC,10,1]],.3);
 X('Operações especiais (spec ops)',[[GL,3,3],[MG,7,2],[ML,7,2],[AC,10,1]],.35);
 X('Mercenário (merc)',[[GL,3,3],[MG,6,2],[BO,2,1],[ML,8,1]],.3);
 X('Caçador de recompensas (bounty hunter)',[[BO,2,3],[GL,5,1]],.3);}

/* ===== v39: kits prontos do packs.xml por ocupação (ver "Kits prontos" em logic/equipamento.js) =====
 *  wk [[kit, peso, pr mín.]] + wkp (chance)   ak [[kit, peso, pr mín.]]   pk [[kit, chance, pr mín.]]
 * Nomes de kit = <name> do packs.xml; kit que o catálogo não cobre simplesmente não rende nada.
 * v43: a arma do kit leva os acessórios e a munição especial do kit (APDS, Stick-n-Shock…); 'Bug-out Bag' (estilo de vida) e os kits Runnerhub/ShadowNET (comunidade) entram em wk/ak/pk;
 *      Medium Machine Gunner e Rocketeer valem também em perfis sem arma de apoio (K.x). */
{const P=(n,o)=>{if(KIT[n])Object.assign(KIT[n],o)};
 P('Civil (cidadão comum)',{ak:[['City Slicker Pack',1,0]],pk:[['Mountaineering Pack',.04,0],['Bug-out Bag',0.06,0]]});
 P('Wage slave (funcionário corporativo)',{ak:[['City Slicker Pack',2,0],['Stylish Suit Pack',1,0]]});
 P('Executivo / Mr. Johnson',{wkp:.25,wk:[['Subtle Pistol Pack',2,1],['Ares Pistol Pack',1,2]],ak:[['Stylish Suit Pack',3,0],['Go Anywhere Jacket Pack',1,3]],pk:[['Jammer Pack',.2,3]]});
 P('Político / burocrata',{ak:[['Stylish Suit Pack',3,0]],pk:[['Jammer Pack',.12,3]]});
 P('Cientista',{pk:[['Mechanic Shop Pack',.1,0]]});
 P('Técnico / engenheiro',{pk:[['Mechanic Shop Pack',.6,0],['Drone Mechanic Pack',.15,2],['Breaking and Entering Pack',.1,2]]});
 P('Médico / street doc',{pk:[['Medic Pack',.9,0],['Medical Patches Pack',.5,1]]});
 P('Arruaceiro / manifestante',{wkp:.3,wk:[['Street Slugger Pack',1,2],['Blademaster Pack',1,0]],ak:[['City Slicker Pack',2,0]],pk:[['Bug-out Bag',0.08,0]]});
 P('Ganger de rua (gangue)',{wkp:.55,wk:[['Street Slugger Pack',3,0],['Big Boom Pistol Pack',2,1],['Colt Pistol Pack',2,0],['Up Close & Personal Pack',1,0]],ak:[['City Slicker Pack',2,0],['Go Anywhere Jacket Pack',1,2]],pk:[['Medical Patches Pack',.2,2],['Bug-out Bag',0.1,0],['Runnerhub Pennypincher Pack',0.08,1]]});
 P('Sindicato (máfia, yakuza, vory)',{wkp:.5,wk:[['Browning And Beretta Pistol Pack',2,0],['Subtle Pistol Pack',2,1],['Ares Pistol Pack',2,1],['Clasic Samurai Pack',1,2],['Smartgun Pack',1,3],['Medium Machine Gunner Pack',0.4,8]],ak:[['Stylish Suit Pack',2,0],['Go Anywhere Jacket Pack',2,1]],pk:[['Surveillance Pack',.15,3],['Jammer Pack',.12,3],['Runnerhub Basic Gear Pack',0.1,2],['Bug-out Bag',0.1,0]]});
 P('Cultista / fanático',{wkp:.35,wk:[['Blademaster Pack',2,0],['Up Close & Personal Pack',1,1],['Big Boom Pistol Pack',1,1]],ak:[['City Slicker Pack',1,0]]});
 P('Contrabandista',{wkp:.4,wk:[['Colt Pistol Pack',2,0],['Street Slugger Pack',1,1],['Sportsman Pack',1,1],['Runnerhub Basic Gear Pack',1,1],['Runnerhub Pennypincher Pack',1,0],['Medium Machine Gunner Pack',0.5,7],['Rocketeer Pack',0.4,8]],ak:[['Go Anywhere Jacket Pack',2,0],['Runnerhub Basic Gear Pack',1,0]],pk:[['Jammer Pack',.3,2],['Mountaineering Pack',.2,1],['Mechanic Shop Pack',.1,2],['Bug-out Bag',0.2,0],['Runnerhub Basic Gear Pack',0.15,2],['Runnerhub Pennypincher Pack',0.15,0]]});
 P('Segurança corporativa (rent-a-cop)',{wkp:.7,wk:[['Light Security Pack',3,0],['Japanacorp Light Security Pack',2,0],['Heavy Security Pack',1,3]],ak:[['Go Anywhere Jacket Pack',2,0]],pk:[['Medical Patches Pack',.1,2]]});
 P('Polícia (Lone Star / força local)',{wkp:.7,wk:[['Light Security Pack',3,0],['Ares Pistol Pack',2,0],['Heavy Security Pack',1,2],['Smartgun Pack',1,3]],ak:[['Go Anywhere Jacket Pack',3,0]],pk:[['Medical Patches Pack',.15,2]]});
 P('Guarda-costas',{wkp:.65,wk:[['Smartgun Pack',3,1],['Ares Pistol Pack',2,0],['Subtle Pistol Pack',1,1]],ak:[['Go Anywhere Jacket Pack',2,0],['Stylish Suit Pack',2,0]],pk:[['Medical Patches Pack',.5,1],['Jammer Pack',.2,3],['Runnerhub Basic Gear Pack',0.1,2],['ShadowNET starter pack',0.08,1]]});
 P('Detetive / investigador',{wkp:.55,wk:[['Colt Pistol Pack',2,0],['Subtle Pistol Pack',2,1],['Browning And Beretta Pistol Pack',1,0]],ak:[['City Slicker Pack',2,0],['Go Anywhere Jacket Pack',1,1]],pk:[['Surveillance Pack',.6,0],['Eavesdropper Pack',.4,2],['Infiltration Pack',.2,1],['Breaking and Entering Pack',.15,1],['ShadowNET starter pack',0.2,0],['Runnerhub Basic Gear Pack',0.12,2]]});
 P('Resposta de alta ameaça (HTR)',{wkp:.6,wk:[['Ares Alpha Gunner Pack',2,3],['Squad Weapon Assault Pack',3,2],['Smartgun Pack',2,2],['Heavy Security Pack',1,1]],ak:[['Go Anywhere Jacket Pack',2,0]],pk:[['Medic Pack',.3,2],['Medical Patches Pack',.4,1],['Demolitionist Pack',.15,4]]});
 P('Operações especiais (spec ops)',{wkp:.65,wk:[['Ares Alpha Gunner Pack',3,3],['Squad Weapon Assault Pack',3,2],['Medium Machine Gunner Pack',1,7],['Rocketeer Pack',1,8],['Smartgun Pack',2,2]],ak:[['Nightbird Pack',2,2],['Go Anywhere Jacket Pack',2,0],['Neon Nights Pack',1,3]],pk:[['Demolitionist Pack',.45,3],['Infiltration Pack',.4,2],['Mountaineering Pack',.3,2],['Medic Pack',.3,2],['Surveillance Pack',.25,2],['Breaking and Entering Pack',.25,2],['Runnerhub Basic Gear Pack',0.1,3]]});
 P('Mercenário (merc)',{wkp:.6,wk:[['Cheap Soldier Pack',2,0],['Ares Alpha Gunner Pack',2,4],['Squad Weapon Assault Pack',2,2],['Sportsman Pack',1,1],['Medium Machine Gunner Pack',1,6],['Runnerhub Basic Gear Pack',1,1],['Runnerhub Pennypincher Pack',1,0],['Rocketeer Pack',0.5,8]],ak:[['Go Anywhere Jacket Pack',2,0],['Runnerhub Basic Gear Pack',1,0]],pk:[['Medic Pack',.3,1],['Medical Patches Pack',.3,1],['Demolitionist Pack',.25,3],['Mountaineering Pack',.2,1],['Runnerhub Basic Gear Pack',0.2,2],['Runnerhub Pennypincher Pack',0.2,0],['Bug-out Bag',0.15,0]]});
 P('Caçador de recompensas (bounty hunter)',{wkp:.55,wk:[['Tranq Darter Pack',2,1],['Tranq Pistol Darter Kit',2,1],['Sportsman Pack',2,1],['Colt Pistol Pack',1,0],['Runnerhub Basic Gear Pack',1,1]],ak:[['Go Anywhere Jacket Pack',2,0],['Runnerhub Basic Gear Pack',1,0]],pk:[['Surveillance Pack',.3,1],['Medical Patches Pack',.3,1],['Mountaineering Pack',.15,1],['Runnerhub Basic Gear Pack',0.15,2],['Bug-out Bag',0.15,0]]});
 P('Motorista / piloto',{ak:[['City Slicker Pack',1,0]],pk:[['Mechanic Shop Pack',.35,0],['Bug-out Bag',0.15,0],['ShadowNET starter pack',0.1,0]]});
 P('Informante / fixer',{ak:[['City Slicker Pack',2,0],['Stylish Suit Pack',1,0]],pk:[['Eavesdropper Pack',.3,1],['Jammer Pack',.3,1],['Surveillance Pack',.15,1],['Bug-out Bag',0.25,0],['Runnerhub Pennypincher Pack',0.12,1],['ShadowNET starter pack',0.12,0]]});}

/* ===== v44: comlink e drones por perfil (ver eqCommDrone em logic/equipamento.js) =====
 *  cd  degraus de comlink acima (+) ou abaixo (−) do padrão do nível
 *  dr  {p: chance de ter drone, m: nível mínimo, n2: chance de um segundo drone (nível 7+), l: [[regex do nome, peso, nível mín.],…]}
 * Sem 'dr' = sem drone. O custo e a disponibilidade ainda são limitados pelo orçamento do nível. */
{const SP='Flying Eye|Fly-Spy|Kanmushi|Microskimmer|Noizquito|Goldfish|Guppy|Dragonfly|Condor|Pigeon|Ocular|Hugin|Munin|Libelle|Pilalux|Tegenaria|Araneus|MeWeRo|Nachtaal|Medusa|Gerbil|Mini-Zep',
 SV='Office Maid|Job-A-Mat|Jardinero|Little Buddy|Janitorial|Criado|i-Doll|Pelican|Holo-Conference|Direktionssekretar',
 SE='Doberman|Roto-drone|Gun Turret|Sentry V|Dalmatian|Knight Errant|Evo Proletarian|Castle Guard|SecureSector',
 CB='Steel Lynx|Duelist|Cheetah|Krokodil|Murmillo|Kurina|Screamer|Heuschrecke|Hovawart|Jagdhund|Jagdschrecke|Wolfhound|LEBD|Tunneler|Paladin',
 SU='Ammo Drone|Reloading|Medicart|Mule|Demolitionman';
 const D=(n,cd,dr)=>{if(KIT[n]){KIT[n].cd=cd;if(dr)KIT[n].dr=dr}};
 D('Civil (cidadão comum)',-1,{p:.05,m:2,l:[['Goldfish|Guppy|Flying Eye|Kanmushi|Ocular',1],['Jardinero|Little Buddy|Job-A-Mat|Mini-Zep',1]]});
 D('Wage slave (funcionário corporativo)',0,{p:.1,m:2,l:[['Job-A-Mat|Office Maid|Little Buddy|Jardinero|Janitorial',2],['Fly-Spy|Kanmushi|Flying Eye',1]]});
 D('Executivo / Mr. Johnson',1,{p:.3,m:3,l:[['i-Doll|Criado|Little Buddy|Office Maid|Holo-Conference',2],['Flying Eye|Fly-Spy|Pigeon|Dragonfly',1]]});
 D('Político / burocrata',1,{p:.25,m:3,l:[['Little Buddy|Office Maid|Holo-Conference|Direktionssekretar|Criado',2],['Flying Eye|Fly-Spy',1]]});
 D('Cientista',0,{p:.3,m:2,l:[['Kanmushi|Ocular|CU\\^3|Schiebel|Pilalux|Tegenaria|Araneus|Hugin',2],['Job-A-Mat|Office Maid|Roto-drone',1]]});
 D('Técnico / engenheiro',1,{p:.45,m:2,l:[['Kanmushi|Job-A-Mat|Office Maid|Roto-drone|Sewer Snake|Ferret|MCT Seven',3],['Criado|Medusa|Jardinero',1],['Gun Turret|Sentry V',1,4]]});
 D('Médico / street doc',0,{p:.35,m:2,l:[['Medicart|Caduceus|Dustoff|Orderly|Reliable|Economically',3,3],['Kanmushi|Fly-Spy|Ocular',1]]});
 D('Arruaceiro / manifestante',-1,{p:.05,m:3,l:[['Goldfish|Guppy|Flying Eye|Noizquito|Fly-Spy',1]]});
 D('Ganger de rua (gangue)',-1,{p:.12,m:3,l:[['Flying Eye|Fly-Spy|Goldfish|Guppy|Condor|Noizquito|Krime Runner',2],['Doberman|Roto-drone|Sentry V|Gun Turret|Proletarian',1,4]]});
 D('Sindicato (máfia, yakuza, vory)',0,{p:.25,m:3,n2:.2,l:[['Fly-Spy|Dragonfly|Flying Eye|Pigeon|Condor|Hugin|Libelle|Munin',3],['Doberman|Roto-drone|Duelist|Kurina|Sentry V|Gun Turret|Knight Errant',2,4],['Steel Lynx|Murmillo|Cheetah',1,7]]});
 D('Cultista / fanático',-1,{p:.05,m:3,l:[['Fly-Spy|Flying Eye|Goldfish',1]]});
 D('Contrabandista',1,{p:.3,m:2,l:[['Mule|Steed|Roto-drone|Condor|Pigeon',2],[SP,2],['Krokodil|Tunneler|Sewer Snake',1,5]]});
 D('Segurança corporativa (rent-a-cop)',0,{p:.3,m:2,l:[[SE,3],['Fly-Spy|Flying Eye|Kanmushi',2],['Steel Lynx|Paladin|Hovawart',1,6]]});
 D('Polícia (Lone Star / força local)',0,{p:.35,m:2,n2:.15,l:[['Lone Star|Doberman|Roto-drone|Dalmatian|Gun Turret|Sentry V|SecureSector|Knight Errant',3],['Fly-Spy|Dragonfly|Flying Eye',2],['Steel Lynx|Paladin',1,6]]});
 D('Guarda-costas',1,{p:.2,m:3,l:[['Fly-Spy|Dragonfly|Flying Eye',2],['Doberman|Roto-drone|Sentry V|Kurina|Duelist',2,4],['Steel Lynx',1,7]]});
 D('Detetive / investigador',1,{p:.45,m:1,n2:.2,l:[[SP,5],['Roto-drone|Ferret|Doberman',1,3]]});
 D('Resposta de alta ameaça (HTR)',0,{p:.5,m:3,n2:.3,l:[['Doberman|Roto-drone|Sentry V|Dragonfly|Condor|Fly-Spy|Pigeon',2],[CB,3,5],[SU,1,5]]});
 D('Operações especiais (spec ops)',1,{p:.5,m:4,n2:.3,l:[['Dragonfly|Condor|Fly-Spy|Pigeon|Hugin|Libelle|Munin|Pilalux|Araneus|Nachtaal|Gerbil|Kanmushi|Microskimmer',3],[CB,2,6],['Ammo Drone|Reloading|Demolitionman',1,6]]});
 D('Mercenário (merc)',0,{p:.4,m:3,n2:.25,l:[['Roto-drone|Doberman|Condor|Fly-Spy|Dragonfly|Pigeon',3],[CB+'|Sentry V|Gun Turret',2,5],[SU,1,5]]});
 D('Caçador de recompensas (bounty hunter)',0,{p:.4,m:2,l:[['Fly-Spy|Dragonfly|Condor|Pigeon|Flying Eye|Roto-drone|Ferret|Bloodhound|Hugin|Libelle|Nachtaal',3],['Doberman|Mule|Steed',1]]});
 D('Motorista / piloto',0,{p:.3,m:2,l:[['Doberman|Roto-drone|Fly-Spy|Kanmushi|Condor|MCT Seven|Pelican|Steed|Mule',1]]});
 D('Informante / fixer',1,{p:.25,m:1,l:[['Flying Eye|Fly-Spy|Kanmushi|Microskimmer|Noizquito|Goldfish|Guppy|Gerbil|Medusa|Dragonfly|Hugin|Libelle|Pigeon',4],['Criado|Little Buddy',1]]});}

/* ===== v44: kits do packs.xml que nenhum perfil usava (arcos, capacete tático, kits Runner). Monowhip e Box of Grenades (agora tratados em logic/equip-ilegal.js) ficavam de fora: o catálogo não tem o chicote e granada é arma de arremesso, não gear de kit + armadura antimotim ===== */
{const A=(n,o)=>{const K=KIT[n];if(!K)return;Object.keys(o).forEach(t=>{K[t]=(K[t]||[]).concat(o[t])})};
 A('Ganger de rua (gangue)',{wk:[['Intro Runner Pack',.8,0]]});
 A('Contrabandista',{wk:[['Intro Runner Pack',1,0],['Basic Runner Pack',.6,2]]});
 A('Resposta de alta ameaça (HTR)',{pk:[['Tacticool Helmet Pack',.25,2]]});
 A('Operações especiais (spec ops)',{pk:[['Tacticool Helmet Pack',.3,2]]});
 A('Mercenário (merc)',{wk:[['Intro Runner Pack',1,0],['Basic Runner Pack',1,2],['Advanced Runner Pack',1,5],['Basic Bowman Pack',.3,2],['Advanced Bowman Pack',.25,4]],pk:[['Tacticool Helmet Pack',.15,2]]});
 A('Caçador de recompensas (bounty hunter)',{wk:[['Basic Bowman Pack',1.2,1],['Advanced Bowman Pack',1,4]]});
 A('Polícia (Lone Star / força local)',{pk:[['Tacticool Helmet Pack',.1,3]]});
 ['Segurança corporativa (rent-a-cop)','Polícia (Lone Star / força local)','Resposta de alta ameaça (HTR)'].forEach(n=>{const K=KIT[n];if(K&&K.ar&&K.ar.l)K.ar.l.push(['Riot Control Armor',n[0]==='R'?1:.6,n[0]==='S'?5:4])});}
