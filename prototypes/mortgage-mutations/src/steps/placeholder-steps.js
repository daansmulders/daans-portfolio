import { registerStep } from "../wizard/step-registry.js";

registerStep("review", {
  render(container) {
    container.innerHTML = '<p style="color:#64748b;padding:2rem 0;">Stap "Controleer en verstuur" — nog niet uitgewerkt.</p>';
  },
  label: "Controleer en verstuur",
});
