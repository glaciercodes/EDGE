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
        articleOutput.innerHTML = article;
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error generating article:', error);
        articleOutput.innerHTML = '<div class="error">Sorry, there was an error generating your article. Please try again.</div>';
    }
});

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
    try {
        // Call our API endpoint
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
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.article || 'Article generated successfully.';
    } catch (error) {
        console.error('Error calling API:', error);
        
        // Fallback: Return a mock article for demonstration
        return generateMockArticle(keywords, preferences);
    }
}

// Generate a mock article for demonstration purposes
function generateMockArticle(keywords, preferences) {
    const title = `Understanding ${keywords}: A Comprehensive Guide`;
    
    return `
        <h3>${title}</h3>
        <p>In today's fast-paced digital world, ${keywords} has become an increasingly important topic. Whether you're a beginner looking to understand the basics or an expert seeking advanced insights, this article will provide valuable information tailored to your needs.</p>
        
        <h4>Key Benefits of ${keywords}</h4>
        <p>The advantages of implementing ${keywords} in your workflow are numerous. First and foremost, it enhances productivity by streamlining processes that would otherwise take significantly more time. Additionally, it improves accuracy and reduces the likelihood of human error.</p>
        
        <h4>Getting Started with ${keywords}</h4>
        <p>If you're new to ${keywords}, the best approach is to start with the fundamentals. Begin by familiarizing yourself with the core concepts and terminology. From there, you can gradually progress to more advanced applications as your confidence grows.</p>
        
        <h4>Advanced Applications</h4>
        <p>For those with existing experience, ${keywords} offers numerous opportunities for optimization and innovation. By leveraging advanced techniques, you can achieve results that were previously thought impossible.</p>
        
        <h4>Conclusion</h4>
        <p>${keywords} represents a significant advancement in how we approach problem-solving and efficiency. By understanding and implementing these concepts, you position yourself at the forefront of your field, ready to tackle challenges with confidence and expertise.</p>
        
        <p><em>This article was generated based on your input: "${keywords}" with preferences: "${preferences || 'Not specified'}".</em></p>
    `;
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

// Add animation to elements when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.review-card, .tool-card, .input-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
});
