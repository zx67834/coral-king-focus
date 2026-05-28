/**
 * 舒尔特方格：按顺序点击 1..N
 */
const Schulte = (() => {
  const STORAGE_KEY = "schulte-best-times";

  let size = 4;
  let numbers = [];
  let nextTarget = 1;
  let playing = false;
  let startTime = 0;
  let rafId = null;

  const gridEl = () => document.getElementById("schulte-grid");
  const targetEl = () => document.getElementById("schulte-target");
  const timerEl = () => document.getElementById("schulte-timer");
  const bestEl = () => document.getElementById("schulte-best");
  const messageEl = () => document.getElementById("schulte-message");

  function getBestTimes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveBestTime(sizeKey, ms) {
    const times = getBestTimes();
    if (!times[sizeKey] || ms < times[sizeKey]) {
      times[sizeKey] = ms;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
    }
    updateBestDisplay();
  }

  function updateBestDisplay() {
    const times = getBestTimes();
    const key = String(size);
    const ms = times[key];
    if (ms != null) {
      bestEl().textContent = formatMs(ms);
    } else {
      bestEl().textContent = "—";
    }
  }

  function formatMs(ms) {
    return (ms / 1000).toFixed(2) + "s";
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildGrid() {
    const total = size * size;
    numbers = shuffle(Array.from({ length: total }, (_, i) => i + 1));
    nextTarget = 1;
    playing = false;
    stopTimerLoop();

    const el = gridEl();
    el.className = `schulte-grid size-${size}`;
    el.innerHTML = "";

    numbers.forEach((num, i) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "schulte-cell";
      cell.textContent = num;
      cell.dataset.value = num;
      cell.disabled = !playing;
      cell.addEventListener("click", () => onCellClick(num, cell));
      el.appendChild(cell);
    });

    targetEl().textContent = "1";
    timerEl().textContent = "0.00s";
    messageEl().textContent = "点击「开始」后，按从小到大的顺序依次点击数字";
    messageEl().className = "message center";
    updateBestDisplay();
  }

  function start() {
    size = parseInt(document.getElementById("schulte-size").value, 10);
    buildGrid();
    playing = true;
    startTime = performance.now();
    targetEl().textContent = "1";
    messageEl().textContent = "找到并点击数字 1";

    gridEl().querySelectorAll(".schulte-cell").forEach((cell) => {
      cell.disabled = false;
    });

    startTimerLoop();
  }

  function startTimerLoop() {
    stopTimerLoop();
    function tick() {
      if (!playing) return;
      const elapsed = performance.now() - startTime;
      timerEl().textContent = formatMs(elapsed);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopTimerLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function onCellClick(num, cell) {
    if (!playing || cell.classList.contains("done")) return;

    const total = size * size;

    if (num === nextTarget) {
      cell.classList.add("done");
      nextTarget++;
      targetEl().textContent = nextTarget > total ? "✓" : String(nextTarget);

      if (nextTarget > total) {
        finish();
      } else {
        messageEl().textContent = `很好！接下来点击 ${nextTarget}`;
      }
    } else {
      cell.classList.add("wrong");
      setTimeout(() => cell.classList.remove("wrong"), 350);
      messageEl().textContent = `点错了，应该点击 ${nextTarget}`;
      messageEl().className = "message center error";
      setTimeout(() => {
        if (playing) messageEl().className = "message center";
      }, 800);
    }
  }

  function finish() {
    playing = false;
    stopTimerLoop();
    const elapsed = performance.now() - startTime;
    timerEl().textContent = formatMs(elapsed);
    saveBestTime(String(size), elapsed);

    messageEl().textContent = `完成！用时 ${formatMs(elapsed)}`;
    messageEl().className = "message center success";

    gridEl().querySelectorAll(".schulte-cell").forEach((c) => {
      c.disabled = true;
    });

    if (window.showToast) showToast(`舒尔特 ${size}×${size} 完成！`, "success");
  }

  function init() {
    document.getElementById("schulte-start").addEventListener("click", start);
    document.getElementById("schulte-size").addEventListener("change", () => {
      size = parseInt(document.getElementById("schulte-size").value, 10);
      buildGrid();
    });
    size = parseInt(document.getElementById("schulte-size").value, 10);
    buildGrid();
  }

  return { init };
})();
