/* ================= MAIN / AI LOGIC ================= */

/* ---------- Send AI Message ---------- */
async function sendAI(){
  const input = aiInput.value.trim();
  if(!input) return;

  appendUserMsg(input);
  const placeholder = appendAIPlaceholder();
  aiInput.value = "";

  try{
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `
You are a helpful AI assistant.

RULES:
- Short answers
- Bullet points if possible
- Code ONLY inside code blocks
- No explanations of thinking
`
          },
          { role:"user", content: input }
        ],
        temperature: 0.7
      })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No response";

    appendAIText(reply, placeholder);
    addCopyButtons();

  }catch(err){
    appendAIText("Error: "+err.message, placeholder);
  }
}

/* ---------- Analyze Code ---------- */
async function analyzeCode(){
  const code = getCode();
  if(!code.trim()){
    appendAIText("⚠ No code to analyze.");
    return;
  }

  const placeholder = appendAIPlaceholder();

  try{
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `
You are a code analyzer.
- Find bugs
- Explain simply
- Suggest fixes
- Provide corrected code
`
          },
          {
            role: "user",
            content: "Analyze this code:\n\n" + code
          }
        ],
        temperature: 0.25
      })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No response";

    appendAIText(reply, placeholder);
    addCopyButtons();

  }catch(err){
    appendAIText("AI Error: "+err.message, placeholder);
  }
}

/* ---------- Convert Text → Code ---------- */
async function convertTextToCode(preview=false){
  const prompt = document.getElementById("convertPrompt").value.trim();
  if(!prompt){
    appendAIText("⚠ Please describe what code you want.");
    return;
  }

  const placeholder = appendAIPlaceholder();

  try{
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Return ONLY code. Use markdown code blocks."
          },
          {
            role: "user",
            content: "Write code for: " + prompt
          }
        ],
        temperature: 0.2
      })
    });

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content || "";

    let match = reply.match(/```[\s\S]*?```/);
    let code = match
      ? match[0].replace(/```[\w+-]*/,"").replace(/```/,"").trim()
      : reply.trim();

    if(preview){
      appendAIText("Preview:\n\n```html\n"+code+"\n```", placeholder);
      addCopyButtons();
      return;
    }

    insertGeneratedCodeAtCaret(code);

  }catch(err){
    appendAIText("Convert Error: "+err.message, placeholder);
  }
}

/* ---------- Accessibility ---------- */
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") closeAIPanel();
});