import { getStep } from "./step-registry.js";

export function createWizardShell(rootEl, wizardState, { onCancel } = {}) {
  let currentCleanup = null;

  rootEl.innerHTML = `
    <div class="breadcrumb">
      <span>Home</span> / <span>Hypotheek Details</span> / <span>Hypotheek aanpassen</span>
    </div>
    <h1 class="page-title">Hypotheek aanpassen en OHA</h1>
    <nav class="wizard-nav">
      <button type="button" class="wizard-nav__back" id="wizardNavBack" aria-label="Vorige stap">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="wizard-steps" id="wizardSteps"></div>
    </nav>
    <div class="wizard-content" id="wizardContent"></div>
    <div class="wizard-footer">
      <button type="button" class="btn btn--primary" id="wizardNext">
        Hypotheek aanpassen <span class="btn-arrow">→</span>
      </button>
      <button type="button" class="btn btn--secondary" id="wizardBack">
        <span class="btn-arrow">←</span> Aanvraag annuleren
      </button>
    </div>
  `;

  const contentEl = rootEl.querySelector("#wizardContent");
  const stepsEl = rootEl.querySelector("#wizardSteps");
  const backBtn = rootEl.querySelector("#wizardBack");
  const nextBtn = rootEl.querySelector("#wizardNext");
  const navBackBtn = rootEl.querySelector("#wizardNavBack");

  navBackBtn.addEventListener("click", () => {
    if (wizardState.canGoBack) {
      wizardState.goBack();
    } else if (onCancel) {
      onCancel();
    }
  });

  backBtn.addEventListener("click", () => {
    if (!wizardState.canGoBack && onCancel) {
      onCancel();
    } else {
      wizardState.goBack();
    }
  });

  nextBtn.addEventListener("click", () => {
    const step = getStep(wizardState.currentStepId);
    if (step && step.validate && !step.validate()) return;
    if (!wizardState.canGoNext) {
      if (step && step.onSubmit) {
        step.onSubmit(contentEl, wizardState);
      }
      return;
    }
    const nextId = step && step.getNextStep ? step.getNextStep(wizardState.getData()) : undefined;
    wizardState.goNext(nextId);
  });

  function renderStepIndicator() {
    const ids = wizardState.stepIds;
    stepsEl.innerHTML = ids
      .map((id, i) => {
        const step = getStep(id);
        const label = (step && step.label) || `Stap ${i + 1}`;
        const isActive = i === wizardState.currentIndex;
        const isDone = i < wizardState.currentIndex;
        const cls = isActive ? "wizard-step--active" : isDone ? "wizard-step--done" : "";
        return `<div class="wizard-step ${cls}">
          <span class="wizard-step__label">${label}</span>
          <div class="wizard-step__circle-row">
            ${i > 0 ? '<span class="wizard-step__line"></span>' : ""}
            <span class="wizard-step__dot"></span>
            ${i < ids.length - 1 ? '<span class="wizard-step__line"></span>' : ""}
          </div>
        </div>`;
      })
      .join("");
  }

  function renderCurrentStep() {
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }
    contentEl.innerHTML = "";
    window.scrollTo(0, 0);

    const step = getStep(wizardState.currentStepId);
    if (step) {
      currentCleanup = step.render(contentEl, wizardState) || null;
    }

    // Back button in nav
    navBackBtn.style.display = wizardState.canGoBack ? "" : "none";

    // Footer back button
    const backLabel = step && step.backLabel;
    backBtn.innerHTML = `<span class="btn-arrow">\u2190</span> ${backLabel || (wizardState.canGoBack ? "Vorige stap" : "Aanvraag annuleren")}`;

    // Footer next button
    const nextLabel = step && step.nextLabel;
    if (wizardState.canGoNext || nextLabel) {
      nextBtn.style.display = "";
      nextBtn.innerHTML = `${nextLabel || "Volgende stap"} <span class="btn-arrow">\u2192</span>`;
    } else {
      nextBtn.style.display = "none";
    }

    renderStepIndicator();
  }

  wizardState.subscribe(() => renderCurrentStep());
  renderCurrentStep();
}
