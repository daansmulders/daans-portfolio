/*!
 * summary-chart.js (v4)
 * Eén-koloms samenvattingsgrafiek met:
 *  - Aflossing (onderste blok)
 *  - Rente (daarboven, krimpt exponentieel bij versnellen)
 *  - NIEUW: "Bespaarde rente" (groen blok) bovenop het huidige niveau; groeit met besparing
 *
 * API:
 *   SummaryChart.mount({ svgSelector?: '#interestChart' })
 *   SummaryChart.update(principalEUR, baselineInterestEUR, currentInterestEUR, accelOn)
 *   SummaryChart.setGamma(gamma)   // exponent voor visuele rente-animatie (default 1.4)
 *
 * Opzet:
 *   - Geen CSS-injectie; gebruik de CSS-classes in styles.css (zie blok onderaan).
 *   - De schaal is gebaseerd op baseline (P + I_base), zodat besparing en krimp duidelijk zichtbaar zijn.
 */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var DEFAULT_SVG_ID = 'interestChart';
  var _gamma = 1.4; // exponent voor exponentieel effect op rentelaag

  function $(sel, root){ return (root || document).querySelector(sel); }

  function create(tag, attrs, parent){
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(el);
    return el;
  }

  // Bouw de SVG-structuur éénmalig
  function ensureSvg(svg){
    if (!svg) return null;
    if (svg.getAttribute('data-ready') === 'true') return svg;

    // Basis meta
    svg.innerHTML = '';
    svg.setAttribute('viewBox','0 0 420 260');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.setAttribute('role','img');
    if (!svg.getAttribute('aria-labelledby')){
      svg.setAttribute('aria-labelledby','chartTitle chartDesc');
      var title = create('title',{ id:'chartTitle' }, svg);
      title.textContent = 'Totale betaling: aflossing + rente + bespaarde rente';
      var desc  = create('desc', { id:'chartDesc'  }, svg);
      desc.textContent  = 'Één verticale balk. Onder aflossing, daarboven rente (krimpt bij versnellen), en bovenop een groen blok voor bespaarde rente.';
    }

    // Maten & layout
    var W=420, H=260;
    var pad={ top:10, right:16, bottom:28, left:16 };
    var baseY=H-pad.bottom; // x-as
    var barX=24, barW=64;   // links uitgelijnd

    // As
    create('line', { x1:pad.left, x2:W-pad.right, y1:baseY, y2:baseY, class:'axis' }, svg);

    // Groepen
    var gBar   = create('g', { id:'gBar' }, svg);

    // Aflossing (onder)
    create('rect', { id:'rectPrincipal', class:'bar bar-principal', x:barX, width:barW }, gBar);

    // Rente (boven aflossing) – in eigen groep zodat we scaleY kunnen animeren
    var gInt = create('g', { id:'gInterest', class:'gInterest' }, gBar);
    create('rect', { id:'rectInterest', class:'bar bar-interest', x:barX, width:barW }, gInt);

    // NIEUW: Bespaarde rente blok – bovenop de huidige (aflossing + rente_now)
    // We animeren via transition op y/height (zie CSS)
    var gSavedBlock = create('g', { id:'gSavedBlock' }, gBar);
    create('rect', { id:'rectSaved', class:'bar bar-saved', x:barX, width:barW, height:0 }, gSavedBlock);

    // Bestaande besparingslabel (lijn + bubble rechts)
    var gSaved = create('g', { id:'gSaved', class:'hidden' }, svg);
    create('line', { id:'savedLine', class:'saved-line' }, gSaved);
    create('rect', { id:'savedRect', class:'saved-bubble', rx:10 }, gSaved);
    var savedText = create('text', { id:'savedText', class:'saved-text', 'dominant-baseline':'middle' }, gSaved);
    savedText.textContent = '';

    // Metadata voor render
    svg.setAttribute('data-ready','true');
    svg.dataset.W=W; svg.dataset.H=H;
    svg.dataset.padTop=pad.top; svg.dataset.padRight=pad.right; svg.dataset.padBottom=pad.bottom; svg.dataset.padLeft=pad.left;
    svg.dataset.barX=barX; svg.dataset.barW=barW; svg.dataset.baseY=baseY;

    return svg;
  }

  // Hoofdrender
  function render(svg, principalEUR, baselineInterestEUR, currentInterestEUR, accelOn){
    if (!svg) return;

    // Lees maatvoering
    var H   = +svg.dataset.H;
    var pad = { top:+svg.dataset.padTop, right:+svg.dataset.padRight, bottom:+svg.dataset.padBottom, left:+svg.dataset.padLeft };
    var baseY = +svg.dataset.baseY;
    var barX  = +svg.dataset.barX;
    var barW  = +svg.dataset.barW;

    // Data
    var P       = Math.max(0, +principalEUR || 0);
    var I_base  = Math.max(0, +baselineInterestEUR || 0);
    var I_now   = Math.max(0, +currentInterestEUR || 0);
    var saved   = Math.max(0, I_base - I_now);

    var totalBase = P + I_base;
    var maxH = H - pad.top - pad.bottom;

    var rectP      = $('#rectPrincipal', svg);
    var gInt       = $('#gInterest', svg);
    var rectI      = $('#rectInterest', svg);
    var rectSaved  = $('#rectSaved', svg);
    var gSaved     = $('#gSaved', svg);
    var savedLine  = $('#savedLine', svg);
    var savedRect  = $('#savedRect', svg);
    var savedText  = $('#savedText', svg);

    if (totalBase <= 0 || maxH <= 0 || !rectP || !gInt || !rectI || !rectSaved) {
      if (gSaved) gSaved.setAttribute('class','hidden');
      return;
    }

    // Schaal o.b.v. baseline (zodat verschillen consistent zichtbaar zijn)
    var k        = maxH / totalBase;
    var hP       = P * k;
    var hI_base  = I_base * k;
    var hI_now   = I_now * k;
    var hSaved   = saved * k;

    // Aflossing
    rectP.setAttribute('y', baseY - hP);
    rectP.setAttribute('height', hP);

    // Rente (baseline-hoogte als referentie); visuele krimp via scaleY op gInterest
    rectI.setAttribute('y', baseY - hP - hI_base);
    rectI.setAttribute('height', hI_base);

    var linRatio   = (hI_base > 0) ? (hI_now / hI_base) : 0;
    var ratioShown = Math.pow(Math.max(0, Math.min(1, linRatio)), _gamma);
    gInt.style.transform = 'scaleY(' + ratioShown.toFixed(6) + ')';

    // NIEUW: Bespaarde rente blok – bovenop het huidige niveau (aflossing + rente_now)
    // y_top_current = baseY - hP - hI_now
    var yTopNow = baseY - hP - hI_now;

    if (accelOn && hSaved > 0.5) { // drempel ~0.5px om flikkering te vermijden
      rectSaved.setAttribute('y', yTopNow - hSaved);
      rectSaved.setAttribute('height', hSaved);
      rectSaved.setAttribute('visibility', 'visible');
    } else {
      // verberg/inklap
      rectSaved.setAttribute('y', yTopNow);
      rectSaved.setAttribute('height', 0);
      rectSaved.setAttribute('visibility', 'hidden');
    }

    // Label "Bespaarde rente" (lijn + bubble rechts)
    var showSaved = !!accelOn && saved > 1e-6 && I_base > 1e-6;
    if (!gSaved) return;

    if (!showSaved){
      gSaved.setAttribute('class','hidden');
      return;
    }

    // Positioneer label op midden tussen baseline-top en current-top
    var yTopBase = baseY - hP - hI_base;
    var yMid     = (yTopBase + yTopNow) / 2;

    var xBarRight = barX + barW;
    var xLineStart = xBarRight + 12; // iets ruimte rechts naast balk
    var xLineEnd   = xLineStart + 12;

    savedLine.setAttribute('x1', xLineStart);
    savedLine.setAttribute('x2', xLineEnd);
    savedLine.setAttribute('y1', yMid);
    savedLine.setAttribute('y2', yMid);

    var label = 'Bespaarde rente: ' + formatEUR(saved);
    savedText.textContent = label;

    // tijdelijke meting voor bubble-breedte
    savedText.setAttribute('x', xLineEnd + 12);
    savedText.setAttribute('y', yMid);

    var textLen;
    try { textLen = savedText.getComputedTextLength(); } catch(e){ textLen = 160; }
    var padX = 14, padY = 8, gap = 8;
    var rectW = Math.max(160, textLen + padX*2);
    var rectH = 28;
    var xRect = xLineEnd + gap;
    var yRect = yMid - rectH/2;

    savedRect.setAttribute('x', xRect);
    savedRect.setAttribute('y', yRect);
    savedRect.setAttribute('width', rectW);
    savedRect.setAttribute('height', rectH);

    savedText.setAttribute('x', xRect + rectW/2);
    savedText.setAttribute('y', yMid);

    gSaved.setAttribute('class','visible');
  }

  // Hulpje voor valuta
  function formatEUR(n){
    try {
      var fmt = (global.CURRENCY && typeof global.CURRENCY.format === 'function')
        ? global.CURRENCY
        : new Intl.NumberFormat('nl-NL', { style:'currency', currency:'EUR' });
      return fmt.format(n);
    } catch(e) {
      return '€ ' + (Math.round(n*100)/100).toLocaleString('nl-NL');
    }
  }

  // Publieke API
  var mountedSvg = null;

  var SummaryChart = {
    mount: function(opts){
      opts = opts || {};
      var svgSel = opts.svgSelector || ('#' + DEFAULT_SVG_ID);
      var svg = $(svgSel);
      if (!svg) return null;
      mountedSvg = ensureSvg(svg);
      return mountedSvg;
    },
    update: function(principalEUR, baselineInterestEUR, currentInterestEUR, accelOn){
      if (!mountedSvg){
        var svg = document.getElementById(DEFAULT_SVG_ID);
        if (svg) mountedSvg = ensureSvg(svg);
      }
      if (!mountedSvg) return;
      render(mountedSvg, principalEUR, baselineInterestEUR, currentInterestEUR, accelOn);
    },
    setGamma: function(gamma){
      var g = Number(gamma);
      if (!isFinite(g) || g <= 0) return;
      _gamma = g;
    }
  };

  global.SummaryChart = SummaryChart;

  // Automount als SVG al aanwezig is
  document.addEventListener('DOMContentLoaded', function(){
    var svg = document.getElementById(DEFAULT_SVG_ID);
    if (svg) SummaryChart.mount({ svgSelector: '#' + DEFAULT_SVG_ID });
  });

})(window);