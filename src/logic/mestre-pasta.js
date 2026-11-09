// ---------- leitura da pasta ----------
const OK_RE=/(^|\/)data\/[^\/]+\.xml$/i,CUST_RE=/(^|\/)customdata\/.+\.xml$/i;
$('dirimp').onchange=async e=>{
 const m=$('dirmsg');try{
  const all=[...e.target.files].filter(f=>/\.xml$/i.test(f.name)),rel=f=>f.webkitRelativePath||f.name;
  let pick=all.filter(f=>OK_RE.test(rel(f))||CUST_RE.test(rel(f)));
  if(!pick.length)pick=all.filter(f=>rel(f).split('/').length<=2);      // pasta escolhida já é a de dados, com outro nome
  if(!pick.length){m.textContent=xl('Não achei arquivos XML do Chummer nessa pasta. Escolha a pasta “data” (ou a pasta raiz do Chummer).');return}
  const seen={},fs=[],t0=Date.now();let k=0;
  for(const f of pick){let nm=f.name;if(seen[nm]){seen[nm]++;nm=nm.replace(/\.xml$/i,'')+'__'+seen[nm]+'.xml'}else seen[nm]=1;
   const text=await f.text();m.textContent='Lendo '+(++k)+' de '+pick.length+': '+nm;
   await stSave({name:nm,text});fs.push({name:nm,text:async()=>text,_t:text})}
  m.textContent=xl('Importando os dados no gerador…');
  const n=await importFiles(fs);
  m.textContent=xl('Montando o índice…');await new Promise(r=>setTimeout(r));
  reindexFrom(fs.map(f=>({name:f.name,text:f._t})));await saveIdx();fillSel();draw();
  const cust=pick.filter(f=>CUST_RE.test(rel(f))).length;
  m.textContent=tn('pasta.ok',pick.length,{cust:cust?t('pasta.cust',{n:cust}):'',u:n,e:IX.rows.length,s:Math.round((Date.now()-t0)/1000)});
  $('mi').open=true
 }catch(x){m.textContent=xl('Não consegui ler a pasta: ')+(x&&x.message||x)}};

// ---------- carga ----------
(async()=>{try{const r=await IDB.tx('readonly',s=>s.get(KEY));if(r&&r.data&&r.data.rows){IX.rows=r.data.rows;IX.bk=r.data.bk||{};IX.bm=r.data.bm||{};IX.ts=r.data.ts||0}}catch(x){avisa('mestre-pasta',x)}fillSel();draw()})();
$('mi').addEventListener('toggle',async()=>{if(!$('mi').open||IX.rows.length)return;
 const l=await stAll();if(!l.length)return;$('dirmsg').textContent=xl('Montando o índice com os ')+l.length+xl(' arquivos guardados…');
 await new Promise(r=>setTimeout(r));reindexFrom(l.map(f=>({name:f.name,text:f.text})));await saveIdx();fillSel();draw();$('dirmsg').textContent=xl('Índice montado a partir dos arquivos guardados.')});

