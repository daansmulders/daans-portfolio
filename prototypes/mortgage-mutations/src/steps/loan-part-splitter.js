import { registerStep } from "../wizard/step-registry.js";

const TOTAL_AMOUNT = 250_000;

function formatCurrency(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function render(container, wizardState) {
  let nextId = 1;

  // Restore state from wizard if previously visited, otherwise start fresh
  let loanParts = wizardState.getData("loanParts");
  if (!loanParts) {
    loanParts = [{ id: 0, amount: TOTAL_AMOUNT }];
  }

  function sumOtherParts() {
    return loanParts.slice(1).reduce((sum, p) => sum + p.amount, 0);
  }

  function recalcRemainder() {
    loanParts[0].amount = TOTAL_AMOUNT - sumOtherParts();
  }

  function save() {
    wizardState.setData("loanParts", loanParts);
  }

  function renderParts() {
    const partsEl = container.querySelector("#loanParts");
    const summaryEl = container.querySelector("#summaryBar");
    const totalEl = container.querySelector("#totalAmount");
    partsEl.innerHTML = "";

    loanParts.forEach((part, index) => {
      const row = document.createElement("div");
      row.className = "loan-part";

      const label = document.createElement("span");
      label.className = "loan-part-label";
      label.textContent = index === 0 ? "Leningdeel 1 (resterend)" : `Leningdeel ${index + 1}`;

      const inputWrap = document.createElement("div");
      inputWrap.className = "loan-part-input-wrap";

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.value = part.amount.toLocaleString("nl-NL");

      if (index === 0) {
        input.readOnly = true;
      } else {
        input.addEventListener("focus", () => {
          input.value = part.amount === 0 ? "" : String(part.amount);
        });
        input.addEventListener("input", () => {
          const raw = input.value.replace(/[^0-9]/g, "");
          let value = raw === "" ? 0 : parseInt(raw, 10);

          const othersSum = loanParts
            .filter((p) => p.id !== part.id && p.id !== 0)
            .reduce((s, p) => s + p.amount, 0);

          const maxAllowed = TOTAL_AMOUNT - othersSum;
          if (value > maxAllowed) value = maxAllowed;

          part.amount = value;
          recalcRemainder();
          save();

          const firstInput = partsEl.querySelector(".loan-part:first-child input");
          if (firstInput) firstInput.value = loanParts[0].amount.toLocaleString("nl-NL");
          input.value = value === 0 && raw === "" ? "" : String(value);
          renderSummary();
        });
        input.addEventListener("blur", () => {
          input.value = part.amount.toLocaleString("nl-NL");
        });
      }

      inputWrap.appendChild(input);
      row.appendChild(label);
      row.appendChild(inputWrap);

      if (index === 0) {
        const spacer = document.createElement("div");
        spacer.className = "btn-remove-placeholder";
        row.appendChild(spacer);
      } else {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn-remove";
        removeBtn.title = "Verwijderen";
        removeBtn.textContent = "\u00d7";
        removeBtn.addEventListener("click", () => {
          loanParts = loanParts.filter((p) => p.id !== part.id);
          recalcRemainder();
          save();
          renderParts();
        });
        row.appendChild(removeBtn);
      }

      partsEl.appendChild(row);
    });

    totalEl.textContent = formatCurrency(TOTAL_AMOUNT);
    renderSummary();
  }

  function renderSummary() {
    const summaryEl = container.querySelector("#summaryBar");
    const allocated = sumOtherParts();
    summaryEl.innerHTML =
      `<span>Verdeeld: ${formatCurrency(allocated)}</span>` +
      `<span>Resterend in deel 1: ${formatCurrency(TOTAL_AMOUNT - allocated)}</span>`;
  }

  // Build step HTML
  container.innerHTML = `
    <div class="total-banner">
      <h2 class="total-label">Totaalbedrag</h2>
      <span class="total-amount" id="totalAmount"></span>
    </div>
    <div id="loanParts"></div>
    <button type="button" class="btn-add" id="addPartBtn">+ Leningdeel toevoegen</button>
    <div class="summary-bar" id="summaryBar"></div>
  `;

  container.querySelector("#addPartBtn").addEventListener("click", () => {
    loanParts.push({ id: nextId++, amount: 0 });
    save();
    renderParts();
  });

  // Find max existing id to avoid collisions
  nextId = Math.max(...loanParts.map((p) => p.id)) + 1;

  renderParts();
}

registerStep("loan-part-splitter", {
  render,
  label: "Wijziging",
});
