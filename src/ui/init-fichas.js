Object.assign(SKCAT,SKCAT0);META_IDS();modeEl.value='grp';modeEl.onchange();
document.getElementById('tabs').addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const b=[...document.querySelectorAll('#tabs button')],i=b.findIndex(x=>x.getAttribute('aria-selected')==='true'),t=b[(i+(e.key==='ArrowRight'?1:b.length-1))%b.length];e.preventDefault();t.click();t.focus()});

