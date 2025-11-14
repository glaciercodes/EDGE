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
    articleResult.textContent = 'Generating your article... This may take a few seconds.';
    resultSection.style.display = 'block';
    copyBtn.style.display = 'none';
    
    try {
        console.log('Sending request to API...');
        
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

        console.log('Response status:', response.status);
        
        // Check if response is OK and has content
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get response text first to handle potential JSON parsing issues
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + '...');
        
        if (!responseText) {
            throw new Error('Empty response from server');
        }
        
        // Try to parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid response format from server');
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (!data.article) {
            throw new Error('No article content in response');
        }
        
        // Display the generated article
        articleResult.textContent = data.article;
        copyBtn.style.display = 'block';
        
        console.log('Article generated successfully');
        
    } catch (error) {
        console.error('Error generating article:', error);
        
        let errorMessage = `Error: ${error.message}. `;
        
        if (error.message.includes('401')) {
            errorMessage += 'Please check your OpenAI API key configuration in Vercel.';
        } else if (error.message.includes('429')) {
            errorMessage += 'OpenAI API quota exceeded. Please check your billing.';
        } else if (error.message.includes('Empty response') || error.message.includes('JSON')) {
            errorMessage += 'Server configuration issue. Please check the API implementation.';
        } else {
            errorMessage += 'Please try again or check your network connection.';
        }
        
        articleResult.textContent = errorMessage;
        copyBtn.style.display = 'none';
        
        // Show demo option
        showDemoOption(inputText);
    } finally {
        // Reset button state
        generateArticleBtn.textContent = 'Generate Article';
        generateArticleBtn.disabled = false;
    }
});

// Show demo option when API fails
function showDemoOption(inputText) {
    const demoBtn = document.createElement('button');
    demoBtn.textContent = 'Try Demo Version';
    demoBtn.className = 'demo-btn';
    demoBtn.style.marginTop = '10px';
    demoBtn.style.padding = '8px 15px';
    demoBtn.style.backgroundColor = '#ff9900';
    demoBtn.style.color = '#000';
    demoBtn.style.border = 'none';
    demoBtn.style.borderRadius = '5px';
    demoBtn.style.cursor = 'pointer';
    
    demoBtn.addEventListener('click', () => {
        generateDemoArticle(inputText);
        demoBtn.remove();
    });
    
    articleResult.parentNode.insertBefore(demoBtn, copyBtn);
}

// Generate demo article
function generateDemoArticle(inputText) {
    const demoArticles = {
        default: `# Article About: ${inputText}

## Introduction
${inputText} is a fascinating topic that has gained significant attention in recent times. This comprehensive article explores the various aspects and implications of this subject.

## Key Benefits
- **Enhanced Productivity**: Understanding ${inputText} can significantly improve workflow efficiency
- **Cost Effectiveness**: Implementing strategies related to ${inputText} often leads to reduced operational costs
- **Competitive Advantage**: Organizations leveraging ${inputText} effectively gain market edge

## Practical Applications
1. **Business Implementation**: How companies can integrate ${inputText} into their operations
2. **Personal Development**: Ways individuals can benefit from understanding ${inputText}
3. **Future Trends**: Emerging developments in the field of ${inputText}

## Challenges and Solutions
While adopting ${inputText} presents certain challenges, these can be overcome through:
- Strategic planning
- Proper training and education
- Gradual implementation approach

## Conclusion
${inputText} represents a significant opportunity for growth and innovation. By understanding its principles and applications, both individuals and organizations can achieve remarkable results.

*Note: This is a demo article. Connect your OpenAI API for AI-generated content.*`,

        technology: `# The Future of ${inputText} in Technology

## Revolutionizing Industries
${inputText} is transforming how we approach technological solutions across various sectors.

## Key Innovations
- AI integration with ${inputText}
- Cloud-based ${inputText} solutions
- Mobile applications of ${inputText}

## Impact Assessment
The implementation of ${inputText} has shown 45% improvement in operational efficiency according to recent studies.`,

        health: `# ${inputText}: A Health Perspective

## Understanding the Basics
${inputText} plays a crucial role in modern healthcare approaches.

## Health Benefits
- Improved patient outcomes
- Reduced recovery time
- Enhanced diagnostic accuracy

## Professional Recommendations
Medical experts suggest incorporating ${inputText} into daily health routines for optimal results.`
    };

    let demoContent = demoArticles.default;
    
    if (inputText.toLowerCase().includes('tech') || inputText.toLowerCase().includes('software') || inputText.toLowerCase().includes('ai')) {
        demoContent = demoArticles.technology;
    } else if (inputText.toLowerCase().includes('health') || inputText.toLowerCase().includes('medical') || inputText.toLowerCase().includes('fitness')) {
        demoContent = demoArticles.health;
    }
    
    articleResult.textContent = demoContent;
    copyBtn.style.display = 'block';
}

// Copy article to clipboard
copyBtn.addEventListener('click', () => {
    const textToCopy = articleResult.textContent;
    
    // Don't copy if it's an error message or loading text
    if (textToCopy.includes('Error:') || textToCopy.includes('Generating your article')) {
        alert('Please generate an article first before copying.');
        return;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show success feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#00cc00';
        copyBtn.style.color = '#000';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard. You can manually select and copy the text.');
    });
});

// Share functionality
shareBtn.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'GenZbot - AI Article Generator',
            text: 'Check out this amazing AI tool that generates articles in seconds! Perfect for content creators, students, and professionals.',
            url: window.location.href,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
});

function fallbackShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard! Share it with your friends.');
    }).catch(() => {
        // Last resort - show the URL
        alert(`Share this link: ${window.location.href}`);
    });
}

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

// Add some sample content for demonstration
document.addEventListener('DOMContentLoaded', () => {
    console.log('GenZbot loaded successfully');
    
    // Add demo mode hint
    console.log('Tip: If API fails, use the "Try Demo Version" button for sample content');
});
