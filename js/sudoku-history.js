/**
 * 数独提交记录（按日期分组存储，localStorage，私人本地）
 */
const SudokuHistory = (() => {
  const STORAGE_KEY = "sudoku-completed-history";
  const MAX_RECORDS = 300;

  const DIFF_LABEL = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
    expert: "专家",
  };

  function toDateKey(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  }

  function flattenGrouped(byDate) {
    return Object.values(byDate || {})
      .flat()
      .filter((r) => r && typeof r === "object")
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  function trimGrouped(byDate) {
    const all = flattenGrouped(byDate).slice(0, MAX_RECORDS);
    const next = {};
    all.forEach((entry) => {
      const key = toDateKey(entry.completedAt);
      if (!next[key]) next[key] = [];
      next[key].push(entry);
    });
    return next;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) return { byDate: {} };

      // 兼容旧版扁平数组
      if (Array.isArray(parsed)) {
        const byDate = {};
        parsed.forEach((entry) => {
          const key = toDateKey(entry.completedAt || new Date().toISOString());
          if (!byDate[key]) byDate[key] = [];
          byDate[key].push(entry);
        });
        return { byDate };
      }

      if (parsed && typeof parsed === "object" && parsed.byDate && typeof parsed.byDate === "object") {
        return { byDate: parsed.byDate };
      }
    } catch {
      // ignore parse error
    }
    return { byDate: {} };
  }

  function saveData(data) {
    const normalized = { byDate: trimGrouped(data.byDate || {}) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  function loadRecords() {
    try {
      return flattenGrouped(loadData().byDate);
    } catch {
      return [];
    }
  }

  function puzzleId(puzzle) {
    return puzzle
      .map((row) => row.map((v) => (v === 0 ? "." : String(v))).join(""))
      .join("");
  }

  function getCompletedIds() {
    return new Set(
      loadRecords()
        .filter((r) => r.result !== "fail")
        .map((r) => r.id)
    );
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function record({ puzzle, difficulty, seconds, standalone, result = "pass", errors = 0 }) {
    const id = puzzleId(puzzle);
    const now = new Date().toISOString();
    const dateKey = toDateKey(now);
    const data = loadData();
    const entry = {
      id,
      difficulty,
      seconds,
      standalone: !!standalone,
      result,
      errors,
      completedAt: now,
    };
    if (!data.byDate[dateKey]) data.byDate[dateKey] = [];
    data.byDate[dateKey].unshift(entry);

    try {
      saveData(data);
      renderUI();
    } catch {
      // keep game flow smooth even if storage fails
    }
    return entry;
  }

  function renderUI() {
    const listEl = document.getElementById("sudoku-history-list");
    const countEl = document.getElementById("sudoku-history-count");
    if (!listEl) return;

    const records = loadRecords();
    if (countEl) countEl.textContent = String(records.length);

    if (records.length === 0) {
      listEl.innerHTML = '<li class="history-empty">还没有提交记录</li>';
      return;
    }

    const grouped = {};
    records.slice(0, 20).forEach((r) => {
      const key = toDateKey(r.completedAt);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    listEl.innerHTML = Object.entries(grouped)
      .map(([date, items]) => {
        const rows = items
          .map((r) =>
            `<li class="history-item">
              <span class="history-time">${formatDate(r.completedAt)}</span>
              <span class="history-meta">${r.result === "fail" ? "提交失败" : "提交成功"} · ${DIFF_LABEL[r.difficulty] || r.difficulty} · ${formatDuration(r.seconds)}${r.standalone ? " · 独立" : ""}${r.result === "fail" ? ` · 错${r.errors}` : ""}</span>
            </li>`
          )
          .join("");
        return `<li class="history-day">
          <div class="history-day-title">${date}</div>
          <ul class="history-day-list">${rows}</ul>
        </li>`;
      })
      .join("");
  }

  function exportJson() {
    const data = loadData();
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), mode: "group-by-date", ...data }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `数独提交记录_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearAll() {
    if (!confirm("确定清空全部数独提交记录吗？")) return;
    saveData({ byDate: {} });
    renderUI();
  }

  function init() {
    const exportBtn = document.getElementById("sudoku-export-history");
    const clearBtn = document.getElementById("sudoku-clear-history");
    if (exportBtn) exportBtn.addEventListener("click", exportJson);
    if (clearBtn) clearBtn.addEventListener("click", clearAll);
    renderUI();
  }

  return {
    init,
    record,
    puzzleId,
    getCompletedIds,
    loadRecords,
    renderUI,
  };
})();
