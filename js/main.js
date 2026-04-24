/* ============================================================
   SHIVA EDITOR - AI LOGIC & API
   ============================================================ */

async function sendAI() {
  const text = aiInput.value.trim();
  if (!text) return;

  appendUserMsg(text);
  aiInput.value = "";
  const placeholder = appendAIPlaceholder();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: text }]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    // Simple markdown code block formatter
    placeholder.innerHTML = formatResponse(reply);
  } catch (err) {
    placeholder.innerText = "Error connecting to AI. Please check your API.";
  }
}

async function analyzeCode() {
  const code = getCode();
  if (!code.trim()) return alert("Editor is empty!");

  const placeholder = appendAIPlaceholder();
  
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a senior developer. Find bugs and suggest improvements for this code." },
          { role: "user", content: code }
        ]
      })
    });

    const data = await response.json();
    placeholder.innerHTML = formatResponse(data.choices[0].message.content);
  } catch (err) {
    placeholder.innerText = "Analysis failed.";
  }
}

async function convertTextToCode(previewOnly = false) {
  const prompt = document.getElementById("convertPrompt").value;
  if (!prompt) return;

  const placeholder = appendAIPlaceholder();
  showAnalyze(); // Switch to chat view to show progress

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Write ONLY the requested code. No talk." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const code = extractCode(data.choices[0].message.content);

    if (previewOnly) {
      placeholder.innerHTML = `<pre><code>${escapeHtml(code)}</code></pre>`;
    } else {
      setCode(code);
      placeholder.innerHTML = "Code injected into editor!";
      closeAIPanel();
    }
  } catch (err) {
    placeholder.innerText = "Generation failed.";
  }
}

/* ---------- Helpers ---------- */
function formatResponse(text) {
  // Replace code blocks with styled <pre>
  return text.replace(/
http://googleusercontent.com/immersive_entry_chip/0
http://googleusercontent.com/immersive_entry_chip/1

### Instructions for Implementation:
1.  **Replace** the contents of your existing files in the `js/` folder with these.
2.  **Ensure** your `api/chat.js` is correctly configured with your **OpenRouter API Key** (as per your uploaded file).
3.  The **Phosphor Icons** and **JetBrains Mono** font are loaded via the `index.html` head, so the UI will update automatically once these scripts are saved.

How do these improvements look to you? I'm ready to help with any further refinements!
           
