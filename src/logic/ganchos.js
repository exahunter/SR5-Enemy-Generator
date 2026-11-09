/* ===== Ganchos narrativos: motivação, peculiaridade e comportamento em combate ===== */
const GC_MOT={
 'Civis':[xl('Sustenta a família com dois empregos e não pode perder nenhum'),xl('Deve uma conta médica a alguém perigoso'),xl('Quer sair do sprawl e juntou quase o suficiente'),xl('Só quer chegar em casa vivo hoje'),xl('Esconde um segredo que a vizinhança não pode saber'),xl('Viu algo que não devia e não sabe a quem contar')],
 'Corporativo e ciência':[xl('Quer a promoção e passa por cima de quem for preciso'),xl('Protege um projeto que já percebeu ser perigoso'),xl('Desviou verba e precisa que ninguém olhe os números'),xl('Quer sair da corporação sem ser caçado'),xl('É leal à empresa por medo, não por gosto'),xl('Negocia em segredo com uma corporação rival')],
 'Rua e crime':[xl('Precisa provar valor ao chefe antes de ser descartado'),xl('Vinga alguém da própria gangue morto por uma facção rival'),xl('Está endividado com um agiota e aceita qualquer serviço'),xl('Quer o território do vizinho e vai chegar lá nem que a ponte caia'),xl('Protege a família que mora no quarteirão'),xl('Gosta do poder que a arma dá e não sabe viver sem ele')],
 'Segurança e lei':[xl('Cumpre o contrato e vai para casa; heroísmo não paga hora extra'),xl('Acredita na lei, mas está cansado de vê-la perder'),xl('Recebe uma propina mensal e hesita em quebrar o acordo'),xl('Tem algo a provar depois de um erro no passado'),xl('Quer a medalha, o bônus ou a promoção no fim do turno'),xl('Quer vingar um colega morto no mesmo bairro')],
 'Militar e caça':[xl('Segue o dinheiro e o contrato, sem perguntas'),xl('Tem um código de honra e só quebra com um bom motivo'),xl('Carrega a culpa de uma operação que deu errado'),xl('Está pagando o tratamento de alguém e precisa de cada nuyen'),xl('Gosta do trabalho e não sabe o que fazer da vida sem ele'),xl('Procura o alvo certo para acertar contas antigas')],
 'Sombras':[xl('Vive de informação e vende a quem pagar mais'),xl('Quer sair do jogo com uma última grande vez'),xl('Deve um favor grande a alguém que não pode recusar'),xl('Paga a faculdade de um parente com cada corrida'),xl('Trabalha para duas partes ao mesmo tempo'),xl('Procura um nome que apareceu numa corrida antiga')]
};
const GC_MOT_G=[xl('Quer ser lembrado por alguém, de algum jeito'),xl('Está com medo e tenta esconder'),xl('Desconfia de todo mundo e já foi traído antes'),xl('Tem um objetivo pessoal que nada tem a ver com o serviço'),xl('Acredita que isso é só um trabalho')];
const GC_PEC=[xl('Fala sozinho quando está nervoso'),xl('Nunca tira as luvas'),xl('Cheira a perfume caro demais para o serviço'),xl('Conta moedas ou cartuchos antes de cada decisão'),xl('Coleciona um tipo estranho de bugiganga'),xl('Gagueja só quando mente'),xl('Assobia sempre a mesma melodia'),xl('Tem uma cicatriz que muda de história a cada vez'),xl('Reza ou faz um gesto de proteção antes de agir'),xl('Come sem parar quando está tenso'),xl('Odeia armas de determinada marca e se recusa a usá-las'),xl('Não suporta silêncio e puxa conversa com qualquer um'),xl('Carrega uma foto antiga e a olha em momentos errados'),xl('Pede desculpas antes de ameaçar'),xl('Tem o nome de um animal tatuado no pescoço'),'Chama todo mundo pelo apelido errado',xl('Evita olhar nos olhos e fixa na testa'),xl('Faz piada na hora errada e se arrepende'),xl('Corrige a gramática dos outros mesmo sob fogo'),xl('Tem tique nervoso na mão dominante'),xl('Nunca senta de costas para a porta'),xl('Usa uma gíria que ninguém mais entende'),xl('Só dorme com a luz acesa'),xl('Mastiga o tempo todo (chiclete, palito ou nada)'),xl('É educado demais com quem apontou uma arma para ele'),xl('Dedica-se a um gato de rua que o segue'),xl('Dá gorjeta exagerada em qualquer lugar'),xl('Toca o amuleto antes de atirar'),xl('Tem um sotaque que muda quando fica com raiva'),xl('Tem fobia de elevador e escada rolante')];
/* comportamento em combate por grupo de ocupação: f = fração do monitor físico em que foge (1 = não foge), rd = chance de se render, rf = chance de chamar reforço */
const GC_CMB={
 'Civis':{f:[.1,.25],rd:.7,rf:.1,who:[xl('vizinhos armados'),xl('a polícia local')]},
 'Corporativo e ciência':{f:[.15,.35],rd:.6,rf:.55,who:[xl('a segurança do prédio'),xl('a equipe de resposta da corporação')]},
 'Rua e crime':{f:[.4,.65],rd:.25,rf:.4,who:[xl('o resto da gangue'),xl('um parceiro com carro'),xl('a célula local')]},
 'Segurança e lei':{f:[.5,.75],rd:.15,rf:.8,who:[xl('a viatura mais próxima'),xl('a equipe de resposta'),xl('o supervisor com mais dois guardas')]},
 'Militar e caça':{f:[.65,.9],rd:.05,rf:.3,who:[xl('o resto do esquadrão'),xl('um helicóptero de apoio'),xl('o contratante')]},
 'Sombras':{f:[.25,.5],rd:.4,rf:.35,who:[xl('um contato bem armado'),xl('o motorista com reforço'),xl('um favor devido')]}
};
const GC_CMB_TIPO={'Cultista / fanático':{f:[1,1],rd:0,rf:.2,who:[xl('mais fiéis do culto')]},'Guarda-costas':{f:[.85,1],rd:0,rf:.7,who:[xl('o resto da comitiva'),xl('a segurança do local')]},'Operações especiais (spec ops)':{f:[.8,1],rd:0,rf:.5,who:[xl('o apoio da unidade')]},'Resposta de alta ameaça (HTR)':{f:[.75,.95],rd:.05,rf:.8,who:[xl('o segundo esquadrão'),xl('um helicóptero de apoio')]},'Polícia (Lone Star / força local)':{f:[.5,.7],rd:.15,rf:.95,who:[xl('a Lone Star'),xl('as viaturas do distrito'),xl('um esquadrão tático')]}};
const GC_ROLE={Líder:.1,Chefe:.1,Sargento:.1,Supervisor:.1,'Segundo em comando':.05,Capanga:-.12,Novato:-.15,Fiel:.1,'Guarda-costas':.1,Assistente:-.15,VIP:-.2};
const gcClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const genGancho=comCamadas('genGancho',genGanchoBase);
function genGanchoBase(c){const o=c.npc;if(!o||c.crit)return;
 const T=TYPES[o.type]||{},g=T.g||'Civis',B=GC_CMB_TIPO[o.type]||GC_CMB[g]||GC_CMB['Civis'];
 const mot=Math.random()<.75?pick(GC_MOT[g]||GC_MOT_G):pick(GC_MOT_G);
 let f=B.f[0]+Math.random()*(B.f[1]-B.f[0]);f+=Math.min(.12,(o.pr||0)*.012)+(GC_ROLE[o.role]||0);
 const never=B.f[0]>=1;
 o.hook={mot,pec:pick(GC_PEC),f:never?1:+gcClamp(f,.1,.98).toFixed(2),rd:Math.random()<B.rd,
  rf:Math.random()<B.rf?{rd:R(1,3),min:R(2,10),n:R(2,5),q:pick(B.who)}:null}}
/* texto da conduta em combate (usa o monitor físico e a lealdade ao líder, se houver) */
function ganchoTxt(c){const h=c.npc&&c.npc.hook;if(!h)return null;
 const d=derived(c),loy=c.npc.loy||0,f=h.f>=1?1:gcClamp(h.f+(loy?(loy-4)*.03:0),.1,.98),box=Math.max(1,Math.round(d.fis*f));
 const fuga=f>=1?xl('Não foge: luta até cair'):t('gancho.foge',{n:box,f:d.fis,pen:ferPen(box)>=1?tn('gancho.pen.dado',ferPen(box)):t(ferStep()?'gancho.pen.ainda':xl('gancho.pen.sem'))});
 const rf=h.rf?xlf('Chama reforço na {0}ª rodada: cerca de {1} pessoas ({2}), chegam em ~{3} min',h.rf.rd,h.rf.n,h.rf.q,h.rf.min):xl('Não chama reforço');
 return{mot:h.mot,pec:h.pec,fuga,rende:h.rd?xl('Rende-se se encurralado'):(f>=1?'':xl('Não se rende')),rf,box}}
const ganchoNotas=comCamadas('ganchoNotas',ganchoNotasBase);
function ganchoNotasBase(c){const t=ganchoTxt(c),n=c.npc&&c.npc.nm;if(!t)return[];
 return[xl('Motivação: ')+t.mot,xl('Peculiaridade: ')+t.pec,xl('Em combate: ')+[t.fuga,t.rende].filter(Boolean).join('. ')+'. '+t.rf,n&&n.cult?xl('Cultura: ')+xl(n.cult)+xl(' (idioma nativo ')+n.l+')':''].filter(Boolean)}
