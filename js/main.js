/* ============================================================
   SHIVA EDITOR - AI LOGIC & API (FIXED VERSION)
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: text }]
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      throw new Error("Invalid AI response");
    }

    const reply = data.choices[0].message.content;
    placeholder.innerHTML = formatResponse(reply);

  } catch (err) {
    console.error(err);
    placeholder.innerText = "❌ Error connecting to AI. Check API.";
  }
}


/* ---------- Analyze Code ---------- */
async function analyzeCode() {
  const code = getCode();
  if (!code.trim()) return alert("Editor is empty!");

  const placeholder = appendAIPlaceholder();

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
            content: "You are a senior developer. Find bugs and suggest improvements."
          },
          {
            role: "user",
            content: code
          }
        ]
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      throw new Error("Invalid AI response");
    }

    const reply = data.choices[0].message.content;
    placeholder.innerHTML = formatResponse(reply);

  } catch (err) {
    console.error(err);
    placeholder.innerText = "❌ Analysis failed.";
  }
}


/* ---------- Convert Text → Code ---------- */
async function convertTextToCode(previewOnly = false) {
  const prompt = document.getElementById("convertPrompt").value;
  if (!prompt) return;

  const placeholder = appendAIPlaceholder();
  showAnalyze(); // switch to chat

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
            content: "Write ONLY code. No explanation."
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
      placeholder.innerHTML = `<pre><code>${escapeHtml(code)}</code></pre>`;
    } else {
      setCode(code);
      placeholder.innerHTML = "✅ Code injected into editor!";
      closeAIPanel();
    }

  } catch (err) {
    console.error(err);
    placeholder.innerText = "❌ Generation failed.";
  }
}


/* ---------- Helpers ---------- */

// Format AI response (supports code blocks)
function formatResponse(text) {
  if (!text) return "";

  return text
    .replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    })
    .replace(/\n/g, "<br>");
}


// Extract only code from AI response
function extractCode(text) {
  if (!text) return "";

  const match = text.match(/```([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}
