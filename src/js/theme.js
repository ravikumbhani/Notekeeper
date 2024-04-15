"use strict";

/**
 * Togglers the theme between 'light' and 'dark'
 * Manages the theme setting in the DOM nd local storage
 */
const toggleTheme = () => {
  const /** {string} */ currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
  const /** {string} */ newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
};

// Initialize the theme
const /** {string | null} */ storedTheme = localStorage.getItem("theme");
const /** {boolean} */ systemThemeIsDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
const /** {string} */ initialTheme =
    storedTheme ?? (systemThemeIsDark ? "dark" : "light");

document.documentElement.setAttribute("data-theme", initialTheme);

// Attach Toggle Theme to theme button event
document.addEventListener("DOMContentLoaded", () => {
  const /** {HTMLElement} */ $themeBtn =
      document.querySelector("[data-theme-btn]");
  if ($themeBtn) $themeBtn.addEventListener("click", toggleTheme);
});
