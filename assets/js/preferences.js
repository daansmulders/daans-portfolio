document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleMobile = document.getElementById("theme-toggle-mobile");

  // Get all toggle buttons that exist
  const themeToggles = [themeToggle, themeToggleMobile].filter(Boolean);

  if (themeToggles.length === 0) {
    // No buttons found, nothing to wire up
    return;
  }

  // --- Helper function to update all buttons ---
  function updateThemeButtons(isDark) {
    themeToggles.forEach(button => {
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
      button.textContent = isDark ? "☀ Light" : "🌙 Dark";
    });
  }

  // --- Initial state from localStorage ---
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark") {
    body.classList.add("theme-dark");
    updateThemeButtons(true);
  } else {
    updateThemeButtons(false);
  }

  // --- Toggle handler ---
  themeToggles.forEach(button => {
    button.addEventListener("click", function () {
      const isDark = body.classList.toggle("theme-dark");
      updateThemeButtons(isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  });
});
