export default async function handler(req, res) {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Call OpenAI — your key is stored in Vercel environment variables
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful content generator." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res.status(500).json({ error: "AI generation failed." });
    }

    const aiText = data.choices?.[0]?.message?.content || "No output generated.";

    return res.status(200).json({ result: aiText });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Server error occurred." });
  }
}
