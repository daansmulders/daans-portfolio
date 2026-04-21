(() => {
  "use strict";

  const TOTAL_AMOUNT = 250_000; // fixed total in euros
  let nextId = 1;

  // State: array of { id, amount }
  // Part at index 0 is the remainder bucket (always present, read-only).
  let loanParts = [{ id: 0, amount: TOTAL_AMOUNT }];

  // ---- Helpers ----

  function formatCurrency(value) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function sumOtherParts() {
    return loanParts.slice(1).reduce((sum, p) => sum + p.amount, 0);
  }

  function recalcRemainder() {
    loanParts[0].amount = TOTAL_AMOUNT - sumOtherParts();
  }

  // ---- Rendering ----

  function render() {
    const container = document.getElementById("loanParts");
    container.innerHTML = "";

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
          handleAmountInput(part.id, input);
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
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", () => removePart(part.id));
        row.appendChild(removeBtn);
      }

      container.appendChild(row);
    });

    renderSummary();
    renderTotal();
  }

  function renderSummary() {
    const bar = document.getElementById("summaryBar");
    const allocated = sumOtherParts();
    bar.innerHTML =
      `<span>Verdeeld: ${formatCurrency(allocated)}</span>` +
      `<span>Resterend in deel 1: ${formatCurrency(TOTAL_AMOUNT - allocated)}</span>`;
  }

  function renderTotal() {
    document.getElementById("totalAmount").textContent = formatCurrency(TOTAL_AMOUNT);
  }

  // ---- Handlers ----

  function handleAmountInput(partId, input) {
    const raw = input.value.replace(/[^0-9]/g, "");
    let value = raw === "" ? 0 : parseInt(raw, 10);

    const part = loanParts.find((p) => p.id === partId);
    const othersSum = loanParts
      .filter((p) => p.id !== partId && p.id !== 0)
      .reduce((s, p) => s + p.amount, 0);

    const maxAllowed = TOTAL_AMOUNT - othersSum;
    if (value > maxAllowed) {
      value = maxAllowed;
    }

    part.amount = value;
    recalcRemainder();

    // Update only the first part's display + summary without a full re-render
    // so we don't lose the user's cursor / focus.
    const firstInput = document.querySelector(".loan-part:first-child input");
    if (firstInput) {
      firstInput.value = loanParts[0].amount.toLocaleString("nl-NL");
    }

    // Show raw number while editing
    input.value = value === 0 && raw === "" ? "" : String(value);

    renderSummary();
  }

  function addPart() {
    loanParts.push({ id: nextId++, amount: 0 });
    render();
  }

  function removePart(id) {
    loanParts = loanParts.filter((p) => p.id !== id);
    recalcRemainder();
    render();
  }

  // ---- Init ----

  document.getElementById("addPartBtn").addEventListener("click", addPart);
  render();
})();
