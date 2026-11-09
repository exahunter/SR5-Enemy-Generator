/* ===== v32: perfil do NPC (ocupação + especialização + estilos + traços) → lealdade, coordenação, volatilidade e tática =====
 * Tabelas em data/perfil-ocupacao.js. persPerfil(c) devolve {ly, co, vo, tt, tags}:
 *   ly lealdade-base (pontos, antes do ruído) · co coordenação · vo volatilidade · tt tática (0–1) · tags de ocupação/especialização (maiúsculas).
 * A lealdade (1–6) é NEUTRA: parte do centro (3,5), é puxada pelo perfil, recebe um ruído (maior para o volátil) e é comprimida de volta
 * para o centro; só quem reúne vários sinais (soldado leal e disciplinado, fanático) chega a 6, e só quem reúne os contrários chega a 1. */
const pfClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function persPerfilTipo(o){const T=TYPES[o.type]||{};return OCC_PERFIL[o.type]||GRP_PERFIL[T.g||'Civis']||GRP_PERFIL.Civis}
function persPerfil(c){
 const o=c.npc||{},P=o.pers,b=persPerfilTipo(o),sp=(P&&P.sp)||o.sp||'',tags={};
 let ly=b.loy,co=b.co,vo=b.vo,tt=b.tt;
 (b.tg||[]).forEach(t=>tags[t]=1);
 const add=(d,f)=>{if(!d)return;f=f===undefined?1:f;ly+=(d.ly||0)*f;co+=(d.co||0)*f;vo+=(d.vo||0)*f;tt+=(d.tt||0)*f};
 if(P){(P.t||[]).forEach(k=>add(TR_PERFIL[k]));(P.s||[]).forEach(x=>add(ST_PERFIL[x.k],x.p/100))}
 const S=SPEC_PERFIL[sp];if(S){add(S);if(S.tag)tags[S.tag]=1}
 if(typeof CD_TOP!=='undefined'&&CD_TOP.includes(o.role)){add(SPEC_PERFIL.Lieutenant);tags.SLIDER=1}
 return{ly,co:pfClamp(co,0,1),vo:pfClamp(vo,0,1),tt:pfClamp(tt,0,1),tags}}
/* lealdade 1–6 gerada pelo perfil (usada também ao compor grupos, como lealdade ao líder) */
function loyGen(c){const f=persPerfil(c),ru=(Math.random()+Math.random()-1)*(.6+f.vo*1.6);
 return pfClamp(Math.round(3.5+(f.ly+ru-3.5)*.85),1,6)}
/* multiplicadores de sorteio de traço por ocupação e especialização */
function persOccTW(type,sp,k){let m=1;const a=OCC_TRACO_W[type];if(a&&a[k]!==undefined)m*=a[k];const b=SPEC_TRACO_W[sp];if(b&&b[k]!==undefined)m*=b[k];return m}
/* texto do perfil: "coordenado, tático, previsível" */
function perfilTxt(f){const a=[];
 a.push(f.co>=.65?xl('coordenado'):f.co<=.25?xl('age por conta própria'):xl('coordenação média'));
 a.push(f.tt>=.6?xl('tático'):f.tt<=.15?xl('improvisa'):xl('tática média'));
 a.push(f.vo>=.6?xl('volátil e imprevisível'):f.vo>=.35?xl('um pouco instável'):f.vo<=.15?xl('previsível'):xl('estável'));
 return a.join(', ')}
const loyTxt=L=>L>=5?xl('firme'):L>=3?xl('condicional'):xl('frágil');
function doutrinaOf(c){const o=c.npc||{};return OCC_DOUTRINA[o.type]||''}
