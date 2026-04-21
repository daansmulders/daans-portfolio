import { registerStep } from "../wizard/step-registry.js";
import { openLoanPartModal } from "../components/loan-part-modal.js";

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
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ---- Dummy data per customer ----
export const CUSTOMER_DATA = {
  "HYP-2024-001": {
    house: { address: "393bf746e3faca, 7751DY 79c9b13", value: 450000, energyLabel: null },
    loanParts: [
      { code: "L001", principal: 235754.76, form: "Annuïtair", fixedPeriod: "10 jaar (01-03-2027)", interest: 3.20, endDate: "01-03-2054", box: null },
      { code: "L002", principal: 47036.43, form: "Annuïtair", fixedPeriod: "10 jaar (01-03-2027)", interest: 3.20, endDate: "01-03-2054", box: null },
    ],
    products: [{ type: "Bankspaarrekening", number: "NL12NNNN0123456789", change: "", explanation: "" }],
  },
  "HYP-2024-002": {
    house: { address: "Keizersgracht 104-II, 1015 AA Amsterdam", value: 310000, energyLabel: "C" },
    loanParts: [
      { code: "L001", principal: 137500.00, form: "Lineair", fixedPeriod: "15 jaar (01-06-2030)", interest: 2.85, endDate: "01-06-2049", box: "Box 1" },
      { code: "L002", principal: 137500.00, form: "Lineair", fixedPeriod: "15 jaar (01-06-2030)", interest: 2.85, endDate: "01-06-2049", box: "Box 1" },
    ],
    products: [{ type: "Overlijdensrisicoverzekering", number: "ORV-2024-5582", change: "", explanation: "" }],
  },
  "HYP-2024-003": {
    house: { address: "Prinsengracht 263-B, 1016 GV Amsterdam", value: 460000, energyLabel: "A" },
    loanParts: [
      { code: "L001", principal: 150000.00, form: "Annuïtair", fixedPeriod: "20 jaar (15-09-2035)", interest: 2.60, endDate: "15-09-2053", box: "Box 1" },
      { code: "L002", principal: 150000.00, form: "Annuïtair", fixedPeriod: "20 jaar (15-09-2035)", interest: 2.60, endDate: "15-09-2053", box: "Box 1" },
      { code: "L003", principal: 60000.00, form: "Aflossingsvrij", fixedPeriod: "10 jaar (15-09-2025)", interest: 3.10, endDate: "15-09-2053", box: null },
      { code: "L004", principal: 50000.00, form: "Aflossingsvrij", fixedPeriod: "10 jaar (15-09-2025)", interest: 3.10, endDate: "15-09-2053", box: "Box 3" },
    ],
    products: [
      { type: "Bankspaarrekening", number: "NL88NNNN0987654321", change: "", explanation: "" },
      { type: "Overlijdensrisicoverzekering", number: "ORV-2024-9901", change: "", explanation: "" },
    ],
  },
};

// Mutable state — set per render based on selected customer
let HOUSE_DATA = null;
let EXISTING_LOAN_PARTS = [];
let EXISTING_PRODUCTS = [];

const COST_TYPES = [
  "Notariskosten",
  "Advieskosten",
  "Borgtochtprovisie NHG",
  "Hypotheekaktekosten",
  "Omzettingskosten",
  "Taxatiekosten",
  "Verbouwing",
  "Overig",
];

const REPAYMENT_FORMS = ["Annuïtair", "Lineair", "Aflossingsvrij"];
const FIXED_RATE_PERIODS = [5, 10, 15, 20, 25, 30];

const ENERGY_LABELS = ["A++++", "A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"];

// ===== Section 1: Woningwaarde =====
function renderSection1(parent, wizardState) {
  const section = document.createElement("section");
  section.className = "adj-section";

  function buildSection() {
    section.innerHTML = `
      <h3 class="adj-section__title">Woningwaarde</h3>
      <p class="adj-section__desc">Vul de nieuwe waarde en het energielabel in.</p>
      <div class="adj-table-wrap">
        <table class="adj-table">
          <thead>
            <tr>
              <th>Adres onderpand</th>
              <th>Woningwaarde</th>
              <th>Energielabel <span class="info-icon">ⓘ</span></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${HOUSE_DATA.address}</td>
              <td class="num">${fmt(HOUSE_DATA.value)}</td>
              <td>${HOUSE_DATA.energyLabel
                ? HOUSE_DATA.energyLabel
                : '<span class="tag tag--warning">Vul energielabel in</span>'
              }</td>
              <td><button type="button" class="btn-table-action" id="editWoning">✏ Aanpassen</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    section.querySelector("#editWoning").addEventListener("click", () => {
      openWoningModal(HOUSE_DATA, {
        onSave(updated) {
          HOUSE_DATA.value = updated.value;
          HOUSE_DATA.energyLabel = updated.energyLabel;
          wizardState.setData("houseData", { ...HOUSE_DATA });
          buildSection();
        },
      });
    });
  }

  buildSection();
  parent.appendChild(section);
}

function openWoningModal(house, { onSave }) {
  let draft = { value: house.value, energyLabel: house.energyLabel || "" };

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);

  const modal = document.createElement("div");
  modal.className = "modal";
  document.body.appendChild(modal);

  const labelOptions = ENERGY_LABELS.map(
    (l) => `<option value="${l}" ${draft.energyLabel === l ? "selected" : ""}>${l}</option>`
  ).join("");

  modal.innerHTML = `
    <div class="modal__header">
      <h2 class="modal__title">Woningwaarde aanpassen</h2>
      <button type="button" class="modal__close" aria-label="Sluiten">&times;</button>
    </div>
    <div class="modal__body">
      <div class="modal__fields">
        <div class="modal__field">
          <label>Adres onderpand</label>
          <p class="modal__field-static">${house.address}</p>
        </div>
        <div class="modal__field">
          <label>Woningwaarde</label>
          <div class="euro-input">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" id="wmValue" value="${draft.value ? draft.value.toLocaleString("nl-NL") : ""}">
          </div>
        </div>
        <div class="modal__field">
          <label>Energielabel</label>
          <select id="wmLabel"><option value="">- Kies energielabel -</option>${labelOptions}</select>
        </div>
      </div>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn btn--primary" id="wmSave">Opslaan</button>
      <button type="button" class="btn btn--secondary" id="wmCancel">Annuleren</button>
    </div>
  `;

  const valueInput = modal.querySelector("#wmValue");
  valueInput.addEventListener("focus", () => { valueInput.value = draft.value || ""; });
  valueInput.addEventListener("input", () => {
    draft.value = parseInt(valueInput.value.replace(/[^0-9]/g, ""), 10) || 0;
  });
  valueInput.addEventListener("blur", () => {
    valueInput.value = draft.value ? draft.value.toLocaleString("nl-NL") : "";
  });

  modal.querySelector("#wmLabel").addEventListener("change", (e) => {
    draft.energyLabel = e.target.value;
  });

  function close() {
    modal.remove();
    overlay.remove();
  }

  modal.querySelector(".modal__close").addEventListener("click", close);
  modal.querySelector("#wmCancel").addEventListener("click", close);
  overlay.addEventListener("click", close);

  modal.querySelector("#wmSave").addEventListener("click", () => {
    onSave(draft);
    close();
  });
}

// ===== Section 2: Leningdelen =====
function renderSection2(parent, wizardState) {
  const section = document.createElement("section");
  section.className = "adj-section";

  function buildTable() {
    const rows = EXISTING_LOAN_PARTS.map(
      (lp, idx) => `
      <tr>
        <td><strong>${lp.code}</strong></td>
        <td class="num">${fmt(lp.principal)}</td>
        <td>${lp.form}</td>
        <td>${lp.fixedPeriod}</td>
        <td class="num">${lp.interest.toFixed(2)}%</td>
        <td>${lp.endDate}</td>
        <td>${lp.box ? lp.box : '<span class="tag tag--warning">Box 1 of box 3?</span>'}</td>
        <td><button type="button" class="btn-table-action" data-lp-idx="${idx}">✏ Aanpassen</button></td>
      </tr>`
    ).join("");

    section.innerHTML = `
      <h3 class="adj-section__title">Leningdelen</h3>
      <p class="adj-section__desc">Pas een leningdeel aan of splits het.</p>
      <div class="adj-table-wrap">
        <table class="adj-table">
          <thead>
            <tr>
              <th>Leningdeel</th>
              <th>Restant hoofdsom</th>
              <th>Aflosvorm</th>
              <th>Rentevaste periode</th>
              <th>Percentage</th>
              <th>Einddatum</th>
              <th>Fiscale aftrekbaarheid <span class="info-icon">ⓘ</span></th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    section.querySelectorAll(".btn-table-action[data-lp-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.lpIdx, 10);
        const lp = EXISTING_LOAN_PARTS[idx];
        openLoanPartModal(lp, {
          onSave(result) {
            if (result.action === "update") {
              EXISTING_LOAN_PARTS[idx] = result.updated;
            } else if (result.action === "split") {
              EXISTING_LOAN_PARTS.splice(idx, 1, ...result.parts);
            }
            wizardState.setData("loanParts", EXISTING_LOAN_PARTS.map((p) => ({ ...p })));
            buildTable();
          },
          onCancel() {},
        });
      });
    });
  }

  buildTable();
  parent.appendChild(section);
}

// ===== Section 3: Verzekeringen of rekeningen =====
function renderSection3(parent) {
  const section = document.createElement("section");
  section.className = "adj-section";
  const rows = EXISTING_PRODUCTS.map(
    (p) => `
    <tr>
      <td>${p.type}</td>
      <td>${p.number}</td>
      <td>${p.change || "-"}</td>
      <td>${p.explanation || "-"}</td>
      <td><button type="button" class="btn-table-action">✏ Aanpassen</button></td>
    </tr>`
  ).join("");

  section.innerHTML = `
    <h3 class="adj-section__title">Verzekeringen of rekeningen</h3>
    <div class="adj-table-wrap">
      <table class="adj-table">
        <thead>
          <tr>
            <th>Gekoppeld product</th>
            <th>Nummer</th>
            <th>Door te voeren wijziging</th>
            <th>Toelichting</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  parent.appendChild(section);
}

// ===== Section 4: Verhoging =====
function renderSection4(parent, wizardState) {
  const section = document.createElement("section");
  section.className = "adj-section";
  section.innerHTML = `<h3 class="adj-section__title">Verhoging</h3>`;

  let state = wizardState.getData("increase") || {
    onderhands: null,
    nhg: null,
    uitkoopBedrag: 0,
    hypotheekkosten: [],
    eigenInleg: 0,
    calculated: false,
    newLoanParts: [{ id: 0, amount: 0, form: "", passDate: "", durationType: "months", months: "", endDate: "", fixedPeriod: "", box: null, renteaftrekEnd: "", collapsed: false }],
  };
  let nextCostId = state.hypotheekkosten.reduce((max, c) => Math.max(max, c.id + 1), 0);
  let nextPartId = state.newLoanParts.reduce((max, p) => Math.max(max, p.id + 1), 0);

  function save() { wizardState.setData("increase", JSON.parse(JSON.stringify(state))); }
  function totalKosten() { return state.hypotheekkosten.reduce((s, k) => s + (k.amount || 0), 0); }
  function totalIncrease() { return (state.uitkoopBedrag || 0) + totalKosten() - (state.eigenInleg || 0); }

  // ---- Radio questions ----
  const radioWrap = document.createElement("div");
  radioWrap.className = "form-section";

  function renderRadios() {
    radioWrap.innerHTML = `
      <fieldset class="radio-group">
        <legend class="radio-group__legend">Past de verhoging binnen de huidige inschrijving (onderhandse akte)?</legend>
        <div class="radio-group__options">
          <label class="radio-option">
            <input type="radio" name="onderhands" value="nee" ${state.onderhands === "nee" ? "checked" : ""}>
            <span>Nee</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="onderhands" value="ja" ${state.onderhands === "ja" ? "checked" : ""}>
            <span>Ja, onderhands</span>
          </label>
        </div>
        <div class="info-box ${state.onderhands === "ja" ? "" : "info-box--hidden"}" id="onderhandsInfo">
          <span class="info-box__icon">ⓘ</span>
          <span>Het is nu niet mogelijk om de verhoging zonder notaris af te sluiten. Blijkt na controle dat de verhoging binnen de inschrijving past? Dan betalen wij de notariskosten.</span>
        </div>
      </fieldset>
      <fieldset class="radio-group">
        <legend class="radio-group__legend">Is de verhoging met NHG?</legend>
        <div class="radio-group__options">
          <label class="radio-option">
            <input type="radio" name="nhg" value="zonder" ${state.nhg === "zonder" ? "checked" : ""}>
            <span>Nee</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="nhg" value="met" ${state.nhg === "met" ? "checked" : ""}>
            <span>Ja, met NHG</span>
          </label>
        </div>
      </fieldset>
    `;

    radioWrap.querySelectorAll('input[name="onderhands"]').forEach((r) =>
      r.addEventListener("change", () => {
        state.onderhands = r.value;
        save();
        document.getElementById("onderhandsInfo").classList.toggle("info-box--hidden", state.onderhands !== "ja");
      })
    );
    radioWrap.querySelectorAll('input[name="nhg"]').forEach((r) =>
      r.addEventListener("change", () => { state.nhg = r.value; save(); })
    );
  }
  renderRadios();
  section.appendChild(radioWrap);

  // ---- Verhogingsbedrag heading ----
  const verhogingHeading = document.createElement("h4");
  verhogingHeading.className = "adj-subsection__title";
  verhogingHeading.textContent = "Verhogingsbedrag";
  section.appendChild(verhogingHeading);

  // ---- Cost inputs ----
  const costsWrap = document.createElement("div");
  costsWrap.className = "increase-costs";

  function renderCosts() {
    costsWrap.innerHTML = "";

    // Uitkoop ex-partner
    const uitkoopEl = document.createElement("div");
    uitkoopEl.className = "cost-field";
    uitkoopEl.innerHTML = `
      <label class="cost-field__label">Uitkoop ex-partner</label>
      <div class="euro-input">
        <span class="euro-input__symbol">&euro;</span>
        <input type="text" inputmode="numeric" value="${state.uitkoopBedrag ? state.uitkoopBedrag.toLocaleString("nl-NL") : ""}">
      </div>
    `;
    const uitkoopInput = uitkoopEl.querySelector("input");
    uitkoopInput.addEventListener("focus", () => { uitkoopInput.value = state.uitkoopBedrag || ""; });
    uitkoopInput.addEventListener("input", () => {
      state.uitkoopBedrag = parseInt(uitkoopInput.value.replace(/[^0-9]/g, ""), 10) || 0;
      save();
    });
    uitkoopInput.addEventListener("blur", () => {
      uitkoopInput.value = state.uitkoopBedrag ? state.uitkoopBedrag.toLocaleString("nl-NL") : "";
    });
    costsWrap.appendChild(uitkoopEl);

    // ---- Hypotheekkosten ----
    const hkSection = document.createElement("div");
    hkSection.className = "hk-section";

    // Header row with column labels
    if (state.hypotheekkosten.length > 0) {
      const hkLabels = document.createElement("div");
      hkLabels.className = "hk-labels";
      hkLabels.innerHTML = `
        <span class="hk-labels__title">Hypotheekkosten</span>
        <span class="hk-labels__col">Type</span>
        <span class="hk-labels__col">Omschrijving</span>
      `;
      hkSection.appendChild(hkLabels);
    } else {
      const hkTitle = document.createElement("span");
      hkTitle.className = "hk-title-only";
      hkTitle.textContent = "Hypotheekkosten";
      hkSection.appendChild(hkTitle);
    }

    // Cost rows
    state.hypotheekkosten.forEach((cost) => {
      const row = document.createElement("div");
      row.className = "hk-row";

      const options = COST_TYPES.map(
        (t) => `<option value="${t}" ${cost.type === t ? "selected" : ""}>${t}</option>`
      ).join("");

      row.innerHTML = `
        <div class="euro-input">
          <span class="euro-input__symbol">&euro;</span>
          <input type="text" inputmode="numeric" value="${cost.amount ? cost.amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 }) : ""}">
        </div>
        <select class="hk-select"><option value="">Kies type...</option>${options}</select>
        ${cost.type === "Overig"
          ? '<input type="text" class="hk-desc" placeholder="Omschrijving" value="' + (cost.description || "") + '">'
          : '<span class="hk-desc-placeholder"></span>'}
        <button type="button" class="btn-remove-text" title="Verwijderen">&times;</button>
      `;

      row.querySelector("input").addEventListener("focus", (e) => { e.target.value = cost.amount || ""; });
      row.querySelector("input").addEventListener("input", (e) => {
        cost.amount = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0; save();
      });
      row.querySelector("input").addEventListener("blur", (e) => {
        e.target.value = cost.amount ? cost.amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 }) : "";
      });
      row.querySelector("select").addEventListener("change", (e) => {
        cost.type = e.target.value; save(); renderCosts();
      });
      if (row.querySelector(".hk-desc")) {
        row.querySelector(".hk-desc").addEventListener("input", (e) => { cost.description = e.target.value; save(); });
      }
      row.querySelector(".btn-remove-text").addEventListener("click", () => {
        state.hypotheekkosten = state.hypotheekkosten.filter((c) => c.id !== cost.id);
        save(); renderCosts();
      });

      hkSection.appendChild(row);
    });

    // Add button
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-tertiary-bordered";
    addBtn.textContent = "+ Kosten toevoegen";
    addBtn.addEventListener("click", () => {
      state.hypotheekkosten.push({ id: nextCostId++, type: "", amount: 0, description: "" });
      save(); renderCosts();
    });
    hkSection.appendChild(addBtn);

    costsWrap.appendChild(hkSection);

    // Eigen inleg
    const eigenEl = document.createElement("div");
    eigenEl.className = "cost-field";
    eigenEl.innerHTML = `
      <label class="cost-field__label">Eigen inleg</label>
      <div class="euro-input">
        <span class="euro-input__symbol">&euro;</span>
        <input type="text" inputmode="numeric" value="${state.eigenInleg ? state.eigenInleg.toLocaleString("nl-NL") : ""}">
      </div>
    `;
    const eigenInput = eigenEl.querySelector("input");
    eigenInput.addEventListener("focus", () => { eigenInput.value = state.eigenInleg || ""; });
    eigenInput.addEventListener("input", () => {
      state.eigenInleg = parseInt(eigenInput.value.replace(/[^0-9]/g, ""), 10) || 0; save();
    });
    eigenInput.addEventListener("blur", () => {
      eigenInput.value = state.eigenInleg ? state.eigenInleg.toLocaleString("nl-NL") : "";
    });
    costsWrap.appendChild(eigenEl);

    // Calculate button
    const calcBtn = document.createElement("button");
    calcBtn.type = "button";
    calcBtn.className = "btn-calc";
    calcBtn.innerHTML = `Bereken verhogingsbedrag`;
    let hasScrolled = state.calculated;
    calcBtn.addEventListener("click", () => {
      state.calculated = true;
      if (state.newLoanParts.length === 1 && state.newLoanParts[0].amount === 0) {
        state.newLoanParts[0].amount = totalIncrease();
      }
      save();
      renderCalc();
      if (!hasScrolled) {
        hasScrolled = true;
        partsEl.style.display = "none";
        setTimeout(() => {
          partsEl.style.display = "";
          renderNewParts();
          calcEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1000);
      } else {
        renderNewParts();
      }
    });
    costsWrap.appendChild(calcBtn);
  }

  section.appendChild(costsWrap);
  renderCosts();

  // ---- Calculation result ----
  const calcEl = document.createElement("div");
  calcEl.className = "calc-result";
  section.appendChild(calcEl);

  function renderCalc() {
    if (!state.calculated) { calcEl.innerHTML = ""; return; }
    const kosten = totalKosten();
    const total = totalIncrease();
    calcEl.innerHTML = `
      <div class="calc-result__box">
        <h4 class="calc-result__title">Totaal verhogingsbedrag</h4>
        <div class="calc-result__row">
          <span>Uitkoop ex-partner</span><span class="num">${fmt(state.uitkoopBedrag || 0)}</span>
        </div>
        <div class="calc-result__row">
          <span>Overige kosten</span><span class="num">${fmt(kosten)}</span>
        </div>
        <div class="calc-result__row calc-result__row--sub">
          <span>Eigen inleg</span><span class="num">- ${fmt(state.eigenInleg || 0)}</span>
        </div>
        <div class="calc-result__row calc-result__row--total">
          <span>Totaal</span><span class="num">${fmt(total)}</span>
        </div>
      </div>
    `;
  }

  // ---- New loan parts (collapsible) ----
  const partsEl = document.createElement("div");
  partsEl.className = "new-parts";
  section.appendChild(partsEl);

  function renderNewParts() {
    if (!state.calculated) { partsEl.innerHTML = ""; return; }
    const total = totalIncrease();
    partsEl.innerHTML = `
      <h3 class="new-parts__title">Verdeel het verhogingsbedrag over leningdelen</h3>
      <div id="npRows"></div>
      <button type="button" class="btn-tertiary-bordered" id="addNpBtn">+ Leningdeel toevoegen</button>
      <div class="new-parts__summary" id="npSummary"></div>
    `;

    const rowsEl = partsEl.querySelector("#npRows");
    const summaryEl = partsEl.querySelector("#npSummary");

    function recalcFirstPart() {
      if (state.newLoanParts.length === 0) return;
      if (state.newLoanParts.length === 1) {
        state.newLoanParts[0].amount = totalIncrease();
        save();
        return;
      }
      const total = totalIncrease();
      const othersSum = state.newLoanParts.slice(1).reduce((s, p) => s + (p.amount || 0), 0);
      state.newLoanParts[0].amount = Math.max(0, total - othersSum);
      save();
    }

    function updateInlineErrors() {
      const total = totalIncrease();
      const totalAlloc = state.newLoanParts.reduce((s, p) => s + (p.amount || 0), 0);
      const excess = totalAlloc - total;
      const errorEls = rowsEl.querySelectorAll("[data-amount-error]");
      // Find the last part with an amount > 0 (the one being edited)
      let lastWithAmount = -1;
      if (excess > 0) {
        for (let i = state.newLoanParts.length - 1; i >= 0; i--) {
          if (state.newLoanParts[i].amount > 0) { lastWithAmount = i; break; }
        }
      }
      errorEls.forEach((el, i) => {
        const euroInput = el.previousElementSibling;
        if (i === lastWithAmount) {
          el.textContent = `Het totaal van de leningdelen is hoger dan het verhogingsbedrag`;
          el.style.display = "block";
          if (euroInput) euroInput.style.borderColor = "#c83c00";
        } else if (state.newLoanParts[i] && !state.newLoanParts[i].amount && state.newLoanParts[i]._showZeroError) {
          el.textContent = `Vul een bedrag in`;
          el.style.display = "block";
          if (euroInput) euroInput.style.borderColor = "#c83c00";
        } else {
          el.textContent = "";
          el.style.display = "none";
          if (euroInput) euroInput.style.borderColor = "";
        }
      });
    }

    function updateSummary() {
      const totalAlloc = state.newLoanParts.reduce((s, p) => s + (p.amount || 0), 0);
      const box1 = state.newLoanParts.filter((p) => p.box === "box1").reduce((s, p) => s + (p.amount || 0), 0);
      const box3 = state.newLoanParts.filter((p) => p.box === "box3").reduce((s, p) => s + (p.amount || 0), 0);
      summaryEl.innerHTML = `
        <div class="np-summary__item np-summary__item--total">
          <span class="np-summary__label">Totaal nieuwe lening</span>
          <span class="np-summary__value">${fmt(totalAlloc)}</span>
        </div>
        <div class="np-summary__item">
          <span class="np-summary__label">Box 1</span>
          <span class="np-summary__value">${fmt(box1)}</span>
        </div>
        <div class="np-summary__item">
          <span class="np-summary__label">Box 3</span>
          <span class="np-summary__value">${fmt(box3)}</span>
        </div>
      `;
    }

    state.newLoanParts.forEach((part, index) => {
      const card = document.createElement("div");
      card.className = "np-card" + (part.collapsed ? " np-card--collapsed" : "");

      const formOptions = REPAYMENT_FORMS.map(
        (f) => `<option value="${f}" ${part.form === f ? "selected" : ""}>${f}</option>`
      ).join("");
      const fixedOptions = FIXED_RATE_PERIODS.map(
        (p) => `<option value="${p}" ${part.fixedPeriod == p ? "selected" : ""}>${p} jaar</option>`
      ).join("");

      card.innerHTML = `
        <div class="np-card__header">
          <div>
            <span class="np-card__title">Nieuw leningdeel ${index + 1}</span>
            ${part.collapsed && part.amount ? '<span class="np-card__collapsed-amount">' + fmt(part.amount) + '</span>' : ""}
          </div>
          <button type="button" class="np-card__toggle" aria-label="Toggle">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="${part.collapsed ? "M5 7.5L10 12.5L15 7.5" : "M5 12.5L10 7.5L15 12.5"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div class="np-card__body" ${part.collapsed ? 'style="display:none"' : ""}>
          <div class="np-card__fields">
            <div class="np-field">
              <label>Hoofdsom</label>
              <div class="euro-input">
                <span class="euro-input__symbol">&euro;</span>
                <input type="text" inputmode="numeric" data-field="amount" value="${(part.amount != null ? part.amount : 0).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}" ${index === 0 && state.newLoanParts.length > 1 ? 'readonly style="background:#f5f5f5;color:#666;"' : ""}>
              </div>
              <div class="np-field__error" data-amount-error></div>
            </div>
            <div class="np-field">
              <label>Hypotheekvorm</label>
              <select data-field="form"><option value="">Kies...</option>${formOptions}</select>
            </div>
            <div class="np-field np-field--full">
              <label>Verwachte passeerdatum</label>
              <input type="date" data-field="passDate" value="${part.passDate || ""}">
            </div>
            <div class="np-field">
              <label>Looptijd</label>
              <select data-field="durationType">
                <option value="months" ${part.durationType === "months" ? "selected" : ""}>Looptijd in maanden</option>
                <option value="enddate" ${part.durationType === "enddate" ? "selected" : ""}>Einddatum</option>
              </select>
            </div>
            <div class="np-field">
              ${part.durationType === "enddate"
                ? '<label>Einddatum</label><input type="date" data-field="endDate" value="' + (part.endDate || "") + '">'
                : '<label>Aantal maanden</label><input type="text" inputmode="numeric" data-field="months" value="' + (part.months || "360") + '">'}
            </div>
            <div class="np-field np-field--full">
              <label>Rentevaste periode</label>
              <select data-field="fixedPeriod"><option value="">Kies...</option>${fixedOptions}</select>
            </div>
            <div class="np-field">
              <label>Fiscale aftrekbaarheid</label>
              <div class="radio-group--inline">
                <label class="radio-option">
                  <input type="radio" name="box_${part.id}" value="box1" ${part.box === "box1" ? "checked" : ""}>
                  <span>Box 1</span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="box_${part.id}" value="box3" ${part.box === "box3" ? "checked" : ""}>
                  <span>Box 3</span>
                </label>
              </div>
            </div>
            <div class="np-field">
              <label>Einddatum renteaftrek</label>
              <input type="date" data-field="renteaftrekEnd" value="${part.renteaftrekEnd || ""}">
            </div>
          </div>
          ${index > 0 ? '<button type="button" class="btn-delete-part">🗑 Leningdeel verwijderen</button>' : ""}
        </div>
      `;

      // Toggle collapse
      card.querySelector(".np-card__toggle").addEventListener("click", () => {
        part.collapsed = !part.collapsed;
        save();
        renderNewParts();
      });

      // Field events (only when not collapsed)
      if (!part.collapsed) {
        const amtInput = card.querySelector('[data-field="amount"]');
        if (index === 0 && state.newLoanParts.length > 1) {
          // First part is read-only, no events
        } else {
          amtInput.addEventListener("focus", () => { amtInput.value = part.amount || ""; });
          amtInput.addEventListener("input", () => {
            part.amount = parseInt(amtInput.value.replace(/[^0-9]/g, ""), 10) || 0;
            if (index > 0) recalcFirstPart();
            save(); updateSummary(); updateInlineErrors();
          });
          amtInput.addEventListener("blur", () => {
            amtInput.value = (part.amount || 0).toLocaleString("nl-NL", { minimumFractionDigits: 2 });
            if (index > 0) renderNewParts();
          });
        }

        card.querySelector('[data-field="form"]').addEventListener("change", (e) => { part.form = e.target.value; save(); });
        card.querySelector('[data-field="passDate"]').addEventListener("change", (e) => { part.passDate = e.target.value; save(); });
        card.querySelector('[data-field="durationType"]').addEventListener("change", (e) => {
          part.durationType = e.target.value; save(); renderNewParts();
        });

        const durInput = card.querySelector('[data-field="months"], [data-field="endDate"]');
        if (durInput) durInput.addEventListener("input", (e) => {
          if (part.durationType === "enddate") part.endDate = e.target.value;
          else part.months = e.target.value;
          save();
        });

        card.querySelector('[data-field="fixedPeriod"]').addEventListener("change", (e) => { part.fixedPeriod = e.target.value; save(); });

        const renteInput = card.querySelector('[data-field="renteaftrekEnd"]');
        if (renteInput) renteInput.addEventListener("change", (e) => { part.renteaftrekEnd = e.target.value; save(); });

        card.querySelectorAll(`input[name="box_${part.id}"]`).forEach((r) =>
          r.addEventListener("change", () => { part.box = r.value; save(); updateSummary(); })
        );

        if (index > 0) {
          card.querySelector(".btn-delete-part").addEventListener("click", () => {
            state.newLoanParts = state.newLoanParts.filter((p) => p.id !== part.id);
            recalcFirstPart();
            save(); renderNewParts();
          });
        }
      }

      rowsEl.appendChild(card);
    });

    partsEl.querySelector("#addNpBtn").addEventListener("click", () => {
      state.newLoanParts.push({
        id: nextPartId++, amount: 0, form: "", passDate: "", durationType: "months",
        months: "", endDate: "", fixedPeriod: "", box: null, renteaftrekEnd: "", collapsed: false,
      });
      save(); renderNewParts();
    });

    updateSummary();
    updateInlineErrors();
  }

  if (state.calculated) {
    renderCalc();
    renderNewParts();
  }

  parent.appendChild(section);
}

// ===== Main render =====
function render(container, wizardState) {
  // Load customer-specific data
  const customer = wizardState.getData("customer");
  const data = customer && CUSTOMER_DATA[customer.id];
  if (data) {
    // Restore house data from wizard state if previously edited, otherwise from customer data
    HOUSE_DATA = wizardState.getData("houseData")
      ? { ...wizardState.getData("houseData") }
      : { ...data.house };
    // Restore loan parts from wizard state if previously edited, otherwise from customer data
    EXISTING_LOAN_PARTS = wizardState.getData("loanParts")
      ? wizardState.getData("loanParts").map((lp) => ({ ...lp }))
      : data.loanParts.map((lp) => ({ ...lp }));
    EXISTING_PRODUCTS = data.products.map((p) => ({ ...p }));
  }

  container.innerHTML = "<h2 class='section-title'>Pas de hypotheek aan</h2>";
  renderSection1(container, wizardState);
  renderSection2(container, wizardState);
  renderSection3(container);
  renderSection4(container, wizardState);
}

registerStep("mortgage-adjustment", {
  render,
  label: "Pas hypotheek aan",
  nextLabel: "Naar gegevens aanvullen",
  backLabel: "Terug naar aanvraag kiezen",
  validate() {
    const npRows = document.getElementById("npRows");
    if (!npRows) return true;

    // First check for overage errors already showing
    const errorEls = npRows.querySelectorAll("[data-amount-error]");
    for (const el of errorEls) {
      if (el.textContent) {
        // Ensure parent card body is visible
        const body = el.closest(".np-card__body");
        if (body) body.style.display = "";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const euroInput = el.previousElementSibling;
        if (euroInput) {
          euroInput.style.transition = "box-shadow 0.3s";
          euroInput.style.boxShadow = "0 0 0 3px rgba(200, 60, 0, 0.3)";
          setTimeout(() => { euroInput.style.boxShadow = ""; }, 1500);
        }
        return false;
      }
    }

    // Check for zero-amount parts
    const cards = npRows.querySelectorAll(".np-card");
    for (const card of cards) {
      const amtInput = card.querySelector('[data-field="amount"]');
      if (!amtInput) continue;
      const val = parseInt(amtInput.value.replace(/[^0-9]/g, ""), 10) || 0;
      if (!val) {
        // Ensure card body is visible
        const body = card.querySelector(".np-card__body");
        if (body) body.style.display = "";
        const amtError = card.querySelector("[data-amount-error]");
        const euroInput = amtError && amtError.previousElementSibling;
        if (amtError) {
          amtError.textContent = "Vul een bedrag in";
          amtError.style.display = "block";
          if (euroInput) euroInput.style.borderColor = "#c83c00";
        }
        (amtError || amtInput).scrollIntoView({ behavior: "smooth", block: "center" });
        if (euroInput) {
          euroInput.style.transition = "box-shadow 0.3s";
          euroInput.style.boxShadow = "0 0 0 3px rgba(200, 60, 0, 0.3)";
          setTimeout(() => { euroInput.style.boxShadow = ""; }, 1500);
        }
        return false;
      }
    }
    return true;
  },
});
