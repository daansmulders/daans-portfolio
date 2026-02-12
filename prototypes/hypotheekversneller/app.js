/* ===== Formatter ===== */
var CURRENCY = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

/* ===== Finance helpers ===== */
function monthlyPayment(p, rPct, m){
  if (m <= 0) return 0;
  var r = (rPct/100)/12;
  if (r === 0) return p/m;
  return p * (r / (1 - Math.pow(1 + r, -m)));
}
function baselineTotals(p,y,r){
  var m = y*12, mp = monthlyPayment(p,r,m), totalPaid = mp*m, totalInterest = Math.max(0,totalPaid-p);
  return { mp: mp, totalPaid: totalPaid, totalInterest: totalInterest, months: m };
}
function simulateBaseline(p,y,r){
  var mTot=y*12, rM=(r/100)/12, mp=monthlyPayment(p,r,mTot);
  var bal=p, rows=[], totalPaid=0,totalInterest=0,paidOff=null,elapsed=0;
  for (var yr=1; yr<=y; yr++){
    for (var m=1; m<=12; m++){
      if (bal<=1e-8) break;
      var i=bal*rM; var princ=mp-i; if (princ<0) princ=0; if (princ>bal) princ=bal;
      bal-=princ; totalInterest+=i; totalPaid+=princ+i; elapsed++; if (bal<=1e-8 && paidOff===null) paidOff=elapsed;
    }
    rows.push({ year: yr, monthly: mp, increase: 0, endBalance: Math.max(0,bal) });
    if (bal<=1e-8){ for (var yy=yr+1; yy<=y; yy++) rows.push({year:yy,monthly:null,increase:null,endBalance:0}); break; }
  }
  return { rows: rows, totalPaid: totalPaid, totalInterest: totalInterest, paidOffAtMonth: paidOff, baseline: baselineTotals(p,y,r) };
}

/**
 * ===== Simulatie met STARTJAAR-ondersteuning =====
 * Voor jaren < startYear ⇒ baseline maandlast. Vanaf startYear ⇒ versneller-logica.
 */
function simulate(p,y,r,mode,param){
  var startYear = (param && +param.startYear) ? Math.max(1, Math.min(y, Math.floor(+param.startYear))) : 1;

  var mTot=y*12, rM=(r/100)/12, base=baselineTotals(p,y,r);
  var bal=p, rows=[], last=base.mp, mon=last, elapsed=0, totalPaid=0,totalInterest=0,paidOff=null;

  var accelIdx=0; // jaar-teller voor 'shorten'
  for (var yr=1; yr<=y; yr++){
    if (yr < startYear){
      // Baseline-fase
      mon = base.mp;
    } else {
      // Versneller-fase
      if (yr > startYear){
        if (mode==='amount')       mon = last + (param.stepEUR||0);
        else if (mode==='percent') mon = last * (1 + (param.pct||0));
      } else {
        // eerste versneller-jaar start vanuit baseline
        if (mode==='amount')       mon = last + (param.stepEUR||0);
        else if (mode==='percent') mon = last * (1 + (param.pct||0));
      }
      if (mode==='shorten'){
        accelIdx += 1;
        var baseRem = mTot - (yr-1)*12;
        var target  = Math.max(1, baseRem - accelIdx * (param.monthsShorten||0));
        mon = monthlyPayment(bal, r, target);
      }
    }

    var inc=(yr===1)?0:(mon-last);
    for (var m=1; m<=12; m++){
      if (bal<=1e-8) break;
      var i=bal*rM; var princ=mon-i; if (princ<0) princ=0; if (princ>bal) princ=bal;
      bal-=princ; totalInterest+=i; totalPaid+=princ+i; elapsed++;
      if (bal<=1e-8 && paidOff===null){ paidOff=elapsed; break; }
    }

    rows.push({ year: yr, monthly: mon, increase: inc, endBalance: Math.max(0,bal) });
    last = mon;

    if (bal<=1e-8){
      for (var yy=yr+1; yy<=y; yy++) rows.push({year:yy,monthly:null,increase:null,endBalance:0});
      break;
    }
  }
  if (rows.length<y){ for (var zz=rows.length+1; zz<=y; zz++) rows.push({year:zz,monthly:null,increase:null,endBalance:0}); }

  return { rows: rows, totalPaid: totalPaid, totalInterest: totalInterest, paidOffAtMonth: paidOff, baseline: base };
}

/* ===== DOM helpers ===== */
function $id(id){ return document.getElementById(id); }
function setText(idOrEl, txt){
  var el = typeof idOrEl === 'string' ? $id(idOrEl) : idOrEl;
  if (el) el.textContent = txt;
}
function onId(id, evt, handler){
  var el = $id(id);
  if (!el){ console.warn('onId: element niet gevonden:', id); return; }
  el.addEventListener(evt, handler);
}
function onAll(sel, evt, handler){
  var list = document.querySelectorAll(sel);
  if (!list || !list.length){ console.warn('onAll: geen matches voor', sel); return; }
  for (var i=0; i<list.length; i++){ list[i].addEventListener(evt, handler); }
}

/* ===== Nieuw: Startjaar-control in Strategy controls ===== */
/* ===== Nieuw: Startjaar-control als <select> in Strategy controls ===== */
function ensureStartYearControl(){
  var sc = $id('strategyControls');
  if (!sc) return;

  // Als het veld al bestaat maar nog een <input> was, vervangen we het door <select>
  var existingField = $id('startYearField');
  var yearsInput = $id('loanYears');
  var years = Math.max(1, +(yearsInput && yearsInput.value) || 30);

  // Helper: maak/refresh opties 1..years en selecteer 'selectedValue'
  function buildStartYearOptions(selectEl, years, selectedValue) {
    var cur = Math.max(1, Math.min(years, selectedValue|0 || 1));
    var frag = document.createDocumentFragment();
    for (var y=1; y<=years; y++){
      var opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = 'Jaar ' + y;
      if (y === cur) opt.selected = true;
      frag.appendChild(opt);
    }
    selectEl.innerHTML = '';
    selectEl.appendChild(frag);
  }

  if (!existingField) {
    // Opbouwen van het complete veld
    var field = document.createElement('div');
    field.className = 'field field--startyear';
    field.id = 'startYearField';

    var label = document.createElement('label');
    label.htmlFor = 'startYear';
    label.textContent = 'Versneller aanzetten vanaf';

    var select = document.createElement('select');
    select.id = 'startYear';
    select.className = 'startyear-select';
    select.setAttribute('aria-label','Versneller aanzetten vanaf');

    buildStartYearOptions(select, years, 1);

    field.appendChild(label);
    field.appendChild(select);

    // Invoegen: na de mode-sectie als die er is, anders achteraan
    var anchor = document.querySelector('#modeGroup') || sc.firstElementChild;
    if (anchor && anchor.parentNode === sc){
      sc.insertBefore(field, anchor.nextSibling);
    } else {
      sc.appendChild(field);
    }

    // Wijzigingen → render
    select.addEventListener('change', function(){
      render();
    });

    // Hou de max in sync met looptijd: refresh options bij wijziging
    if (yearsInput){
      yearsInput.addEventListener('input', function(){
        var y = Math.max(1, +yearsInput.value || 30);
        // bewaar huidige keuze, clamp binnen nieuwe range
        var prev = +($id('startYear') && $id('startYear').value) || 1;
        var clamped = Math.max(1, Math.min(y, prev));
        buildStartYearOptions(select, y, clamped);
      });
    }
  } else {
    // Bestaat al: zorg dat het een <select> is en opties kloppen
    var selectEl = $id('startYear');
    if (selectEl && selectEl.tagName.toLowerCase() !== 'select') {
      // vervang input→select (migreer huidige waarde)
      var currentValue = Math.max(1, Math.min(years, Math.floor(+selectEl.value || 1)));
      var newSelect = document.createElement('select');
      newSelect.id = 'startYear';
      newSelect.className = 'startyear-select';
      newSelect.setAttribute('aria-label','Startjaar versnellen');
      buildStartYearOptions(newSelect, years, currentValue);
      selectEl.parentNode.replaceChild(newSelect, selectEl);
      newSelect.addEventListener('change', function(){ render(); });
      selectEl = newSelect;
    } else if (selectEl) {
      // gewoon refreshen voor zekerheid
      var keep = Math.max(1, Math.min(years, Math.floor(+selectEl.value || 1)));
      buildStartYearOptions(selectEl, years, keep);
    }

    // sync op looptijdwijziging als niet al gezet
    if (yearsInput && !yearsInput.__startYearSyncBound) {
      yearsInput.__startYearSyncBound = true;
      yearsInput.addEventListener('input', function(){
        var y = Math.max(1, +yearsInput.value || 30);
        var sy = $id('startYear');
        if (!sy) return;
        var prev = +(sy.value || 1);
        var clamped = Math.max(1, Math.min(y, prev));
        buildStartYearOptions(sy, y, clamped);
      });
    }
  }
}

/* ===== Besparingsgrafiek-anker (boven tabel) ===== */
function ensureSummaryAnchor(){
  var existing = document.getElementById('interestChart');
  if (existing) return existing;

  var tbody = $id('scheduleBody');
  if (!tbody) return null;
  var table = tbody.closest('table');
  if (!table || !table.parentNode) return null;

  var section = document.createElement('section');
  section.id = 'summary';
  section.className = 'summary step';

  var h2 = document.createElement('h2');
  h2.className = 'section-title';
  h2.textContent = 'Samenvatting besparing';
  section.appendChild(h2);

  var card = document.createElement('div');
  card.id = 'chartCard';
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id = 'interestChart';
  svg.setAttribute('width','100%');
  svg.setAttribute('height','260');
  card.appendChild(svg);
  section.appendChild(card);

  table.parentNode.insertBefore(section, table);
  return svg;
}

/* ===== Compact overzicht jaarlijkse kosten (collapsing) ===== */
var TABLE_EXPANDED = false;   // standaard: ingeklapt

function ensureScheduleUX() {
  var tbody = $id('scheduleBody');
  if (!tbody) return null;

  var table = tbody.closest('table');
  if (!table) return null;

  var wrap = $id('scheduleWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'scheduleWrap';
    wrap.className = 'schedule-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);

    var actions = document.createElement('div');
    actions.className = 'schedule-actions';
    actions.id = 'scheduleActions';
    wrap.appendChild(actions);

    var btn = document.createElement('button');
    btn.id = 'toggleAllYearsBtn';
    btn.type = 'button';
    btn.className = 'btn btn-ghost';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Toon elk jaar';
    actions.appendChild(btn);

    btn.addEventListener('click', function () {
      TABLE_EXPANDED = !TABLE_EXPANDED;
      applyScheduleCollapsePresentation();
      btn.classList.remove('anim-bump'); void btn.offsetWidth; btn.classList.add('anim-bump');
    });
  }
  return wrap;
}

function applyScheduleCollapsePresentation() {
  var tbody = $id('scheduleBody');
  var wrap  = $id('scheduleWrap');
  var btn   = $id('toggleAllYearsBtn');
  if (!tbody) return;

  var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
  var totalYears = rows.length;
  var collapsePossible = totalYears > 6;

  if (!collapsePossible) {
    rows.forEach(function (tr) { tr.classList.remove('is-teaser','is-hidden'); });
    if (wrap) wrap.classList.remove('is-collapsed');
    if (btn)  { btn.hidden = true; btn.setAttribute('aria-expanded','true'); }
    return;
  }

  if (btn) btn.hidden = false;

  if (!TABLE_EXPANDED) {
    rows.forEach(function (tr, idx) {
      tr.classList.remove('is-teaser','is-hidden');
      if (idx >= 6)      tr.classList.add('is-hidden'); // 7+
      else if (idx >= 3) tr.classList.add('is-teaser'); // 4–6
    });
    if (wrap) wrap.classList.add('is-collapsed');
    if (btn)  { btn.textContent = 'Toon elk jaar'; btn.setAttribute('aria-expanded','false'); }
  } else {
    rows.forEach(function (tr) { tr.classList.remove('is-teaser','is-hidden'); });
    if (wrap) {
      wrap.classList.remove('is-collapsed');
      wrap.classList.add('table-expand');
      setTimeout(function(){ wrap && wrap.classList.remove('table-expand'); }, 260);
    }
    if (btn)  { btn.textContent = 'Toon minder'; btn.setAttribute('aria-expanded','true'); }
  }
}

/* ===== State getters ===== */
function getInputs(){
  var principal = +($id('loanAmount') && $id('loanAmount').value) || 0;
  var years     = Math.max(1, +($id('loanYears') && $id('loanYears').value) || 30);
  var rate      = Math.max(0, +($id('loanRate') && $id('loanRate').value) || 4);
  var accelOn   = ($id('accelerateToggle') && $id('accelerateToggle').getAttribute('aria-pressed') === 'true');

  var activeModeBtn = document.querySelector('#modeGroup [data-mode][aria-pressed="true"]');
  var mode = activeModeBtn && activeModeBtn.getAttribute('data-mode') ? activeModeBtn.getAttribute('data-mode') : 'amount';
  var param = {};
  if (mode === 'amount'){
    var selA = document.querySelector('#amountGroup .opt-amount[aria-pressed="true"]');
    var vA = selA ? +selA.getAttribute('data-value') : 10; // default +€10
    param = { stepEUR: vA };
  } else if (mode === 'percent'){
    var selP = document.querySelector('#percentGroup .opt-percent[aria-pressed="true"]');
    var vP = selP ? +selP.getAttribute('data-value') : 2; // default +2%
    param = { pct: vP/100 };
  } else if (mode === 'shorten'){
    var selS = document.querySelector('#shortenGroup .opt-shorten[aria-pressed="true"]');
    var vS = selS ? +selS.getAttribute('data-value') : 2; // default 2 maanden
    param = { monthsShorten: vS };
  }

  // Startjaar uit UI
  var startInput = $id('startYear');
  var startYear = Math.max(1, Math.min(years, Math.floor(+(startInput && startInput.value) || 1)));
  param.startYear = startYear;

  return { principal, years, rate, accelOn, mode, param };
}

/* ===== Render ===== */
function render(){
  var s = getInputs();
  var principal = s.principal, years = s.years, rate = s.rate, accelOn = s.accelOn, mode = s.mode, param = s.param;

  var controls = $id('strategyControls');
  if (controls){
    controls.classList.toggle('is-disabled', !accelOn);
    controls.setAttribute('aria-disabled', String(!accelOn));
  }

  var result = accelOn ? simulate(principal, years, rate, mode, param) : simulateBaseline(principal, years, rate);

  var tbody = $id('scheduleBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (var r=0; r<result.rows.length; r++){
    var row = result.rows[r];
    var tr = document.createElement('tr');

    var tdY = document.createElement('td'); tdY.className='year'; tdY.appendChild(document.createTextNode(row.year));
    var tdM = document.createElement('td'); tdM.className=(row.monthly==null)?'dash':'num';
    tdM.appendChild(document.createTextNode(row.monthly==null ? '—' : CURRENCY.format(row.monthly)));
    var tdI = document.createElement('td'); tdI.className=(row.increase==null || row.year===1)?'dash':'num';
    tdI.appendChild(document.createTextNode((row.increase==null || row.year===1) ? '—' : (((row.increase>=0)?'+':'')+CURRENCY.format(row.increase))));
    var tdB = document.createElement('td'); tdB.className='num'; tdB.appendChild(document.createTextNode(CURRENCY.format(row.endBalance)));

    tr.appendChild(tdY); tr.appendChild(tdM); tr.appendChild(tdI); tr.appendChild(tdB);
    tbody.appendChild(tr);
  }

  // Compacte weergave + knop
  ensureScheduleUX();
  applyScheduleCollapsePresentation();

  // Besparingsgrafiek updaten
  try {
    var baselineSim = simulateBaseline(principal, years, rate);
    var baseInterest = baselineSim.totalInterest;
    var currentInterest = result.totalInterest;
    if (window.SummaryChart) {
      SummaryChart.update(principal, baseInterest, currentInterest, accelOn);
    }
  } catch (e) {
    console.warn('Chart render error:', e);
  }
}

/* Header recap */
function updateHeaderMeta(){
  var p=+($id('loanAmount') && $id('loanAmount').value) || 0;
  var y=Math.max(1, +($id('loanYears') && $id('loanYears').value) || 30);
  var r=Math.max(0, +($id('loanRate') && $id('loanRate').value) || 4);
  setText('hAmount', 'Hypotheekbedrag: ' + (p?CURRENCY.format(p):'—'));
  setText('hRate',   'Rente: ' + r.toFixed(2) + '%');
  setText('hYears',  'Resterende looptijd: ' + y + ' jaar');
}

/* Validatie & Navigatie */
function validateStep1(){
  var errs=[], amount=+($id('loanAmount')&&$id('loanAmount').value), rate=+($id('loanRate')&&$id('loanRate').value), years=+($id('loanYears')&&$id('loanYears').value);
  if (!amount || amount<=0) errs.push('Vul een geldig hypotheekbedrag in (> 0).');
  if (isNaN(rate) || rate<0) errs.push('Vul een geldig rentepercentage in (≥ 0%).');
  if (!years || years<5 || years>40) errs.push('Vul een looptijd tussen 5 en 40 jaar in.');
  return errs;
}
function showStep(step){
  var s1=$id('step1'), s2=$id('step2'), headerMeta=$id('headerMeta');
  var accelBtn=$id('accelerateToggle');
  var strategyControls=$id('strategyControls');

  if (step===1){
    if (s1) s1.hidden=false; if (s2) s2.hidden=true; if (headerMeta) headerMeta.hidden=true;
    if (accelBtn){
      accelBtn.setAttribute('aria-pressed','false');
      setText(accelBtn,'Sneller aflossen aanzetten');
      accelBtn.setAttribute('aria-label','Sneller aflossen aanzetten');
    }
    if (strategyControls){
      strategyControls.classList.add('is-disabled');
      strategyControls.setAttribute('aria-disabled','true');
    }
    window.scrollTo(0,0);
  } else {
    if (s1) s1.hidden=true; if (s2) s2.hidden=false; if (headerMeta) headerMeta.hidden=false;
    if (accelBtn){
      accelBtn.setAttribute('aria-pressed','false');
      setText(accelBtn,'Sneller aflossen aanzetten');
      accelBtn.setAttribute('aria-label','Sneller aflossen aanzetten');
    }
    if (strategyControls){
      strategyControls.classList.add('is-disabled');
      strategyControls.setAttribute('aria-disabled','true');
    }

    // Startjaar-veld toevoegen zodra stap 2 opent
    ensureStartYearControl();

    // Summary-chart anker + mount (indien aanwezig)
    ensureSummaryAnchor();
    if (window.SummaryChart) {
      SummaryChart.mount({ svgSelector: '#interestChart' });
    }

    window.scrollTo(0,0);
    render();
  }
}

/* ===== Events & init ===== */
function init(){
  updateHeaderMeta();
  if ($id('headerMeta')) $id('headerMeta').hidden = true;
  showStep(1);

  // Stap 1 → Stap 2
  onId('goToStep2','click', function(){
    var errs=validateStep1(), box=$id('step1Errors');
    if (box){
      if (errs.length){ box.innerHTML='• ' + errs.join('<br>• '); return; }
      box.textContent='';
    }
    showStep(2);
  });

  // Terug naar stap 1
  onId('editLoanHeader','click', function(){ showStep(1); var el=$id('loanAmount'); if (el) el.focus(); });

  // Toggle versneller
  onId('accelerateToggle','click', function(){
    var btn=$id('accelerateToggle'), controls=$id('strategyControls');
    var pressed = btn.getAttribute('aria-pressed')==='true';
    btn.classList.remove('anim-bump'); void btn.offsetWidth; btn.classList.add('anim-bump');
    var enable = !pressed;
    btn.setAttribute('aria-pressed', String(enable));
    setText(btn, enable ? 'Sneller aflossen uitzetten' : 'Sneller aflossen aanzetten');
    btn.setAttribute('aria-label', enable ? 'Sneller aflossen uitzetten' : 'Sneller aflossen aanzetten');
    if (controls){
      controls.classList.toggle('is-disabled', !enable);
      controls.setAttribute('aria-disabled', String(!enable));
    }
    render();
  });

  // Mode wisselen
  onAll('#modeGroup [data-mode]','click', function(){
    var all = document.querySelectorAll('#modeGroup [data-mode]');
    for (var j=0;j<all.length;j++) all[j].setAttribute('aria-pressed','false');
    this.setAttribute('aria-pressed','true');
    var mode = this.getAttribute('data-mode');
    if ($id('panel-amount'))  $id('panel-amount').hidden  = (mode!=='amount');
    if ($id('panel-percent')) $id('panel-percent').hidden = (mode!=='percent');
    if ($id('panel-shorten')) $id('panel-shorten').hidden = (mode!=='shorten');
    render();
  });

  // Sub-opties — amount
  onAll('#amountGroup .opt-amount','click', function(){
    var all = document.querySelectorAll('#amountGroup .opt-amount');
    for (var j=0;j<all.length;j++) all[j].setAttribute('aria-pressed','false');
    this.setAttribute('aria-pressed','true');
    render();
  });

  // Sub-opties — percent
  onAll('#percentGroup .opt-percent','click', function(){
    var all = document.querySelectorAll('#percentGroup .opt-percent');
    for (var j=0;j<all.length;j++) all[j].setAttribute('aria-pressed','false');
    this.setAttribute('aria-pressed','true');
    render();
  });

  // Sub-opties — shorten
  onAll('#shortenGroup .opt-shorten','click', function(){
    var all = document.querySelectorAll('#shortenGroup .opt-shorten');
    for (var j=0;j<all.length;j++) all[j].setAttribute('aria-pressed','false');
    this.setAttribute('aria-pressed','true');
    render();
  });

  // Live headerchips + Enter → door
  ['loanAmount','loanYears','loanRate'].forEach(function(id){
    var el = $id(id);
    if (!el) return;
    el.addEventListener('input', updateHeaderMeta);
    el.addEventListener('keydown', function(e){ if (e.key==='Enter'){ var go=$id('goToStep2'); if (go) go.click(); } });
  });
}

/* DOM ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
