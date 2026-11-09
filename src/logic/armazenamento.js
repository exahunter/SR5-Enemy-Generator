const AP={A:24,B:20,C:16,D:14,E:12},SKP={A:46,B:36,C:28,D:22,E:18};
const SEEN=new Set(),FL={},fresh=k=>!SEEN.has(k)&&!!SEEN.add(k);
const IDB={db:null,open(){return this.db||(this.db=new Promise((ok,no)=>{const r=indexedDB.open('sr5gen',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'name'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}))},
 async tx(m,f){const d=await this.open();return new Promise((ok,no)=>{const t=d.transaction('files',m),q=f(t.objectStore('files'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})}};
const stAll=()=>IDB.tx('readonly',s=>s.getAll()).then(l=>l.filter(f=>f.name[0]!=='_')).catch(()=>[]);
const stSave=f=>IDB.tx('readwrite',s=>s.put({name:f.name,text:f.text,size:f.text.length})).catch(()=>{});
async function drawStored(){const el=document.getElementById('stored'),l=await stAll();
 el.innerHTML=l.length?xl('<b>Arquivos guardados neste site (')+l.length+')</b>'+l.map(f=>xlf('<div class="row"><span>{0} <span class="note">{1} KB</span></span><button class="rm" data-n="{2}">Remover</button></div>',esc(f.name),Math.round(f.size/1024),esc(f.name))).join(''):xl('<span class="note">Nenhum arquivo guardado ainda. Os XML que você importar ficam salvos neste navegador e são recarregados toda vez que abrir o site.</span>');
 el.querySelectorAll('.rm').forEach(b=>b.onclick=async()=>{await IDB.tx('readwrite',s=>{s.delete(b.dataset.n);s.delete('__parsed')}).catch(()=>{});location.reload()});if(typeof drawPrimeirosPassos==='function')drawPrimeirosPassos()}
