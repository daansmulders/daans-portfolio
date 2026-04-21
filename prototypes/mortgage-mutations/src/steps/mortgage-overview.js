/**
 * Mortgage overview page — entry point before the wizard.
 * Shows a single mortgage detail page with dummy data.
 * Clicking "Hypotheek aanpassen en OHA" starts the wizard flow.
 */

function fmt(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtShort(value) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const MORTGAGE_DATA = {
  loanNumber: "8005066",
  totalPrincipal: 282791.19,
  monthlyPayment: 1442.83,
  paymentDate: "01-05-2026",
  liable: "A. Punt",
  coLiable: "B. Punt",
  pensionTime: "23 jaar en 5 maanden",
  address1: "393bf746e3faca",
  address2: "7751DY 79c9b13",
  houseValue: 450000.00,
  rateClass: "> 60% t/m 70%",
  depot: {
    type: "Verbouwdepot",
    startDate: "03-06-2024",
    endDate: "03-06-2026",
    originalAmount: 45000.00,
    remaining: 164.63,
    interestRate: "0,00 %",
    number: "80050662",
  },
  loanParts: [
    { type: "Annuïteiten Hypotheek", principal: 235754.76 },
    { type: "Annuïteiten Hypotheek", principal: 47036.43 },
  ],
  endedDepot: {
    type: "Nieuwbouwdepot",
  },
};

export function renderMortgageOverview(rootEl, onStartWizard) {
  const d = MORTGAGE_DATA;

  rootEl.innerHTML = `
    <div class="mo-page">
      <header class="mo-header">
        <div class="mo-header__inner">
          <div class="mo-header__left">
            <div class="mo-header__logo">
              <img src="images/NN.svg" alt="Nationale-Nederlanden" class="mo-header__logo-img">
            </div>
            <nav class="mo-header__nav">
              <span class="mo-header__nav-item">Regelen <span class="mo-header__chevron">⌄</span></span>
              <span class="mo-header__nav-item">Producten <span class="mo-header__chevron">⌄</span></span>
              <span class="mo-header__nav-item">Je klanten <span class="mo-header__chevron">⌄</span></span>
              <span class="mo-header__nav-item">Contact <span class="mo-header__chevron">⌄</span></span>
            </nav>
          </div>
          <div class="mo-header__right">
            <span class="mo-header__search">Zoek 🔍</span>
            <span class="mo-header__avatar">👤</span>
          </div>
        </div>
      </header>

      <div class="mo-content">
        <div class="mo-breadcrumb">
          <span>Home</span> / <span>Hypotheek Details</span>
        </div>

        <div class="mo-info-banner">
          <span class="mo-info-banner__icon">ⓘ</span>
          <div>
            <strong>Nieuw: Eén plek voor aanpassen hypotheekvorm en OHA</strong><br>
            Omzetting of Ontslag Hoofdelijke Aansprakelijkheid regelen? Je vindt de link 'Hypotheek aanpassen en OHA' onder 'Snel regelen'.
          </div>
        </div>

        <div class="mo-summary-cards">
          <div class="mo-summary-card">
            <span class="mo-summary-card__label">Leningnummer</span>
            <span class="mo-summary-card__value">${d.loanNumber}</span>
          </div>
          <div class="mo-summary-card">
            <span class="mo-summary-card__label">Restant hoofdsom</span>
            <span class="mo-summary-card__value">${fmtShort(d.totalPrincipal)}</span>
          </div>
          <div class="mo-summary-card">
            <span class="mo-summary-card__label">Rente en aflossing per ${d.paymentDate}</span>
            <span class="mo-summary-card__value">${fmtShort(d.monthlyPayment)}</span>
          </div>
        </div>

        <div class="mo-details">
          <div class="mo-details__left">
            <div class="mo-detail-row">
              <span class="mo-detail-row__label">Hoofdelijk aansprakelijk</span>
              <span class="mo-detail-row__value">${d.liable}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label"></span>
              <span class="mo-detail-row__value">${d.coLiable}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label">Geschatte resterende tijd tot pensioendatum <span class="mo-info-icon">ⓘ</span></span>
              <span class="mo-detail-row__value">${d.pensionTime}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label">Onderpand</span>
              <span class="mo-detail-row__value">${d.address1}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label"></span>
              <span class="mo-detail-row__value">${d.address2}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label">Waarde woning</span>
              <span class="mo-detail-row__value">${fmt(d.houseValue)}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label">Tariefklasse</span>
              <span class="mo-detail-row__value">${d.rateClass}</span>
            </div>
            <div class="mo-detail-row">
              <span class="mo-detail-row__label">Bruto rente en aflossing per maand</span>
              <span class="mo-detail-row__value"><strong>${fmt(d.monthlyPayment)}</strong></span>
            </div>
          </div>

          <div class="mo-details__right">
            <h3 class="mo-quick__title">Snel regelen</h3>
            <ul class="mo-quick__list">
              <li><a href="#">&rsaquo; Rente wijzigen</a></li>
              <li><a href="#">&rsaquo; (extra) Aflossen</a></li>
              <li><a href="#">&rsaquo; Woningwaarde aanpassen</a></li>
              <li><a href="#" class="mo-quick__cta" id="moStartWizard">&rsaquo; Hypotheek aanpassen en OHA</a></li>
              <li><a href="#">&rsaquo; Download Hypotheekoverzicht</a></li>
              <li><a href="#">&rsaquo; Meer zelf regelen</a></li>
            </ul>
          </div>
        </div>

        <section class="mo-section">
          <h2 class="mo-section__title">Depot</h2>
          <div class="mo-depot">
            <div class="mo-depot__header">
              <span>${d.depot.type}</span>
              <span class="mo-depot__toggle">⌃</span>
            </div>
            <div class="mo-depot__body">
              <div class="mo-detail-row">
                <span class="mo-detail-row__label">Oorspronkelijke ingangsdatum</span>
                <span class="mo-detail-row__value">${d.depot.startDate}</span>
              </div>
              <div class="mo-detail-row">
                <span class="mo-detail-row__label">Einddatum <span class="mo-info-icon">ⓘ</span></span>
                <span class="mo-detail-row__value">${d.depot.endDate}</span>
              </div>
              <div class="mo-detail-row">
                <span class="mo-detail-row__label">Oorspronkelijk depotbedrag</span>
                <span class="mo-detail-row__value"><strong>${fmt(d.depot.originalAmount)}</strong></span>
              </div>
              <div class="mo-detail-row">
                <span class="mo-detail-row__label">Resterend depotbedrag <span class="mo-info-icon">ⓘ</span></span>
                <span class="mo-detail-row__value"><strong>${fmt(d.depot.remaining)}</strong></span>
              </div>
              <div class="mo-detail-row">
                <span class="mo-detail-row__label">Rentevergoeding <span class="mo-info-icon">ⓘ</span></span>
                <span class="mo-detail-row__value">${d.depot.interestRate}</span>
              </div>
              <div class="mo-detail-row">
                <span class="mo-detail-row__label">Depotnummer</span>
                <span class="mo-detail-row__value">${d.depot.number}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="mo-section">
          <h2 class="mo-section__title">Leningdelen</h2>
          ${d.loanParts.map((lp) => `
            <div class="mo-loanpart">
              <span class="mo-loanpart__type">${lp.type}</span>
              <span class="mo-loanpart__amount">Restant hoofdsom: ${fmt(lp.principal)} <span class="mo-loanpart__toggle">⌄</span></span>
            </div>
          `).join("")}
        </section>

        <section class="mo-section">
          <h2 class="mo-section__title">Beëindigd Depot</h2>
          <div class="mo-depot">
            <div class="mo-depot__header">
              <span>${d.endedDepot.type}</span>
              <span class="mo-depot__toggle">⌄</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  // Wire up the CTA link
  rootEl.querySelector("#moStartWizard").addEventListener("click", (e) => {
    e.preventDefault();
    // Pass a customer object compatible with the wizard
    onStartWizard({
      id: "HYP-2024-001",
      loanNumber: d.loanNumber,
      names: [d.liable, d.coLiable],
    });
  });
}
