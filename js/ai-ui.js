/* ============================================================
   SHIVA EDITOR - AI PANEL UI
   ============================================================ */

const aiPanel = document.getElementById("aiPanel");
const aiOutput = document.getElementById("aiOutput");
const aiInput = document.getElementById("aiInput");

function openAIPanel() {
  aiPanel.classList.add("open");
  aiPanel.setAttribute("aria-hidden", "false");
  aiInput.focus();
}

function closeAIPanel() {
  aiPanel.classList.remove("open");
  aiPanel.setAttribute("aria-hidden", "true");
}

function showAnalyze() {
  document.getElementById("pageAnalyze").style.display = "flex";
  document.getElementById("pageConvert").style.display = "none";
  document.getElementById("tabAnalyze").classList.add("active");
  document.getElementById("tabConvert").classList.remove("active");
}

function showConvert() {
  document.getElementById("pageAnalyze").style.display = "none";
  document.getElementById("pageConvert").style.display = "flex";
  document.getElementById("tabAnalyze").classList.remove("active");
  document.getElementById("tabConvert").classList.add("active");
}

function clearAiChat() {
  aiOutput.innerHTML = `
    <div class="welcome-msg">
      <i class="ph ph-robot"></i>
      <p>Chat cleared. How can I help you with your code?</p>
    </div>`;
}

/* ---------- Message Rendering ---------- */
function appendUserMsg(text) {
  const div = document.createElement("div");
  div.className = "msg user-msg-wrap";
  div.innerHTML = `<span class="who">You</span><div class="ai-msg user-bubble">${escapeHtml(text)}</div>`;
  aiOutput.appendChild(div);
  scrollToBottom();
}

function appendAIPlaceholder() {
  const div = document.createElement("div");
  div.className = "msg ai-msg-wrap";
  div.innerHTML = `<span class="who">AI Assistant</span><div class="ai-msg typing"><span>.</span><span>.</span><span>.</span></div>`;
  aiOutput.appendChild(div);
  scrollToBottom();
  return div.querySelector(".ai-msg");
}

function scrollToBottom() {
  aiOutput.scrollTop = aiOutput.scrollHeight;
}

/* ---------- Dragging Logic ---------- */
let isDragging = false;
let currentY;
let initialY;
let yOffset = 0;

const dragHandle = document.getElementById("dragHandle");

dragHandle.addEventListener("touchstart", dragStart, false);
dragHandle.addEventListener("touchend", dragEnd, false);
dragHandle.addEventListener("touchmove", drag, false);

dragHandle.addEventListener("mousedown", dragStart, false);
document.addEventListener("mousemove", drag, false);
document.addEventListener("mouseup", dragEnd, false);

function dragStart(e) {
  if (e.type === "touchstart") {
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialY = e.clientY - yOffset;
  }
  isDragging = true;
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    if (e.type === "touchmove") {
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentY = e.clientY - initialY;
    }
    // Only allow dragging upwards (negative Y)
    if (currentY < 0) {
      yOffset = currentY;
      aiPanel.style.transform = `translate(-50%, ${currentY}px)`;
    }
  }
}

function dragEnd() {
  isDragging = false;
  // If dragged significantly down, close it
  if (yOffset > 100) closeAIPanel();
  // Reset transform to allow CSS transitions to take over
  aiPanel.style.transform = "";
  yOffset = 0;
}
