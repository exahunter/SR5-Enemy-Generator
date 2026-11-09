/* ===== v52: ESPECIALIZAÇÕES — pesos por perfil =====
 * O catálogo (quais especializações existem em cada perícia) vem de data/especializacoes.json (const SPK; o skills.xml importado
 * o substitui). Aqui ficam só os PESOS com que o gerador escolhe uma especialização (logic/especializacoes.js). Peso 1 = qualquer uma;
 * quanto maior, mais provável. Os pesos se somam: padrão da perícia + ocupação + estilo (campo spc de ESTILO, × a % do estilo)
 * + armas que o NPC leva + magia, espíritos, sprites, formas complexas e veículos que ele tem.
 *   SPEC_B    bônus em dados de uma especialização (SR5 p.130: +2)
 *   SPEC_K    custo em carma (SR5 p.69: 7)
 *   SPEC_GER  perícia → {especialização: peso}, para qualquer NPC
 *   SPEC_OCC  [regex do tipo de NPC, {perícia → {especialização: peso}}], somado ao padrão
 *   SPEC_ARMA categoria da arma → especialização que ela dá (quando o catálogo de armas não traz o campo spec)
 *   SPEC_ALIAS nome de especialização usado nos estilos/armas → nome do catálogo do Chummer */
const SPEC_B=2,SPEC_K=7;
const SPEC_GER={
 Perception:{Visual:3,Hearing:2,Searching:2,Scent:.3,Taste:.2,Touch:.4,'Numinous Perception':.2},
 Sneaking:{Urban:3,Vehicle:.3,Wilderness:1,Jungle:.4,Desert:.4},Running:{Sprinting:2,Distance:1,Urban:1.2,Wilderness:.5,Desert:.3},
 Gymnastics:{Dodging:1.5,Climbing:2,Parkour:1.5,Rolling:1.2,Balance:1,Leaping:1,Dance:.2},
 Pistols:{'Semi-Automatics':3,Revolvers:1.5,Holdouts:1,Tasers:.5},Automatics:{'Assault Rifles':3,'Submachine Guns':2.5,'Machine Pistols':1,Carbines:1,'Cyber-Implant':.3},
 Longarms:{'Sniper Rifles':2,Shotguns:2,'Extended-Range Shots':1,'Long-Range Shots':1,'Sporting Rifles':1.5},Blades:{Knives:3,Swords:1.5,Axes:1,Parrying:1},
 Clubs:{Batons:3,Saps:1.5,Hammers:1,Staves:.7,Parrying:.7},'Unarmed Combat':{'Subduing Combat':2.5,Blocking:2,'Cyber Implants':.7},
 'Throwing Weapons':{Aerodynamic:2,Blades:1.5,'Non-Aerodynamic':1},'Heavy Weapons':{'Machine Guns':2,'Grenade Launchers':1.5,'Rocket Launchers':1,'Assault Cannons':.5,'Guided Missiles':.5},
 Archery:{Bow:3,Crossbow:1.5,Slingshot:.3,'Non-Standard Ammunition':.3},Gunnery:{Ballistic:3,'Guided Missile':1.5,Energy:.5,Artillery:.5,Rocket:.8},
 Intimidation:{Physical:2.5,Mental:2,Interrogation:1.5,Torture:.4},Con:{'Fast Talk':3,Seduction:1.5},Negotiation:{Bargaining:3,Contracts:2,Diplomacy:1.5},
 Etiquette:{Street:3,Corporate:2.5,Media:1,'High Society':1,Mafia:.7,Yakuza:.7,Mercenary:.7,Magic:.4,Matrix:.4,'Catholic Church':.2},
 Leadership:{Direct:3,Inspire:2,Command:1.5,Command:1,Rally:1},Impersonation:{Human:1,Elf:.5,Dwarf:.5,Ork:.5,Troll:.5},
 Disguise:{Cosmetic:2,Theatrical:1.5,Camouflage:1.5,'Trideo & Video':.5},Locksmith:{Maglock:2.5,Keypad:2,Tumbler:1.5,Combination:1,'Voice Recognition':.7},
 Palming:{Legerdemain:2,Pickpocket:1.5,Pilfering:1},Tracking:{Urban:3,Forest:1,Jungle:.5,Desert:.5,Mountain:.5,Polar:.3},Survival:{Urban:2,Forest:1.5,Desert:1,Jungle:1,Mountain:1,Polar:.7},
 'First Aid':{'Gunshot Wounds':3,'Broken Bones':1.5,Resuscitation:1.5,Burns:1},Medicine:{'Trauma Surgery':3,'Extended Care':2,'Implant Surgery':1.2,'Cosmetic Surgery':.5,'Magical Health':.4,'Organ Culture':.7,Veterinary:.3},
 Chemistry:{Analytical:2,Drugs:1.5,Toxins:1.5,Biochemistry:1.5,Inorganic:1,Organic:1,Physical:1},Biotechnology:{Bioware:2,Cloning:1,'Gene Therapy':1,Bioinformatics:1,'Vat Maintenance':1},
 Armorer:{Firearms:3,Armor:1.5,'Melee Weapons':1,'Heavy Weapons':1,'Weapon Accessories':1,Explosives:.7,Artillery:.3},Demolitions:{'Commercial Explosives':2,Defusing:2,'Plastic Explosives':1.5,'Improvised Explosives':1.5},
 'Industrial Mechanic':{'Electrical Power Systems':2,Hydraulics:1,HVAC:1,'Industrial Robotics':1,Structural:1,Welding:1},'Automotive Mechanic':{Wheeled:3,Tracked:1,Hover:.5,Walker:.5},
 'Aeronautics Mechanic':{'Rotary Wing':2,'Fixed Wing':2,'Vector Thrust':1,'Tilt Wing':.5,Aerospace:.3,'LTA (blimp)':.2},'Nautical Mechanic':{Motorboat:2,Sailboat:1,Ship:1,Submarine:.5},
 Cybertechnology:{Bodyware:2,Cyberlimbs:2,Headware:1.5,Repair:1.5,Nanoware:.5},Computer:{'Edit File':2,'Matrix Search':2,'Matrix Perception':2},Hacking:{Devices:2.5,Hosts:2,Files:1.5,Personas:1.5},
 Cybercombat:{Personas:2,Devices:1.5,IC:2,Grids:.7,Sprites:.5},'Electronic Warfare':{Jamming:2,Communications:2,Encryption:1.5,'Sensor Operations':1.5},Hardware:{Cyberdecks:2,Commlinks:1.5,Smartguns:.7,'Jack Out':.3},
 Software:{'Data Bombs':1.5},Forgery:{'False ID':2.5,'Credstick Forgery':1.5,Counterfeiting:1,'Paper Forgery':1,'Image Doctoring':1},
 'Pilot Ground Craft':{Wheeled:3,Bike:2,Tracked:.7,Hovercraft:.5,'Remote Operation':.5},'Pilot Aircraft':{'Rotary Wing':2.5,'Fixed-Wing':2,'Vectored Thrust':1,'Tilt Wing':.7,'Lighter-Than-Air':.2,'Remote Operation':.5},
 'Pilot Watercraft':{Motorboat:3,Sail:1,Ship:1,Submarine:.5,Hydrofoil:.5,'Remote Operation':.5},'Pilot Walker':{Biped:2,Quadruped:1,'Remote Operation':.5},
 Navigation:{Maps:2,GPS:2,Compass:1,'Augmented Reality Markers':1.5,Celestial:.3},'Escape Artist':{Cuffs:2.5,Ropes:1.5,'Zip Ties':1.5,Contortionism:1},Diving:{SCUBA:2,Military:1,Commercial:1},
 Swimming:{Dash:1.5,'Long Distance':1.5},Artisan:{Cooking:1.5,Drawing:1.2,Writing:1.2,Fashion:1,Carpentry:1,Sculpting:.7},
 'Animal Handling':{Training:2,Riding:1.5,Herding:1},Assensing:{'Aura Reading':3,'Astral Signatures':2,Psychometry:1},'Astral Combat':{Magicians:2,Spirits:2,'Mana Barriers':1},
 Arcana:{'Spell Design':2,'Focus Design':1.5,'Spirit Formula':1,'Spirit Theory':1,'Magical Artifacts':1},Artificing:{'Focus Analysis':1},'Ritual Spellcasting':{}};
/* ocupação (regex sobre o nome do tipo em data/tipos-npc.js) → bônus por perícia */
const SPEC_OCC=[
 [/Civil/,{Perception:{Visual:2},Running:{Sprinting:2},Etiquette:{Street:2},Con:{'Fast Talk':1}}],
 [/Wage slave|Executivo|Político/,{Etiquette:{Corporate:5},Negotiation:{Contracts:3,Bargaining:1},Computer:{'Edit File':3},Leadership:{Direct:2},Con:{'Fast Talk':2},Intimidation:{Mental:2}}],
 [/Cientista/,{Chemistry:{Analytical:4,Biochemistry:3},Biotechnology:{Bioinformatics:3},Medicine:{'Extended Care':2},Computer:{'Edit File':2}}],
 [/Técnico/,{'Industrial Mechanic':{'Electrical Power Systems':3},Armorer:{Firearms:2},Cybertechnology:{Repair:2},'Automotive Mechanic':{Wheeled:2}}],
 [/Médico|Paramédico/,{Medicine:{'Trauma Surgery':4},'First Aid':{'Gunshot Wounds':4,Resuscitation:2},Biotechnology:{Bioware:2},'Pilot Aircraft':{'Rotary Wing':3}}],
 [/Arruaceiro/,{'Unarmed Combat':{Blocking:2,'Subduing Combat':2},Clubs:{Batons:3},Intimidation:{Physical:4},Running:{Urban:2},'Throwing Weapons':{Aerodynamic:3}}],
 [/Ganger/,{Pistols:{'Semi-Automatics':2},Blades:{Knives:3},'Unarmed Combat':{'Subduing Combat':1},Intimidation:{Physical:3},Etiquette:{Street:4},Running:{Urban:2}}],
 [/Sindicato/,{Pistols:{'Semi-Automatics':2},Automatics:{'Submachine Guns':3},Blades:{Knives:2},Intimidation:{Physical:3},Etiquette:{Mafia:3,Yakuza:2,Street:2},Negotiation:{Bargaining:2}}],
 [/Cultista/,{Blades:{Knives:2,Swords:2},Pistols:{Revolvers:2},Intimidation:{Mental:3},Con:{Seduction:2},Etiquette:{Street:1}}],
 [/Contrabandista/,{'Pilot Ground Craft':{Wheeled:3},Con:{'Fast Talk':3},Negotiation:{Bargaining:3},Sneaking:{Urban:2},Locksmith:{Keypad:2,Maglock:1}}],
 [/Segurança corporativa|SecOps/,{Pistols:{'Semi-Automatics':3},Clubs:{Batons:3},Perception:{Visual:3},'Unarmed Combat':{'Subduing Combat':3},Etiquette:{Corporate:3},Automatics:{'Submachine Guns':2,'Assault Rifles':2}}],
 [/Polícia/,{Pistols:{'Semi-Automatics':3},Clubs:{Batons:3},Perception:{Visual:3,Searching:2},'Unarmed Combat':{'Subduing Combat':4},Etiquette:{Street:3},Running:{Sprinting:2},Automatics:{'Submachine Guns':2}}],
 [/Guarda-costas/,{Pistols:{'Semi-Automatics':3},'Unarmed Combat':{Blocking:3},Perception:{Visual:3},Etiquette:{'High Society':3,Corporate:2},'First Aid':{'Gunshot Wounds':3},Intimidation:{Physical:2}}],
 [/Detetive/,{Perception:{Searching:4,Visual:2},Tracking:{Urban:4},Sneaking:{Urban:3},Con:{'Fast Talk':3},Computer:{'Matrix Search':4},Etiquette:{Street:3}}],
 [/Resposta de alta|Operações especiais|Mercenário/,{Automatics:{'Assault Rifles':4,'Submachine Guns':1},Pistols:{'Semi-Automatics':2},Longarms:{'Sniper Rifles':1,Shotguns:1},'Unarmed Combat':{'Subduing Combat':3},Sneaking:{Urban:2},Gymnastics:{Rolling:2,Climbing:2},Perception:{Visual:3},Blades:{Knives:3},Demolitions:{'Commercial Explosives':2,Defusing:2}}],
 [/Caçador de recompensas/,{Pistols:{'Semi-Automatics':2},Longarms:{'Sniper Rifles':3},Tracking:{Urban:4},'Unarmed Combat':{'Subduing Combat':4},Intimidation:{Interrogation:3},Running:{Sprinting:2}}],
 [/Motorista/,{'Pilot Ground Craft':{Wheeled:3,Bike:2},'Automotive Mechanic':{Wheeled:3},Gunnery:{Ballistic:2},Navigation:{GPS:3}}],
 [/Informante/,{Con:{'Fast Talk':3},Negotiation:{Bargaining:3},Etiquette:{Street:4},Perception:{Visual:2,Hearing:1}}],
 [/Espião/,{Sneaking:{Urban:3},Con:{'Fast Talk':3},Disguise:{Theatrical:3,Cosmetic:2},Computer:{'Edit File':2},Etiquette:{Corporate:3,'High Society':2},Palming:{Legerdemain:2}}],
 [/Traficante/,{Negotiation:{Bargaining:4},Con:{'Fast Talk':3},Etiquette:{Street:4},Intimidation:{Physical:2}}],
 [/Leão-de-chácara/,{'Unarmed Combat':{'Subduing Combat':3,Blocking:2},Clubs:{Batons:3},Intimidation:{Physical:4},Perception:{Visual:2}}],
 [/Jornalista/,{Con:{'Fast Talk':3},Etiquette:{Media:5},Negotiation:{Bargaining:2},Perception:{Visual:2},Computer:{'Matrix Search':3}}]];
/* categoria da arma → especialização (usado só quando o catálogo de armas não traz o campo spec) */
const SPEC_ARMA={'Holdouts':'Holdouts','Hold-Outs':'Holdouts','Tasers':'Tasers','Machine Pistols':'Machine Pistols','Submachine Guns':'Submachine Guns','Assault Rifles':'Assault Rifles','Shotguns':'Shotguns','Sniper Rifles':'Sniper Rifles','Sporting Rifles':'Sporting Rifles','Bows':'Bow','Crossbows':'Crossbow','Machine Guns':'Machine Guns','Light Machine Guns':'Machine Guns','Medium Machine Guns':'Machine Guns','Heavy Machine Guns':'Machine Guns','Grenade Launchers':'Grenade Launchers','Assault Cannons':'Assault Cannons','Missile Launchers':'Rocket Launchers'};
const SPEC_ALIAS={'Direct Command':'Direct','Vector Thrust':'Vectored Thrust','Hold-Outs':'Holdouts','Cyber-Implant':'Cyber Implants','Hearing':'Hearing','Aural':'Hearing','Tactile':'Touch','Underworld':'Mafia','Bow':'Bow','Machine Sprites':'Machine Sprites'};
