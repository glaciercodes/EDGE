// api/generate.js
import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Input validation schema
const generateRequestSchema = z.object({
  tool: z.enum([
    'article-generator',
    'auto-summary',
    'movie-suggestor',
    'music-suggestor',
    'hashtag-generator',
    'verify-news',
    'top-trending',
    'human-ai-claims',
    'iq-grader',
    'idea-suggestor'
  ]),
  prompt: z.string().min(1).max(2000),
  options: z.object({
    length: z.enum(['short', 'medium', 'long']).optional(),
    tone: z.enum(['professional', 'casual', 'technical', 'creative']).optional(),
    language: z.string().default('english'),
  }).optional(),
});

// Tool-specific system prompts
const TOOL_SYSTEM_PROMPTS = {
  'article-generator': `You are an expert article writer. Generate engaging, well-structured articles based on the user's input. 
  Follow these guidelines:
  - Create compelling headlines and introductions
  - Use proper paragraph structure with clear transitions
  - Include relevant examples and evidence
  - Maintain consistent tone and voice
  - End with a strong conclusion
  - Ensure content is original and plagiarism-free`,

  'auto-summary': `You are a professional summarization expert. Create concise, accurate summaries that capture the essence of the input.
  Guidelines:
  - Identify and preserve key information
  - Remove redundant or less important details
  - Maintain the original meaning and context
  - Use clear, straightforward language
  - Structure summaries logically`,

  'movie-suggestor': `You are a movie recommendation expert with deep knowledge of cinema across genres and eras.
  Guidelines:
  - Suggest movies based on user preferences, mood, and context
  - Provide brief explanations for each recommendation
  - Consider factors like genre, director, actors, and themes
  - Include both popular and hidden gem recommendations
  - Tailor suggestions to the user's specified constraints`,

  'music-suggestor': `You are a music connoisseur with extensive knowledge of artists, genres, and musical styles.
  Guidelines:
  - Recommend songs and artists based on user preferences
  - Consider mood, activity, and musical taste
  - Provide variety while staying relevant
  - Include both established and emerging artists
  - Explain why each recommendation fits`,

  'hashtag-generator': `You are a social media marketing expert specializing in content optimization.
  Guidelines:
  - Generate relevant, trending hashtags for different platforms
  - Mix popular and niche hashtags
  - Consider platform-specific best practices
  - Ensure hashtags are appropriate for the content
  - Group by platform when applicable`,

  'verify-news': `You are a fact-checking and media literacy expert.
  Guidelines:
  - Analyze claims for accuracy and credibility
  - Identify potential biases or misinformation patterns
  - Provide balanced perspective on controversial topics
  - Suggest reliable sources for verification
  - Explain reasoning behind assessments`,

  'top-trending': `You are a trend analysis expert with insights into current events and popular culture.
  Guidelines:
  - Identify emerging trends across different domains
  - Provide context and background for trends
  - Estimate potential impact and duration
  - Suggest related topics and connections
  - Keep information current and relevant`,

  'human-ai-claims': `You are an expert in AI detection and content analysis.
  Guidelines:
  - Analyze writing patterns and stylistic elements
  - Identify potential AI-generated content markers
  - Provide confidence levels for assessments
  - Explain the reasoning behind your analysis
  - Consider context and writing purpose`,

  'iq-grader': `You are a cognitive assessment specialist.
  Guidelines:
  - Create engaging, thought-provoking questions
  - Cover different cognitive domains (logical, verbal, spatial, etc.)
  - Provide clear, educational explanations
  - Adapt difficulty based on implied user level
  - Focus on learning and improvement`,

  'idea-suggestor': `You are a business and innovation consultant.
  Guidelines:
  - Generate practical, innovative business ideas
  - Consider user skills, interests, and constraints
  - Provide market analysis and feasibility assessment
  - Suggest implementation steps and resources
  - Identify potential challenges and solutions`
};

// Tool-specific response formats
const TOOL_RESPONSE_FORMATS = {
  'article-generator': `Please provide the article in this format:
  # [Article Title]
  
  [Introduction paragraph]
  
  ## [Subheading 1]
  [Content for section 1]
  
  ## [Subheading 2]
  [Content for section 2]
  
  ## [Subheading 3]
  [Content for section 3]
  
  ## Conclusion
  [Concluding paragraph]`,

  'auto-summary': `Please provide the summary in this format:
  **Key Points:**
  - [Point 1]
  - [Point 2]
  - [Point 3]
  
  **Detailed Summary:**
  [2-3 paragraph comprehensive summary]
  
  **Key Terms:** [comma-separated important terms]`,

  'movie-suggestor': `Please provide recommendations in this format:
  **Based on your preferences, here are movie recommendations:**
  
  1. **Movie Title** (Year) - Genre
     - Why it matches: [brief explanation]
     - Similar to: [related movies]
  
  2. **Movie Title** (Year) - Genre
     - Why it matches: [brief explanation]
     - Similar to: [related movies]`,

  'music-suggestor': `Please provide recommendations in this format:
  **Music Recommendations:**
  
  **Artists to Explore:**
  - [Artist 1]: [Genre] - [Why recommended]
  - [Artist 2]: [Genre] - [Why recommended]
  
  **Playlist Suggestions:**
  - [Mood/Activity]: [Song 1], [Song 2], [Song 3]`,

  'hashtag-generator': `Please provide hashtags in this format:
  **Instagram:**
  #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
  
  **Twitter:**
  #hashtag1 #hashtag2 #hashtag3
  
  **TikTok:**
  #hashtag1 #hashtag2 #hashtag3 #hashtag4
  
  **LinkedIn:**
  #hashtag1 #hashtag2 #hashtag3`,

  'verify-news': `Please provide analysis in this format:
  **Claim Analysis:**
  - **Accuracy:** [Rating: True/Mostly True/Mixed/False]
  - **Confidence:** [High/Medium/Low]
  
  **Fact Check:**
  [Detailed analysis of the claim]
  
  **Sources to Consider:**
  - [Source 1]
  - [Source 2]`,

  'top-trending': `Please provide trends in this format:
  **Current Trending Topics:**
  
  1. **Trend Name**
     - Description: [what it is]
     - Why it's trending: [context]
     - Potential impact: [analysis]
  
  2. **Trend Name**
     - Description: [what it is]
     - Why it's trending: [context]
     - Potential impact: [analysis]`,

  'human-ai-claims': `Please provide analysis in this format:
  **Content Analysis:**
  - **AI Likelihood:** [Low/Medium/High/Very High]
  - **Confidence Score:** [0-100%]
  
  **Key Indicators:**
  - [Indicator 1 and explanation]
  - [Indicator 2 and explanation]
  
  **Overall Assessment:**
  [Detailed analysis and reasoning]`,

  'iq-grader': `Please provide assessment in this format:
  **Cognitive Challenge:**
  
  **Question 1:**
  [Thought-provoking question]
  
  **Answer & Explanation:**
  [Detailed answer with educational explanation]
  
  **Key Learning:**
  [What this question teaches]`,

  'idea-suggestor': `Please provide ideas in this format:
  **Business Idea 1: [Idea Name]**
  - **Concept:** [Brief description]
  - **Target Market:** [Who it serves]
  - **Key Features:** [Main selling points]
  - **Implementation Steps:** [1-2-3 approach]
  - **Resources Needed:** [What's required]`
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Please use POST.'
    });
  }

  try {
    // Validate request body
    const validationResult = generateRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { tool, prompt, options = {} } = validationResult.data;

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    // Construct the system prompt
    const systemPrompt = `${TOOL_SYSTEM_PROMPTS[tool]}

${TOOL_RESPONSE_FORMATS[tool]}

Additional Instructions:
- Be specific and actionable
- Provide practical, useful information
- Use clear, engaging language
- Structure the response for easy reading
- Tailor the response to the user's specific input`;

    // Construct user prompt with options
    let userPrompt = prompt;
    if (options.length) {
      userPrompt += `\n\nPlease make the output ${options.length} in length.`;
    }
    if (options.tone) {
      userPrompt += `\n\nPlease use a ${options.tone} tone.`;
    }
    if (options.language && options.language !== 'english') {
      userPrompt += `\n\nPlease respond in ${options.language}.`;
    }

    // Generate completion using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo" for faster, cheaper responses
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated by AI');
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      tool,
      prompt,
      result: generatedContent,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in generate API:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        success: false,
        error: `OpenAI API Error: ${error.message}`,
        code: error.code
      });
    }

    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Utility function for batch processing (optional)
export async function batchGenerate(requests) {
  const results = [];
  
  for (const request of requests) {
    try {
      // Simulate the handler logic for batch processing
      const validationResult = generateRequestSchema.safeParse(request);
      
      if (!validationResult.success) {
        results.push({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        continue;
      }

      const { tool, prompt, options = {} } = validationResult.data;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: TOOL_SYSTEM_PROMPTS[tool] + "\n\n" + TOOL_RESPONSE_FORMATS[tool]
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      results.push({
        success: true,
        tool,
        prompt,
        result: completion.choices[0]?.message?.content,
        usage: completion.usage
      });

    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        tool: request.tool
      });
    }
  }
  
  return results;
}
