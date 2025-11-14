// api/detect.js - Vercel Serverless Function
const OpenAI = require('openai');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const words = text.trim().split(/\s+/);
        if (words.length < 50 || words.length > 1500) {
            return res.status(400).json({ 
                error: 'Text must be between 50 and 1500 words' 
            });
        }

        // Initialize OpenAI with your private key from environment variables
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Create a prompt for AI detection
        const prompt = `Analyze the following text and determine the likelihood that it was AI-generated vs human-written. Consider factors like:
        - Perplexity and burstiness
        - Sentence structure variation
        - Repetitive patterns
        - Logical flow and coherence
        - Common AI writing patterns

        Text to analyze: "${text}"

        Provide your analysis as a JSON object with this structure:
        {
            "human": 0.85,
            "ai": 0.15,
            "confidence": 0.92,
            "reasoning": "Brief explanation of the analysis"
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an AI detection expert. Analyze texts and provide probabilities for human vs AI authorship. Always respond with valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 500
        });

        const responseText = completion.choices[0].message.content;
        
        try {
            const result = JSON.parse(responseText);
            res.status(200).json(result);
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            // Fallback analysis if JSON parsing fails
            res.status(200).json({
                human: 0.5,
                ai: 0.5,
                confidence: 0.7,
                reasoning: "Analysis completed with default values due to parsing issues"
            });
        }

    } catch (error) {
        console.error('Error in AI detection:', error);
        res.status(500).json({ 
            error: 'Failed to analyze text',
            details: error.message 
        });
    }
};
