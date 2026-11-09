/* ===== v38: ligação texto → ação do livro (actions.xml) =====
 * ACR: [[regex sobre o texto em minúsculas, [nomes de ação do Chummer, em inglês]], …], na ordem de prioridade.
 * Usado por logic/acoes.js (acRefs): para cada tática/conduta, até 2 ações distintas que a primeira oração do texto (até o ';') descreve.
 * Ação que não existe no actions.xml carregado, ou de livro desmarcado, some em silêncio.
 * Para acrescentar uma regra, basta uma linha aqui; o nome tem de ser igual ao <name> do actions.xml. */
const ACR=[
 [/rajadas? longas?|saraivada/,['Fire Long Burst']],
 [/rajadas? curtas?|rajadas? de|rajada\b/,['Fire Burst Fire']],
 [/semi-?autom/,['Fire Semi-Auto']],
 [/autom[áa]tico|esvazia o pente|despeja|fogo cerrado|tiroteio/,['Fire Full-Auto Simple']],
 [/tiros? [úu]nicos?|um tiro|tiros? precisos?|tiro certeiro|dispara s[óo] para ferir|dispara|atira s[óo]|escondido: d[áa]|atira e|atira de|atira com|atira no|atira em/,['Fire Single-Shot']],
 [/supress|mant[eé]m .*cabe[çc]a baixa|fogo de cobertura|cobre (o )?(avan[çc]o|a equipe|a retirada|o recuo)|cobrindo(?!-se)/,['Suppressive Fire']],
 [/\bmira\b|\bmirar\b|mirando|aponta com calma|escolhe .*alvo/,['Take Aim']],
 [/recarrega|troca de pente|pente/,['Reload Firearm']],
 [/\bsaca\b|saque r[áa]pido|puxa a arma/,['Quick Draw']],
 [/granada/,['Throw Weapon (Grenade)']],
 [/feiti[çc]o|conjura(?!dor)|magia de combate/,['Cast Spell (Indirect, Single-target Combat)']],
 [/espírito/,['Command Spirit']],
 [/intercepta|barra a passagem/,['Intercept']],
 [/defesa total/,['Full Defense']],
 [/esquiv/,['Dodge']],
 [/bloque(ia|io)/,['Block']],
 [/empurra|derruba (o|a) (alvo|inimigo|guarda)/,['Shove']],
 [/algema|imobiliza|agarra|agarrado|segura o alvo/,['Subduing']],
 [/corpo a corpo|investe|fecha a dist|golpe|soco|facada|l[âa]mina|coronha|parte para cima|gruda no alvo|briga/,['Melee Attack']],
 [/se joga no ch[ãa]o|cai no ch[ãa]o|rasteja|rastejando|agachado|abaixa(?! a arma)/,['Drop Prone']],
 [/finge ter desmaiado|se faz de morto|finge (estar )?morto|se finge de morto|finge de morto/,['Playing Possum (Performance)']],
 [/(?<!ignora a )cobertura(?! pela matrix)|abrigo|atr[áa]s d[eo]|se esconde|esconde-se|escondido|barricada|esquina|encosta/,['Take Cover']],
 [/foge|escapa|sai pela|fuga|sai correndo|desaparece/,['Sprint']],
 [/\bcorre\b|correndo|corrida|dispara em dire/,['Run']],
 [/rende|entrega (a arma|o equipamento)|larga a arma|largando|joelhos|m[ãa]os ao alto|larga o/,['Drop Object']],
 [/grita|ordens|comanda|aponta os alvos|avisa|cubram|esperem|segurem|sinal/,['Speak/Text/Transmit Phrase']],
 [/negocia|oferece|propõe|promete|trégua|suborna|blefa|convence|barganha|pergunta o pre[çc]o|pergunta quanto|vende os aliados|por um pre[çc]o|vira a casaca|muda de lado/,['Use Skill']],
 [/slap patch|estimulante|medkit|estancar|compressa|primeiros socorros|cuida|(?<!o )m[ée]dico/,['Use Skill']],
 [/observa|mapeia|examina|conta quantos|procura|reconhece|lembra a planta/,['Observe in Detail']],
 [/vigia a |patrulha|perceber/,['Shift Perception']],
 [/spike|ataca o (dispositivo|[íi]cone)|derruba o sistema/,['Data Spike']],
 [/desconect|jack out/,['Jack Out']],
 [/\bhackea|\bhackear|\bhackeando|matrix/,['Matrix Perception']],   // v43: "decker" e "hackers" sozinhos citam alguém, não uma ação
 [/abalroa/,['Ramming']],
 [/dirige|pilota|persegue|ve[íi]culo|carro/,['Control Vehicle']],
 [/\bdrones?\b/,['Control Device (Simple)']],
];

/* ===== v43: ações de Matrix e ações sociais com regra própria =====
 * O actions.xml não traz ações sociais: Intimidação, Negociação, Disfarce etc. são "Use Skill" (testes de perícia), então toda conduta social aponta para ela.
 * As de Matrix têm ação própria (marcar, controlar, interferir, rastrear, apagar rastro). Estas regras entram na frente das anteriores.
 * Os textos usam o nome do deck/drone/RCC da ficha no lugar do item, por isso as regras olham o verbo (abrir portas, desligar câmeras), não o nome do aparelho.
 * Um aparelho precisa de marca antes de ser controlado: portas, câmeras e armas viram "Hack on the Fly (1 Mark)" + "Control Device (Simple)". */
ACR.unshift(
 /* Matrix */
 [/ca[çc]a a persona|persona deles|procura (outros )?hackers|ca[çc]a (os )?hackers/,['Matrix Perception','Trace Icon']],
 [/zera os sensores|corta as comunica|bloqueia o sinal|interfere n[oa]s? sinais?|embaralha a vis[ãa]o|atrapalha(ndo)? as armas/,['Jam Signals']],
 [/abre (as )?portas|abrir portas|desliga(r)? (as )?c[âa]meras|c[âa]meras, portas|fecha os olhos do inimigo|trava as (armas|miras)/,['Hack on the Fly (1 Mark)','Control Device (Simple)']],
 [/apaga (o|seu) rastro|apaga a assinatura/,['Erase Matrix Signature']],
 [/some da (matrix|rede)|se esconde na (matrix|rede)|fica invis[íi]vel na (matrix|rede)/,['Hide']],
 [/reinicia o (dispositivo|aparelho)|reboot/,['Reboot Device']],
 [/formata o (dispositivo|aparelho)/,['Format Device']],
 [/derruba o programa|trava o programa/,['Crash Program']],
 [/rastreia|localiza o hacker|trace/,['Trace Icon']],
 [/alvo da rede|conectado o tempo todo/,['Matrix Perception']],
 /* sociais (todas são testes de perícia: "Use Skill") */
 [/domina pela presen[çc]a|usa o medo|intimida|berra|amea[çc]a e tenta|mente primeiro|engana|disfar[çc]a|interroga|prefere capturar e conversar|resolve na conversa|distrai: chama a aten/,['Use Skill']]);
