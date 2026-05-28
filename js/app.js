/**
 * 应用入口：标签切换、主题、Toast
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

  const tabs = document.querySelectorAll(".tab");
  const panels = {
    sudoku: document.getElementById("panel-sudoku"),
    schulte: document.getElementById("panel-schulte"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active);
      });
      Object.entries(panels).forEach(([key, panel]) => {
        const active = key === id;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    });
  });

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

  const STANDALONE_KEY = "sudoku-standalone";

  function setSudokuStandalone(on) {
    document.body.classList.toggle("sudoku-standalone", on);
    const nav = document.getElementById("sudoku-standalone-nav");
    const toggle = document.getElementById("sudoku-standalone-toggle");
    if (nav) nav.hidden = !on;
    if (toggle) toggle.textContent = on ? "退出独立模式" : "进入独立模式";
    if (on) {
      document.querySelectorAll(".tab").forEach((t) => {
        const isSudoku = t.dataset.tab === "sudoku";
        t.classList.toggle("active", isSudoku);
        t.setAttribute("aria-selected", isSudoku);
      });
      panels.sudoku.classList.add("active");
      panels.sudoku.hidden = false;
      panels.schulte.classList.remove("active");
      panels.schulte.hidden = true;
    }
    localStorage.setItem(STANDALONE_KEY, on ? "1" : "0");
    if (Sudoku.updateStandaloneUI) Sudoku.updateStandaloneUI();
  }

  window.enterSudokuStandalone = () => setSudokuStandalone(true);
  window.exitSudokuStandalone = () => setSudokuStandalone(false);

  const enterBtn = document.getElementById("sudoku-standalone-toggle");
  const exitBtn = document.getElementById("sudoku-exit-standalone");
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      if (document.body.classList.contains("sudoku-standalone")) {
        exitSudokuStandalone();
      } else {
        enterSudokuStandalone();
      }
    });
  }
  if (exitBtn) exitBtn.addEventListener("click", exitSudokuStandalone);

  const urlStandalone = new URLSearchParams(location.search).get("standalone") === "1";
  if (urlStandalone || localStorage.getItem(STANDALONE_KEY) === "1") {
    setSudokuStandalone(true);
  }

  if (typeof SudokuHistory !== "undefined" && SudokuHistory?.init) SudokuHistory.init();
  Sudoku.init();
  if (document.getElementById("panel-schulte")) Schulte.init();
})();
