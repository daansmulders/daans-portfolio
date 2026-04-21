/**
 * Pre-wizard screen: dummy customer list.
 * Not a wizard step — rendered before the wizard mounts.
 */

const DUMMY_CUSTOMERS = [
  {
    id: "HYP-2024-001",
    loanNumber: "NL-7821-4490",
    names: ["Jan de Vries", "Petra de Vries"],
    totalAmount: 342000,
    type: "Annuïteitenhypotheek",
  },
  {
    id: "HYP-2024-002",
    loanNumber: "NL-3310-8827",
    names: ["Mohammed El Amrani", "Sophie El Amrani"],
    totalAmount: 275000,
    type: "Lineaire hypotheek",
  },
  {
    id: "HYP-2024-003",
    loanNumber: "NL-5567-2213",
    names: ["Lisa Bakker", "Tom Bakker"],
    totalAmount: 410000,
    type: "Annuïteitenhypotheek",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function renderCustomerSelect(rootEl, onSelect) {
  rootEl.innerHTML = `
    <h1 class="page-title">Klant en hypotheek selecteren</h1>
    <div class="customer-list" id="customerList"></div>
  `;

  const listEl = rootEl.querySelector("#customerList");

  DUMMY_CUSTOMERS.forEach((customer) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "customer-card";
    card.innerHTML = `
      <div class="customer-card__names">${customer.names.join(" & ")}</div>
      <div class="customer-card__details">
        <span>Leningnummer: ${customer.loanNumber}</span>
        <span>${customer.type}</span>
        <span>${formatCurrency(customer.totalAmount)}</span>
      </div>
    `;
    card.addEventListener("click", () => onSelect(customer));
    listEl.appendChild(card);
  });
}
