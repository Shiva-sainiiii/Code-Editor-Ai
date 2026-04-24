
/**
 * SHIVA EDITOR - AI Chat API (Vercel Serverless Function)
 * Model: DeepSeek R1 (via OpenRouter)
 */

export default async function handler(req, res) {
  // 1. Security: Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ 
      error: "Method not allowed", 
      message: "This endpoint only accepts POST requests for AI interactions." 
    });
  }

  // 2. CORS Headers (Optional but recommended for API safety)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { messages, temperature = 0.6 } = req.body;

    // 3. Validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: 'messages' must be an array." });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Missing OPENROUTER_API_KEY in environment variables.");
      return res.status(500).json({ error: "Server configuration error: API Key missing." });
    }

    // 4. API Request to OpenRouter
    // We use DeepSeek R1 for high-quality code reasoning
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://shiva-editor.vercel.app", // Optional: Update with your domain
        "X-Title": "Shiva Code Editor"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free", 
        messages: messages,
        temperature: temperature,
        top_p: 0.9,
        max_tokens: 2000
      })
    });

    // 5. Response Handling
    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(response.status).json({
        error: "AI Service Error",
        message: data.error?.message || "Failed to fetch AI response."
      });
    }

    // Success response
    return res.status(200).json(data);

  } catch (err) {
    console.error("Serverless Function Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
}
