/* ===== v32: PERFIL DE OCUPAÇÃO — lealdade, coordenação, volatilidade e tática =====
 * Cada NPC tem um perfil que sai da ocupação, da especialização, dos estilos e dos traços (logic/perfil-ocupacao.js).
 * O perfil decide a LEALDADE (neutra: a maioria fica em 3–4) e molda as condutas: o soldado é mais leal, coordenado e tático;
 * o membro de gangue é mais volátil e imprevisível. Para ajustar um papel, edite só este arquivo.
 *
 * OCC_PERFIL   ocupação → loy lealdade-base (≈1–6, centro 3,5) · co coordenação 0–1 · vo volatilidade 0–1 · tt tática 0–1 · tg tags de ocupação
 * GRP_PERFIL   mesmo formato, por grupo de ocupação (usado quando a ocupação não está na tabela)
 * SPEC_PERFIL  especialização → ajustes ly/co/vo/tt + tag
 * TR_PERFIL    traço → ajustes ly/co/vo/tt (ly = lealdade em pontos)
 * ST_PERFIL    estilo → ajustes (proporcionais ao % do estilo)
 * OCC_ESTILO_W / OCC_TRACO_W / SPEC_TRACO_W   multiplicadores de sorteio de estilo e traço por ocupação / especialização
 * OCC_DOUTRINA ocupação → como esse tipo de NPC costuma agir (aparece nas Notas)
 * Tags (maiúsculas, usadas nas afinidades das condutas): SOLD soldado · SEG segurança/lei · POL polícia · ESC escolta · MERC mercenário · GANG gangue/rua ·
 *   CRIM crime organizado · CULT seita · CORP corporativo/ciência · CIV civil · SOMB sombras · CAC caçador · SMAGE · SADEPT · SDECK · STECH · SRIGGER · SLIDER */
const OCC_PERFIL={
 'Civil (cidadão comum)':{loy:3,co:.15,vo:.45,tt:.05,tg:['CIV']},
 'Wage slave (funcionário corporativo)':{loy:3,co:.3,vo:.25,tt:.1,tg:['CORP']},
 'Executivo / Mr. Johnson':{loy:3,co:.4,vo:.2,tt:.25,tg:['CORP']},
 'Político / burocrata':{loy:3,co:.3,vo:.2,tt:.2,tg:['CORP']},
 'Cientista':{loy:3.2,co:.3,vo:.2,tt:.15,tg:['CORP']},
 'Técnico / engenheiro':{loy:3.3,co:.4,vo:.2,tt:.2,tg:['CORP']},
 'Médico / street doc':{loy:3.6,co:.4,vo:.2,tt:.2,tg:['CORP']},
 'Arruaceiro / manifestante':{loy:3,co:.2,vo:.7,tt:.05,tg:['GANG','CIV']},
 'Ganger de rua (gangue)':{loy:3,co:.25,vo:.8,tt:.1,tg:['GANG']},
 'Sindicato (máfia, yakuza, vory)':{loy:3.8,co:.55,vo:.3,tt:.4,tg:['CRIM']},
 'Cultista / fanático':{loy:4.6,co:.5,vo:.35,tt:.15,tg:['CULT']},
 'Contrabandista':{loy:3.2,co:.45,vo:.4,tt:.35,tg:['CRIM','SOMB']},
 'Segurança corporativa (rent-a-cop)':{loy:3.8,co:.6,vo:.2,tt:.45,tg:['SEG']},
 'Polícia (Lone Star / força local)':{loy:3.9,co:.65,vo:.2,tt:.5,tg:['SEG','POL']},
 'Guarda-costas':{loy:4.7,co:.75,vo:.1,tt:.65,tg:['SEG','ESC']},
 'Detetive / investigador':{loy:3.2,co:.4,vo:.25,tt:.45,tg:['SEG','SOMB']},
 'Resposta de alta ameaça (HTR)':{loy:4.5,co:.9,vo:.08,tt:.85,tg:['SOLD','SEG']},
 'Operações especiais (spec ops)':{loy:4.7,co:.95,vo:.05,tt:.95,tg:['SOLD']},
 'Mercenário (merc)':{loy:3.9,co:.75,vo:.2,tt:.7,tg:['SOLD','MERC']},
 'Caçador de recompensas (bounty hunter)':{loy:3.1,co:.35,vo:.3,tt:.55,tg:['CAC','SOMB']},
 'Motorista / piloto':{loy:3.2,co:.5,vo:.3,tt:.35,tg:['SOMB']},
 'Informante / fixer':{loy:3,co:.3,vo:.35,tt:.3,tg:['SOMB']}};
const GRP_PERFIL={
 Civis:{loy:3,co:.2,vo:.4,tt:.1,tg:['CIV']},
 'Corporativo e ciência':{loy:3.2,co:.35,vo:.2,tt:.2,tg:['CORP']},
 'Rua e crime':{loy:3.2,co:.35,vo:.55,tt:.2,tg:['GANG']},
 'Segurança e lei':{loy:3.9,co:.6,vo:.2,tt:.5,tg:['SEG']},
 'Militar e caça':{loy:4.2,co:.75,vo:.15,tt:.75,tg:['SOLD']},
 Sombras:{loy:3.1,co:.4,vo:.35,tt:.35,tg:['SOMB']}};
const SPEC_PERFIL={
 Lieutenant:{ly:.4,co:.2,vo:-.1,tt:.2,tag:'SLIDER'},
 Mage:{tt:.05,tag:'SMAGE'},Mystic:{ly:.1,tt:.05,tag:'SMAGE'},
 Adept:{ly:.2,co:.05,tt:.05,tag:'SADEPT'},
 Decker:{ly:-.2,co:.05,tt:.1,tag:'SDECK'},
 Technomancer:{ly:-.2,vo:.05,tag:'STECH'},
 Rigger:{ly:.1,co:.2,tt:.15,tag:'SRIGGER'}};
const TR_PERFIL={
 leal:{ly:1,co:.15},fanatico:{ly:1,vo:.15},covarde:{ly:-1,co:-.1},ganancioso:{ly:-.8},oportunista:{ly:-1.2,vo:.1},
 rebelde:{ly:-1,co:-.25,vo:.2},protetor:{ly:.8,co:.15},devoto:{ly:.8},honrado:{ly:.5,vo:-.05},
 disciplinado:{ly:.6,co:.2,tt:.2,vo:-.15},metodico:{co:.1,tt:.2,vo:-.15},calculista:{tt:.2,vo:-.1},veterano:{co:.1,tt:.2,vo:-.1},
 estoico:{vo:-.1},impulsivo:{co:-.15,vo:.25,tt:-.15},temerario:{co:-.1,vo:.2,tt:-.15},agressivo:{vo:.15,tt:-.05},
 sadico:{ly:-.3,vo:.15},rancoroso:{vo:.1},teimoso:{co:-.1},competitivo:{ly:-.4,co:-.15,vo:.1},orgulhoso:{ly:-.2,co:-.1},
 cinico:{ly:-.4},idealista:{ly:.5},gentil:{ly:.3},brincalhao:{vo:.1,tt:-.05},ansioso:{co:-.05,vo:.1},paranoico:{ly:-.2,vo:.05},
 cauteloso:{tt:.1},exausto:{ly:-.3},sombrio:{vo:.05},frio:{vo:-.1},supersticioso:{vo:.05},vaidoso:{ly:-.2,co:-.1},
 coordenado:{ly:.4,co:.35,tt:.15,vo:-.1},tatico:{co:.15,tt:.35,vo:-.2},volatil:{ly:-.3,co:-.3,vo:.4,tt:-.25},
 imprevisivel:{co:-.25,vo:.45,tt:-.3},solitario:{ly:-.6,co:-.4},obediente:{ly:.7,co:.2,vo:-.2},bravateiro:{co:-.15,vo:.2},
 pragmatico:{ly:-.2,tt:.1},profissional:{ly:.3,co:.2,tt:.25,vo:-.2}};
const ST_PERFIL={
 lider:{ly:.3,co:.2,tt:.15},sentinela:{co:.1,tt:.2},esquadrao:{ly:.5,co:.4,tt:.4,vo:-.2},batedor:{co:.05,tt:.3},
 patrulheiro:{ly:.2,co:.2,tt:.1},escolta:{ly:.6,co:.3,tt:.2,vo:-.15},bando:{ly:-.3,co:-.2,vo:.35,tt:-.2},chefao:{co:.2,tt:.2},
 executor:{ly:.3,co:.2,tt:.2},zelote:{ly:1,vo:.1,tt:-.1},fugitivo:{tt:.2},burocrata:{tt:.1},protetor:{ly:.4,co:.2},
 assaltante:{co:.1,vo:.1},duelista:{co:-.2,vo:.15},sobrevivente:{ly:-.3,co:-.2},interrogador:{tt:.1},intimidador:{vo:.1},
 ladino:{ly:-.2,co:-.1,vo:.1},furtivo:{co:-.05},cassetete:{vo:.05},atirador:{tt:.15},fuzileiro:{co:.1,tt:.1},
 guardiaomagico:{ly:.3,co:.2},adeptoguardiao:{ly:.4,co:.2},hackerdecampo:{co:.25,tt:.15},enxame:{co:.3,tt:.2}};

/* ---------- multiplicadores de sorteio por ocupação ---------- */
const OCC_ESTILO_W={
 'Wage slave (funcionário corporativo)':{burocrata:3,tecnico:1.5,sobrevivente:1.2},
 'Executivo / Mr. Johnson':{burocrata:3,chefao:2,diplomata:1.5,lider:1.5},
 'Político / burocrata':{burocrata:2.5,diplomata:2,chefao:1.5},
 'Cientista':{quimico:2,tecnico:1.5,burocrata:1.2},
 'Técnico / engenheiro':{tecnico:2,mecanico:2},
 'Médico / street doc':{medico:3},
 'Arruaceiro / manifestante':{bando:3,cassetete:2,lutador:1.5,intimidador:1.5},
 'Ganger de rua (gangue)':{bando:4,pistoleiro:1.3,faqueiro:1.8,intimidador:1.5,cassetete:1.3,assaltante:1.2},
 'Sindicato (máfia, yakuza, vory)':{executor:3,chefao:2,interrogador:1.8,duelista:1.5,intimidador:1.5},
 'Cultista / fanático':{zelote:4,faqueiro:1.8},
 'Contrabandista':{fugitivo:3,corredor:2,ladino:1.5,piloto:1.5},
 'Segurança corporativa (rent-a-cop)':{patrulheiro:2.5,sentinela:2.5,escolta:1.2,cassetete:1.5},
 'Polícia (Lone Star / força local)':{patrulheiro:3.5,sentinela:2,interrogador:1.5,cassetete:1.5,protetor:1.5},
 'Guarda-costas':{escolta:4,protetor:3,sentinela:1.5},
 'Detetive / investigador':{observador:2.5,rastreador:2,interrogador:1.8,batedor:1.2},
 'Resposta de alta ameaça (HTR)':{esquadrao:4,assaltante:2.5,fuzileiro:2,protetor:1.3,sentinela:1.3},
 'Operações especiais (spec ops)':{esquadrao:3,batedor:3,atirador:2,assaltante:2,furtivo:1.5},
 'Mercenário (merc)':{esquadrao:2,fuzileiro:2,assaltante:1.5,artilheiro:1.5,escopeteiro:1.3},
 'Caçador de recompensas (bounty hunter)':{rastreador:2.5,batedor:2,atirador:1.5,interrogador:1.3},
 'Motorista / piloto':{piloto:3,fugitivo:3,corredor:1.5},
 'Informante / fixer':{burocrata:1.5,trambiqueiro:2,diplomata:2,observador:1.5,ladino:1.5}};
/* grupos de estilo pouco prováveis para o grupo da ocupação (aplica só aos estilos que a ocupação não cita em OCC_ESTILO_W) */
const OCC_GRP_ESTILO_W={
 'Militar e caça':{social:.4,tecnico:.3},
 'Segurança e lei':{tecnico:.5},
 'Rua e crime':{tecnico:.35,matrix:.5}};
const OCC_TRACO_W={
 'Civil (cidadão comum)':{ansioso:1.3,covarde:1.3,pragmatico:1.2},
 'Wage slave (funcionário corporativo)':{ansioso:1.3,obediente:1.4,cauteloso:1.2,pragmatico:1.2},
 'Executivo / Mr. Johnson':{calculista:1.5,vaidoso:1.4,pragmatico:1.5,ganancioso:1.2},
 'Político / burocrata':{oportunista:1.5,vaidoso:1.5,calculista:1.3,pragmatico:1.4},
 'Cientista':{curioso:1.8,metodico:1.3,pragmatico:1.2},
 'Técnico / engenheiro':{metodico:1.4,curioso:1.4,tecnofilo:1.3},
 'Médico / street doc':{gentil:1.6,protetor:1.4,pragmatico:1.2},
 'Arruaceiro / manifestante':{impulsivo:1.8,bravateiro:1.8,volatil:1.6,rebelde:1.4,agressivo:1.4},
 'Ganger de rua (gangue)':{volatil:2.2,imprevisivel:2,bravateiro:2,impulsivo:1.6,temerario:1.5,rebelde:1.4,competitivo:1.4,orgulhoso:1.3,leal:.8,tatico:.2,coordenado:.2,obediente:.2},
 'Sindicato (máfia, yakuza, vory)':{profissional:1.5,calculista:1.4,leal:1.4,frio:1.4,coordenado:1.3,rancoroso:1.2,volatil:.6},
 'Cultista / fanático':{fanatico:2,devoto:1.8,obediente:1.3,leal:1.3},
 'Contrabandista':{pragmatico:1.6,oportunista:1.3,cauteloso:1.3,solitario:1.3},
 'Segurança corporativa (rent-a-cop)':{obediente:1.5,coordenado:1.4,cauteloso:1.3,profissional:1.3,disciplinado:1.3},
 'Polícia (Lone Star / força local)':{obediente:1.5,coordenado:1.5,honrado:1.4,cinico:1.2,profissional:1.3,disciplinado:1.3,tatico:1.2},
 'Guarda-costas':{leal:2,protetor:2,coordenado:1.8,profissional:1.8,disciplinado:1.5,tatico:1.4,estoico:1.3},
 'Detetive / investigador':{calculista:1.4,cinico:1.5,curioso:1.4,solitario:1.4,pragmatico:1.3},
 'Resposta de alta ameaça (HTR)':{coordenado:3,tatico:3,disciplinado:2.5,profissional:2.5,leal:1.6,obediente:1.6,estoico:1.4,volatil:.2,imprevisivel:.2,bravateiro:.3,rebelde:.3},
 'Operações especiais (spec ops)':{coordenado:3,tatico:3.5,profissional:3,disciplinado:2.5,estoico:1.8,leal:1.5,volatil:.1,imprevisivel:.15,bravateiro:.2,rebelde:.2},
 'Mercenário (merc)':{profissional:2.5,pragmatico:2.2,tatico:1.6,coordenado:1.6,veterano:1.5,ganancioso:1.4},
 'Caçador de recompensas (bounty hunter)':{solitario:2,pragmatico:1.6,profissional:1.5,calculista:1.3,veterano:1.3},
 'Motorista / piloto':{impulsivo:1.2,temerario:1.5,brincalhao:1.3,pragmatico:1.2},
 'Informante / fixer':{oportunista:1.7,pragmatico:1.7,cinico:1.5,calculista:1.4,solitario:1.3,leal:.6}};
const SPEC_TRACO_W={
 Mage:{curioso:1.5,supersticioso:1.4,orgulhoso:1.3,calculista:1.3,solitario:1.2},
 Mystic:{curioso:1.5,supersticioso:1.4,devoto:1.3,calculista:1.2,solitario:1.2},
 Adept:{disciplinado:1.8,estoico:1.6,devoto:1.4,profissional:1.3,orgulhoso:1.3},
 Decker:{curioso:1.6,paranoico:1.6,tecnofilo:1.6,solitario:1.5,pragmatico:1.3,rebelde:1.2,calculista:1.3},
 Technomancer:{paranoico:1.6,curioso:1.5,ansioso:1.4,solitario:1.6,rebelde:1.3},
 Rigger:{tecnofilo:1.6,temerario:1.3,brincalhao:1.3,profissional:1.2,coordenado:1.2},
 Lieutenant:{coordenado:1.6,tatico:1.5,leal:1.4,profissional:1.4,disciplinado:1.4}};
const OCC_DOUTRINA={
 'Civil (cidadão comum)':xl('age por instinto: foge, se esconde ou pede ajuda, sem plano nem coordenação'),
 'Wage slave (funcionário corporativo)':xl('segue procedimento e evita o confronto; chama a segurança antes de reagir'),
 'Executivo / Mr. Johnson':xl('deixa os contratados na frente e protege o próprio patrimônio; negocia antes de lutar'),
 'Político / burocrata':xl('só reage atrás de escoltas e prazos; troca de lado se o custo subir'),
 'Cientista':xl('protege o trabalho, calcula o risco e só age por necessidade'),
 'Técnico / engenheiro':xl('prefere improvisar com o equipamento a lutar; segue ordens de quem entende de combate'),
 'Médico / street doc':xl('trata primeiro e luta depois; só pega em arma para defender o paciente'),
 'Arruaceiro / manifestante':xl('age em multidão, no calor do momento: barulho, provocação e arremesso'),
 'Ganger de rua (gangue)':xl('luta em bando e por impulso: provoca, muda de ideia e raramente segue plano; a lealdade vai e vem'),
 'Sindicato (máfia, yakuza, vory)':xl('obedece à hierarquia da organização: frio, disciplinado e discreto, sem gastar o que não rende'),
 'Cultista / fanático':xl('luta por crença: não recua, não negocia e se sacrifica pela seita'),
 'Contrabandista':xl('planeja a rota antes da luta e prefere escapar a vencer'),
 'Segurança corporativa (rent-a-cop)':xl('segue o procedimento, mantém posição e pede reforço antes de arriscar'),
 'Polícia (Lone Star / força local)':xl('dá voz de comando, usa cobertura e reforço, e segue as regras de engajamento'),
 'Guarda-costas':xl('só pensa no protegido: vigia, cobre, retira e aceita o risco no lugar dele'),
 'Detetive / investigador':xl('observa, evita o confronto direto e prefere capturar a matar'),
 'Resposta de alta ameaça (HTR)':xl('age como equipe: setores, rádio, avanço em lances e fogo coordenado'),
 'Operações especiais (spec ops)':xl('age em silêncio e em sincronia: reconhece, entra por etapas e cumpre o plano ao pé da letra'),
 'Mercenário (merc)':xl('profissional e prático: cumpre o contrato, coordena-se com a equipe e sai quando o contrato não compensa'),
 'Caçador de recompensas (bounty hunter)':xl('rastreia e captura: paciência, armadilha e pressa só no fim'),
 'Motorista / piloto':xl('mantém o veículo pronto e a rota aberta; a saída vem antes do tiro'),
 'Informante / fixer':xl('evita o combate, vende o que sabe e fica do lado de quem estiver ganhando')};

/* ---------- estilos novos, baseados em ocupação (ocx: só entram quando a ocupação os cita em OCC_ESTILO_W) ---------- */
Object.assign(ESTILO,{
 esquadrao:{n:xl('Operador de equipe tática'),ocx:1,sk:['Automatics'],wk:'f',wp:/Assault Rifles|Submachine|Carbines|Shotguns/,wc:'Assault Rifles|Submachine Guns',at:['AGI','REA','WIL'],ap:['Gymnastics','Perception','Sneaking','Running'],w:.7,
  pa:{'Smartgun System, Internal':.3,'Foregrip':.3,'Laser Sight':.25},pg:[['Micro-Transceiver',.6],['Earbuds',.5]],ar:'tatica',im:[['Smartlink|Cybereyes',2.5],['Reaction Enhancers|Wired Reflexes',2]],pf:'soldado',spc:'Assault Rifles',
  qp:{Toughness:1,Guts:1.2},kn:['Tactics','Military History'],pec:[xl('Confirma cada movimento por sinais de mão'),xl('Só entra depois do "pronto" de todos'),xl('Repete a ordem de volta antes de executar')],d:xl('age como parte de uma equipe: comunica, cobre setores e avança em lances')},
 batedor:{n:'Batedor (reconhecimento)',ocx:1,sk:['Sneaking'],wk:'f',wp:/Sniper|Carbines|Assault|Pistols/,wc:'Assault Rifles|Sniper Rifles|Light Pistols',at:['AGI','INT','WIL'],ap:['Perception','Navigation','Survival','Tracking'],w:.5,
  pg:[['Binoculars',.5],['Micro-Transceiver',.4]],ar:'discreta',im:[['Smartlink|Cybereyes|Eyes',2]],pf:'furtivo',spc:'Urban',
  qp:{Observant:1.5,'Hawk Eye':1},kn:['Tactics','Terrain Maps'],pec:[xl('Anota tudo em um caderno que ninguém lê'),xl('Só fala em sussurros, mesmo em local seguro')],d:xl('vai na frente, observa e volta com informação antes de qualquer tiro')},
 patrulheiro:{n:xl('Patrulheiro (policial de rua)'),ocx:1,sk:['Pistols'],wk:'f',wp:/Pistols|Submachine|Clubs|Tasers|Shotguns/,wc:'Heavy Pistols|Light Pistols|Clubs',at:['REA','INT','CHA'],ap:['Perception','Intimidation','Etiquette','Unarmed Combat'],w:.6,
  pa:{'Flashlight, Standard':.3,'Quick-Draw Holster':.3},pg:[['Flashlight',.5]],ar:'tatica',pf:'soldado',spc:'Semi-Automatics',
  qp:{Observant:1},kn:['Police Procedures','Local Underworld'],pec:[xl('Dá voz de prisão mesmo quando está claro que não vai prender'),xl('Anota a placa de tudo que passa'),xl('Chama todo mundo de "senhor", até quem vai algemar')],d:xl('faz ronda, dá ordem de parar e pede reforço antes de arriscar')},
 escolta:{n:'Escolta (guarda-costas)',ocx:1,sk:['Pistols'],wk:'f',wp:/Pistols|Submachine|Machine Pistols/,wc:'Heavy Pistols|Machine Pistols|Submachine Guns',at:['REA','BOD','INT'],ap:['Perception','Unarmed Combat','Etiquette','First Aid'],w:.6,
  pa:{'Quick-Draw Holster':.4,'Smartgun System, Internal':.25},pg:[['Earbuds',.6],['Micro-Transceiver',.5]],ar:'discreta',im:[['Smartlink|Cybereyes',2],['Reaction Enhancers|Wired Reflexes',2],['Dermal|Bone Lacing',1.2]],pf:'soldado',spc:'Semi-Automatics',
  qp:{Toughness:1.5,Observant:1.5,Guts:1},kn:['Executive Protection','Security Procedures'],pec:[xl('Nunca senta de costas para a porta'),xl('Vigia as mãos de todos antes de olhar o rosto'),xl('Impede que o cliente cumprimente estranhos')],d:xl('vive para manter o protegido vivo: vigia, cobre e retira sem aceitar riscos')},
 bando:{n:xl('Membro de bando (rua)'),ocx:1,sk:['Intimidation'],wk:'m',wp:/Blades|Clubs|Pistols|Machine Pistols|Tasers/,wc:'Blades|Clubs|Light Pistols|Machine Pistols',at:['AGI','STR','CHA'],ap:['Unarmed Combat','Running','Perception','Gymnastics'],w:.7,
  pg:[['Glasses',.15]],ar:'leve',im:[['Muscle|Bone Lacing|Dermal|Cyberarm',1.2]],pf:'lutador',spc:'Physical',
  qp:{Toughness:1,'Pain is Gain':1},kn:['Gang Identification','Local Underworld'],pec:[xl('Mostra as cores da gangue em tudo que veste'),xl('Desafia estranhos só para ver quem recua'),xl('Muda de humor sem aviso, rindo e xingando na mesma frase')],d:xl('luta em bando, de perto e com o que tiver: a coragem vem da multidão')},
 chefao:{n:xl('Chefão (comando de organização)'),ocx:1,sk:['Leadership'],wk:'',at:['CHA','WIL','INT'],ap:['Negotiation','Intimidation','Etiquette','Perception'],w:.5,
  ar:'discreta',pf:'face',spc:'Direct Command',qp:{'Natural Leader':1.5,'Better to be Feared Than Loved':1},kn:['Organized Crime','Syndicate Politics'],
  pec:[xl('Nunca toca em dinheiro, só em contratos'),xl('Manda recado por outro, nunca pessoalmente'),xl('Lembra de todos os favores e de todas as dívidas')],d:xl('comanda por reputação e medo, e delega o trabalho sujo')},
 executor:{n:xl('Executor (braço armado de organização)'),ocx:1,sk:['Pistols'],wk:'f',wp:/Pistols|Submachine|Shotguns|Blades/,wc:'Heavy Pistols|Submachine Guns|Blades',at:['AGI','REA','CHA'],ap:['Intimidation','Sneaking','Unarmed Combat','Perception'],w:.6,
  pa:{'Sound Suppressor':.3,'Laser Sight':.25},ar:'discreta',im:[['Smartlink|Cybereyes',1.5],['Reaction Enhancers|Wired Reflexes',1.5]],pf:'soldado',spc:'Semi-Automatics',
  qp:{'Better to be Feared Than Loved':1,Guts:1},kn:['Organized Crime','Local Underworld'],pec:[xl('Veste-se como alguém que vai a um funeral'),xl('Nunca pergunta o motivo do trabalho'),xl('Só fala com quem dá as ordens')],d:xl('cumpre as ordens da organização com frieza e discrição')},
 zelote:{n:xl('Zelote (fé como arma)'),ocx:1,sk:['Blades'],wk:'m',wp:/Blades|Clubs|Pistols/,wc:'Blades|Clubs|Light Pistols',at:['WIL','BOD','CHA'],ap:['Intimidation','Unarmed Combat','Perception','Con'],w:.5,
  ar:'leve',pf:'lutador',spc:'Knives',qp:{Guts:1.5,Toughness:1},kn:['Cult Doctrine','Magical Theory'],pec:[xl('Canta ou reza durante a luta'),xl('Não aceita rendição de ninguém, nem a própria'),xl('Marca a pele com símbolos da seita')],d:xl('luta por crença: não negocia, não recua e não pede cobertura')},
 fugitivo:{n:'Fugitivo (rotas e escapadas)',ocx:1,sk:['Pilot Ground Craft'],wk:'f',wp:/Pistols|Machine Pistols|Submachine/,wc:'Light Pistols|Machine Pistols',at:['REA','AGI','INT'],ap:['Navigation','Perception','Running','Sneaking'],w:.5,
  ar:'discreta',im:[['Reaction Enhancers|Wired Reflexes',1.5]],pf:'piloto',spc:'Ground Craft',qp:{'Steely Eyed Wheelman':1.5},kn:['Back Roads','Smuggling Routes'],
  pec:[xl('Estaciona sempre de frente para a saída'),xl('Tem uma segunda rota e uma terceira'),xl('Mantém o motor ligado até o último segundo')],d:xl('planeja a saída antes da entrada: rota, veículo e plano B')},
 burocrata:{n:'Negociador corporativo',ocx:1,sk:['Negotiation'],wk:'',at:['CHA','LOG','WIL'],ap:['Etiquette','Con','Perception','Leadership'],w:.5,
  ar:'discreta',pf:'face',spc:'Contracts',qp:{'Analytical Mind':1},kn:['Corporate Politics','Corporate Finance'],pec:[xl('Só decide depois de uma reunião sobre a decisão'),xl('Guarda cópia de todos os e-mails'),xl('Responde ao perigo pedindo um relatório')],d:xl('resolve com prazos, contratos e seguranças: evita o confronto direto')}
});
/* ---------- estilos novos, baseados em especialização ---------- */
Object.assign(ESTILO,{
 guardiaomagico:{n:xl('Guardião arcano'),sk:['Spellcasting'],req:['Mage'],sc:['Health','Illusion','Manipulation'],at:['WIL','LOG','INT'],ap:['Counterspelling','Assensing','Perception'],w:.7,
  ar:'leve',pf:'civil',spc:'Counterspelling',qp:{'Analytical Mind':1},kn:['Magical Theory','Spirit Lore'],pec:[xl('Traça símbolos no ar antes de entrar em um cômodo'),xl('Verifica o plano astral antes de abrir qualquer porta')],d:xl('protege os aliados com barreiras, cura e contrafeitiços')},
 adeptoguardiao:{n:xl('Adepto guardião'),sk:['Unarmed Combat','Blades'],req:['Adept'],pw:['Mystic Armor','Pain Resistance','Combat Sense','Improved Reflexes'],wk:'u',at:['BOD','REA','WIL'],ap:['Gymnastics','Perception','Intimidation'],w:.8,
  ar:'leve',pf:'lutador',spc:'Subduing Combat',kn:['Martial Arts'],pec:[xl('Posiciona-se entre o grupo e a porta'),xl('Medita antes de cada missão e depois de cada luta')],d:xl('usa o corpo como escudo e investe em poderes defensivos')},
 hackerdecampo:{n:xl('Hacker de campo'),sk:['Hacking'],req:['Decker','Technomancer'],at:['LOG','INT','REA'],ap:['Electronic Warfare','Computer','Perception','Sneaking'],w:.7,
  pg:[['AR Gloves',.3],['Micro-Transceiver',.5]],ar:'tatica',pf:'tecnico',spc:'Hosts',qp:{'Analytical Mind':1.5},kn:['Corporate Hosts','Tactics'],pec:[xl('Narra o que vê na Matrix pelo rádio'),xl('Mantém o deck sempre à vista dos aliados')],d:xl('trabalha junto da equipe, em campo, com a Matrix a serviço do plano')},
 enxame:{n:xl('Comandante de enxame (rigger)'),sk:['Gunnery'],req:['Rigger'],at:['INT','LOG','REA'],ap:['Electronic Warfare','Perception','Pilot Ground Craft'],w:.7,
  ar:'leve',pf:'piloto',spc:'Ballistic',qp:{},kn:['Weapon Systems','Drone Models'],pec:[xl('Dá comandos a vários drones ao mesmo tempo'),xl('Fala com a equipe como se fosse a voz de todos os drones')],d:xl('comanda vários drones em apoio coordenado à equipe')}
});
Object.assign(ST_GRP,{esquadrao:'fogo',batedor:'furtivo',patrulheiro:'fogo',escolta:'fogo',bando:'corpo',chefao:'social',executor:'fogo',zelote:'corpo',fugitivo:'piloto',burocrata:'social',
 guardiaomagico:'magia',adeptoguardiao:'corpo',hackerdecampo:'matrix',enxame:'piloto'});
Object.assign(TAT_ST,{
 esquadrao:{o:xl('Entra em equipe: cada um cobre um setor e ninguém avança sem a confirmação dos outros.')},
 batedor:{o:xl('Vai na frente, reconhece o terreno em silêncio e só passa o que viu para o grupo.')},
 patrulheiro:{o:xl('Dá a voz de comando, procura cobertura e chama reforço antes de arriscar.')},
 escolta:{o:xl('Põe o corpo entre o protegido e a ameaça e só pensa em retirar.')},
 bando:{o:xl('Entra gritando e em bando, sem plano: a coragem vem de quem está ao lado.')},
 chefao:{o:xl('Deixa o trabalho para os outros e só aparece quando a vitória já é certa.')},
 executor:{o:xl('Cumpre a ordem com frieza e sem teatro; não gasta nada além do necessário.')},
 zelote:{o:xl('Entra cantando ou rezando e não considera recuar.')},
 fugitivo:{o:xl('Define a rota de fuga antes de abrir fogo e mantém o veículo pronto.')},
 burocrata:{o:xl('Evita o confronto: negocia, adia e deixa a segurança agir.')},
 guardiaomagico:{o:xl('Ergue barreiras e cura aliados antes de qualquer feitiço ofensivo.')},
 adeptoguardiao:{o:xl('Entra na frente do grupo e usa o corpo como escudo.')},
 hackerdecampo:{o:xl('Prepara a Matrix para a equipe entrar: câmeras, portas e sensores.')},
 enxame:{o:xl('Libera os drones em ondas e os comanda como extensão da equipe.')}});

/* ---------- traços novos (coordenação, tática, volatilidade, lealdade) ---------- */
Object.assign(TRACO,{
 coordenado:{n:'Coordenado',c:['solitario','imprevisivel','volatil'],gw:{'Militar e caça':1.5,'Segurança e lei':1.4,'Rua e crime':.8,Civis:.6},up:1,acc:0,bv:.7,rd:.4,rf:1.5,
  pq:{'No Man Left Behind':1},pec:[xl('Confirma a posição de cada aliado antes de se mover'),xl('Fala pouco e só passa informação útil')],mot:[xl('Acredita que o grupo vence quando age como um corpo só')],fl:[xl('"Posição confirmada."'),xl('"Cubro seu lado."')]},
 tatico:{n:xl('Tático'),c:['impulsivo','volatil','imprevisivel','temerario'],gw:{'Militar e caça':1.6,'Segurança e lei':1.3,Sombras:1.1},up:1.2,acc:1,bv:.65,rd:.5,rf:1.3,at:['LOG'],
  pq:{'Analytical Mind':1},pec:[xl('Estuda saídas, ângulos e linhas de tiro ao entrar em qualquer lugar'),xl('Desenha o terreno com o dedo no ar')],mot:[xl('O plano certo vale mais do que a pontaria')],fl:[xl('"Ângulo livre."'),xl('"Mudamos de posição."')]},
 volatil:{n:xl('Volátil'),c:['metodico','tatico','coordenado','calculista','estoico','profissional'],gw:{'Rua e crime':1.8,Civis:1.1,Sombras:1.1},up:1.1,acc:0,bv:.55,rd:.9,rf:.6,
  pec:[xl('Muda de ideia no meio da frase'),xl('Passa do riso à fúria sem aviso')],mot:[xl('Reage ao momento, não ao plano')],fl:[xl('"Sabe de uma coisa? Dane-se."'),xl('"Mudei de ideia."')]},
 imprevisivel:{n:xl('Imprevisível'),c:['metodico','tatico','coordenado','disciplinado','profissional'],gw:{'Rua e crime':1.5,Sombras:1.3},up:1.3,acc:0,bv:.5,rd:1,rf:.8,
  pec:[xl('Nunca age do mesmo jeito duas vezes'),xl('Decide no instinto, às vezes jogando uma moeda')],mot:[xl('Gosta de manter todos sem saber o que virá')],fl:['"Surpresa."',xl('"Achou mesmo que eu ia fazer isso?"')]},
 solitario:{n:xl('Solitário'),c:['coordenado','leal','obediente'],gw:{Sombras:1.5,'Militar e caça':1.1,'Rua e crime':1},up:1,acc:0,bv:.6,rd:.8,rf:.3,
  pec:[xl('Evita ficar perto de qualquer pessoa em combate'),xl('Prefere resolver tudo sozinho')],mot:[xl('Só confia em si mesmo')],fl:['"Eu cuido disso."',xl('"Não preciso de ajuda."')]},
 obediente:{n:'Obediente',c:['rebelde','imprevisivel','solitario'],gw:{'Segurança e lei':1.4,'Militar e caça':1.3,'Corporativo e ciência':1.1},up:.9,acc:0,bv:.65,rd:.5,rf:1.2,
  pec:[xl('Responde "sim, senhor" antes de entender a ordem'),xl('Espera ordens antes de qualquer decisão')],mot:[xl('A cadeia de comando existe por um motivo')],fl:['"Entendido."','"Cumprindo ordens."']},
 bravateiro:{n:'Bravateiro',c:['estoico','ansioso','frio'],gw:{'Rua e crime':1.6,Civis:.8},up:1,acc:0,bv:.6,rd:.7,rf:.9,
  pec:[xl('Fala alto para impressionar quem está perto'),xl('Exagera cada vitória e esquece cada derrota')],mot:[xl('Precisa mostrar que não tem medo de nada')],fl:[xl('"Isso é tudo que vocês têm?"'),xl('"Eu faria de novo!"')]},
 pragmatico:{n:xl('Pragmático (lealdade condicional)'),c:['fanatico','devoto'],gw:{Sombras:1.4,'Militar e caça':1.2,'Corporativo e ciência':1.2},up:1.1,acc:0,bv:.55,rd:1,rf:1,
  pec:[xl('Pesa o custo de cada risco em voz alta'),xl('Ajuda quem está do mesmo lado, enquanto o lado for o mesmo')],mot:[xl('Fica enquanto compensa e sai quando deixa de compensar')],fl:['"Faz sentido."','"O contrato diz outra coisa."']},
 profissional:{n:'Profissional',c:['impulsivo','volatil','imprevisivel','bravateiro'],gw:{'Militar e caça':1.5,'Segurança e lei':1.2,Sombras:1.2},up:1.1,acc:1,bv:.75,rd:.4,rf:1.1,
  pq:{Guts:1},pec:[xl('Faz o trabalho e não comenta'),xl('Mantém o equipamento sempre conferido')],mot:[xl('Faz o que foi combinado, do jeito combinado')],fl:[xl('"Trabalho é trabalho."'),'"Feito."']}
});
Object.assign(TAT_TR,{
 coordenado:{p:xl('Move-se com o grupo, confirma posições e cobre os setores dos outros.'),e:xl('Gasta Edge para salvar a formação, não para brilhar.')},
 tatico:{p:xl('Escolhe ângulo, cobertura e rota antes de atirar; muda de posição quando o plano deixa de funcionar.'),e:xl('Guarda Edge para Tomar a iniciativa e abrir a luta na posição que escolheu.')},
 volatil:{p:xl('Reage ao último estímulo: ataca, recua ou grita sem plano.'),e:xl('Gasta Edge cedo, em um impulso, e fica sem nada para o fim.')},
 imprevisivel:{p:xl('Faz o que o grupo não espera e nunca repete a mesma conduta.'),e:xl('Usa Edge em um momento inesperado, até em ações sem importância.')},
 solitario:{p:xl('Age sozinho e não espera nem ajuda os aliados.'),e:xl('Gasta Edge em si mesmo, sem pensar no grupo.')},
 obediente:{p:xl('Cumpre a ordem recebida e mantém a posição até alguém mandar o contrário.'),e:xl('Só usa Edge quando o líder ou o plano mandam.')},
 bravateiro:{p:xl('Faz barulho, provoca e se expõe para mostrar coragem.'),e:xl('Gasta Edge em ações teatrais para impressionar os outros.')},
 pragmatico:{p:xl('Pesa o custo e o ganho a cada rodada; muda de conduta quando o cálculo muda.'),e:xl('Guarda Edge para sair vivo, não para vencer.')},
 profissional:{p:xl('Faz o combinado do jeito combinado, sem teatro e sem improviso desnecessário.'),e:xl('Gasta Edge só em ações que protegem o objetivo.')}});
Object.assign(TR_AFF.fogo,{coordenado:1.3,tatico:1.3,profissional:1.2,obediente:1.1,volatil:.6,imprevisivel:.6,bravateiro:.7});
Object.assign(TR_AFF.corpo,{volatil:1.3,bravateiro:1.4,imprevisivel:1.2,coordenado:.7,tatico:.6});
Object.assign(TR_AFF.social,{pragmatico:1.2,imprevisivel:1.1,profissional:1.1});
Object.assign(TR_AFF.furtivo,{solitario:1.4,pragmatico:1.2,tatico:1.1,profissional:1.2});
Object.assign(TR_AFF.tecnico,{pragmatico:1.1,coordenado:1.1});
Object.assign(TR_AFF.piloto,{profissional:1.1,imprevisivel:1.2});
Object.assign(TR_AFF.matrix,{solitario:1.2,pragmatico:1.2});
Object.assign(TR_AFF.magia,{solitario:1.1});
