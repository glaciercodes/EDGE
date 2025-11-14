// api/detect.js
// Vercel serverless function - POST { topic, audience, tone, length }
// Returns JSON { article: "..." }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { topic, audience = '', tone = 'friendly', length = 'medium' } = body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Missing topic' });
  }

  // build a clear prompt for the model
  const lengthHint = length === 'short' ? '200-300 words' : length === 'long' ? '700+ words' : '400-600 words';
  const audienceHint = audience ? `Audience: ${audience}.` : '';

  const systemPrompt = `You are an expert content writer who writes clear, friendly, and well-structured articles that humans can easily edit. Keep language simple, avoid overly-complex vocabulary, and highlight main points with short, clear paragraphs.`;

  const userPrompt = `
Write an article about: "${topic}"

${audienceHint}
Tone: ${tone}.
Length: ${lengthHint}.

Include:
- a short introduction,
- 3-5 clear body points with short headings,
- a brief conclusion with a call-to-action.

Make the article easy to read and human-editable. Do not invent facts; keep claims generic unless user provided specifics.
Return only the article text.
  `.trim();

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // Call OpenAI Chat Completions
    const payload = {
      model: 'gpt-4o-mini', // change model if you prefer
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1200,
      temperature: 0.6,
      top_p: 1.0
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI error:', text);
      return res.status(502).json({ error: 'OpenAI request failed', details: text });
    }

    const json = await r.json();
    // Chat completions usually return choices[0].message.content
    const article = json?.choices?.[0]?.message?.content || '';

    return res.status(200).json({ article });
  } catch (err) {
    console.error('Server error', err);
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
