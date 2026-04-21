import { registerStep } from "../wizard/step-registry.js";
import { CUSTOMER_DATA } from "./mortgage-adjustment.js";

function fmt(value) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

function fmtShort(value) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);
}

function editBtn(wizardState, stepId, label = "Aanpassen") {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "rv-edit-btn";
  btn.textContent = label;
  btn.addEventListener("click", () => wizardState.goToStep(stepId));
  return btn;
}

function sectionEl(title, wizardState, stepId) {
  const section = document.createElement("section");
  section.className = "rv-section";
  const header = document.createElement("div");
  header.className = "rv-section__header";
  const h3 = document.createElement("h3");
  h3.className = "rv-section__title";
  h3.textContent = title;
  header.appendChild(h3);
  if (stepId) header.appendChild(editBtn(wizardState, stepId));
  section.appendChild(header);
  return section;
}

// ===== Type aanvraag =====
function renderTypeAanvraag(parent, wizardState) {
  const adj = wizardState.getData("adjustmentType") || {};
  const section = sectionEl("Type aanvraag", wizardState, "adjustment-type");
  section.innerHTML += `
    <div class="rv-field-list">
      <div class="rv-field"><span class="rv-field__label">Aanvraag ontslag hoofdelijke aansprakelijkheid (OHA)?</span><span class="rv-field__value rv-field__value--changed">${adj.ontslagHA === "ja" ? "Ja" : adj.ontslagHA === "nee" ? "Nee" : "-"}</span></div>
      <div class="rv-field"><span class="rv-field__label">Aanvraag met verhoging?</span><span class="rv-field__value rv-field__value--changed">${adj.verhoging === "ja" ? "Ja" : adj.verhoging === "nee" ? "Nee" : "-"}</span></div>
    </div>
  `;
  parent.appendChild(section);
}

// ===== Woningwaarde =====
function renderWoningwaarde(parent, wizardState) {
  const customer = wizardState.getData("customer");
  const data = customer && CUSTOMER_DATA[customer.id];
  if (!data) return;
  const house = wizardState.getData("houseData") || data.house;
  const origHouse = data.house;
  const valueChanged = house.value !== origHouse.value;
  const labelChanged = house.energyLabel !== origHouse.energyLabel;
  const section = sectionEl("Woningwaarde", wizardState, "mortgage-adjustment");
  section.innerHTML += `
    <div class="rv-table-wrap">
      <table class="rv-table">
        <thead><tr><th>Adres onderpand</th><th>Woningwaarde</th><th>Energielabel</th></tr></thead>
        <tbody><tr>
          <td>${house.address}</td>
          <td class="num${valueChanged ? " rv-changed" : ""}">${fmt(house.value)}</td>
          <td${labelChanged ? ' class="rv-changed"' : ''}>${house.energyLabel || "-"}</td>
        </tr></tbody>
      </table>
    </div>
  `;
  parent.appendChild(section);
}

// ===== Leningdelen =====
function renderLeningdelen(parent, wizardState) {
  const customer = wizardState.getData("customer");
  const data = customer && CUSTOMER_DATA[customer.id];
  if (!data) return;
  // Use persisted loan parts if available (includes modal edits), otherwise original data
  const loanParts = wizardState.getData("loanParts") || data.loanParts;
  const originals = data.loanParts;
  const section = sectionEl("Leningdelen", wizardState, "mortgage-adjustment");

  function isLoanPartChanged(lp) {
    const orig = originals.find((o) => o.code === lp.code);
    if (!orig) return true; // new part from split
    return lp.principal !== orig.principal || lp.form !== orig.form ||
      lp.fixedPeriod !== orig.fixedPeriod || lp.interest !== orig.interest ||
      lp.endDate !== orig.endDate || lp.box !== orig.box;
  }

  const rows = loanParts.map((lp) => {
    const changed = isLoanPartChanged(lp);
    return `
    <tr${changed ? ' class="rv-changed"' : ''}>
      <td>${lp.code}</td>
      <td class="num">${fmt(lp.principal)}</td>
      <td>${lp.form}</td>
      <td>${lp.fixedPeriod}</td>
      <td class="num">${lp.interest.toFixed(2)}%</td>
      <td>${lp.endDate}</td>
      <td>${lp.box || "-"}</td>
    </tr>`;
  }).join("");
  section.innerHTML += `
    <div class="rv-table-wrap">
      <table class="rv-table">
        <thead><tr>
          <th>Leningdeel</th><th>Restant hoofdsom</th><th>Aflosvorm</th>
          <th>Rentevaste periode</th><th>Percentage</th><th>Einddatum</th><th>Fiscale aftrekbaarheid</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  parent.appendChild(section);
}

// ===== Verzekeringen en rekeningen =====
function renderVerzekeringen(parent, wizardState) {
  const customer = wizardState.getData("customer");
  const data = customer && CUSTOMER_DATA[customer.id];
  if (!data) return;
  const section = sectionEl("Verzekeringen en rekeningen", wizardState, "mortgage-adjustment");
  const rows = data.products.map((p) => `
    <tr><td>${p.type}</td><td>${p.number}</td><td>${p.change || "-"}</td><td>${p.explanation || "-"}</td></tr>
  `).join("");
  section.innerHTML += `
    <div class="rv-table-wrap">
      <table class="rv-table">
        <thead><tr><th>Gekoppeld product</th><th>Nummer</th><th>Door te voeren wijziging</th><th>Toelichting</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  parent.appendChild(section);
}

// ===== Verhoging =====
function renderVerhoging(parent, wizardState) {
  const increase = wizardState.getData("increase");
  if (!increase) return;
  const section = sectionEl("Verhoging", wizardState, "mortgage-adjustment");

  let html = `<div class="rv-field-list">
    <div class="rv-field"><span class="rv-field__label">Onderhandse akte?</span><span class="rv-field__value rv-field__value--changed">${increase.onderhands === "ja" ? "Ja" : increase.onderhands === "nee" ? "Nee" : "-"}</span></div>
    <div class="rv-field"><span class="rv-field__label">NHG?</span><span class="rv-field__value rv-field__value--changed">${increase.nhg === "met" ? "Ja" : increase.nhg === "zonder" ? "Nee" : "-"}</span></div>
  </div>`;

  if (increase.calculated) {
    const kosten = (increase.hypotheekkosten || []).reduce((s, k) => s + (k.amount || 0), 0);
    const total = (increase.uitkoopBedrag || 0) + kosten - (increase.eigenInleg || 0);
    html += `
      <div class="rv-calc-box">
        <h4 class="rv-calc-box__title">Totaal verhogingsbedrag</h4>
        <div class="rv-calc-row"><span>Uitkoop ex-partner</span><span class="num">${fmt(increase.uitkoopBedrag)}</span></div>
        <div class="rv-calc-row"><span>Overige kosten</span><span class="num">${fmt(kosten)}</span></div>
        <div class="rv-calc-row rv-calc-row--sub"><span>Eigen inleg</span><span class="num">- ${fmt(increase.eigenInleg)}</span></div>
        <div class="rv-calc-row rv-calc-row--total"><span>Totaal</span><span class="num">${fmt(total)}</span></div>
      </div>
    `;

    // New loan parts
    if (increase.newLoanParts && increase.newLoanParts.length > 0) {
      html += `<h4 class="rv-subsection-title">Nieuwe lening</h4>`;
      const lpRows = increase.newLoanParts.map((lp, i) => `
        <tr class="rv-changed">
          <td>Nieuw</td>
          <td class="num">${fmt(lp.amount)}</td>
          <td>${lp.form || "-"}</td>
          <td>${lp.fixedPeriod ? lp.fixedPeriod + " jaar" : "-"}</td>
          <td>-</td>
          <td>${lp.passDate || "-"}</td>
          <td>${lp.box === "box1" ? "Box 1" : lp.box === "box3" ? "Box 3" : "-"}</td>
        </tr>
      `).join("");
      html += `
        <div class="rv-table-wrap">
          <table class="rv-table">
            <thead><tr><th>Leningdeel</th><th>Restant hoofdsom</th><th>Aflosvorm</th><th>Rentevaste periode</th><th>Percentage</th><th>Einddatum</th><th>Fiscale aftrekbaarheid</th></tr></thead>
            <tbody>${lpRows}</tbody>
          </table>
        </div>
      `;

      const totalAlloc = increase.newLoanParts.reduce((s, p) => s + (p.amount || 0), 0);
      const box1 = increase.newLoanParts.filter((p) => p.box === "box1").reduce((s, p) => s + (p.amount || 0), 0);
      const box3 = increase.newLoanParts.filter((p) => p.box === "box3").reduce((s, p) => s + (p.amount || 0), 0);
      html += `
        <div class="rv-loan-summary">
          <div class="rv-loan-summary__item rv-loan-summary__item--total"><span>Totaal nieuwe lening</span><strong>${fmt(totalAlloc)}</strong></div>
          <div class="rv-loan-summary__item"><span>Box 1</span><span>${fmt(box1)}</span></div>
          <div class="rv-loan-summary__item"><span>Box 3</span><span>${fmt(box3)}</span></div>
        </div>
      `;
    }
  }

  section.innerHTML += html;
  parent.appendChild(section);
}

// ===== Hypotheekgevers =====
function renderHypotheekgevers(parent, wizardState) {
  const details = wizardState.getData("fillDetails");
  if (!details) return;
  const section = sectionEl("Hypotheekgevers", wizardState, "fill-details");

  const onMortgage = details.persons.filter((p) => p.checked).map((p) => p.name);
  const notOnMortgage = details.persons.filter((p) => !p.checked).map((p) => p.name);

  let html = "";
  if (onMortgage.length) {
    html += `<p class="rv-info-line">Met name schrift op de lening:</p>`;
    onMortgage.forEach((n) => { html += `<p class="rv-info-value">${n}</p>`; });
  }
  if (notOnMortgage.length) {
    html += `<p class="rv-info-line" style="margin-top: 0.75rem;">Niet meer actief op de lening:</p>`;
    notOnMortgage.forEach((n) => { html += `<p class="rv-info-value rv-inactive">${n}</p>`; });
  }

  section.innerHTML += html;
  parent.appendChild(section);
}

// ===== Person cards =====
function renderPersonCards(parent, wizardState) {
  const details = wizardState.getData("fillDetails");
  if (!details) return;

  details.persons.filter((p) => p.checked).forEach((person) => {
    const section = sectionEl(person.name, wizardState, "fill-details");

    let html = `<h4 class="rv-card-subtitle">Gegevens</h4>
      <div class="rv-field-list">
        <div class="rv-field"><span class="rv-field__label">Burgerlijke staat vóór beëindiging relatie</span><span class="rv-field__value rv-field__value--changed">${person.burgStaatVoor || "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Burgerlijke staat nieuwe situatie</span><span class="rv-field__value rv-field__value--changed">${person.burgStaatNieuw || "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Verwachte datum uit elkaar gaan</span><span class="rv-field__value rv-field__value--changed">${person.datumUitElkaar || "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Aantal inwonende kinderen tot 21 jaar</span><span class="rv-field__value rv-field__value--changed">${person.kinderen || 0}</span></div>
      </div>

      <h4 class="rv-card-subtitle">Vermogen</h4>
      <div class="rv-field-list">
        <div class="rv-field"><span class="rv-field__label">Geld op spaarrekening(en)</span><span class="rv-field__value rv-field__value--changed">${fmt(person.spaargeld)}</span></div>
        <div class="rv-field"><span class="rv-field__label">Andere aandelen</span><span class="rv-field__value rv-field__value--changed">${person.andereAandelen || "-"}</span></div>
      </div>

      <h4 class="rv-card-subtitle">Inkomensgegevens</h4>`;

    if (person.incomes && person.incomes.length > 0) {
      html += `<div class="rv-table-wrap"><table class="rv-table"><thead><tr>
        <th>Soort inkomen</th><th>Naam bedrijf</th><th>Bruto jaarbedrag</th><th>Datum in dienst</th><th>Einddatum</th>
      </tr></thead><tbody>`;
      person.incomes.forEach((inc) => {
        html += `<tr>
          <td class="rv-changed">${inc.type || "-"}</td>
          <td class="rv-changed">${inc.bedrijf || "-"}</td>
          <td class="num rv-changed">${fmt(inc.bruto)}</td>
          <td class="rv-changed">${inc.datumInDienst || "-"}</td>
          <td class="rv-changed">${inc.einddatum || "-"}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
    }

    html += `<h4 class="rv-card-subtitle">Financiële verplichtingen</h4>
      <div class="rv-field-list">
        <div class="rv-field"><span class="rv-field__label">BKR-registraties</span><span class="rv-field__value rv-field__value--changed">${person.bkr === "ja" ? "Ja" : person.bkr === "nee" ? "Nee" : "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">DUO-schuld/studielening</span><span class="rv-field__value rv-field__value--changed">${person.duoSchuld === "ja" ? "Ja" : person.duoSchuld === "nee" ? "Nee" : "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Familielening/schuld aan derden</span><span class="rv-field__value rv-field__value--changed">${person.familielening === "ja" ? "Ja" : person.familielening === "nee" ? "Nee" : "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Partneralimentatie</span><span class="rv-field__value rv-field__value--changed">${person.alimentatie === "ja" ? "Ja" : person.alimentatie === "nee" ? "Nee" : "-"}</span></div>
      </div>`;

    section.innerHTML += html;
    parent.appendChild(section);
  });
}

// ===== Co-debtor =====
function renderCoDebtor(parent, wizardState) {
  const details = wizardState.getData("fillDetails");
  if (!details || details.medeschuldenaar !== "ja") return;
  const cd = details.coDebtor;
  if (!cd) return;

  const fullName = [cd.voorletters, cd.tussenvoegsel, cd.achternaam].filter(Boolean).join(" ");
  const section = sectionEl(`Nieuwe medeschuldenaar - ${fullName || "Onbekend"}`, wizardState, "fill-details");

  let html = `<h4 class="rv-card-subtitle">Gegevens</h4>
    <div class="rv-field-list">
      <div class="rv-field"><span class="rv-field__label">Naam</span><span class="rv-field__value rv-field__value--changed">${fullName || "-"}</span></div>
      <div class="rv-field"><span class="rv-field__label">Geboortedatum</span><span class="rv-field__value rv-field__value--changed">${cd.geboortedatum || "-"}</span></div>
      <div class="rv-field"><span class="rv-field__label">Burgerlijke staat</span><span class="rv-field__value rv-field__value--changed">${cd.burgStaat || "-"}</span></div>
      <div class="rv-field"><span class="rv-field__label">Aantal inwonende kinderen tot 21 jaar</span><span class="rv-field__value rv-field__value--changed">${cd.kinderen || 0}</span></div>
    </div>

    <h4 class="rv-card-subtitle">Vermogen</h4>
    <div class="rv-field-list">
      <div class="rv-field"><span class="rv-field__label">Geld op spaarrekening(en)</span><span class="rv-field__value rv-field__value--changed">${fmt(cd.spaargeld)}</span></div>
      <div class="rv-field"><span class="rv-field__label">Onroerende goederen</span><span class="rv-field__value rv-field__value--changed">${cd.onroerendGoed || "-"}</span></div>
    </div>

    <h4 class="rv-card-subtitle">Inkomensgegevens</h4>`;

  if (cd.incomes && cd.incomes.length > 0) {
    html += `<div class="rv-table-wrap"><table class="rv-table"><thead><tr>
      <th>Soort inkomen</th><th>Bruto jaarbedrag</th></tr></thead><tbody>`;
    cd.incomes.forEach((inc) => {
      html += `<tr><td class="rv-changed">${inc.type || "-"}</td><td class="num rv-changed">${fmt(inc.bruto)}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }

  html += `<h4 class="rv-card-subtitle">Financiële verplichtingen</h4>
    <div class="rv-field-list">
        <div class="rv-field"><span class="rv-field__label">BKR-registraties</span><span class="rv-field__value rv-field__value--changed">${cd.bkr === "ja" ? "Ja" : cd.bkr === "nee" ? "Nee" : "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">DUO-schuld/studielening</span><span class="rv-field__value rv-field__value--changed">${cd.duoSchuld === "ja" ? "Ja" : cd.duoSchuld === "nee" ? "Nee" : "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Familielening/schuld aan derden</span><span class="rv-field__value rv-field__value--changed">${cd.familielening === "ja" ? "Ja" : cd.familielening === "nee" ? "Nee" : "-"}</span></div>
        <div class="rv-field"><span class="rv-field__label">Partneralimentatie</span><span class="rv-field__value rv-field__value--changed">${cd.alimentatie === "ja" ? "Ja" : cd.alimentatie === "nee" ? "Nee" : "-"}</span></div>
    </div>`;

  section.innerHTML += html;
  parent.appendChild(section);
}

// ===== Bijzonderheden =====
function renderBijzonderheden(parent, wizardState) {
  const details = wizardState.getData("fillDetails");
  if (!details) return;
  const section = sectionEl("Bijzonderheden", wizardState, "fill-details");
  section.innerHTML += `
    <div class="rv-field-list">
      <div class="rv-field"><span class="rv-field__label">Past binnen annulaïre toets</span><span class="rv-field__value rv-field__value--changed">${details.annulaireToets === "ja" ? "Ja" : details.annulaireToets === "nee" ? "Nee" : "-"}</span></div>
    </div>
    ${details.extraInfo ? `<p class="rv-info-line" style="margin-top: 0.5rem;">Toelichting:</p><p class="rv-info-value">${details.extraInfo}</p>` : ""}
  `;
  parent.appendChild(section);
}

// ===== Contactinformatie =====
function renderContactInfo(parent, wizardState) {
  const section = document.createElement("section");
  section.className = "rv-section";
  const h3 = document.createElement("h3");
  h3.className = "rv-section__title";
  h3.textContent = "Contactinformatie";
  section.appendChild(h3);

  const saved = wizardState.getData("contact") || {};

  section.innerHTML += `
    <p class="rv-info-line">Met wie kunnen we contact opnemen als we vragen hebben over de aanvraag?</p>
    <div class="rv-contact-fields">
      <div class="rv-contact-field">
        <label>Contactpersoon</label>
        <input type="text" id="rvContactPerson" value="${saved.person || ""}">
      </div>
      <div class="rv-contact-field">
        <label>Telefoonnummer (optioneel)</label>
        <input type="tel" id="rvContactPhone" value="${saved.phone || ""}">
      </div>
    </div>
  `;

  parent.appendChild(section);

  section.querySelector("#rvContactPerson").addEventListener("input", (e) => {
    const contact = wizardState.getData("contact") || {};
    contact.person = e.target.value;
    wizardState.setData("contact", contact);
  });
  section.querySelector("#rvContactPhone").addEventListener("input", (e) => {
    const contact = wizardState.getData("contact") || {};
    contact.phone = e.target.value;
    wizardState.setData("contact", contact);
  });
}

// ===== Success screen =====
function renderSuccess(container, wizardState) {
  const customer = wizardState.getData("customer");
  container.innerHTML = `
    <div class="rv-success">
      <div class="rv-success__icon">✓</div>
      <h2 class="rv-success__title">Aanvraag verstuurd</h2>
      <p class="rv-success__text">De aanvraag voor hypotheekmutatie${customer ? " (" + customer.loanNumber + ")" : ""} is succesvol verstuurd.</p>
      <p class="rv-success__text">We nemen de aanvraag in behandeling en nemen contact op als er vragen zijn.</p>
      <a href="#" class="btn btn--primary rv-success__btn" id="rvBackToOverview">Terug naar klantoverzicht <span class="btn-arrow">→</span></a>
    </div>
  `;
}

// ===== Main render =====
function render(container, wizardState) {
  container.innerHTML = "";

  const intro = document.createElement("div");
  intro.className = "rv-intro";
  intro.innerHTML = `
    <p>Bekijk alle gegevens. Klopt alles? Verstuur dan de aanvraag.<br>Wil je nog iets aanpassen? Ga terug en pas het aan.</p>
  `;
  container.appendChild(intro);

  renderTypeAanvraag(container, wizardState);
  renderWoningwaarde(container, wizardState);
  renderLeningdelen(container, wizardState);
  renderVerzekeringen(container, wizardState);
  renderVerhoging(container, wizardState);
  renderHypotheekgevers(container, wizardState);
  renderPersonCards(container, wizardState);
  renderCoDebtor(container, wizardState);
  renderBijzonderheden(container, wizardState);
  renderContactInfo(container, wizardState);
}

registerStep("review", {
  render,
  label: "Controleer en verstuur",
  nextLabel: "Aanvraag versturen",
  backLabel: "Terug naar gegevens invullen",
  onSubmit: renderSuccess,
});
