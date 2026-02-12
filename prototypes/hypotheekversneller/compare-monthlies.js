/*!
 * compare-monthlies.js  ·  v4.0
 * - Sparkline (area + line) hersteld
 * - Eén toggle-knop met omgewisselde varianten:
 *     Globaal UIT  → "Versneller aanzetten vanaf jaar X" (btn-primary)
 *     Globaal AAN  → "Versneller uitzetten"              (btn-ghost)
 * - Bij AAN: zet globaal startjaar = Jaar X + activeert versneller + render()
 * - Delta-chip, pijltjes en labels blijven synchroon
 */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var SELECTED_YEAR = 1;
  var LAST_RESULT = null;
  var PATCHED = false;
  var accelObserver = null;
  var PREVIEW_FROM_YEAR = false; // lokale preview zolang globaal UIT staat

  // Formatter
  var formatCurrency =
    (global.CURRENCY && typeof global.CURRENCY.format === 'function')
      ? function(n){ return global.CURRENCY.format(n); }
      : new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format;

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $id(id){ return document.getElementById(id); }

  /* ---------- helpers: globale versnellerstatus + knop-variant ---------- */
  function isGlobalAccelOn(){
    var btn = $id('accelerateToggle');
    return !!(btn && btn.getAttribute('aria-pressed') === 'true');
  }
  // AAN → ghost, UIT → primary
  function setAccelButtonVariant(isOn){
    var t = $id('cmpStartPreviewToggle');
    if (!t) return;
    t.classList.remove('btn-primary','btn-ghost');
    t.classList.add(isOn ? 'btn-ghost' : 'btn-primary');
  }
  function updateToggleButtonLabel(){
    var btn = $id('cmpStartPreviewToggle');
    if (!btn) return;
    if (isGlobalAccelOn()){
      btn.textContent = 'Versneller uitzetten';
      setAccelButtonVariant(true);   // AAN = ghost
    } else {
      btn.textContent = 'Versneller aanzetten vanaf jaar ' + SELECTED_YEAR;
      setAccelButtonVariant(false);  // UIT = primary
    }
  }
  function ensureAccelObserver(){
    var g = $id('accelerateToggle');
    if (!g || accelObserver) return;
    accelObserver = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        if (muts[i].type === 'attributes' && muts[i].attributeName === 'aria-pressed'){
          updateToggleButtonLabel();
          try { buildAndUpdate(); } catch(e){}
        }
      }
    });
    accelObserver.observe(g, { attributes:true });
  }

  /* ----------------------------- DOM opbouw ----------------------------- */
  function ensureCompareCard(){
    var summary   = $id('summary');
    var chartCard = $id('chartCard');
    var tbody = $id('scheduleBody');
    var table = tbody ? tbody.closest('table') : null;
    var host  = summary || (table && table.parentNode) || document.body;

    var card = $id('compareCard');
    if (card && card.parentNode) return card;

    card = document.createElement('div');
    card.id = 'compareCard';
    card.className = 'compare-card';
    card.setAttribute('role','region');
    card.setAttribute('aria-label','Vergelijk maandlasten');

    var grid = document.createElement('div');
    grid.className = 'compare-grid';
    grid.innerHTML = [
      '<div class="compare-block" id="cmpLeft">',
      '  <div class="compare-top">',
      '    <button id="cmpPrev" class="arrow-btn" type="button" aria-label="Vorig jaar">‹</button>',
      '    <span class="compare-label" id="cmpYearTitle">Jaar 1</span>',
      '    <button id="cmpNext" class="arrow-btn" type="button" aria-label="Volgend jaar">›</button>',
      '  </div>',
      '  <div class="compare-sub">Maandlast</div>',
      '  <div class="compare-value" id="cmpYearValue">—</div>',
      '</div>',
      '<div class="compare-block" id="cmpRight">',
      '  <div class="compare-top">',
      '    <span class="compare-label">Laatste jaar</span>',
      '  </div>',
      '  <div class="compare-sub">Maandlast</div>',
      '  <div class="compare-value" id="cmpLastValue">—</div>',
      '</div>'
    ].join('');

    var deltaRow = document.createElement('div');
    deltaRow.className = 'compare-delta';
    deltaRow.innerHTML = [
      '<span class="delta-chip delta-neutral" id="cmpDeltaChip">',
      '  <span class="arrow" id="cmpDeltaArrow">↔</span>',
      '  <span id="cmpDeltaText">Laatste jaar: —</span>',
      '</span>',
      '<span class="delta-note" id="cmpDeltaNote">t.o.v. Jaar 1</span>'
    ].join('');

    var sparkWrap = document.createElement('div');
    sparkWrap.id = 'cmpSparkline';
    sparkWrap.className = 'cmp-sparkline';
    sparkWrap.innerHTML =
      '<svg id="cmpSparklineSvg" viewBox="0 0 360 60" preserveAspectRatio="none" aria-label="Verloop maandlasten">' +
      '  <g id="cmpSparkGroup"></g>' +
      '</svg>';

    var actions = document.createElement('div');
    actions.className = 'compare-actions';
    actions.innerHTML = [
      // Init als primary (globaal initieel meestal UIT)
      '<button id="cmpStartPreviewToggle" class="btn btn-primary cmp-accel-btn" type="button" aria-pressed="false"',
      '  title="Zet de versneller aan vanaf het gekozen jaar (globaal)">',
      '  Versneller aanzetten vanaf jaar 1',
      '</button>'
    ].join('');

    // Invoegen
    var insertAfter = function(parent, node, ref){ parent.insertBefore(node, ref ? ref.nextSibling : null); };
    if (summary && chartCard && chartCard.parentNode === summary) insertAfter(summary, card, chartCard);
    else if (summary) summary.appendChild(card);
    else if (table && host) host.insertBefore(card, table);
    else host.appendChild(card);

    card.appendChild(grid);
    card.appendChild(deltaRow);
    card.appendChild(sparkWrap);
    card.appendChild(actions);

    // Pijltjes
    var prev = $id('cmpPrev');
    var next = $id('cmpNext');
    if (prev) prev.addEventListener('click', function(){
      SELECTED_YEAR = Math.max(1, (SELECTED_YEAR|0) - 1);
      if (!isGlobalAccelOn()) updateToggleButtonLabel();
      buildAndUpdate();
    });
    if (next) next.addEventListener('click', function(){
      var effective = computeEffectiveResult(); // grens bepalen
      var lastActive = getLastActiveYear(effective);
      SELECTED_YEAR = Math.min(lastActive, (SELECTED_YEAR|0) + 1);
      if (!isGlobalAccelOn()) updateToggleButtonLabel();
      buildAndUpdate();
    });

    // Toggle-knop
    var tbtn = $id('cmpStartPreviewToggle');
    if (tbtn){
      tbtn.addEventListener('click', function(){
        if (isGlobalAccelOn()){
          PREVIEW_FROM_YEAR = false;
          var g = $id('accelerateToggle');
          if (g) g.click(); // render() wordt getriggerd
          updateToggleButtonLabel();
        } else {
          PREVIEW_FROM_YEAR = true;
          syncPreviewToGlobal();      // zet startYear = X, zet versneller AAN, render()
          updateToggleButtonLabel();
        }
      });
    }

    updateToggleButtonLabel();
    ensureAccelObserver();

    return card;
  }

  /* -------- preview → globale sync (startjaar + versneller + render) ------ */
  function syncPreviewToGlobal(){
    var startInput = $id('startYear');
    var yearsInput = $id('loanYears');
    var years = Math.max(1, +(yearsInput && yearsInput.value) || 30);
    var yWanted = Math.max(1, Math.min(years, SELECTED_YEAR|0));
    if (startInput && String(yWanted) !== startInput.value) {
      startInput.value = String(yWanted);
      startInput.dispatchEvent(new Event('input', { bubbles:true }));
      startInput.dispatchEvent(new Event('change', { bubbles:true }));
    }
    var globalBtn = $id('accelerateToggle');
    if (globalBtn && globalBtn.getAttribute('aria-pressed') !== 'true') {
      globalBtn.click();
    } else {
      if (typeof global.render === 'function') { try { global.render(); } catch(e){} }
    }
  }

  /* ---------------------------- simulatie ---------------------------- */
  function getLastActiveYear(result){
    if (!result || !result.rows) return 1;
    var rows = result.rows, last = 1;
    for (var i=0; i<rows.length; i++){
      if (rows[i] && rows[i].monthly != null) last = i+1;
    }
    return Math.max(1, last);
  }
  function computeCurrentResult(){
    if (typeof global.getInputs !== 'function' ||
        typeof global.simulate !== 'function' ||
        typeof global.simulateBaseline !== 'function') {
      return null;
    }
    var s = global.getInputs();
    if (!s) return null;
    return s.accelOn
      ? global.simulate(s.principal, s.years, s.rate, s.mode, s.param)
      : global.simulateBaseline(s.principal, s.years, s.rate);
  }

  // Lokale preview-simulatie: baseline t/m (startYear-1), daarna versnellen volgens mode/param
  function simulatePreviewStart(p, y, r, mode, param, startYear){
    if (!p || !y || r==null) return computeCurrentResult();
    var mTot=y*12, rM=(r/100)/12;

    // baseline maandlast (constante)
    var baseMP = (function monthlyPaymentLocal(P, rPct, m){
      if (m<=0) return 0;
      var rr=(rPct/100)/12; if (rr===0) return P/m;
      return P*(rr/(1-Math.pow(1+rr,-m)));
    })(p, r, mTot);

    var bal=p, rows=[], last=baseMP, mon=last, elapsed=0, totalPaid=0,totalInterest=0,paidOff=null;
    var accelFrom = Math.max(1, Math.min(y, startYear|0));
    var accelIdx=0;

    for (var yr=1; yr<=y; yr++){
      if (yr < accelFrom){
        mon = baseMP;
      } else {
        if (yr > accelFrom){
          if (mode==='amount')       mon = last + (param && +param.stepEUR || 0);
          else if (mode==='percent') mon = last * (1 + (param && +param.pct || 0));
        } else {
          if (mode==='amount')       mon = last + (param && +param.stepEUR || 0);
          else if (mode==='percent') mon = last * (1 + (param && +param.pct || 0));
        }
        if (mode==='shorten'){
          accelIdx += 1;
          var baseRem = mTot - (yr-1)*12;
          var target  = Math.max(1, baseRem - accelIdx * (param && +param.monthsShorten || 0));
          mon = (function monthlyPaymentLocal(P, rPct, m){
            if (m<=0) return 0;
            var rr=(rPct/100)/12; if (rr===0) return P/m;
            return P*(rr/(1-Math.pow(1+rr,-m)));
          })(bal, r, target);
        }
      }

      var inc=(yr===1)?0:(mon-last);
      for (var m=1; m<=12; m++){
        if (bal<=1e-8) break;
        var i=bal*rM; var princ=mon-i; if (princ<0) princ=0; if (princ>bal) princ=bal;
        bal-=princ; totalInterest+=i; totalPaid+=princ+i; elapsed++;
        if (bal<=1e-8 && paidOff===null){ paidOff=elapsed; break; }
      }
      rows.push({ year: yr, monthly: mon, increase: inc, endBalance: Math.max(0, bal) });
      last=mon;
      if (bal<=1e-8){ for (var yy=yr+1; yy<=y; yy++) rows.push({year:yy,monthly:null,increase:null,endBalance:0}); break; }
    }
    if (rows.length<y){ for (var zz=rows.length+1; zz<=y; zz++) rows.push({year:zz,monthly:null,increase:null,endBalance:0}); }

    return { rows: rows, totalPaid: totalPaid, totalInterest: totalInterest, paidOffAtMonth: paidOff, baseline: { mp: baseMP } };
  }

  /* ----------------------------- sparkline ---------------------------- */
  function drawSparkline(result){
    var svg = $id('cmpSparklineSvg');
    var grp = svg ? svg.querySelector('#cmpSparkGroup') : null;
    if (!svg || !grp) return;

    // reset
    grp.innerHTML = '';

    var rows = (result && result.rows) ? result.rows : [];
    var lastActive = getLastActiveYear(result);
    if (!rows.length || lastActive < 1) return;

    // waarden verzamelen t/m laatste actieve jaar (monthly != null)
    var vals = [];
    for (var i=0; i<lastActive; i++){
      var v = rows[i] && rows[i].monthly;
      if (v == null) break;
      vals.push(v);
    }
    var n = vals.length; if (n === 0) return;

    // ViewBox: 360 x 60, padding boven/onder
    var W=360, H=60, padT=6, padB=6, padL=0, padR=0;
    var innerH = H - padT - padB;

    // min/max
    var min = vals[0], max = vals[0];
    for (var j=1;j<n;j++){ if (vals[j] < min) min = vals[j]; if (vals[j] > max) max = vals[j]; }
    var range = max - min;
    var xStep = (n > 1) ? (W - padL - padR)/(n - 1) : 0;

    function yFor(v){
      var t = (range > 0) ? (v - min)/range : 0.5; // vlak → midden
      return padT + innerH * (1 - t);
    }

    // lijnpad
    var lineD = '';
    for (var k=0;k<n;k++){
      var x = padL + k*xStep;
      var y = yFor(vals[k]);
      lineD += (k===0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }

    // vlak onder lijn
    var areaD = '';
    if (n > 1){
      areaD = 'M' + (padL) + ',' + yFor(vals[0]).toFixed(2) + ' ';
      for (var k2=1;k2<n;k2++){
        var x2 = padL + k2*xStep;
        areaD += 'L' + x2.toFixed(2) + ',' + yFor(vals[k2]).toFixed(2) + ' ';
      }
      areaD += 'L' + (padL + (n-1)*xStep).toFixed(2) + ',' + (H - padB).toFixed(2) + ' ';
      areaD += 'L' + (padL).toFixed(2) + ',' + (H - padB).toFixed(2) + ' Z';
    }

    var areaEl = document.createElementNS(NS,'path');
    areaEl.setAttribute('class','area');
    areaEl.setAttribute('d', areaD);
    grp.appendChild(areaEl);

    var lineEl = document.createElementNS(NS,'path');
    lineEl.setAttribute('class','line');
    lineEl.setAttribute('d', lineD);
    grp.appendChild(lineEl);

    // punten: geselecteerd jaar en laatste jaar
    var selIdx = Math.max(0, Math.min(n-1, (SELECTED_YEAR|0) - 1));
    var lstIdx = n - 1;

    function addDot(i, cls, r){
      var cx = padL + i*xStep;
      var cy = yFor(vals[i]);
      var dot = document.createElementNS(NS,'circle');
      dot.setAttribute('cx', cx.toFixed(2));
      dot.setAttribute('cy', cy.toFixed(2));
      dot.setAttribute('r', String(r || 3.5));
      dot.setAttribute('class', 'dot ' + (cls||''));
      grp.appendChild(dot);
    }

    if (selIdx === lstIdx) addDot(selIdx, 'selected last', 4.2);
    else { addDot(selIdx, 'selected', 4.2); addDot(lstIdx, 'last', 4.2); }
  }

  /* ------------------------------ update flow ----------------------------- */
  function computeEffectiveResult(){
    var s = (typeof global.getInputs === 'function') ? global.getInputs() : null;
    if (!s) return null;
    if (PREVIEW_FROM_YEAR && !isGlobalAccelOn()){
      return simulatePreviewStart(s.principal, s.years, s.rate, s.mode, s.param, SELECTED_YEAR);
    }
    return s.accelOn
      ? global.simulate(s.principal, s.years, s.rate, s.mode, s.param)
      : global.simulateBaseline(s.principal, s.years, s.rate);
  }

  function updateCompareCard(result){
    LAST_RESULT = result;

    var rows = (result && result.rows) ? result.rows : [];
    if (!rows.length) { updateToggleButtonLabel(); return; }

    var lastActive = getLastActiveYear(result);
    if (SELECTED_YEAR > lastActive) SELECTED_YEAR = lastActive;
    if (SELECTED_YEAR < 1) SELECTED_YEAR = 1;

    var leftRow  = rows[SELECTED_YEAR - 1] || {};
    var rightRow = rows[lastActive - 1] || {};

    var leftVal  = (leftRow.monthly == null)  ? null : leftRow.monthly;
    var rightVal = (rightRow.monthly == null) ? null : rightRow.monthly;

    var yearTitle = $id('cmpYearTitle');
    var leftValEl = $id('cmpYearValue');
    var lastValEl = $id('cmpLastValue');
    var prevBtn   = $id('cmpPrev');
    var nextBtn   = $id('cmpNext');

    if (yearTitle) yearTitle.textContent = 'Jaar ' + SELECTED_YEAR;
    if (leftValEl) leftValEl.textContent = (leftVal==null) ? '—' : formatCurrency(leftVal);
    if (lastValEl) lastValEl.textContent = (rightVal==null) ? '—' : formatCurrency(rightVal);

    if (prevBtn) prevBtn.disabled = (SELECTED_YEAR <= 1);
    if (nextBtn) nextBtn.disabled = (SELECTED_YEAR >= lastActive);

    // knop-label en variant
    updateToggleButtonLabel();

    // Delta
    var chip   = $id('cmpDeltaChip');
    var arrow  = $id('cmpDeltaArrow');
    var text   = $id('cmpDeltaText');
    var note   = $id('cmpDeltaNote');
    if (note) note.textContent = 't.o.v. Jaar ' + SELECTED_YEAR + (PREVIEW_FROM_YEAR && !isGlobalAccelOn() ? ' (preview)' : '');

    if (chip && arrow && text) {
      chip.classList.remove('delta-up','delta-down','delta-neutral');
      chip.classList.add('delta-neutral'); arrow.textContent='↔'; text.textContent='Laatste jaar: —';

      if (leftVal != null && rightVal != null) {
        var delta = rightVal - leftVal;
        var pct   = (leftVal !== 0) ? (delta / leftVal) : 0;
        var pctStr = (leftVal !== 0) ? (' (' + (pct>0?'+':'') + (Math.abs(pct)*100).toFixed(1) + '%)') : '';

        if (Math.abs(delta) <= 0.005) {
          chip.classList.add('delta-neutral'); arrow.textContent = '↔';
          text.textContent = 'Laatste jaar: €0' + pctStr;
        } else if (delta > 0) {
          chip.classList.add('delta-up'); arrow.textContent = '↑';
          text.textContent = 'Laatste jaar: +' + formatCurrency(Math.abs(delta)) + pctStr;
        } else {
          chip.classList.add('delta-down'); arrow.textContent = '↓';
          text.textContent = 'Laatste jaar: −' + formatCurrency(Math.abs(delta)) + pctStr;
        }
      }
    }

    // Sparkline tekenen
    drawSparkline(result);
  }

  function buildAndUpdate(){
    ensureCompareCard();
    ensureAccelObserver();
    var result = computeEffectiveResult();
    if (result) updateCompareCard(result);
  }

  /* ------------------------------- bootstrap ------------------------------ */
  function patchRenderOnce(){
    if (PATCHED) return;
    var tryPatch = function(){
      if (typeof global.render === 'function'){
        var original = global.render;
        global.render = function(){
          original.apply(this, arguments);
          try { buildAndUpdate(); } catch(e){ console.warn('compare-monthlies update error:', e); }
        };
        PATCHED = true;
        try { buildAndUpdate(); } catch(e){}
        return true;
      }
      return false;
    };
    if (!tryPatch()){
      var attempts = 0;
      var t = setInterval(function(){
        attempts++;
        if (tryPatch() || attempts > 50) clearInterval(t);
      }, 100);
    }
  }
  document.addEventListener('DOMContentLoaded', function(){ patchRenderOnce(); });

  // Kleine API (optioneel)
  global.CompareMonthlies = {
    refresh: buildAndUpdate,
    setYear: function(y){
      var n=Number(y)||1;
      SELECTED_YEAR=Math.max(1,Math.floor(n));
      if (!isGlobalAccelOn()) updateToggleButtonLabel();
      buildAndUpdate();
    },
    getSelectedYear: function(){ return SELECTED_YEAR; }
  };

})(window);