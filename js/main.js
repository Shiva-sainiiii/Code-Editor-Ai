/* ============================================================
   SHIVA EDITOR - AI LOGIC & API (CONTEXT-AWARE VERSION)
   ============================================================ */

// 1. AI Chat Function (Chat tab se message bhejne ke liye)
async function sendAI() {
  const aiInput = document.getElementById("aiInput");
  const text = aiInput.value.trim();
  if (!text) return;

  // Editor se current code fetch karna context ke liye
  const currentCode = typeof window.getCode === 'function' ? window.getCode() : "";
  
  // User ka message UI par dikhana
  if (typeof appendUserMsg === 'function') appendUserMsg(text);
  aiInput.value = "";

  // AI typing placeholder dikhana
  const placeholder = typeof appendAIPlaceholder === 'function' ? appendAIPlaceholder() : null;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are Shiva Editor AI, a helpful coding assistant. Here is the user's current code in the editor for context:\n\n\`\`\`\n${currentCode}\n\`\`\`\n\nHelp the user with their questions or modify the code as requested. Keep your explanations concise.`
          },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      throw new Error("Invalid AI response");
    }

    const reply = data.choices[0].message.content;
    if (placeholder) placeholder.innerHTML = formatResponse(reply);

  } catch (err) {
    console.error("AI Chat Error:", err);
    if (placeholder) placeholder.innerText = "❌ Error connecting to AI. Check console for details.";
  }
}

/* ============================================================
   2. Analyze Code Function (Bugs & Improvements dhundne ke liye)
   ============================================================ */
async function analyzeCode() {
  const code = typeof window.getCode === 'function' ? window.getCode() : "";
  if (!code.trim()) return alert("Editor is empty! Please write some code first to analyze.");

  // Panel open karna aur chat tab show karna
  if (typeof openAIPanel === 'function') openAIPanel();
  if (typeof showAnalyze === 'function') showAnalyze();
  
  const placeholder = typeof appendAIPlaceholder === 'function' ? appendAIPlaceholder() : null;
  if (placeholder) placeholder.innerHTML = "<i>Analyzing your code for bugs and improvements...</i>";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an expert Senior Web Developer. Analyze the following code. Point out bugs, performance issues, and suggest modern improvements. Format your response cleanly using markdown lists and code blocks."
          },
          {
            role: "user",
            content: `Please analyze this code:\n\n\`\`\`\n${code}\n\`\`\``
          }
        ]
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      throw new Error("Invalid AI response");
    }

    const reply = data.choices[0].message.content;
    if (placeholder) placeholder.innerHTML = formatResponse(reply);

  } catch (err) {
    console.error("Analysis Error:", err);
    if (placeholder) placeholder.innerText = "❌ Code analysis failed. Check API connection.";
  }
}

/* ============================================================
   3. Code Generator Function (Text se code banana)
   ============================================================ */
async function convertTextToCode(previewOnly = false) {
  const promptInput = document.getElementById("convertPrompt");
  const prompt = promptInput ? promptInput.value.trim() : "";
  if (!prompt) return alert("Please describe what you want to generate.");

  if (typeof showAnalyze === 'function') showAnalyze(); // Chat tab par wapas laana progress dikhane ke liye
  const placeholder = typeof appendAIPlaceholder === 'function' ? appendAIPlaceholder() : null;
  if (placeholder) placeholder.innerHTML = "<i>Generating code... This might take a moment.</i>";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a code generator. Write ONLY the requested code. No explanations, no pleasantries. Ensure the code is production-ready and enclosed in markdown triple backticks."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      throw new Error("Invalid AI response");
    }

    const raw = data.choices[0].message.content;
    const code = extractCode(raw);

    if (previewOnly) {
      // Sirf preview dikhana
      if (placeholder) placeholder.innerHTML = `<div class="preview-badge" style="color:var(--accent); font-weight:bold; margin-bottom:5px;">Preview:</div><pre><code>${escapeHtml(code)}</code></pre>`;
    } else {
      // Editor me direct insert karna
      if (typeof window.setCode === 'function') {
        window.setCode(code);
        if (placeholder) placeholder.innerHTML = "✅ Code successfully injected into the editor!";
        if (typeof closeAIPanel === 'function') setTimeout(closeAIPanel, 1500);
      } else {
        throw new Error("setCode function not found in editor.js");
      }
    }

  } catch (err) {
    console.error("Generation Error:", err);
    if (placeholder) placeholder.innerText = "❌ Code generation failed. Check console for details.";
  }
}

/* ============================================================
   4. Helper Functions
   ============================================================ */

// AI ke response ko format karna (Code blocks handle karna)
function formatResponse(text) {
  if (!text) return "";

  // Markdown code blocks ko HTML/CSS ui me wrap karna
  let formattedText = text.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const safeCode = escapeHtml(code.trim());
    // Escape special characters for the copy function
    const rawCodeForCopy = code.trim().replace(/`/g, '\\`').replace(/\$/g, '\\$'); 
    
    return `
      <div class="ai-code-wrapper" style="position:relative; margin: 15px 0; border: 1px solid var(--glass-border); border-radius: 8px; overflow: hidden;">
        <div class="ai-code-header" style="background: rgba(0,0,0,0.5); padding: 8px 12px; font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border);">
          <span style="text-transform: uppercase; font-weight: 600;">${lang || 'code'}</span>
          <button onclick="copyToClipboard(\`${rawCodeForCopy}\`)" style="background: none; border: none; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 12px; transition: 0.2s;">
            <i class="ph ph-copy"></i> Copy
          </button>
        </div>
        <pre style="margin: 0; padding: 12px; background: rgba(0,0,0,0.2); overflow-x: auto;"><code>${safeCode}</code></pre>
      </div>
    `;
  });

  // Normal text ke line breaks ko <br> me convert karna
  return formattedText.replace(/\n/g, "<br>");
}

