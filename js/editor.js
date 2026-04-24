/* ============================================================
   SHIVA EDITOR - CORE ENGINE (UPDATED)
   ============================================================ */

const codeArea = document.getElementById("codeArea");
const lineBox = document.getElementById("lineNumbers");
const suggestBox = document.getElementById("suggestBox");
const cursorPosDisplay = document.getElementById("cursorPos");

let fontSize = 16;

/* ---------- Code Model ---------- */

// Editor mein code set karne ke liye
window.setCode = function(text) {
  if (!text) text = "";
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  codeArea.innerHTML = lines.map(line => {
    const safe = escapeHtml(line);
    return `<div class="code-line">${safe || ""}</div>`;
  }).join("");
  updateLines();
  applyHighlighting(); // Syntax highlight trigger
};

// Editor se raw text nikalne ke liye
window.getCode = function() {
  return [...codeArea.querySelectorAll(".code-line")]
    .map(l => l.innerText || "")
    .join("\n");
};

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"'`]/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
  }[m]));
}

/* ---------- UI Updates ---------- */

function updateLines() {
  const lines = codeArea.querySelectorAll(".code-line");
  const count = lines.length || 1;
  let nums = "";
  for (let i = 1; i <= count; i++) {
    nums += `<div>${i}</div>`;
  }
  lineBox.innerHTML = nums;
}

// Cursor position (Ln, Col) track karne ke liye
function updateCursorInfo() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const curLineElem = range.startContainer.parentElement.closest(".code-line");
  
  if (!curLineElem) return;

  const lines = [...codeArea.querySelectorAll(".code-line")];
  const row = lines.indexOf(curLineElem) + 1;
  const col = range.startOffset + 1;

  cursorPosDisplay.innerText = `Ln ${row}, Col ${col}`;
}

/* ---------- Editor Actions ---------- */

// Preview Logic (HTML/JS code run karne ke liye)
window.runPreview = function() {
  const code = window.getCode();
  const previewWindow = window.open("", "_blank");
  previewWindow.document.open();
  previewWindow.document.write(code);
  previewWindow.document.close();
};

// File Save (Local Download)
window.saveFile = function() {
  const code = window.getCode();
  const blob = new Blob([code], { type: "text/plain" });
  const anchor = document.createElement("a");
  anchor.download = "index.html";
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
};

// File Open (Local Upload)
window.openFile = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => window.setCode(event.target.result);
    reader.readAsText(file);
  };
  input.click();
};

window.clearEditor = function() {
  if (confirm("Poora code delete kar dein?")) {
    window.setCode("");
    saveToStorage();
  }
};

window.copyCode = function() {
  const code = window.getCode();
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('[title="Copy All"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-check" style="color:var(--success)"></i>';
    setTimeout(() => btn.innerHTML = original, 2000);
  });
};

/* ---------- Font & Theme Controls ---------- */

window.fontPlus = () => { fontSize++; applyFont(); };
window.fontMinus = () => { if (fontSize > 10) fontSize--; applyFont(); };

function applyFont() {
  codeArea.style.fontSize = fontSize + "px";
  lineBox.style.fontSize = fontSize + "px";
}

window.toggleWrap = () => {
  const isWrapped = codeArea.style.whiteSpace === "pre-wrap";
  codeArea.style.whiteSpace = isWrapped ? "pre" : "pre-wrap";
  document.getElementById("wrapBtn").classList.toggle("active");
};

// Basic Syntax Highlighting (Monaco feel)
function applyHighlighting() {
    // Note: Future mein yahan Prism.js ya regex logic dalenge keywords color karne ke liye
    // Abhi ke liye hum focus functional stability par rakh rahe hain
}

/* ---------- Events ---------- */

codeArea.addEventListener("input", () => {
  updateLines();
  saveToStorage();
});

// Cursor update events
["click", "keyup", "touchstart"].forEach(evt => {
  codeArea.addEventListener(evt, updateCursorInfo);
});

// Tab key handle (4 spaces)
codeArea.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const tabNode = document.createTextNode("    ");
    range.insertNode(tabNode);
    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode); 
    selection.removeAllRanges();
    selection.addRange(range);
  }
});

/* ---------- Storage & Sync ---------- */

function saveToStorage() {
  const code = window.getCode();
  localStorage.setItem("shivaCode", code);
  
  // Firebase Cloud Sync call (Jo index.html mein define hai)
  if (window.saveCloud) {
    window.saveCloud(code);
  }
}

// Initial Load
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("shivaCode");
  if (saved) window.setCode(saved);
  applyFont();
});
     
