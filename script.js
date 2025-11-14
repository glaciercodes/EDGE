// API configuration
const API_URL = '/api/generate';

// DOM Elements
const topicInput = document.getElementById('topicInput');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const articleContent = document.getElementById('articleContent');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

async function generateArticle() {
    const topic = topicInput.value.trim();
    
    if (!topic) {
        showError('Please enter a topic for your article');
        return;
    }

    // Show loading state
    setLoading(true);
    hideError();
    hideResult();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                max_tokens: 1000
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate article');
        }

        if (data.article) {
            showResult(data.article);
        } else {
            throw new Error('No article content received');
        }

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Something went wrong. Please try again.');
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        generateBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

function showResult(article) {
    articleContent.textContent = article;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function hideResult() {
    resultSection.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorSection.style.display = 'none';
}

function copyToClipboard() {
    const articleText = articleContent.textContent;
    navigator.clipboard.writeText(articleText).then(() => {
        // Show temporary success message
        const copyBtn = document.querySelector('.action-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showError('Failed to copy to clipboard');
    });
}

function downloadArticle() {
    const articleText = articleContent.textContent;
    const topic = topicInput.value.trim().substring(0, 50) || 'article';
    const filename = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    
    const blob = new Blob([articleText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateNew() {
    topicInput.value = '';
    topicInput.focus();
    hideResult();
    hideError();
}

// Add event listeners
topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        generateArticle();
    }
});

// Initialize
topicInput.focus();
