// api/detect.js - Corrected for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.trim().length < 100) {
      return res.status(400).json({ error: 'Text must be at least 100 characters long' });
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'Service configuration error - Check API Key' });
    }

    console.log('Starting analysis for text length:', text.length);
    
    // Analyze the text with OpenAI
    const analysis = await analyzeWithOpenAI(text, apiKey);
    
    console.log('Analysis completed:', analysis);
    
    res.status(200).json(analysis);
    
  } catch (error) {
    console.error('Error in detection handler:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
};

async function analyzeWithOpenAI(text, apiKey) {
  const prompt = `Analyze this text and determine if it was AI-generated or human-written. Return ONLY valid JSON:

{
  "isAI": true/false,
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}

Text: "${text.substring(0, 2000)}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI content detector. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown API error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    console.log('OpenAI raw response:', content);
    
    if (!content) {
      throw new Error('No response from AI analysis');
    }

    // Clean the response
    const cleanContent = content.replace(/```json|```/g, '').trim();
    
    try {
      const result = JSON.parse(cleanContent);

      // Validate the response
      if (typeof result.isAI !== 'boolean') {
        throw new Error('Invalid AI detection result');
      }

      if (typeof result.confidence !== 'number') {
        result.confidence = result.isAI ? 0.7 : 0.3;
      }

      // Ensure confidence is between 0 and 1
      result.confidence = Math.max(0.1, Math.min(1, result.confidence));

      return result;

    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', cleanContent);
      return getFallbackAnalysis(text);
    }

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return getFallbackAnalysis(text);
  }
}

function getFallbackAnalysis(text) {
  // Simple fallback analysis
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = words / Math.max(sentences, 1);
  
  // Basic heuristics
  let aiScore = 0;
  
  // AI text often has more uniform sentence length
  if (avgSentenceLength > 15 && avgSentenceLength < 30) aiScore += 0.4;
  
  // Check for personal pronouns (more common in human writing)
  const personalPronouns = (text.match(/\b(I|me|my|mine|we|us|our|ours)\b/gi) || []).length;
  if (personalPronouns < words * 0.01) aiScore += 0.3;
  
  // Check for transition words (common in AI writing)
  const transitionWords = (text.match(/however|moreover|furthermore|additionally|in conclusion/gi) || []).length;
  if (transitionWords > words * 0.005) aiScore += 0.3;
  
  const isAI = aiScore > 0.5;
  const confidence = Math.min(0.8, 0.4 + aiScore * 0.4);

  return {
    isAI,
    confidence,
    reasoning: "Analysis based on text patterns (fallback mode)"
  };
}
