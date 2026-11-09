/* ===== Módulos de veículo e drone (Rigger 5.0) =====
 * Tabela: data/veiculo-modulos.js (gerada do vehicles.xml por tools/gen_veiculos.py): VM = módulos, VF = módulos de fábrica por modelo.
 * Chamado por genRiggerKit (rigger.js). Slots, custo e disponibilidade são fórmulas do Chummer (Body, Rating, FixedValues…),
 * avaliadas aqui sem eval. Só entram módulos de livros marcados (okSrc); os de fábrica vêm sempre.
 * Cada módulo da ficha: {n,id,cat,rt,mr,sl,cost,av,sf,cf,af,src,pg,inc}; sf/cf/af são as fórmulas originais (o XML as grava para o Chummer recalcular). */
const VMn=new Map();VM.forEach(r=>{if(!VMn.has(r[0]))VMn.set(r[0],r)});
function vmSplit(s){const o=[];let d=0,b='';for(const ch of s){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&!d){o.push(b);b=''}else b+=ch}o.push(b);return o}
function vmEval(src,V){
 const t=String(src).replace(/Vehicle Cost/g,'VehicleCost').match(/\d+(?:\.\d+)?|[A-Za-z_]+|>=|<=|[-+*\/(),<>=]/g)||[];let p=0;
 const peek=()=>t[p],nx=()=>t[p++];
 function cmp(){const a=add(),o=peek();if(o==='>='||o==='<='||o==='>'||o==='<'||o==='='){nx();const b=add();return o==='>='?+(a>=b):o==='<='?+(a<=b):o==='>'?+(a>b):o==='<'?+(a<b):+(a===b)}return a}
 function add(){let a=mul();while(peek()==='+'||peek()==='-'){const o=nx(),b=mul();a=o==='+'?a+b:a-b}return a}
 function mul(){let a=un();while(peek()==='*'||peek()==='/'){const o=nx(),b=un();a=o==='*'?a*b:a/b}return a}
 function un(){if(peek()==='-'){nx();return -un()}if(peek()==='+'){nx();return un()}return pr()}
 function pr(){const x=nx();if(x===undefined)return NaN;if(x==='('){const v=cmp();nx();return v}
  if(/^\d/.test(x))return parseFloat(x);
  if(x==='number'){nx();const v=cmp();nx();return v}
  if(x==='FixedValues'){nx();const a=[];do{a.push(cmp())}while(peek()===','&&nx());nx();return a[Math.max(1,Math.min(a.length,V.Rating||1))-1]}
  return x in V?V[x]:NaN}
 const v=cmp();return p<t.length?NaN:v}
/* disponibilidade: "4R", "(Rating * 2)R", "FixedValues(2,4,8,12R)", "+1" → {n,t:'R'|'F'|'',p:1 se relativa} */
function vmAvail(src,V){let a=String(src).trim();const f=/^FixedValues\((.*)\)$/.exec(a);if(f){const ps=vmSplit(f[1]);a=(ps[Math.max(1,Math.min(ps.length,V.Rating||1))-1]||'').trim()}
 let t='',p=0;const m=/^(.*?)([RF])$/.exec(a);if(m){a=m[1];t=m[2]}a=a.trim();if(a[0]==='+'){p=1;a=a.slice(1)}a=a.replace(/^\((.*)\)$/,'$1');
 const n=vmEval(a,V);return isNaN(n)?null:{n:Math.round(n),t,p}}
const vmAvStr=a=>(a.p?'+':'')+a.n+a.t;
function vmStats(it){const s=it.st||{},g=k=>parseInt(String(s[k]||'0').split('/')[0])||0;
 return{Body:g('body'),Handling:g('handling'),Speed:g('speed'),Acceleration:g('accel'),Armor:g('armor'),Sensor:g('sensor'),Pilot:g('pilot'),Seats:g('seats'),VehicleCost:+it.cost||0,Rating:0}}
function vmReq(q,it){if(!q)return true;if(q.x)return false;const s=it.st||{},cat=it.sub||'',n=it.n,B=parseInt(s.body)||0,S=parseInt(s.seats)||0;
 if(q.f&&q.f.includes(n))return false;if(!q.t)return true;
 const ok=([k,v])=>k==='c'?cat.includes(v):k==='q'?cat===v:k==='n'?n===v:k==='nc'?n.includes(v):k==='b'?B<=v:k==='s'?S>=v:false;
 return q.m==='any'?q.t.some(ok):q.t.every(ok)}
function vmCalc(r,rt,V){const W=Object.assign({},V,{Rating:rt});if(/Variable/.test(r[7]))return null;
 const sl=vmEval(r[6],W),co=vmEval(r[7],W),av=vmAvail(r[8],W);return isNaN(sl)||isNaN(co)||!av||sl<0?null:{sl,cost:Math.round(co),av}}
/* o que vale a pena sortear: [nome, peso]; só veículo (V), só drone (D) ou ambos (B). Os demais módulos existem na tabela mas não são sorteados */
const VM_V=[[/^(Speed|Handling|Acceleration) Enhancement$/,3],[/^Armor \((Standard|Concealed)\)$/,2],[/^Passenger Protection System$/,1],[/^Anti-Theft System$/,1.4],[/^Off-Road Suspension$/,1.5,'g'],
 [/^(Multifuel Engine|Improved Economy)$/,.7],[/^Secondary Manual Controls$/,.6],[/^Rocket Booster$/,.4,'g'],[/^Smuggling Compartment$/,1.2],[/^Chameleon Coating$/,.8],[/^(Extreme Environment Modification|Nanomaintenance System|Life Support)$/,.5],
 [/^(Searchlight|Interior Cameras|Vehicle Tag Eraser|Winch \(Basic\))$/,.5],[/^(Extra Entry\/Exit Points|Increased Seating)$/,.3]],
 VM_D=[[/^(Handling|Speed|Acceleration|Armor|Sensor) \(Drone\)$/,2],[/^Single Sensor \(Drone\)$/,.6],[/^(Realistic Features|Gecko Grips|Amphibious|Spotlight) \(Drone\)$/,.3],[/^Suspension \(Drone\)$/,.5]],
 VM_B=[[/^ECM$/,1.4],[/^(Sensor|Pilot) Enhancement$/,1.1],[/^(Signature Masking|Electromagnetic Shielding|Satellite Link)$/,.9],[/^(GridLink|Retrans Unit|Touch Sensors)$/,.4]];
function vmWeight(r,it,gnd){const drone=it.cat==='drone';if(r[2]==='Model-Specific')return r[9]&&r[9].t&&vmReq(r[9],it)?2.5:0;
 for(const e of [...(drone?VM_D:VM_V),...VM_B])if(e[0].test(r[0]))return e[2]==='g'&&!gnd?0:e[1];return 0}
function vmRating(r,V,pr){let m=r[5];if(m==='body')m=V.Body;if(typeof m!=='number'||m<=0)return 0;if(m>=99)m=6;return Math.max(1,Math.min(m,1+Math.floor(pr/3)))}
const vmMk=(r,rt,c,inc,V)=>({n:r[0],id:r[1],cat:r[2],rt,mr:typeof r[5]==='number'?r[5]:r[5]==='body'?V.Body:0,sl:inc?0:c.sl,cost:inc?0:c.cost,av:vmAvStr(c.av),sf:r[6],cf:r[7],af:r[8],src:r[3],pg:r[4]==='?'?'':r[4],inc:inc?1:0});
/* veste um veículo/drone: módulos de fábrica + (rigger) Rigger Interface + sorteados que cabem nos slots e no orçamento. Devolve o que gastou. */
function vmDress(it,pr,ctx,o){o=o||{};const V=vmStats(it),drone=it.cat==='drone',gnd=/^(Bikes|Cars|Trucks)/.test(it.sub||''),cap=(+(it.st||{}).modslots)||V.Body,L=it.mods=[];
 const has=n=>L.some(m=>m.n===n),zero={sl:0,cost:0,av:{n:0,t:'',p:0}};
 (VF[it.n]||[]).forEach(n=>{const r=VMn.get(n);if(r&&!has(n))L.push(vmMk(r,vmRating(r,V,1)?1:0,vmCalc(r,vmRating(r,V,1)?1:0,V)||zero,1,V))});
 let used=0,spent=0;const budget=Math.min(ctx.left*(o.share||.3),V.VehicleCost*.9);
 const put=(r,rt,c)=>{L.push(vmMk(r,rt,c,0,V));used+=c.sl;spent+=c.cost};
 if(o.rigger&&!drone&&!has('Rigger Interface')){const r=VMn.get('Rigger Interface'),c=r&&okSrc(r[3])&&vmCalc(r,0,V);if(c)put(r,0,c)}
 const n=drone?Math.min(4,Math.floor(pr/2)):Math.min(8,1+Math.floor(pr/2));
 for(let k=0;k<n;k++){
  const C=[];VM.forEach(r=>{if(!okSrc(r[3])||has(r[0])||(/^Armor \(/.test(r[0])&&L.some(m=>/^Armor \(/.test(m.n)))||!vmReq(r[9],it))return;
   const w=vmWeight(r,it,gnd);if(!w)return;const rt=vmRating(r,V,pr),c=vmCalc(r,rt,V);if(!c)return;
   const a=c.av;if(!((pr>=7||a.n<=12)&&(a.t!=='F'||pr>=8)&&(a.t!=='R'||pr>=3)))return;
   if(used+c.sl>cap||spent+c.cost>budget)return;C.push({r,rt,c,w})});
  if(!C.length)break;const x=wchoose(C,e=>e.w);put(x.r,x.rt,x.c)}
 ctx.left-=spent;return spent}
