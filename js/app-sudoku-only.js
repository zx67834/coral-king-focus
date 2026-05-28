/**
 * 数独独立页入口（sudoku.html）
 */
(function () {
  const THEME_KEY = "app-theme";
  const THEMES = ["dark", "light", "green", "warm"];

  function setTheme(theme) {
    if (!THEMES.includes(theme)) theme = "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll(".theme-dot").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === theme);
    });
  }

  document.querySelectorAll(".theme-dot").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });
  setTheme(localStorage.getItem(THEME_KEY) || "green");

  let toastTimer;
  window.showToast = function (text, type = "") {
    const el = document.getElementById("toast");
    el.textContent = text;
    el.className = "toast" + (type ? ` ${type}` : "");
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2800);
  };

  if (typeof SudokuHistory !== "undefined" && SudokuHistory?.init) SudokuHistory.init();
  Sudoku.init();
  if (Sudoku.updateStandaloneUI) Sudoku.updateStandaloneUI();
})();
