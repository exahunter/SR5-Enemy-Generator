/* ===== Formato de números e termos de regra =====
 * REGRA 1 — onde o texto aparece decide o formato:
 *   TELA (ficha, dicas, resumos)  segue o idioma escolhido: pt → 1.234,5 · en → 1,234.5   (fmtNum, fmtDec, fmtNy)
 *   ARQUIVO (XML, JSON, Notas)    segue o Chummer: números sem localização, nuyen do JSON/Notas com milhar en-US (nyArquivo)
 *   Nenhum outro arquivo chama toLocaleString/toFixed para mostrar número: passe por aqui.
 * REGRA 2 — o que fica no original (inglês) e o que se traduz:
 *   FICA no original: nome de coisa do jogo (item, arma, magia, poder, qualidade, perícia, metatipo, programa, tradição, arte marcial),
 *     porque é o nome que o Chummer e o livro mostram; e o que vai dentro de arquivo (tags, rótulos das Notas).
 *   TRADUZ na tela: palavra de regra que o gerador escreve sozinho (Grade → Grau, Essence → Essência, Drain → Dreno, Karma → carma).
 *   EXCEÇÕES mantidas no original: Rating (o "nível" da ficha é o do NPC, então "Nível" confundiria), Fade, Edge e as estatísticas de
 *     Matrix e veículo (Device Rating, Sleaze, Firewall, Handling, Speed, Accel, Body, Pilot, Sensor): sem tradução corrente na mesa.
 * Para mudar um termo, edite só a tabela TERMOS abaixo: termo('grade') devolve o texto do idioma atual. */
const LOCALE_NUM={pt:'pt-BR',en:'en-US'};
const _nf=(n,min,max)=>{const v=+n;if(n===''||n==null||!isFinite(v))return String(n==null?'':n);
 return new Intl.NumberFormat(LOCALE_NUM[idiomaAtual()]||'pt-BR',{minimumFractionDigits:min,maximumFractionDigits:max}).format(v)};
const fmtNum=(n,max)=>_nf(n,0,max==null?2:max);          // até `max` casas (padrão 2), sem zeros sobrando: 5,5 · 1.234
const fmtDec=(n,d)=>_nf(n,d,d);                          // casas fixas (o toFixed da tela): 3,0 · 1,50
const fmtNy=n=>(idiomaAtual()==='en'?'¥':'¥ ')+fmtNum(Math.round(+n||0),0);   // ¥ 1.234 (pt) · ¥1,234 (en)
const nyArquivo=n=>(+n).toLocaleString('en-US');          // único uso de 'en-US' fixo: formato do JSON e das Notas do Chummer
i18nAdd({
 'termo.rating':['Rating','Rating'],'termo.grade':['Grau','Grade'],'termo.essence':['Essência','Essence'],'termo.drain':['Dreno','Drain'],
 'termo.fade':['Fade','Fade'],'termo.edge':['Edge','Edge'],'termo.karma':['carma','Karma'],'termo.cost':['Custo','Cost'],
 'termo.devicerating':['Device Rating','Device Rating'],'termo.force':['Força','Force']});
const termo=k=>t('termo.'+k);
const listaE=a=>{try{return new Intl.ListFormat(LANG_HTML[idiomaAtual()],{style:'long',type:'conjunction'}).format(a)}catch(e){return a.join(', ')}};   // "A, B e C" · "A, B, and C"
