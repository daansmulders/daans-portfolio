import { registerStep } from "../wizard/step-registry.js";

let isValid = false;

function render(container, wizardState) {
  const customer = wizardState.getData("customer");
  const saved = wizardState.getData("adjustmentType") || {};

  isValid = saved.ontslagHA === "ja" && saved.verhoging === "ja";

  container.innerHTML = `
    <div class="mortgage-info">
      <div class="mortgage-info__row">
        <span class="mortgage-info__label">Leningnummer</span>
        <span class="mortgage-info__value">${customer.loanNumber}</span>
      </div>
      <div class="mortgage-info__row">
        <span class="mortgage-info__label">Personen op de lening</span>
        <span class="mortgage-info__value">${customer.names.join("<br>")}</span>
      </div>
    </div>

    <h2 class="section-title">Kies je aanvraag</h2>

    <div class="form-section">
      <fieldset class="radio-group" data-field="ontslagHA">
        <legend class="radio-group__legend">Wil je een ontslag hoofdelijke aansprakelijkheid (OHA) aanvragen?</legend>
        <div class="radio-group__options">
          <label class="radio-option">
            <input type="radio" name="ontslagHA" value="nee" ${saved.ontslagHA === "nee" ? "checked" : ""}>
            <span>Nee</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="ontslagHA" value="ja" ${saved.ontslagHA === "ja" ? "checked" : ""}>
            <span>Ja, OHA</span>
          </label>
        </div>
        <div class="radio-group__error"></div>
      </fieldset>

      <fieldset class="radio-group" data-field="verhoging">
        <legend class="radio-group__legend">Wil je de hypotheek verhogen?</legend>
        <div class="radio-group__options">
          <label class="radio-option">
            <input type="radio" name="verhoging" value="nee" ${saved.verhoging === "nee" ? "checked" : ""}>
            <span>Nee</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="verhoging" value="ja" ${saved.verhoging === "ja" ? "checked" : ""}>
            <span>Ja, verhogen</span>
          </label>
        </div>
        <div class="radio-group__error"></div>
      </fieldset>
    </div>
  `;

  container.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const ontslagHA = container.querySelector('input[name="ontslagHA"]:checked');
      const verhoging = container.querySelector('input[name="verhoging"]:checked');

      const data = {
        ontslagHA: ontslagHA ? ontslagHA.value : null,
        verhoging: verhoging ? verhoging.value : null,
      };

      wizardState.setData("adjustmentType", data);
      isValid = data.ontslagHA === "ja" && data.verhoging === "ja";

      // Clear error on the fieldset that was just answered
      const fieldset = radio.closest(".radio-group");
      if (fieldset) {
        const err = fieldset.querySelector(".radio-group__error");
        if (err) { err.textContent = ""; err.style.display = "none"; }
      }
    });
  });
}

function validate() {
  if (isValid) return true;

  const fields = ["ontslagHA", "verhoging"];
  for (const name of fields) {
    const fieldset = document.querySelector(`.radio-group[data-field="${name}"]`);
    if (!fieldset) continue;
    const checked = fieldset.querySelector(`input[name="${name}"]:checked`);
    const err = fieldset.querySelector(".radio-group__error");
    if (!checked) {
      if (err) {
        err.textContent = "Maak een keuze. Deze vraag is verplicht.";
        err.style.display = "block";
      }
      fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    } else if (checked.value !== "ja") {
      if (err) {
        err.textContent = "Maak een keuze. Deze vraag is verplicht.";
        err.style.display = "block";
      }
      fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
  }
  return false;
}

registerStep("adjustment-type", {
  render,
  validate,
  label: "Kies je aanvraag",
  nextLabel: "Hypotheek aanpassen",
  backLabel: "Aanvraag annuleren",
});
