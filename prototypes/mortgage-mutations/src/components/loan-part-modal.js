/**
 * Modal for editing/splitting a loan part.
 * openLoanPartModal(loanPart, { onSave, onCancel })
 */

const REPAYMENT_FORMS = ["Annuïtair", "Lineair", "Aflossingsvrij"];

export function openLoanPartModal(loanPart, { onSave, onCancel }) {
  // Clone to avoid direct mutation
  let draft = JSON.parse(JSON.stringify(loanPart));
  let splitting = false;
  let splitParts = [
    { ...draft, principal: draft.principal },
    { code: draft.code + "b", principal: 0, form: "", fixedPeriod: "", endDate: "", interest: 0, box: "" },
  ];

  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);

  // Modal
  const modal = document.createElement("div");
  modal.className = "modal";
  document.body.appendChild(modal);

  function updateModalWidth() {
    modal.classList.toggle("modal--wide", splitting);
  }

  function fmtNum(val) {
    return val ? val.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
  }

  function render() {
    updateModalWidth();
    modal.innerHTML = `
      <div class="modal__header">
        <h2 class="modal__title">Aanpassen leningdeel ${draft.code} ${draft.form}</h2>
        <button type="button" class="modal__close" aria-label="Sluiten">&times;</button>
      </div>
      <div class="modal__body">
        <div class="modal__split-section">
          <div class="modal__split-question">
            <span class="modal__split-text">Wil je het leningdeel splitsen?</span>
          </div>
          <label class="toggle">
            <input type="checkbox" class="toggle__input" ${splitting ? "checked" : ""}>
            <span class="toggle__track"></span>
            <span class="toggle__label">Leningdeel splitsen</span>
          </label>
        </div>

        ${splitting ? renderSplitFields() : renderSingleFields(draft)}
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn--primary" id="modalSave">Aanpassing opslaan</button>
        <button type="button" class="btn btn--secondary" id="modalCancel">Aanpassing annuleren</button>
      </div>
    `;

    // Events
    modal.querySelector(".modal__close").addEventListener("click", close);
    modal.querySelector("#modalCancel").addEventListener("click", close);
    modal.querySelector(".toggle__input").addEventListener("change", (e) => {
      splitting = e.target.checked;
      if (splitting) {
        const half = Math.floor(draft.principal / 2);
        splitParts[0].principal = half;
        splitParts[1].principal = draft.principal - half;
      }
      render();
    });

    modal.querySelector("#modalSave").addEventListener("click", () => {
      if (splitting) {
        onSave({ action: "split", original: loanPart, parts: splitParts });
      } else {
        onSave({ action: "update", original: loanPart, updated: draft });
      }
      close();
    });

    // Bind field events for single mode
    if (!splitting) {
      bindFieldEvents(modal, draft);
    } else {
      bindSplitEvents(modal);
    }

    overlay.addEventListener("click", close);
  }

  function renderSingleFields(data) {
    const formOptions = REPAYMENT_FORMS.map(
      (f) => `<option value="${f}" ${data.form === f ? "selected" : ""}>${f}</option>`
    ).join("");

    return `
      <div class="modal__fields">
        <div class="modal__field">
          <label>Restant hoofdsom</label>
          <div class="euro-input">
            <span class="euro-input__symbol">&euro;</span>
            <input type="text" inputmode="numeric" data-field="principal" value="${fmtNum(data.principal)}">
          </div>
        </div>
        <div class="modal__field">
          <label>Aflosvorm</label>
          <select data-field="form">${formOptions}</select>
        </div>
        <div class="modal__field">
          <label>Rentevaste periode</label>
          <select data-field="fixedPeriod">
            <option value="${data.fixedPeriod}" selected>Ongewijzigd (einddatum ${data.endDate})</option>
          </select>
        </div>
        <div class="modal__field">
          <label>Rentepercentage (inclusief risico-opslag)</label>
          <div class="pct-input">
            <input type="text" data-field="interest" value="${data.interest.toFixed(2).replace(".", ",")}">
            <span class="pct-input__symbol">%</span>
          </div>
          <div class="modal__field-info">
            Huidige risico-opslag: 0,00%<br>
            Huidige tariefklasse: &gt; 90% t/m 100% marktwaarde
          </div>
        </div>
        <div class="modal__field">
          <label>Einddatum</label>
          <input type="date" data-field="endDate" value="${toISODate(data.endDate)}">
        </div>
        <div class="modal__field">
          <label>Fiscale aftrekbaarheid</label>
          <div class="segment-control">
            <button type="button" class="segment-control__btn ${data.box === "Box 1" ? "segment-control__btn--active" : ""}" data-box="Box 1">Box 1</button>
            <button type="button" class="segment-control__btn ${data.box === "Box 3" ? "segment-control__btn--active" : ""}" data-box="Box 3">Box 3</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSplitFields() {
    return `
      <div class="modal__split-parts">
        <div class="modal__split-part">
          <h4>Deel A — ${splitParts[0].code}</h4>
          ${renderSingleFields(splitParts[0])}
        </div>
        <div class="modal__split-part">
          <h4>Deel B — ${splitParts[1].code}</h4>
          ${renderSingleFields(splitParts[1])}
        </div>
      </div>
      <div class="modal__split-total">
        Totaal: ${fmtNum(splitParts[0].principal + splitParts[1].principal)} van ${fmtNum(loanPart.principal)}
      </div>
    `;
  }

  function bindFieldEvents(container, data) {
    const principalInput = container.querySelector('[data-field="principal"]');
    if (principalInput) {
      principalInput.addEventListener("focus", () => { principalInput.value = data.principal || ""; });
      principalInput.addEventListener("input", () => {
        data.principal = parseFloat(principalInput.value.replace(/[^0-9]/g, "")) || 0;
      });
      principalInput.addEventListener("blur", () => { principalInput.value = fmtNum(data.principal); });
    }

    const formSelect = container.querySelector('[data-field="form"]');
    if (formSelect) formSelect.addEventListener("change", (e) => { data.form = e.target.value; });

    const interestInput = container.querySelector('[data-field="interest"]');
    if (interestInput) interestInput.addEventListener("input", (e) => {
      data.interest = parseFloat(e.target.value.replace(",", ".")) || 0;
    });

    const endDateInput = container.querySelector('[data-field="endDate"]');
    if (endDateInput) endDateInput.addEventListener("change", (e) => {
      data.endDate = fromISODate(e.target.value);
    });

    container.querySelectorAll("[data-box]").forEach((btn) => {
      btn.addEventListener("click", () => {
        data.box = btn.dataset.box;
        container.querySelectorAll("[data-box]").forEach((b) =>
          b.classList.toggle("segment-control__btn--active", b.dataset.box === data.box)
        );
      });
    });
  }

  function bindSplitEvents(container) {
    const parts = container.querySelectorAll(".modal__split-part");
    if (parts[0]) bindFieldEvents(parts[0], splitParts[0]);
    if (parts[1]) bindFieldEvents(parts[1], splitParts[1]);
  }

  function close() {
    modal.remove();
    overlay.remove();
    if (onCancel) onCancel();
  }

  function toISODate(ddmmyyyy) {
    const parts = ddmmyyyy.split("-");
    if (parts.length === 3 && parts[0].length <= 2) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return ddmmyyyy;
  }

  function fromISODate(iso) {
    const parts = iso.split("-");
    if (parts.length === 3 && parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return iso;
  }

  render();
}
