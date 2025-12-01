document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  const fontToggle = document.getElementById("font-toggle");

  if (!themeToggle || !fontToggle) {
    // Buttons not found, nothing to wire up
    return;
  }

  // --- Initial state from localStorage ---
  const storedTheme = localStorage.getItem("theme");
  const storedFont = localStorage.getItem("fontPref");

  if (storedTheme === "dark") {
    body.classList.add("theme-dark");
    themeToggle.setAttribute("aria-pressed", "true");
    themeToggle.textContent = "☀ Light";
  } else {
    themeToggle.setAttribute("aria-pressed", "false");
    themeToggle.textContent = "🌙 Dark";
  }

  if (storedFont === "sans") {
    body.classList.add("font-sans");
    fontToggle.setAttribute("aria-pressed", "true");
    fontToggle.textContent = "Serif";
  } else {
    fontToggle.setAttribute("aria-pressed", "false");
    fontToggle.textContent = "Sans";
  }

  // --- Toggle handlers ---
  themeToggle.addEventListener("click", function () {
    const isDark = body.classList.toggle("theme-dark");
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.textContent = isDark ? "☀ Light" : "🌙 Dark";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  fontToggle.addEventListener("click", function () {
    const isSans = body.classList.toggle("font-sans");
    fontToggle.setAttribute("aria-pressed", isSans ? "true" : "false");
    fontToggle.textContent = isSans ? "Serif" : "Sans";
    localStorage.setItem("fontPref", isSans ? "sans" : "serif");
  });
});
