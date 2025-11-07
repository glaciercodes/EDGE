export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body || "{}");

    const { prompt, system = "You are a helpful assistant.", model = "gpt-4o-mini" } = body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({ error: "Prompt is too short or missing." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      return res.status(500).json({ error: "OpenAI returned no response." });
    }

    res.status(200).json({
      success: true,
      result: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error. Check your backend setup.",
      details: error.message
    });
  }
}
