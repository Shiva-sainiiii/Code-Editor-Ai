/* ============================================================
   SHIVA EDITOR - AI PANEL UI & INTERACTIONS
   ============================================================ */

const aiPanel = document.getElementById("aiPanel");
const aiOutput = document.getElementById("aiOutput");
const aiInput = document.getElementById("aiInput");

/**
 * Opens the AI Panel with animation
 */
window.openAIPanel = function() {
  aiPanel.classList.add("open");
  aiPanel.setAttribute("aria-hidden", "false");
  if (aiInput) aiInput.focus();
};

/**
 * Closes the AI Panel
 */
window.closeAIPanel = function() {
  aiPanel.classList.remove("open");
  aiPanel.setAttribute("aria-hidden", "true");
  // Reset transform if it was dragged
  aiPanel.style.transform = "";
};

/**
 * Tab Switching: Chat/Analyze
 */
window.showAnalyze = function() {
  document.getElementById("pageAnalyze").style.display = "flex";
  document.getElementById("pageConvert").style.display = "none";
  document.getElementById("tabAnalyze").classList.add("active");
  document.getElementById("tabConvert").classList.remove("active");
};

/**
 * Tab Switching: Code Generator
 */
window.showConvert = function() {
  document.getElementById("pageAnalyze").style.display = "none";
  document.getElementById("pageConvert").style.display = "flex";
  document.getElementById("tabAnalyze").classList.remove("active");
  document.getElementById("tabConvert").classList.add("active");
};

/**
 * UI Rendering Helpers
 */
window.appendUserMsg = function(text) {
  const div = document.createElement("div");
  div.className = "msg user-msg-wrap";
  div.innerHTML = `
    <span class="who">You</span>
    <div class="ai-msg">${escapeHtml(text)}</div>
  `;
  aiOutput.appendChild(div);
  scrollToBottom();
};

window.appendAIPlaceholder = function() {
  const div = document.createElement("div");
  div.className = "msg ai-response-wrap";
  div.innerHTML = `
    <span class="who">Shiva AI</span>
    <div class="ai-msg typing-effect">
      <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
    </div>
  `;
  aiOutput.appendChild(div);
  scrollToBottom();
  return div.querySelector(".ai-msg");
};

function scrollToBottom() {
  aiOutput.scrollTop = aiOutput.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/* ---------- Advanced Dragging Logic (Mobile Friendly) ---------- */
let isDragging = false;
let startY;
let startHeight;

const dragHandle = document.getElementById("dragHandle");

if (dragHandle) {
  // Mouse Events
  dragHandle.addEventListener("mousedown", initDrag);
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);

  // Touch Events
  dragHandle.addEventListener("touchstart", (e) => initDrag(e.touches[0]));
  document.addEventListener("touchmove", (e) => doDrag(e.touches[0]));
  document.addEventListener("touchend", stopDrag);
}

function initDrag(e) {
  isDragging = true;
  startY = e.clientY;
  startHeight = aiPanel.offsetHeight;
  aiPanel.style.transition = "none"; // Disable transitions while dragging
}

function doDrag(e) {
  if (!isDragging) return;
  const delta = startY - e.clientY;
  const newHeight = startHeight + delta;
  
  // Set height limits (30% to 90% of window)
  if (newHeight > window.innerHeight * 0.3 && newHeight < window.innerHeight * 0.9) {
    aiPanel.style.height = newHeight + "px";
  }
}

function stopDrag() {
  if (!isDragging) return;
  isDragging = false;
  aiPanel.style.transition = "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)"; // Restore transition
   }
     
