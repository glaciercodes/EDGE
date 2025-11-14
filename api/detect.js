// This would be a serverless function for Vercel
// Save this as /api/detect.js in your Vercel project

const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI with your API key from environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, type = 'article' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create a more detailed prompt based on the type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'article') {
      systemPrompt = 'You are a professional content writer. Create engaging, well-structured articles that are informative and easy to read. Use proper headings, paragraphs, and highlight key points.';
      userPrompt = `Write a comprehensive article about: ${prompt}. The article should be approximately 500-700 words, well-structured with clear sections, and include practical insights.`;
    } else {
      systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.';
      userPrompt = prompt;
    }

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const generatedText = completion.data.choices[0].message.content;

    // Return the generated content
    res.status(200).json({
      success: true,
      article: generatedText,
      type: type
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle different types of errors
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        error: 'Error from OpenAI API',
        details: error.response.data
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
};
