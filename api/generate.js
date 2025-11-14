export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { topic, max_tokens = 1000 } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Get OpenAI API key from environment variable
        const openaiApiKey = process.env.OPENAI_API_KEY;
        
        if (!openaiApiKey) {
            console.error('OpenAI API key not found in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional article writer. Create well-structured, engaging, and informative articles based on the given topic. Format the article with clear paragraphs and appropriate sections.'
                    },
                    {
                        role: 'user',
                        content: `Please write a comprehensive article about: ${topic}`
                    }
                ],
                max_tokens: max_tokens,
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

        res.status(200).json({ 
            article: article,
            model: data.model,
            usage: data.usage
        });

    } catch (error) {
        console.error('Error in generate API:', error);
        
        // Provide more specific error messages
        if (error.message.includes('API key') || error.message.includes('authorization')) {
            return res.status(500).json({ error: 'Authentication error. Please check API configuration.' });
        } else if (error.message.includes('rate limit')) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        } else {
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
