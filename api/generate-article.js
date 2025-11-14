export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { topic } = req.body;

        if (!topic || topic.trim().length === 0) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        if (topic.length > 100) {
            return res.status(400).json({ error: 'Topic must be 100 characters or less' });
        }

        // Get OpenAI API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.error('OpenAI API key is not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional article writer. Create well-structured, engaging articles with proper formatting. Always write at least 300 words.'
                    },
                    {
                        role: 'user',
                        content: `Write a comprehensive article about: ${topic}`
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API error:', data);
            throw new Error(data.error?.message || 'Failed to generate article');
        }

        const article = data.choices[0]?.message?.content;
        
        if (!article) {
            throw new Error('No article content received from AI');
        }

        res.status(200).json({ article });

    } catch (error) {
        console.error('Error in generate-article API:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('API key') || error.message.includes('authorization')) {
            return res.status(500).json({ error: 'API configuration error. Please check your OpenAI API key.' });
        }
        
        if (error.message.includes('rate limit')) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        }
        
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
