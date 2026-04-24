/* ============================================================
   SHIVA EDITOR - CORE ENGINE
   ============================================================ */

const codeArea = document.getElementById("codeArea");
const lineBox = document.getElementById("lineNumbers");
const suggestBox = document.getElementById("suggestBox");
const cursorPosDisplay = document.getElementById("cursorPos");

let fontSize = 15;

/* ---------- Code Model ---------- */
function setCode(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  codeArea.innerHTML = lines.map(line => {
    const safe = escapeHtml(line);
    return safe === "" 
      ? `<div class="code-line"></div>` 
      : `<div class="code-line">${safe}</div>`;
  }).join("");
  updateLines();
}

function getCode() {
  return [...codeArea.querySelectorAll(".code-line")]
    .map(l => l.innerText || "")
    .join("\n");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"'`]/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
  }[m]));
}

/* ---------- UI Updates ---------- */
function updateLines() {
  const count = codeArea.querySelectorAll(".code-line").length || 1;
  let nums = "";
  for (let i = 1; i <= count; i++) nums += i + "<br>";
  lineBox.innerHTML = nums;
}

// Tracks Line and Column for the Status Bar
function updateCursorInfo() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  
  // Find the current line div
  let currentLine = node.nodeType === 3 ? node.parentNode : node;
  while (currentLine && !currentLine.classList?.contains('code-line')) {
    currentLine = currentLine.parentNode;
  }

  const allLines = [...codeArea.querySelectorAll(".code-line")];
  const lineIdx = allLines.indexOf(currentLine) + 1;
  const colIdx = range.startOffset + 1;

  cursorPosDisplay.innerText = `Ln ${lineIdx || 1}, Col ${colIdx || 1}`;
}

/* ---------- Editor Actions ---------- */
function clearEditor() {
  if (confirm("Clear all code?")) {
    setCode("");
    saveToStorage();
  }
}

function copyCode() {
  navigator.clipboard.writeText(getCode());
  const btn = document.querySelector('[title="Copy All"]');
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="ph ph-check"></i>';
  setTimeout(() => btn.innerHTML = original, 2000);
}

function fontPlus() { fontSize++; applyFont(); }
function fontMinus() { if (fontSize > 8) fontSize--; applyFont(); }
function applyFont() {
  codeArea.style.fontSize = fontSize + "px";
  lineBox.style.fontSize = fontSize + "px";
}

function toggleWrap() {
  const isWrapped = codeArea.style.whiteSpace === "pre-wrap";
  codeArea.style.whiteSpace = isWrapped ? "pre" : "pre-wrap";
  document.getElementById("wrapBtn").classList.toggle("active");
}

/* ---------- Events ---------- */
codeArea.addEventListener("input", () => {
  updateLines();
  saveToStorage();
});

// Update status bar on click or key navigation
["click", "keyup", "touchstart"].forEach(evt => {
  codeArea.addEventListener(evt, updateCursorInfo);
});

// Tab key handling
codeArea.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    document.execCommand("insertText", false, "    ");
  }
});

/* ---------- Storage ---------- */
function saveToStorage() {
  localStorage.setItem("shivaCode", getCode());
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("shivaCode");
  if (saved) setCode(saved);
  else setCode("");
});
  
