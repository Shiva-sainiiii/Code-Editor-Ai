/**
 * SHIVA EDITOR - AI Chat API (Vercel Serverless Function)
 * Model: Nvidia Nemotron 3 Super 120b (Free) via OpenRouter
 */

export default async function handler(req, res) {
  // 1. Security: Sirf POST requests allow karein
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ 
      error: "Method not allowed", 
      message: "Ye endpoint sirf AI interactions ke liye POST requests accept karta hai." 
    });
  }

  // 2. CORS Headers (Browser compatibility ke liye)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { messages, temperature = 0.6 } = req.body;

    // 3. Validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: 'messages' ek array honi chahiye." });
    }

    // Check if API Key exists in Environment Variables
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Missing OPENROUTER_API_KEY in Vercel Environment Variables.");
      return res.status(500).json({ error: "Server error: API Key missing hai." });
    }

    // 4. API Request to OpenRouter
    // Model ko "nvidia/nemotron-3-super-120b-a12b:free" par hi rakha gaya hai
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://shiva-editor.vercel.app", // Isko apne domain se badal sakte ho
        "X-Title": "Shiva Code Editor"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free", 
        messages: messages,
        temperature: temperature,
        top_p: 0.9,
        max_tokens: 2048 // Code generation ke liye kaafi tokens
      })
    });

    // 5. Response Handling
    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return res.status(response.status).json({
        error: "AI Service Error",
        message: data.error?.message || "AI response fetch karne mein fail ho gaya."
      });
    }

    // 6. Success: AI ka reply bhej rahe hain
    return res.status(200).json(data);

  } catch (err) {
    console.error("Internal Server Error:", err);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message 
    });
  }
        }
                    
