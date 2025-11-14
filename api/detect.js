// api/detect.js - Vercel Serverless Function
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0].message.content;

    // Return the generated content
    return res.status(200).json({
      success: true,
      article: generatedText,
      type: type
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Provide more specific error messages
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API configuration.' 
      });
    } else if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please check your OpenAI billing.' 
      });
    } else if (error.response) {
      return res.status(error.response.status).json({
        error: 'Error from OpenAI API',
        details: error.response.data
      });
    } else {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}
