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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate article');
        }
        
        // Display the generated article
        articleResult.textContent = data.article || 'Article generated successfully!';
        
    } catch (error) {
        console.error('Error generating article:', error);
        articleResult.textContent = `Error: ${error.message}. Please check your API configuration and try again.`;
        
        // Show more detailed error info in console for debugging
        console.log('Full error details:', error);
    } finally {
        // Reset button state
        generateArticleBtn.textContent = 'Generate Article';
        generateArticleBtn.disabled = false;
    }
});

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

// Add demo mode toggle (for testing without API)
let demoMode = false;

// Add a hidden demo mode toggle (for development)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') {
        demoMode = !demoMode;
        alert(`Demo mode: ${demoMode ? 'ON' : 'OFF'}`);
    }
});

// Update the generate function to include demo mode
const originalGenerateFunction = generateArticleBtn.onclick;
generateArticleBtn.onclick = async function() {
    if (demoMode) {
        // Use demo content
        const inputText = articleInput.value.trim();
        generateArticleBtn.textContent = 'Generating...';
        generateArticleBtn.disabled = true;
        resultSection.style.display = 'block';
        articleResult.textContent = `Demo Article about: ${inputText}\n\nThis is a demo article generated in demonstration mode. In a real environment, this would be created by OpenAI's powerful AI model.\n\nKey points about ${inputText}:\n\n• First important aspect\n• Second key feature  \n• Third major benefit\n\nConclusion: ${inputText} represents an exciting topic that deserves thorough exploration and discussion.`;
        
        setTimeout(() => {
            generateArticleBtn.textContent = 'Generate Article';
            generateArticleBtn.disabled = false;
        }, 1000);
        return;
    }
    
    await originalGenerateFunction();
};
