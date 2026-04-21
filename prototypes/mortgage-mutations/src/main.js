import { createWizardState } from "./wizard/wizard-state.js";
import { createWizardShell } from "./wizard/wizard-shell.js";
import { renderMortgageOverview } from "./steps/mortgage-overview.js";

// Register wizard steps (side-effect imports)
import "./steps/adjustment-type.js";
import "./steps/mortgage-adjustment.js";
import "./steps/fill-details.js";
import "./steps/review.js";

const root = document.getElementById("app");

function startOverview() {
  renderMortgageOverview(root, (customer) => {
    startWizard(customer);
  });
}

function startWizard(customer) {
  const wizardState = createWizardState([
    "adjustment-type",
    "mortgage-adjustment",
    "fill-details",
    "review",
  ]);
  wizardState.setData("customer", customer);

  root.innerHTML = "";
  createWizardShell(root, wizardState, {
    onCancel: () => startOverview(),
  });
}

startOverview();
