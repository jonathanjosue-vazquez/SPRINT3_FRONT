(function(){
  const NAV_TABS = [
    {key:'capturar', label:'Capturar', screen:'camera', main:true, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.4"/></svg>'},
    {key:'galeria', label:'Galeria', screen:'gallery', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'},
    {key:'buscar', label:'Buscar', screen:'search', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>'},
    {key:'perfil', label:'Perfil', screen:'profile', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>'}
  ];
  const STATUSBAR_HTML = `
    <div class="jv-statusbar">
      <span>9:42</span>
      <div class="jv-statusbar__icons">
        <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="6" width="3" height="5" rx="0.5" fill="currentColor"/><rect x="4.5" y="4" width="3" height="7" rx="0.5" fill="currentColor"/><rect x="9" y="2" width="3" height="9" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor" opacity=".35"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="7" rx="1.3" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.7" fill="currentColor"/></svg>
      </div>
    </div>`;
  const HOME_INDICATOR_HTML = `<div class="jv-home-indicator"><span></span></div>`;

  function bottomNavHTML(activeKey){
    let html = '<div class="jv-bottomnav">';
    NAV_TABS.forEach(t=>{
      const active = t.key===activeKey ? 'is-active' : '';
      if(t.main){
        html += `<button class="jv-navtab jv-navtab--main ${active}" data-navkey="${t.key}"><span class="jv-navtab__circle">${t.icon}</span>${t.label}</button>`;
      } else {
        html += `<button class="jv-navtab ${active}" data-navkey="${t.key}">${t.icon}${t.label}</button>`;
      }
    });
    html += '</div>';
    return html;
  }

  // Inject status bars, bottom navs, home indicators
  document.querySelectorAll('.jv-screen').forEach(scr=>{
    scr.insertAdjacentHTML('afterbegin', STATUSBAR_HTML);
    const navKey = scr.getAttribute('data-nav');
    if(navKey){
      scr.insertAdjacentHTML('beforeend', bottomNavHTML(navKey));
    }
    scr.insertAdjacentHTML('beforeend', HOME_INDICATOR_HTML);
  });

  function showScreen(name){
    document.querySelectorAll('.jv-screen').forEach(s=>s.classList.remove('is-active'));
    const target = document.getElementById('screen-'+name);
    if(target) target.classList.add('is-active');
    document.querySelectorAll('.jv-nav-item').forEach(b=>{
      b.classList.toggle('is-active', b.dataset.goto===name);
    });
  }
  window.jvShowScreen = showScreen;

  // Sidebar index
  document.querySelectorAll('[data-goto]').forEach(b=>{
    b.addEventListener('click', ()=> showScreen(b.dataset.goto));
  });

  // Bottom nav clicks (delegated, since injected dynamically per screen)
  document.getElementById('screenFrame').addEventListener('click', (e)=>{
    const btn = e.target.closest('.jv-navtab');
    if(!btn) return;
    const tab = NAV_TABS.find(t=>t.key===btn.dataset.navkey);
    if(tab) showScreen(tab.screen);
    if(tab && tab.key==='buscar'){
      setTimeout(()=>{ const i=document.getElementById('searchInput'); if(i) i.focus(); }, 350);
    }
  });

  // Welcome
  document.getElementById('btnStart').addEventListener('click', ()=> showScreen('camera'));
  document.getElementById('btnHaveAccount').addEventListener('click', ()=> showScreen('gallery'));

  // Camera: type chips
  document.getElementById('typeChips').addEventListener('click', (e)=>{
    const chip = e.target.closest('.jv-chip');
    if(!chip) return;
    document.querySelectorAll('#typeChips .jv-chip').forEach(c=>c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const toast = document.getElementById('detectToast');
    toast.textContent = '';
    const dot = document.createElement('span'); dot.className='jv-dot'; toast.appendChild(dot);
    toast.append(' '+chip.dataset.type+' selecionado');
  });

  // Camera: shutter -> capture -> processing
  let capturing = false;
  document.getElementById('shutterBtn').addEventListener('click', ()=>{
    if(capturing) return;
    capturing = true;
    const shutter = document.getElementById('shutterBtn');
    const flash = document.getElementById('flash');
    const toast = document.getElementById('detectToast');
    shutter.classList.add('is-capturing');
    flash.classList.add('flashing');
    toast.classList.add('show');
    setTimeout(()=> flash.classList.remove('flashing'), 140);
    setTimeout(()=>{
      shutter.classList.remove('is-capturing');
      toast.classList.remove('show');
      showScreen('processing');
      runProcessing();
      capturing = false;
    }, 480);
  });

  // Processing sequence
  function resetProcessing(){
    document.querySelectorAll('.jv-stepitem').forEach(s=>s.classList.remove('is-active','is-done'));
    document.getElementById('procResult').classList.remove('show');
    document.getElementById('procActions').classList.remove('show');
    document.getElementById('confFill').style.width='0%';
  }
  function runProcessing(){
    resetProcessing();
    const steps = Array.from(document.querySelectorAll('.jv-stepitem'));
    let i = 0;
    function next(){
      if(i>0){
        steps[i-1].classList.remove('is-active');
        steps[i-1].classList.add('is-done');
        steps[i-1].querySelector('.jv-stepitem__mark').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>';
      }
      if(i < steps.length){
        steps[i].classList.add('is-active');
        steps[i].querySelector('.jv-stepitem__mark').innerHTML = '<span class="jv-spinner"></span>';
        i++;
        setTimeout(next, 420);
      } else {
        document.getElementById('procResult').classList.add('show');
        setTimeout(()=> document.getElementById('confFill').style.width='98%', 80);
        document.getElementById('procActions').classList.add('show');
      }
    }
    next();
  }

  document.getElementById('btnDiscard').addEventListener('click', ()=> showScreen('camera'));
  document.getElementById('btnSave').addEventListener('click', ()=>{
    showScreen('gallery');
    const item = document.getElementById('itemRecursao');
    if(item){
      item.classList.add('jv-item-new');
      setTimeout(()=> item.classList.remove('jv-item-new'), 3000);
    }
  });

  // Gallery: filters
  document.querySelectorAll('.jv-filter-chip').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('.jv-filter-chip').forEach(x=>x.classList.remove('is-active'));
      c.classList.add('is-active');
    });
  });

  // Item cards -> detail
  document.querySelectorAll('[data-detail]').forEach(card=>{
    card.addEventListener('click', ()=> showScreen('detail'));
  });

  document.getElementById('btnBackDetail').addEventListener('click', ()=> showScreen('gallery'));

  // Export toast (simple, non-blocking)
  document.getElementById('btnExport').addEventListener('click', function(){
    const original = this.innerHTML;
    this.innerHTML = '✓ Exportado';
    setTimeout(()=> this.innerHTML = original, 1400);
  });

})();
