// This is a serverless function for Vercel
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

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, max_tokens = 1000, temperature = 0.7 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Initialize OpenAI with your API key from environment variables
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a creative writer who generates engaging stories and articles. Always provide well-structured, creative content that matches the user's requested style and length."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: max_tokens,
            temperature: temperature,
        });

        const story = completion.choices[0].message.content;

        // Return the generated story
        res.status(200).json({
            story: story,
            usage: completion.usage
        });

    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            res.status(error.response.status).json({
                error: `OpenAI API error: ${error.response.statusText}`
            });
        } else if (error.code === 'ENOTFOUND') {
            res.status(500).json({
                error: 'Network error: Unable to connect to OpenAI API'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error: ' + error.message
            });
        }
    }
};
