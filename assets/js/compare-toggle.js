document.addEventListener("DOMContentLoaded", () => {
  const compareFigures = document.querySelectorAll("[data-compare]");

  compareFigures.forEach((figure) => {
    const img = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    const buttons = figure.querySelectorAll("[data-compare-show]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const state = button.dataset.compareShow; // "before" or "after"
        const key = state.charAt(0).toUpperCase() + state.slice(1);

        img.src = img.dataset[`compare${key}`];
        img.alt = img.dataset[`compare${key}Alt`];
        if (caption) caption.textContent = img.dataset[`compare${key}Caption`];
        img.classList.toggle("is-before", state === "before");

        buttons.forEach((b) => b.classList.toggle("is-active", b === button));
      });
    });
  });
});
