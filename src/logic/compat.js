/* Download: usa o do visualizador (claude.use('downloads')) quando funciona; senão baixa pelo navegador (<a download>).
   Cobre 3 casos: sem window.claude, claude sem use(), e use() que falha ou devolve vazio. 'declined' (usuário cancelou) é repassado. */
(function(){const nav={save:async({filename,data})=>{
 const b=data instanceof Blob?data:new Blob([data],{type:'application/octet-stream'});
 const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=filename;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}};
 const orig=window.claude,use=orig&&typeof orig.use==='function'?orig.use.bind(orig):null;
 const wrap={use:async(n)=>{if(use&&n==='downloads'){try{const r=await use(n);if(r&&typeof r.save==='function')return{save:async o=>{try{return await r.save(o)}catch(e){if(e&&e.code==='declined')throw e;return nav.save(o)}}}}catch(e){if(e&&e.code==='declined')throw e}}
  if(n==='downloads')return nav;return use?use(n):null}};
 try{window.claude=orig?Object.assign(orig,wrap):wrap}catch(e){try{Object.defineProperty(window,'claude',{value:wrap,configurable:true})}catch(e2){}}})();
if(typeof JSZip==='undefined'){window.JSZip=function(){const F=[];this.file=(n,d)=>{F.push([n,typeof d==='string'?new TextEncoder().encode(d):d]);return this};
this.generateAsync=async()=>{const T=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[i]=c>>>0}
const crc=u=>{let c=-1;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return (~c)>>>0};
const enc=new TextEncoder(),parts=[],cen=[];let off=0;
F.forEach(([n,d])=>{const nb=enc.encode(n),c=crc(d),h=new DataView(new ArrayBuffer(30));
h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nb.length,true);
parts.push(new Uint8Array(h.buffer),nb,d);
const k=new DataView(new ArrayBuffer(46));k.setUint32(0,0x02014b50,true);k.setUint16(4,20,true);k.setUint16(6,20,true);k.setUint16(8,0x0800,true);k.setUint16(14,0x21,true);k.setUint32(16,c,true);k.setUint32(20,d.length,true);k.setUint32(24,d.length,true);k.setUint16(28,nb.length,true);k.setUint32(42,off,true);
cen.push(new Uint8Array(k.buffer),nb);off+=30+nb.length+d.length});
let cs=0;cen.forEach(u=>cs+=u.length);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,F.length,true);e.setUint16(10,F.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}}}
