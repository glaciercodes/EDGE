// DOM Elements
const generateNowBtn = document.getElementById('generate-now');
const articleForm = document.getElementById('article-form');
const resultSection = document.getElementById('result-section');
const articleOutput = document.getElementById('article-output');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const rateBtn = document.getElementById('rate-btn');

// Scroll to input section when "Generate Now" is clicked
generateNowBtn.addEventListener('click', () => {
    document.querySelector('.input-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
});

// Handle article form submission
articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const keywords = document.getElementById('keywords').value;
    const preferences = document.getElementById('preferences').value;
    
    if (!keywords.trim()) {
        alert('Please enter some keywords or ideas to generate an article.');
        return;
    }
    
    // Show loading state
    articleOutput.innerHTML = '<div class="loading">Generating your article... <i class="fas fa-spinner fa-spin"></i></div>';
    resultSection.style.display = 'block';
    
    try {
        // Call the API to generate the article
        const article = await generateArticle(keywords, preferences);
        articleOutput.innerHTML = formatArticle(article);
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error generating article:', error);
        articleOutput.innerHTML = '<div class="error">Sorry, there was an error generating your article. Please try again.</div>';
    }
});

// Format the article with proper HTML structure
function formatArticle(articleText) {
    // Convert line breaks to paragraphs and add basic formatting
    return articleText
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim() === '') return '';
            
            // Check if this looks like a heading
            if (paragraph.length < 100 && !paragraph.includes('.') && !paragraph.includes(',')) {
                return `<h4>${paragraph}</h4>`;
            }
            
            return `<p>${paragraph}</p>`;
        })
        .join('');
}

// Copy article to clipboard
copyBtn.addEventListener('click', () => {
    const articleText = articleOutput.innerText;
    
    navigator.clipboard.writeText(articleText).then(() => {
        // Show success feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.backgroundColor = '#4CAF50';
        copyBtn.style.borderColor = '#4CAF50';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
            copyBtn.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy article to clipboard. Please select and copy manually.');
    });
});

// Share tool
shareBtn.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'GenZbot - AI Article Generator',
            text: 'Check out this amazing AI tool that generates personalized articles in seconds!',
            url: window.location.href
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support the Web Share API
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard! Share it with your friends.');
        });
    }
});

// Rate button redirect
rateBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Generate article using OpenAI API
async function generateArticle(keywords, preferences) {
    const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            keywords: keywords,
            preferences: preferences
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
    }
    
    const data = await response.json();
    return data.article;
}

// Add smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
