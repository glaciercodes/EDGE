// api/detect-ai.js - Fixed version
export default async function handler(req, res) {
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

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ 
                error: 'Text must be at least 50 characters long' 
            });
        }

        // Get OpenAI API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.error('OpenAI API key not found in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('Starting analysis for text length:', text.length);
        
        // Call OpenAI API for detection
        const detectionResult = await detectWithOpenAI(text, apiKey);
        
        console.log('Analysis completed:', detectionResult);
        
        res.status(200).json(detectionResult);
    } catch (error) {
        console.error('Detection error:', error);
        res.status(500).json({ 
            error: error.message || 'Internal server error' 
        });
    }
}

async function detectWithOpenAI(text, apiKey) {
    // Simplified prompt that's more reliable
    const prompt = `Analyze this text and determine if it was AI-generated or human-written. 
Return ONLY a JSON object with this exact format:
{
    "isAI": true or false,
    "confidence": 0.85,
    "reasoning": "Brief explanation here"
}

Text to analyze: "${text.substring(0, 2000)}"`; // Limit text length

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
                        content: 'You are an AI content detector. Always respond with valid JSON only, no other text.'
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
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const resultText = data.choices[0]?.message?.content?.trim();
        
        console.log('Raw OpenAI response:', resultText);

        if (!resultText) {
            throw new Error('No response from AI analysis');
        }

        // Clean the response - remove any markdown code blocks
        const cleanResult = resultText.replace(/```json\s*|\s*```/g, '');
        
        try {
            const result = JSON.parse(cleanResult);
            
            // Validate the response structure
            if (typeof result.isAI !== 'boolean' || typeof result.confidence !== 'number') {
                throw new Error('Invalid response format from AI');
            }

            return {
                isAI: result.isAI,
                confidence: Math.max(0, Math.min(1, result.confidence)), // Ensure between 0-1
                reasoning: result.reasoning || 'No reasoning provided'
            };
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response that failed to parse:', cleanResult);
            
            // Fallback: Use simple detection logic
            return getFallbackDetection(text);
        }
    } catch (error) {
        console.error('OpenAI call failed:', error);
        throw error;
    }
}

// Fallback detection for when OpenAI fails
function getFallbackDetection(text) {
    // Simple heuristic-based fallback
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgSentenceLength = words / sentences;
    
    // Very basic heuristics (AI text often has more uniform sentence length)
    const isAI = avgSentenceLength > 15 && avgSentenceLength < 25;
    const confidence = 0.6; // Low confidence for fallback
    
    return {
        isAI,
        confidence,
        reasoning: "Analysis using fallback heuristics due to API issues"
    };
}
