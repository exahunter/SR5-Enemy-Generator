decorateSheet((sh,c)=>{if(!c.ma)return;
 sh.querySelector('.sec').insertAdjacentHTML('beforeend','<div class="row"><span>'+xl('Arte marcial')+'</span><span>'+esc(c.ma.n)+' ('+c.ma.tech.map(t=>esc(t.n)).join(', ')+')</span></div>')});
