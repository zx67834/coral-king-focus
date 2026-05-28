/**
 * 数独：生成、求解、游戏逻辑
 */
const Sudoku = (() => {
  const SIZE = 9;
  const BOX = 3;
  const EMPTY = 0;

  const CLUES = {
    easy: 42,
    medium: 32,
    hard: 26,
    expert: 22,
  };

  function getHistoryApi() {
    return typeof SudokuHistory !== "undefined" ? SudokuHistory : null;
  }

  function createEmpty() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  }

  function clone(grid) {
    return grid.map((row) => [...row]);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isValid(grid, row, col, num) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[row][c] === num) return false;
    }
    for (let r = 0; r < SIZE; r++) {
      if (grid[r][col] === num) return false;
    }
    const br = Math.floor(row / BOX) * BOX;
    const bc = Math.floor(col / BOX) * BOX;
    for (let r = br; r < br + BOX; r++) {
      for (let c = bc; c < bc + BOX; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function findEmpty(grid) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === EMPTY) return [r, c];
      }
    }
    return null;
  }

  function solve(grid) {
    const pos = findEmpty(grid);
    if (!pos) return true;
    const [row, col] = pos;
    for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (solve(grid)) return true;
        grid[row][col] = EMPTY;
      }
    }
    return false;
  }

  function countSolutions(grid, limit = 2) {
    let count = 0;
    function backtrack() {
      if (count >= limit) return;
      const pos = findEmpty(grid);
      if (!pos) {
        count++;
        return;
      }
      const [row, col] = pos;
      for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
          grid[row][col] = num;
          backtrack();
          grid[row][col] = EMPTY;
          if (count >= limit) return;
        }
      }
    }
    backtrack();
    return count;
  }

  function generateFull() {
    const grid = createEmpty();
    solve(grid);
    return grid;
  }

  function generatePuzzle(difficulty) {
    const solution = generateFull();
    const puzzle = clone(solution);
    const targetClues = CLUES[difficulty] || CLUES.medium;
    const cells = shuffle(
      Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE])
    );

    let removed = 0;
    const maxRemove = SIZE * SIZE - targetClues;

    for (const [r, c] of cells) {
      if (removed >= maxRemove) break;
      const backup = puzzle[r][c];
      puzzle[r][c] = EMPTY;
      const test = clone(puzzle);
      if (countSolutions(test, 2) === 1) {
        removed++;
      } else {
        puzzle[r][c] = backup;
      }
    }
    return { puzzle, solution };
  }

  function generatePuzzleAvoidingCompleted(difficulty) {
    const history = getHistoryApi();
    const completedIds = history?.getCompletedIds
      ? history.getCompletedIds()
      : new Set();
    const maxAttempts = 8;
    let lastResult = null;
    for (let i = 0; i < maxAttempts; i++) {
      const result = generatePuzzle(difficulty);
      lastResult = result;
      const id = history?.puzzleId
        ? history.puzzleId(result.puzzle)
        : null;
      if (!id || !completedIds.has(id)) return result;
    }
    return lastResult || generatePuzzle(difficulty);
  }

  // --- UI ---
  let puzzle = createEmpty();
  let solution = createEmpty();
  let userGrid = createEmpty();
  let notes = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => new Set())
  );
  let given = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  let selected = null;
  let noteMode = false;
  let timerInterval = null;
  let seconds = 0;
  let completed = false;
  let showConflicts = false;

  function isStandaloneMode() {
    return document.body.classList.contains("sudoku-standalone") ||
      document.body.classList.contains("sudoku-page");
  }

  const gridEl = () => document.getElementById("sudoku-grid");
  const timerEl = () => document.getElementById("sudoku-timer");
  const messageEl = () => document.getElementById("sudoku-message");

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function startTimer() {
    stopTimer();
    seconds = 0;
    timerEl().textContent = formatTime(0);
    timerInterval = setInterval(() => {
      seconds++;
      timerEl().textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function idx(r, c) {
    return r * SIZE + c;
  }

  function renderGrid() {
    const el = gridEl();
    el.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("div");
        cell.className = "sudoku-cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("tabindex", given[r][c] ? "-1" : "0");

        if (given[r][c]) cell.classList.add("given");

        const val = userGrid[r][c];
        if (val !== EMPTY) {
          const span = document.createElement("span");
          span.className = "value";
          span.textContent = val;
          cell.appendChild(span);
        } else if (notes[r][c].size > 0) {
          const notesEl = document.createElement("div");
          notesEl.className = "notes";
          for (let n = 1; n <= 9; n++) {
            const s = document.createElement("span");
            if (notes[r][c].has(n)) s.textContent = n;
            notesEl.appendChild(s);
          }
          cell.appendChild(notesEl);
        }

        if (!given[r][c]) {
          cell.addEventListener("click", () => selectCell(r, c));
        }
        el.appendChild(cell);
      }
    }
    updateHighlights();
    updateNumpad();
  }

  function getCellEl(r, c) {
    return gridEl().children[idx(r, c)];
  }

  function selectCell(r, c) {
    if (completed || given[r][c]) return;
    selected = [r, c];
    updateHighlights();
  }

  function updateHighlights() {
    const cells = gridEl().children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      cell.classList.remove("selected", "highlight-peer", "same-value", "conflict");
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      const val = userGrid[r][c];

      if (selected) {
        const [sr, sc] = selected;
        if (r === sr && c === sc) cell.classList.add("selected");
        else if (r === sr || c === sc ||
          (Math.floor(r / BOX) === Math.floor(sr / BOX) &&
           Math.floor(c / BOX) === Math.floor(sc / BOX))) {
          cell.classList.add("highlight-peer");
        }
        if (val !== EMPTY && val === userGrid[sr][sc]) {
          cell.classList.add("same-value");
        }
      }

      const showError = !given[r][c] && val !== EMPTY && val !== solution[r][c];
      if (showError && (!isStandaloneMode() || showConflicts)) {
        cell.classList.add("conflict");
      }
    }
  }

  function updateNumpad() {
    const pad = document.getElementById("sudoku-numpad");
    if (!pad.children.length) {
      for (let n = 1; n <= 9; n++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "numpad-btn";
        btn.textContent = n;
        btn.addEventListener("click", () => inputNumber(n));
        pad.appendChild(btn);
      }
    }
    const counts = Array(10).fill(0);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = userGrid[r][c];
        if (v !== EMPTY) counts[v]++;
      }
    }
    pad.querySelectorAll(".numpad-btn").forEach((btn, i) => {
      btn.classList.toggle("done", counts[i + 1] >= 9);
    });
  }

  function isBoardFilled() {
    return userGrid.every((row) => row.every((v) => v !== EMPTY));
  }

  function clearConflictMarks() {
    if (showConflicts) {
      showConflicts = false;
    }
  }

  function afterBoardChange() {
    if (completed) return;
    if (isBoardFilled()) {
      showMessage("已填满，点击「提交答案」进行判定");
    }
  }

  function countBoardErrors() {
    let errors = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (userGrid[r][c] !== solution[r][c]) errors++;
      }
    }
    return errors;
  }

  function finishSuccess(standalone) {
    completed = true;
    stopTimer();
    const history = getHistoryApi();
    if (history?.record) {
      history.record({
        puzzle,
        difficulty: document.getElementById("sudoku-difficulty").value,
        seconds,
        standalone,
        result: "pass",
        errors: 0,
      });
    }
  }

  function runFinalCheck() {
    const errors = countBoardErrors();
    if (errors > 0) {
      showConflicts = true;
      renderGrid();
      const history = getHistoryApi();
      if (history?.record) {
        history.record({
          puzzle,
          difficulty: document.getElementById("sudoku-difficulty").value,
          seconds,
          standalone: true,
          result: "fail",
          errors,
        });
      }
      showMessage(`提交失败：有 ${errors} 格不正确`, "error");
      return;
    }
    finishSuccess(true);
    showMessage(`提交成功！用时 ${formatTime(seconds)}`, "success");
    if (window.showToast) showToast("提交成功！", "success");
  }

  function submitBoard() {
    if (completed) return;
    if (!isBoardFilled()) {
      showMessage("请先填满全部格子再提交", "error");
      return;
    }
    if (isStandaloneMode()) {
      runFinalCheck();
      return;
    }
    const errors = countBoardErrors();
    if (errors > 0) {
      showConflicts = true;
      renderGrid();
      const history = getHistoryApi();
      if (history?.record) {
        history.record({
          puzzle,
          difficulty: document.getElementById("sudoku-difficulty").value,
          seconds,
          standalone: false,
          result: "fail",
          errors,
        });
      }
      showMessage(`提交失败：有 ${errors} 格不正确`, "error");
      return;
    }
    finishSuccess(false);
    showMessage(`提交成功！用时 ${formatTime(seconds)}`, "success");
    if (window.showToast) showToast("提交成功！", "success");
  }

  function inputNumber(num) {
    if (completed || !selected) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    clearConflictMarks();

    if (noteMode) {
      if (notes[r][c].has(num)) notes[r][c].delete(num);
      else notes[r][c].add(num);
      renderGrid();
      return;
    }

    notes[r][c].clear();
    userGrid[r][c] = userGrid[r][c] === num ? EMPTY : num;
    renderGrid();
    afterBoardChange();
  }

  function erase() {
    if (completed || !selected) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    clearConflictMarks();
    userGrid[r][c] = EMPTY;
    notes[r][c].clear();
    renderGrid();
    if (isStandaloneMode() && !completed) {
      showMessage("独立模式：填满后点击提交进行判定");
    }
  }

  function hint() {
    if (isStandaloneMode()) return;
    if (completed || !selected) {
      showMessage("请先选中一个空格", "error");
      return;
    }
    const [r, c] = selected;
    if (given[r][c]) return;
    userGrid[r][c] = solution[r][c];
    notes[r][c].clear();
    renderGrid();
    checkWin();
  }

  function checkBoard() {
    if (isStandaloneMode()) return;
    let errors = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!given[r][c] && userGrid[r][c] !== EMPTY && userGrid[r][c] !== solution[r][c]) {
          errors++;
        }
      }
    }
    if (errors === 0) {
      const filled = userGrid.every((row) => row.every((v) => v !== EMPTY));
      showMessage(filled ? "全部正确！" : "目前没有错误，继续加油", filled ? "success" : "");
    } else {
      showMessage(`发现 ${errors} 处错误`, "error");
      renderGrid();
    }
  }

  function checkWin() {
    // 保留函数以兼容旧调用，判定统一走提交按钮
    afterBoardChange();
  }

  function showMessage(text, type = "") {
    const el = messageEl();
    el.textContent = text;
    el.className = "message" + (type ? ` ${type}` : "");
  }

  function newGame() {
    const difficulty = document.getElementById("sudoku-difficulty").value;
    completed = false;
    showConflicts = false;
    showMessage("正在生成…");
    setTimeout(() => {
      const result = generatePuzzleAvoidingCompleted(difficulty);
      puzzle = result.puzzle;
      solution = result.solution;
      userGrid = clone(puzzle);
      notes = Array.from({ length: SIZE }, () =>
        Array.from({ length: SIZE }, () => new Set())
      );
      given = puzzle.map((row) => row.map((v) => v !== EMPTY));
      selected = null;
      showMessage(
        isStandaloneMode()
          ? "独立模式：无提示，填满后点击提交进行判定"
          : ""
      );
      renderGrid();
      startTimer();
    }, 10);
  }

  function updateStandaloneUI() {
    const assist = document.getElementById("sudoku-assist");
    if (assist) assist.hidden = isStandaloneMode();
    if (!isStandaloneMode()) {
      showConflicts = false;
    } else if (!completed) {
      showMessage("独立模式：无提示，填满后点击提交进行判定");
    }
    if (gridEl().children.length) renderGrid();
  }

  function isActive() {
    if (document.body.classList.contains("sudoku-standalone") ||
        document.body.classList.contains("sudoku-page")) {
      return true;
    }
    const panel = document.getElementById("panel-sudoku");
    return panel && panel.classList.contains("active");
  }

  function init() {
    document.getElementById("sudoku-new").addEventListener("click", newGame);
    document.getElementById("sudoku-submit")?.addEventListener("click", submitBoard);
    document.getElementById("sudoku-check").addEventListener("click", checkBoard);
    document.getElementById("sudoku-hint").addEventListener("click", hint);
    document.getElementById("sudoku-erase").addEventListener("click", erase);
    document.getElementById("sudoku-note-toggle").addEventListener("click", (e) => {
      noteMode = !noteMode;
      e.currentTarget.classList.toggle("active", noteMode);
    });
    document.getElementById("sudoku-difficulty").addEventListener("change", newGame);

    document.addEventListener("keydown", (e) => {
      if (!isActive()) return;
      if (e.key === "Escape" && document.body.classList.contains("sudoku-standalone")) {
        if (window.exitSudokuStandalone) window.exitSudokuStandalone();
        e.preventDefault();
        return;
      }
      if (completed) return;
      const key = e.key;
      if (key >= "1" && key <= "9") {
        inputNumber(parseInt(key, 10));
        e.preventDefault();
      } else if (key === "Backspace" || key === "Delete") {
        erase();
        e.preventDefault();
      } else if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
        moveSelection(key);
        e.preventDefault();
      }
    });

    newGame();
  }

  function moveSelection(key) {
    let r = selected ? selected[0] : 0;
    let c = selected ? selected[1] : 0;
    if (key === "ArrowUp") r = Math.max(0, r - 1);
    if (key === "ArrowDown") r = Math.min(8, r + 1);
    if (key === "ArrowLeft") c = Math.max(0, c - 1);
    if (key === "ArrowRight") c = Math.min(8, c + 1);
    selectCell(r, c);
    getCellEl(r, c)?.focus();
  }

  return { init, isActive, newGame, updateStandaloneUI, isStandaloneMode };
})();
