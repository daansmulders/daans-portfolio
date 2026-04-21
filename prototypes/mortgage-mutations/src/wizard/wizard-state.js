/**
 * Wizard state machine.
 * Tracks current step, navigation history, and collected form data.
 */
export function createWizardState(stepIds) {
  let currentIndex = 0;
  const history = [];
  const data = {};
  const listeners = [];

  function notify() {
    listeners.forEach((fn) => fn(state));
  }

  const state = {
    get currentStepId() {
      return stepIds[currentIndex];
    },
    get currentIndex() {
      return currentIndex;
    },
    get stepIds() {
      return [...stepIds];
    },
    get canGoBack() {
      return history.length > 0;
    },
    get canGoNext() {
      return currentIndex < stepIds.length - 1;
    },

    getData(key) {
      return key ? data[key] : { ...data };
    },
    setData(key, value) {
      data[key] = value;
    },

    goNext(nextStepId) {
      history.push(currentIndex);
      if (nextStepId) {
        const idx = stepIds.indexOf(nextStepId);
        if (idx !== -1) currentIndex = idx;
      } else {
        currentIndex = Math.min(currentIndex + 1, stepIds.length - 1);
      }
      notify();
    },
    goToStep(stepId) {
      const idx = stepIds.indexOf(stepId);
      if (idx !== -1) {
        history.push(currentIndex);
        currentIndex = idx;
        notify();
      }
    },

    goBack() {
      if (history.length > 0) {
        currentIndex = history.pop();
        notify();
      }
    },

    subscribe(fn) {
      listeners.push(fn);
      return () => {
        const i = listeners.indexOf(fn);
        if (i !== -1) listeners.splice(i, 1);
      };
    },
  };

  return state;
}
