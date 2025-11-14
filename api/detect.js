// Vercel serverless function for OpenAI integration
const OpenAI = require('openai');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keywords, preferences } = req.body;

    if (!keywords) {
      return res.status(400).json({ error: 'Keywords are required' });
    }

    // Initialize OpenAI with API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Construct the prompt for OpenAI
    const prompt = `Write a comprehensive, well-structured article about "${keywords}". ${
      preferences ? `Please consider these preferences: ${preferences}.` : ''
    }

    Requirements:
    - Create a professional, engaging article
    - Include an introduction, main content with key points, and conclusion
    - Use clear, readable language
    - Make it informative and valuable for readers
    - Ensure proper structure with logical flow
    - Length: approximately 500-800 words

    Please generate the article now:`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer who creates high-quality, engaging articles. Your writing is clear, informative, and well-structured. Always provide original, valuable content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const article = completion.choices[0].message.content;

    // Return the generated article
    res.status(200).json({
      success: true,
      article: article
    });

  } catch (error) {
    console.error('Error generating article:', error);
    
    res.status(500).json({ 
      error: 'Failed to generate article. Please try again.',
      details: error.message
    });
  }
};
