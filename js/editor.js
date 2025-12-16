/* ================== DOM ================== */
const codeArea = document.getElementById("codeArea");
const lineBox = document.getElementById("lineNumbers");
const suggestBox = document.getElementById("suggestBox");

let fontSize = 15;

/* ================== HTML Escape ================== */
function escapeHtml(str){
  if(!str && str !== "") return "";
  return str.replace(/[&<>"'`]/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[m])
  );
}

/* ================== Code Model ================== */
function setCode(text){
  const lines = text.replace(/\r\n/g,"\n").split("\n");
  codeArea.innerHTML = lines.map(line=>{
    const safe = escapeHtml(line);
    return safe === ""
      ? `<div class="code-line"></div>`
      : `<div class="code-line">${safe}</div>`;
  }).join("");
  updateLines();
}

function getCode(){
  return [...codeArea.querySelectorAll(".code-line")]
    .map(l=>l.innerText || "")
    .join("\n");
}

/* ================== Storage ================== */
function scheduleSave(){
  clearTimeout(scheduleSave.t);
  scheduleSave.t = setTimeout(()=>{
    localStorage.setItem("shivaCode", getCode());
  },600);
}

if(localStorage.getItem("shivaCode")){
  setCode(localStorage.getItem("shivaCode"));
}else{
  setCode(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>New file</title>
  </head>
  <body>

  </body>
</html>`);
}

/* ================== Line Numbers ================== */
function updateLines(){
  const count = Math.max(1, getCode().split("\n").length);
  lineBox.innerHTML = Array.from({length:count},(_,i)=>i+1).join("<br>");
  lineBox.scrollTop = codeArea.scrollTop;
}

codeArea.addEventListener("scroll",()=> lineBox.scrollTop = codeArea.scrollTop);
codeArea.addEventListener("input",()=>{ updateLines(); scheduleSave(); });

/* ================== Caret Helpers ================== */
function getCaretOffset(){
  const sel = window.getSelection();
  if(!sel.rangeCount) return 0;
  const range = sel.getRangeAt(0).cloneRange();
  range.selectNodeContents(codeArea);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function setCaretByOffset(offset){
  codeArea.focus();
  let current = 0;
  const range = document.createRange();
  const sel = window.getSelection();

  function walk(node){
    if(node.nodeType === 3){
      if(current + node.length >= offset){
        range.setStart(node, offset - current);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        throw "done";
      }
      current += node.length;
    }else{
      node.childNodes.forEach(walk);
    }
  }

  try{ walk(codeArea); }catch{}
}

function setCaretToEnd(){
  setCaretByOffset(getCode().length);
}

/* ================== Basic Actions ================== */
function clearEditor(){
  setCode("");
  setCaretToEnd();
}

function toggleWrap(){
  codeArea.style.whiteSpace =
    getComputedStyle(codeArea).whiteSpace === "pre" ? "pre-wrap" : "pre";
}

function fontPlus(){
  fontSize = Math.min(36,fontSize+1);
  codeArea.style.fontSize = lineBox.style.fontSize = fontSize+"px";
}

function fontMinus(){
  fontSize = Math.max(10,fontSize-1);
  codeArea.style.fontSize = lineBox.style.fontSize = fontSize+"px";
}

/* ================== Undo / Redo ================== */
let undoStack=[], redoStack=[], isUndoRedo=false;

function saveState(){
  if(isUndoRedo) return;
  undoStack.push(getCode());
  if(undoStack.length>100) undoStack.shift();
  redoStack.length=0;
}

codeArea.addEventListener("input", saveState);

function undo(){
  if(!undoStack.length) return;
  isUndoRedo=true;
  redoStack.push(getCode());
  setCode(undoStack.pop());
  setCaretToEnd();
  isUndoRedo=false;
}

function redo(){
  if(!redoStack.length) return;
  isUndoRedo=true;
  undoStack.push(getCode());
  setCode(redoStack.pop());
  setCaretToEnd();
  isUndoRedo=false;
}

/* ================== Clipboard ================== */
function copyCode(){
  const sel = window.getSelection().toString();
  navigator.clipboard.writeText(sel || getCode());
}

/* ================== File ================== */
function saveFile(){
  const blob = new Blob([getCode()],{type:"text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download="code.html";
  a.click();
}

function openFile(){
  const input=document.createElement("input");
  input.type="file";
  input.accept=".html,.js,.css,.txt";
  input.onchange=e=>{
    const r=new FileReader();
    r.onload=()=>{ setCode(r.result); setCaretToEnd(); };
    r.readAsText(e.target.files[0]);
  };
  input.click();
}

function runPreview(){
  const win = window.open();
  win.document.write(getCode());
  win.document.close();
}

/* ================== Keyboard ================== */
codeArea.addEventListener("keydown",e=>{
  if(e.key==="Tab"){
    e.preventDefault();
    document.execCommand("insertText",false,"\t");
  }

  if(e.key==="Enter"){
    e.preventDefault();
    const sel=window.getSelection();
    const range=sel.getRangeAt(0);
    const before=range.startContainer.textContent.slice(0,range.startOffset);
    const indent=(before.match(/^[\t ]*/)||[""])[0];
    document.execCommand("insertText",false,"\n"+indent);
  }

  const pairs={"{":"}","(" :")","[":"]","\"":"\"","'":"'"};
  if(pairs[e.key]){
    e.preventDefault();
    document.execCommand("insertText",false,e.key+pairs[e.key]);
    setCaretByOffset(getCaretOffset()-1);
  }
});

/* ================== Paste ================== */
codeArea.addEventListener("paste",e=>{
  e.preventDefault();
  const text=(e.clipboardData||window.clipboardData).getData("text");
  document.execCommand("insertText",false,text.replace(/\r\n/g,"\n"));
});

/* ================== Suggestions ================== */
const tags=["div","p","span","img","a","ul","li","section","header","footer","button","input"];

codeArea.addEventListener("keyup",()=>{
  const txt=codeArea.innerText;
  const m=txt.match(/<([a-z]*)$/i);
  if(!m){ suggestBox.style.display="none"; return; }

  const found=tags.filter(t=>t.startsWith(m[1]));
  if(!found.length) return;

  suggestBox.innerHTML=found.map(t=>`<div>${t}</div>`).join("");
  suggestBox.style.display="block";

  suggestBox.querySelectorAll("div").forEach(d=>{
    d.onclick=()=>{
      document.execCommand("insertText",false,d.innerText+">");
      suggestBox.style.display="none";
    };
  });
});

/* ================== Init ================== */
setTimeout(()=>{
  updateLines();
  setCaretToEnd();
},100);

/* ================= Insert Generated Code at Caret ================= */

function insertTextAtCursor(text){
  const pos = getCaretOffset();
  const full = getCode();

  const before = full.slice(0, pos);
  const after  = full.slice(pos);

  setCode(before + text + after);
  setCaretByOffset(pos + text.length);
  scheduleSave();
}

function insertGeneratedCodeAtCaret(code){
  let chunk = code;

  if(!chunk.startsWith("\n")) chunk = "\n" + chunk;
  if(!chunk.endsWith("\n")) chunk = chunk + "\n";

  insertTextAtCursor(chunk);
}
