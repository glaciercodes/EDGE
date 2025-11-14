// DOM Elements
const generateNowBtn = document.getElementById('generate-now-btn');
const articleInput = document.getElementById('article-input');
const generateArticleBtn = document.getElementById('generate-article');
const articleResult = document.getElementById('article-result');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const resultSection = document.querySelector('.result-section');
const rateUsBtn = document.querySelector('.rate-us-btn');
const toolCards = document.querySelectorAll('.tool-card');
const reviewCards = document.querySelectorAll('.review-card');
const stars = document.querySelectorAll('.rating .stars i');

// Scroll to article generator when "Generate Now" is clicked
generateNowBtn.addEventListener('click', () => {
    document.querySelector('.article-generator').scrollIntoView({ 
        behavior: 'smooth' 
    });
});

// Generate article when button is clicked
generateArticleBtn.addEventListener('click', async () => {
    const inputText = articleInput.value.trim();
    
    if (!inputText) {
        alert('Please enter a topic or keywords for your article');
        return;
    }
    
    // Show loading state
    generateArticleBtn.textContent = 'Generating...';
    generateArticleBtn.disabled = true;
    
    try {
        // Call the API to generate the article
        const response = await fetch('/api/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: inputText,
                type: 'article'
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate article');
        }
        
        const data = await response.json();
        
        // Display the generated article
        articleResult.textContent = data.article || data.text || 'Article generated successfully!';
        resultSection.style.display = 'block';
        
        // Scroll to the result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Error generating article:', error);
        articleResult.textContent = 'Sorry, there was an error generating your article. Please try again.';
        resultSection.style.display = 'block';
    } finally {
        // Reset button state
        generateArticleBtn.textContent = 'Generate Article';
        generateArticleBtn.disabled = false;
    }
});

// Copy article to clipboard
copyBtn.addEventListener('click', () => {
    const textToCopy = articleResult.textContent;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show success feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard');
    });
});

// Share functionality
shareBtn.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'GenZbot - AI Article Generator',
            text: 'Check out this amazing AI tool that generates articles in seconds!',
            url: window.location.href,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard! Share it with your friends.');
        });
    }
});

// Redirect to index.html for various elements
rateUsBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Add click events to tool cards
toolCards.forEach(card => {
    card.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// Add click events to review cards
reviewCards.forEach(card => {
    card.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// Add click events to rating stars
stars.forEach(star => {
    star.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// Add some sample content for demonstration (remove in production)
document.addEventListener('DOMContentLoaded', () => {
    // Sample article for demonstration
    const sampleArticle = `How to Boost Your Productivity with AI Tools

In today's fast-paced digital world, staying productive can be challenging. With countless distractions and an ever-growing to-do list, it's easy to feel overwhelmed. However, artificial intelligence (AI) tools are revolutionizing how we work and manage our time.

Key Benefits of AI Productivity Tools:

1. Automation of Repetitive Tasks
AI can handle mundane, repetitive tasks that consume valuable time. From sorting emails to scheduling meetings, these tools free up your mental space for more important work.

2. Smart Prioritization
AI algorithms can analyze your tasks and help you prioritize what's most important. This ensures you're always working on high-impact activities.

3. Personalized Workflows
Unlike one-size-fits-all solutions, AI tools adapt to your unique working style and preferences, creating a customized productivity system.

4. Intelligent Reminders
Never miss a deadline again with AI-powered reminders that learn your patterns and alert you at the optimal time.

Getting Started with AI Productivity Tools:

Begin by identifying the areas where you struggle most. Is it time management? Task organization? Or perhaps focus? Then, explore AI tools designed to address those specific challenges.

Remember, the goal isn't to replace human intelligence but to augment it. The most successful users of AI tools are those who view them as partners in productivity rather than replacements for their own capabilities.

As AI technology continues to evolve, we can expect even more sophisticated tools that understand our needs and work styles on a deeper level. The future of productivity is personalized, intelligent, and remarkably efficient.`;

    // Set sample text in the article result for demonstration
    // Remove this in production or when connected to the actual API
    articleResult.textContent = sampleArticle;
});
