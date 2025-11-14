// api/detect.js - Vercel Serverless Function
export default async function handler(req, res) {
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
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, type = 'article' } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ 
        error: 'Server configuration error: OpenAI API key is missing' 
      });
    }

    // Create a more detailed prompt based on the type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'article') {
      systemPrompt = 'You are a professional content writer. Create engaging, well-structured articles that are informative and easy to read. Use proper headings, paragraphs, and highlight key points. Make it sound human-written and natural.';
      userPrompt = `Write a comprehensive, well-structured article about: "${prompt}". The article should be approximately 500-700 words, include clear sections with headings, and provide practical, valuable insights. Format it with proper paragraph breaks.`;
    } else {
      systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.';
      userPrompt = prompt;
    }

    console.log('Making request to OpenAI API...');
    
    // Call OpenAI API directly using fetch
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorData);
      throw new Error(`OpenAI API returned ${openaiResponse.status}: ${errorData}`);
    }

    const openaiData = await openaiResponse.json();
    
    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const generatedText = openaiData.choices[0].message.content;

    console.log('Successfully generated article');
    
    // Return the generated content
    return res.status(200).json({
      success: true,
      article: generatedText,
      type: type
    });

  } catch (error) {
    console.error('API error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your API configuration in Vercel environment variables.' 
      });
    } else if (error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please check your OpenAI billing.' 
      });
    } else if (error.message.includes('OpenAI API')) {
      return res.status(502).json({
        error: `OpenAI API error: ${error.message}`
      });
    } else {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}
