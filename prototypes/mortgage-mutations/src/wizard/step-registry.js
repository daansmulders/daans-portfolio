/**
 * Central registry mapping step IDs to their implementation.
 * Each step: { render(container, wizardState), cleanup?(), validate?() => bool, getNextStep?(data) => stepId }
 */
const steps = new Map();

export function registerStep(id, stepDef) {
  steps.set(id, stepDef);
}

export function getStep(id) {
  return steps.get(id);
}

export function getAllStepIds() {
  return [...steps.keys()];
}
