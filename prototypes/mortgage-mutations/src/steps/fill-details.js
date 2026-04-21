import { registerStep } from "../wizard/step-registry.js";

const BURGERLIJKE_STAAT = ["", "Gehuwd", "Geregistreerd partnerschap", "Samenwonend", "Alleenstaand"];
const INKOMEN_TYPES = ["", "Loondienst", "Tijdelijk dienstverband", "Zelfstandig ondernemer", "Pensioen"];

let nextIncomeId = 1;
let nextProvisionId = 1;

function fmtEuro(val) {
  return val ? val.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}

function defaultPersonState(name) {
  return {
    name,
    checked: false,
    burgStaatVoor: "",
    burgStaatNieuw: "",
    datumUitElkaar: "",
    kinderen: 0,
    spaargeld: 0,
    andereAandelen: "",
    incomes: [{ id: nextIncomeId++, type: "", bedrijf: "", bruto: 0, datumInDienst: "", einddatum: "" }],
    bkr: "",
    duoSchuld: "",
    familielening: "",
    alimentatie: "",
  };
}

function defaultCoDebtorState() {
  return {
    voorletters: "",
    tussenvoegsel: "",
    achternaam: "",
    geboortedatum: "",
    burgStaat: "",
    kinderen: 0,
    spaargeld: 0,
    onroerendGoed: "",
    incomes: [{ id: nextIncomeId++, type: "", bedrijf: "", bruto: 0, datumInDienst: "", einddatum: "" }],
    bkr: "",
    duoSchuld: "",
    familielening: "",
    alimentatie: "",
  };
}

function render(container, wizardState) {
  const customer = wizardState.getData("customer");
  const saved = wizardState.getData("fillDetails");

  // Build state from saved or defaults
  const state = saved || {
    persons: customer.names.map((n) => defaultPersonState(n)),
    medeschuldenaar: "",
    coDebtor: defaultCoDebtorState(),
    provisions: [],
    annulaireToets: "",
    extraInfo: "",
  };

  function save() {
    wizardState.setData("fillDetails", state);
  }

  // ===== Render all =====
  function renderAll() {
    container.innerHTML = "";
    renderHypotheekgevers(container);
    state.persons.forEach((p, i) => {
      if (p.checked) renderPersonCard(container, p, i);
    });
    if (state.medeschuldenaar === "ja") {
      renderCoDebtorCard(container);
    }
    renderHuurlasten(container);
    renderExtraInfo(container);
  }

  // ===== Section 1: Hypotheekgevers =====
  function renderHypotheekgevers(parent) {
    const section = document.createElement("section");
    section.className = "adj-section";

    const checkboxes = state.persons.map((p, i) => `
      <label class="fd-checkbox">
        <input type="checkbox" name="person_${i}" ${p.checked ? "checked" : ""}>
        <span class="fd-checkbox__mark"></span>
        <span>${p.name}</span>
      </label>
    `).join("");

    section.innerHTML = `
      <h3 class="adj-section__title">Hypotheekgevers</h3>
      <p class="fd-question">Wie blijft er op de hypotheek?</p>
      <div class="fd-checkboxes">${checkboxes}</div>
      <p class="fd-question">Komt er iemand anders bij als medeschuldenaar?</p>
      <div class="fd-inline-radios">
        <label class="fd-inline-radio">
          <input type="radio" name="medeschuldenaar" value="ja" ${state.medeschuldenaar === "ja" ? "checked" : ""}>
          <span>Ja</span>
        </label>
        <label class="fd-inline-radio">
          <input type="radio" name="medeschuldenaar" value="nee" ${state.medeschuldenaar === "nee" ? "checked" : ""}>
          <span>Nee</span>
        </label>
      </div>
    `;

    section.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
      cb.addEventListener("change", () => {
        state.persons[i].checked = cb.checked;
        save();
        renderAll();
      });
    });

    section.querySelectorAll('input[name="medeschuldenaar"]').forEach((r) => {
      r.addEventListener("change", () => {
        state.medeschuldenaar = r.value;
        save();
        renderAll();
      });
    });

    parent.appendChild(section);
  }

  // ===== Section 2: Person card =====
  function renderPersonCard(parent, person, index) {
    const card = document.createElement("div");
    card.className = "fd-card";

    const bsVoorOpts = BURGERLIJKE_STAAT.map((b) =>
      `<option value="${b}" ${person.burgStaatVoor === b ? "selected" : ""}>${b || "- Maak een keuze -"}</option>`
    ).join("");
    const bsNieuwOpts = BURGERLIJKE_STAAT.map((b) =>
      `<option value="${b}" ${person.burgStaatNieuw === b ? "selected" : ""}>${b || "- Maak een keuze -"}</option>`
    ).join("");

    card.innerHTML = `
      <h3 class="fd-card__title">${person.name}</h3>

      <h4 class="fd-card__subtitle">Gegevens</h4>
      <div class="fd-fields fd-fields--2col">
        <div class="fd-field">
          <label>Burgerlijke staat vóór beëindiging relatie</label>
          <select data-f="burgStaatVoor">${bsVoorOpts}</select>
        </div>
        <div class="fd-field">
          <label>Burgerlijke staat nieuwe situatie</label>
          <select data-f="burgStaatNieuw">${bsNieuwOpts}</select>
        </div>
      </div>
      <div class="fd-fields fd-fields--2col">
        <div class="fd-field">
          <label>Verwachte datum uit elkaar gaan</label>
          <input type="date" data-f="datumUitElkaar" value="${person.datumUitElkaar || ""}">
        </div>
        <div class="fd-field">
          <label>Aantal inwonende kinderen tot 21 jaar</label>
          <input type="number" min="0" data-f="kinderen" value="${person.kinderen || 0}">
        </div>
      </div>

      <h4 class="fd-card__subtitle">Vermogen</h4>
      <div class="fd-fields fd-fields--2col">
        <div class="fd-field">
          <label>Geld op spaarrekening(en)</label>
          <div class="euro-input">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" data-f="spaargeld" value="${fmtEuro(person.spaargeld)}">
          </div>
        </div>
        <div class="fd-field">
          <label>Andere aandelen</label>
          <input type="text" data-f="andereAandelen" value="${person.andereAandelen || ""}">
        </div>
      </div>

      <h4 class="fd-card__subtitle">Inkomen</h4>
      <div class="fd-income-rows" data-income-target></div>
      <button type="button" class="btn-tertiary-bordered fd-add-income">⊕ Inkomen toevoegen</button>

      <h4 class="fd-card__subtitle">Financiële verplichtingen</h4>
      ${renderObligations(person)}
    `;

    // Income rows
    const incomeTarget = card.querySelector("[data-income-target]");
    function renderIncomeRows() {
      incomeTarget.innerHTML = "";
      // Header
      if (person.incomes.length > 0) {
        const header = document.createElement("div");
        header.className = "fd-income-header";
        header.innerHTML = `
          <span>Type inkomen</span>
          <span>Naam bedrijf</span>
          <span>Bruto bedrag per jaar</span>
          <span>Datum in dienst</span>
        `;
        incomeTarget.appendChild(header);
      }
      person.incomes.forEach((inc) => {
        const row = document.createElement("div");
        row.className = "fd-income-row";
        const typeOpts = INKOMEN_TYPES.map((t) =>
          `<option value="${t}" ${inc.type === t ? "selected" : ""}>${t || "- Kies type in..."}</option>`
        ).join("");
        const showEnd = inc.type === "Tijdelijk dienstverband";
        row.innerHTML = `
          <select data-inc="type">${typeOpts}</select>
          <input type="text" data-inc="bedrijf" value="${inc.bedrijf || ""}" placeholder="Naam bedrijf">
          <div class="euro-input euro-input--sm">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" data-inc="bruto" value="${fmtEuro(inc.bruto)}">
          </div>
          <input type="date" data-inc="datumInDienst" value="${inc.datumInDienst || ""}">
          ${showEnd ? `<input type="date" data-inc="einddatum" value="${inc.einddatum || ""}" placeholder="Einddatum">` : ""}
          ${person.incomes.length > 1 ? `<button type="button" class="btn-remove-text" data-remove-inc="${inc.id}">&times;</button>` : ""}
        `;
        // Events
        row.querySelector('[data-inc="type"]').addEventListener("change", (e) => {
          inc.type = e.target.value; save(); renderIncomeRows();
        });
        row.querySelector('[data-inc="bedrijf"]').addEventListener("input", (e) => { inc.bedrijf = e.target.value; save(); });
        const brutoInput = row.querySelector('[data-inc="bruto"]');
        brutoInput.addEventListener("focus", () => { brutoInput.value = inc.bruto || ""; });
        brutoInput.addEventListener("input", () => { inc.bruto = parseFloat(brutoInput.value.replace(/[^0-9]/g, "")) || 0; save(); });
        brutoInput.addEventListener("blur", () => { brutoInput.value = fmtEuro(inc.bruto); });
        row.querySelector('[data-inc="datumInDienst"]').addEventListener("change", (e) => { inc.datumInDienst = e.target.value; save(); });
        if (showEnd) {
          row.querySelector('[data-inc="einddatum"]').addEventListener("change", (e) => { inc.einddatum = e.target.value; save(); });
        }
        const removeBtn = row.querySelector("[data-remove-inc]");
        if (removeBtn) {
          removeBtn.addEventListener("click", () => {
            person.incomes = person.incomes.filter((x) => x.id !== inc.id);
            save(); renderIncomeRows();
          });
        }
        incomeTarget.appendChild(row);
      });
    }
    renderIncomeRows();

    card.querySelector(".fd-add-income").addEventListener("click", () => {
      person.incomes.push({ id: nextIncomeId++, type: "", bedrijf: "", bruto: 0, datumInDienst: "", einddatum: "" });
      save(); renderIncomeRows();
    });

    // Simple field bindings
    bindPersonFields(card, person);
    // Obligation bindings
    bindObligations(card, person);

    parent.appendChild(card);
  }

  // ===== Section 3: Co-debtor card =====
  function renderCoDebtorCard(parent) {
    const cd = state.coDebtor;
    const card = document.createElement("div");
    card.className = "fd-card";

    const bsOpts = BURGERLIJKE_STAAT.map((b) =>
      `<option value="${b}" ${cd.burgStaat === b ? "selected" : ""}>${b || "- Maak een keuze -"}</option>`
    ).join("");

    card.innerHTML = `
      <h3 class="fd-card__title">Nieuwe medeschuldenaar</h3>

      <h4 class="fd-card__subtitle">Gegevens</h4>
      <h5 class="fd-card__label">Naam</h5>
      <div class="fd-fields fd-fields--3col">
        <div class="fd-field">
          <label>Voorletter(s)</label>
          <input type="text" data-cd="voorletters" value="${cd.voorletters || ""}">
        </div>
        <div class="fd-field">
          <label>Tussenvoegsel (optioneel)</label>
          <input type="text" data-cd="tussenvoegsel" value="${cd.tussenvoegsel || ""}">
        </div>
        <div class="fd-field">
          <label>Achternaam</label>
          <input type="text" data-cd="achternaam" value="${cd.achternaam || ""}">
        </div>
      </div>
      <div class="fd-fields fd-fields--2col">
        <div class="fd-field">
          <label>Geboortedatum</label>
          <input type="date" data-cd="geboortedatum" value="${cd.geboortedatum || ""}">
        </div>
        <div class="fd-field">
          <label>Burgerlijke staat</label>
          <select data-cd="burgStaat">${bsOpts}</select>
        </div>
      </div>
      <div class="fd-fields">
        <div class="fd-field">
          <label>Aantal inwonende kinderen tot 21 jaar</label>
          <input type="number" min="0" data-cd="kinderen" value="${cd.kinderen || 0}" style="width:80px;">
        </div>
      </div>

      <h4 class="fd-card__subtitle">Vermogen</h4>
      <div class="fd-fields fd-fields--2col">
        <div class="fd-field">
          <label>Geld op spaarrekening(en)</label>
          <div class="euro-input">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" data-cd="spaargeld" value="${fmtEuro(cd.spaargeld)}">
          </div>
        </div>
        <div class="fd-field">
          <label>Onroerende goederen</label>
          <input type="text" data-cd="onroerendGoed" value="${cd.onroerendGoed || ""}">
        </div>
      </div>

      <h4 class="fd-card__subtitle">Inkomensgegevens</h4>
      <div class="fd-income-rows" data-cd-income-target></div>
      <button type="button" class="btn-tertiary-bordered fd-add-cd-income">⊕ Inkomen toevoegen</button>

      <h4 class="fd-card__subtitle">Financiële verplichtingen</h4>
      ${renderCdObligations(cd)}
    `;

    // Income rows
    const incomeTarget = card.querySelector("[data-cd-income-target]");
    function renderCdIncomeRows() {
      incomeTarget.innerHTML = "";
      if (cd.incomes.length > 0) {
        const header = document.createElement("div");
        header.className = "fd-income-header";
        header.innerHTML = `<span>Type inkomen</span><span>Bruto bedrag per jaar</span><span>Datum in dienst</span>`;
        incomeTarget.appendChild(header);
      }
      cd.incomes.forEach((inc) => {
        const row = document.createElement("div");
        row.className = "fd-income-row";
        const typeOpts = INKOMEN_TYPES.map((t) =>
          `<option value="${t}" ${inc.type === t ? "selected" : ""}>${t || "- Maak een keuze -"}</option>`
        ).join("");
        row.innerHTML = `
          <select data-inc="type">${typeOpts}</select>
          <div class="euro-input euro-input--sm">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" data-inc="bruto" value="${fmtEuro(inc.bruto)}">
          </div>
          <input type="date" data-inc="datumInDienst" value="${inc.datumInDienst || ""}">
          ${cd.incomes.length > 1 ? `<button type="button" class="btn-remove-text" data-remove-inc="${inc.id}">&times;</button>` : ""}
        `;
        row.querySelector('[data-inc="type"]').addEventListener("change", (e) => { inc.type = e.target.value; save(); });
        const brutoInput = row.querySelector('[data-inc="bruto"]');
        brutoInput.addEventListener("focus", () => { brutoInput.value = inc.bruto || ""; });
        brutoInput.addEventListener("input", () => { inc.bruto = parseFloat(brutoInput.value.replace(/[^0-9]/g, "")) || 0; save(); });
        brutoInput.addEventListener("blur", () => { brutoInput.value = fmtEuro(inc.bruto); });
        row.querySelector('[data-inc="datumInDienst"]').addEventListener("change", (e) => { inc.datumInDienst = e.target.value; save(); });
        const removeBtn = row.querySelector("[data-remove-inc]");
        if (removeBtn) {
          removeBtn.addEventListener("click", () => {
            cd.incomes = cd.incomes.filter((x) => x.id !== inc.id);
            save(); renderCdIncomeRows();
          });
        }
        incomeTarget.appendChild(row);
      });
    }
    renderCdIncomeRows();

    card.querySelector(".fd-add-cd-income").addEventListener("click", () => {
      cd.incomes.push({ id: nextIncomeId++, type: "", bedrijf: "", bruto: 0, datumInDienst: "", einddatum: "" });
      save(); renderCdIncomeRows();
    });

    // Field bindings
    card.querySelectorAll("[data-cd]").forEach((el) => {
      const key = el.dataset.cd;
      const evt = el.tagName === "SELECT" ? "change" : "input";
      if (key === "spaargeld") {
        el.addEventListener("focus", () => { el.value = cd.spaargeld || ""; });
        el.addEventListener("input", () => { cd.spaargeld = parseFloat(el.value.replace(/[^0-9]/g, "")) || 0; save(); });
        el.addEventListener("blur", () => { el.value = fmtEuro(cd.spaargeld); });
      } else if (key === "kinderen") {
        el.addEventListener("input", () => { cd[key] = parseInt(el.value, 10) || 0; save(); });
      } else {
        el.addEventListener(evt, () => { cd[key] = el.value; save(); });
      }
    });

    // Obligation bindings
    card.querySelectorAll('.fd-obligation input[type="radio"]').forEach((r) => {
      r.addEventListener("change", () => {
        cd[r.name.replace("cd_", "")] = r.value;
        save();
      });
    });

    parent.appendChild(card);
  }

  // ===== Section 4: Huurlasten =====
  function renderHuurlasten(parent) {
    const section = document.createElement("section");
    section.className = "adj-section";
    section.innerHTML = `<h3 class="adj-section__title">Huurlasten voor voorzieningen</h3>`;

    const rowsEl = document.createElement("div");
    section.appendChild(rowsEl);

    function renderProvisionRows() {
      rowsEl.innerHTML = "";
      state.provisions.forEach((prov) => {
        const row = document.createElement("div");
        row.className = "fd-provision-row";
        row.innerHTML = `
          <input type="text" placeholder="Omschrijving" value="${prov.description || ""}">
          <div class="euro-input euro-input--sm">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" value="${fmtEuro(prov.amount)}">
          </div>
          <button type="button" class="btn-remove-text">&times;</button>
        `;
        const descInput = row.querySelector('input[type="text"]');
        descInput.addEventListener("input", () => { prov.description = descInput.value; save(); });
        const amtInput = row.querySelectorAll("input")[1];
        amtInput.addEventListener("focus", () => { amtInput.value = prov.amount || ""; });
        amtInput.addEventListener("input", () => { prov.amount = parseFloat(amtInput.value.replace(/[^0-9]/g, "")) || 0; save(); });
        amtInput.addEventListener("blur", () => { amtInput.value = fmtEuro(prov.amount); });
        row.querySelector(".btn-remove-text").addEventListener("click", () => {
          state.provisions = state.provisions.filter((x) => x.id !== prov.id);
          save(); renderProvisionRows();
        });
        rowsEl.appendChild(row);
      });
    }
    renderProvisionRows();

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-tertiary-bordered";
    addBtn.textContent = "⊕ Voorziening toevoegen";
    addBtn.addEventListener("click", () => {
      state.provisions.push({ id: nextProvisionId++, description: "", amount: 0 });
      save(); renderProvisionRows();
    });
    section.appendChild(addBtn);

    parent.appendChild(section);
  }

  // ===== Section 5: Extra informatie =====
  function renderExtraInfo(parent) {
    const section = document.createElement("section");
    section.className = "adj-section";
    section.innerHTML = `
      <h3 class="adj-section__title">Extra informatie</h3>
      <p class="fd-question">Past de aanvraag binnen de annulaire toets?</p>
      <div class="fd-inline-radios">
        <label class="fd-inline-radio">
          <input type="radio" name="annulaireToets" value="ja" ${state.annulaireToets === "ja" ? "checked" : ""}>
          <span>Ja</span>
        </label>
        <label class="fd-inline-radio">
          <input type="radio" name="annulaireToets" value="nee" ${state.annulaireToets === "nee" ? "checked" : ""}>
          <span>Nee</span>
        </label>
      </div>
      <p class="fd-question" style="margin-top:1rem;">Heb je extra informatie over de aanvraag? Vul die hieronder in.</p>
      <textarea class="fd-textarea" rows="4">${state.extraInfo || ""}</textarea>
    `;

    section.querySelectorAll('input[name="annulaireToets"]').forEach((r) => {
      r.addEventListener("change", () => { state.annulaireToets = r.value; save(); });
    });
    section.querySelector(".fd-textarea").addEventListener("input", (e) => {
      state.extraInfo = e.target.value; save();
    });

    parent.appendChild(section);
  }

  // ===== Helpers =====
  function renderObligations(person) {
    const questions = [
      { key: "bkr", label: "Zijn er kredieten of andere financiële verplichtingen die bij het BKR zijn geregistreerd?" },
      { key: "duoSchuld", label: "Is er een Duo-schuld of studielening?" },
      { key: "familielening", label: "Is er een familielening of een schuld aan iemand anders?" },
      { key: "alimentatie", label: "Betaal of ontvang je partneralimentatie?" },
    ];
    return questions.map((q) => `
      <div class="fd-obligation">
        <p class="fd-obligation__label">${q.label}</p>
        <div class="fd-inline-radios">
          <label class="fd-inline-radio">
            <input type="radio" name="${q.key}_${person.name}" value="ja" ${person[q.key] === "ja" ? "checked" : ""}>
            <span>Ja</span>
          </label>
          <label class="fd-inline-radio">
            <input type="radio" name="${q.key}_${person.name}" value="nee" ${person[q.key] === "nee" ? "checked" : ""}>
            <span>Nee</span>
          </label>
        </div>
      </div>
    `).join("");
  }

  function renderCdObligations(cd) {
    const questions = [
      { key: "bkr", label: "Zijn er kredieten of andere financiële verplichtingen die bij het BKR zijn geregistreerd?" },
      { key: "duoSchuld", label: "Is er een Duo-schuld/Studielening?" },
      { key: "familielening", label: "Is er een familielening of een schuld aan derden?" },
      { key: "alimentatie", label: "Wordt er partneralimentatie betaald en/of ontvangen?" },
    ];
    return questions.map((q) => `
      <div class="fd-obligation">
        <p class="fd-obligation__label">${q.label}</p>
        <div class="fd-inline-radios">
          <label class="fd-inline-radio">
            <input type="radio" name="cd_${q.key}" value="ja" ${cd[q.key] === "ja" ? "checked" : ""}>
            <span>Ja</span>
          </label>
          <label class="fd-inline-radio">
            <input type="radio" name="cd_${q.key}" value="nee" ${cd[q.key] === "nee" ? "checked" : ""}>
            <span>Nee</span>
          </label>
        </div>
      </div>
    `).join("");
  }

  function bindPersonFields(card, person) {
    card.querySelectorAll("[data-f]").forEach((el) => {
      const key = el.dataset.f;
      const evt = el.tagName === "SELECT" ? "change" : "input";
      if (key === "spaargeld") {
        el.addEventListener("focus", () => { el.value = person.spaargeld || ""; });
        el.addEventListener("input", () => { person.spaargeld = parseFloat(el.value.replace(/[^0-9]/g, "")) || 0; save(); });
        el.addEventListener("blur", () => { el.value = fmtEuro(person.spaargeld); });
      } else if (key === "kinderen") {
        el.addEventListener("input", () => { person[key] = parseInt(el.value, 10) || 0; save(); });
      } else {
        el.addEventListener(evt, () => { person[key] = el.value; save(); });
      }
    });
  }

  function bindObligations(card, person) {
    card.querySelectorAll('.fd-obligation input[type="radio"]').forEach((r) => {
      r.addEventListener("change", () => {
        const key = r.name.split("_")[0];
        person[key] = r.value;
        save();
      });
    });
  }

  // Initial render
  save();
  renderAll();
}

let isValid = true;

registerStep("fill-details", {
  render,
  validate() { return isValid; },
  label: "Vul gegevens in",
  nextLabel: "Controleren en versturen",
  backLabel: "Terug naar hypotheek aanpassen",
});
