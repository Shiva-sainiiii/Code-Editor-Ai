/* ================= AI PANEL UI ================= */

const aiPanel   = document.getElementById("aiPanel");
const aiOutput  = document.getElementById("aiOutput");
const aiInput   = document.getElementById("aiInput");
const dragHandle = document.getElementById("dragHandle");

/* ---------- Open / Close ---------- */
function openAIPanel(){
  aiPanel.classList.add("open");
  aiPanel.setAttribute("aria-hidden","false");
  aiInput.focus();
  showAnalyze();
}

function closeAIPanel(){
  aiPanel.classList.remove("open");
  aiPanel.setAttribute("aria-hidden","true");
}

function clearAiChat(){
  aiOutput.innerHTML = "";
  aiOutput.scrollTop = 0;
  showAnalyze();
}

/* ---------- Tabs ---------- */
function showAnalyze(){
  document.getElementById("pageAnalyze").style.display = "block";
  document.getElementById("pageConvert").style.display = "none";
  document.getElementById("tabAnalyze").classList.add("active");
  document.getElementById("tabConvert").classList.remove("active");
}

function showConvert(){
  document.getElementById("pageAnalyze").style.display = "none";
  document.getElementById("pageConvert").style.display = "block";
  document.getElementById("tabAnalyze").classList.remove("active");
  document.getElementById("tabConvert").classList.add("active");
}

/* ---------- Messages ---------- */
function appendUserMsg(text){
  const wrap = document.createElement("div");
  wrap.className = "msg";
  wrap.innerHTML = `
    <span class="who">You</span>
    <div class="ai-msg">${escapeHtml(text)}</div>
  `;
  aiOutput.appendChild(wrap);
  aiOutput.scrollTop = aiOutput.scrollHeight;
}

function appendAIPlaceholder(){
  const wrap = document.createElement("div");
  wrap.className = "msg";
  wrap.innerHTML = `
    <span class="who">AI</span>
    <div class="ai-msg">
      <span class="typing">
        AI is typing<span>.</span><span>.</span><span>.</span>
      </span>
    </div>
  `;
  aiOutput.appendChild(wrap);
  aiOutput.scrollTop = aiOutput.scrollHeight;
  return wrap;
}

function appendAIText(text, placeholder){
  const node = placeholder || appendAIPlaceholder();
  node.querySelector(".ai-msg").innerHTML = renderReplyToHtml(text);
  aiOutput.scrollTop = aiOutput.scrollHeight;
}

/* ---------- Markdown-safe Renderer ---------- */
function renderReplyToHtml(md){
  if(!md) return "";

  const fence = /```(?:([\w+-]+)\n)?([\s\S]*?)```/g;
  let out = md.replace(fence, (_,lang,code)=>{
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  });

  const parts = out.split(/(<pre><code>[\s\S]*?<\/code><\/pre>)/g);
  for(let i=0;i<parts.length;i++){
    if(!parts[i].startsWith("<pre><code>")){
      parts[i] = escapeHtml(parts[i]).replace(/\n/g,"<br>");
    }
  }
  return parts.join("");
}

/* ---------- Copy AI Output ---------- */
function copyAIOutput(){
  navigator.clipboard.writeText(aiOutput.innerText || "");
}

/* ---------- Add copy buttons to code blocks ---------- */
function addCopyButtons(){
  document.querySelectorAll(".ai-msg pre").forEach(pre=>{
    if(pre.querySelector(".copy-btn")) return;

    const code = pre.querySelector("code");
    if(!code) return;

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";

    btn.onclick = ()=>{
      navigator.clipboard.writeText(code.innerText);
      btn.textContent = "Copied!";
      setTimeout(()=> btn.textContent="Copy",1500);
    };

    pre.appendChild(btn);
  });
}

/* ---------- Drag AI Panel ---------- */
(function(){
  let dragging=false,startY=0,startBottom=0;
  const header=document.querySelector(".ai-header");

  function start(e){
    dragging=true;
    startY=(e.touches?e.touches[0].clientY:e.clientY);
    const r=aiPanel.getBoundingClientRect();
    startBottom=window.innerHeight-r.bottom;
    document.body.style.userSelect="none";
  }

  function move(e){
    if(!dragging) return;
    const y=(e.touches?e.touches[0].clientY:e.clientY);
    const dy=y-startY;
    aiPanel.style.bottom=Math.max(0,startBottom-dy)+"px";
  }

  function end(){
    dragging=false;
    document.body.style.userSelect="";
  }

  dragHandle.addEventListener("mousedown",start);
  header.addEventListener("mousedown",start);
  window.addEventListener("mousemove",move);
  window.addEventListener("mouseup",end);

  dragHandle.addEventListener("touchstart",start);
  header.addEventListener("touchstart",start);
  window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("touchend",end);
})();

/* ---------- ESC to close ---------- */
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") closeAIPanel();
});