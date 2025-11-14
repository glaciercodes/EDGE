// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const generateArticleBtn = document.getElementById('generateArticleBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const rateBtn = document.getElementById('rateBtn');
const generatorSection = document.getElementById('generatorSection');
const resultsSection = document.getElementById('resultsSection');
const articleOutput = document.getElementById('articleOutput');
const topicInput = document.getElementById('topic');
const titleInput = document.getElementById('title');
const wordCountSelect = document.getElementById('wordCount');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Generate Now button scrolls to generator section
    generateBtn.addEventListener('click', function() {
        generatorSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Generate Article button
    generateArticleBtn.addEventListener('click', generateArticle);
    
    // Copy Article button
    copyBtn.addEventListener('click', copyArticle);
    
    // Share Tool button
    shareBtn.addEventListener('click', shareTool);
    
    // Rate Us button
    rateBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Tool cards redirect to index.html
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    });
    
    // Review cards redirect to index.html
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach(card => {
        card.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    });
    
    // Star rating in hero section redirects to index.html
    const heroStars = document.querySelector('.rating');
    heroStars.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});

// Generate Article Function
async function generateArticle() {
    const topic = topicInput.value.trim();
    const title = titleInput.value.trim();
    const wordCount = wordCountSelect.value;
    
    if (!topic) {
        alert('Please enter a topic for your article');
        return;
    }
    
    // Show loading state
    generateArticleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateArticleBtn.disabled = true;
    
    try {
        // Call the API endpoint
        const response = await fetch('/api/detect.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                title: title,
                wordCount: wordCount
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate article');
        }
        
        const data = await response.json();
        
        // Display the generated article
        displayArticle(data.article);
        
        // Show results section
        resultsSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error generating article:', error);
        
        // For demo purposes, show a sample article if API fails
        displayArticle(generateSampleArticle(topic, title, wordCount));
        resultsSection.style.display = 'block';
    } finally {
        // Reset button state
        generateArticleBtn.innerHTML = 'Generate Article';
        generateArticleBtn.disabled = false;
    }
}

// Display Article Function
function displayArticle(article) {
    articleOutput.innerHTML = article;
}

// Copy Article Function
function copyArticle() {
    const articleText = articleOutput.innerText;
    
    navigator.clipboard.writeText(articleText).then(function() {
        // Show success feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy article to clipboard');
    });
}

// Share Tool Function
function shareTool() {
    const shareText = "Check out GenZbot - an amazing AI tool that generates personalized articles in seconds!";
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'GenZbot - AI Article Generator',
            text: shareText,
            url: shareUrl,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support the Web Share API
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = shareUrl;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // Show success feedback
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i class="fas fa-check"></i> Link Copied!';
        
        setTimeout(() => {
            shareBtn.innerHTML = originalText;
        }, 2000);
    }
}

// Generate Sample Article (for demo purposes)
function generateSampleArticle(topic, title, wordCount) {
    const sampleTitle = title || `The Future of ${topic}`;
    
    return `
        <h3>${sampleTitle}</h3>
        <p>In today's rapidly evolving world, ${topic} has become an increasingly important subject that impacts various aspects of our lives. This article explores the key dimensions of ${topic} and its implications for the future.</p>
        
        <h4>Understanding ${topic}</h4>
        <p>At its core, ${topic} represents a significant shift in how we approach problems and opportunities. The fundamental principles behind ${topic} have been developing for years, but recent advancements have accelerated its adoption across multiple sectors.</p>
        
        <p><strong>The most crucial aspect</strong> of ${topic} is its ability to transform traditional processes and create new possibilities. This transformation is not just technological but also cultural and organizational.</p>
        
        <h4>Key Benefits and Applications</h4>
        <p>The applications of ${topic} are diverse and far-reaching. From improving efficiency to enabling entirely new capabilities, the benefits are substantial:</p>
        
        <ul>
            <li><strong>Enhanced productivity</strong> through automation and optimization</li>
            <li><strong>Improved decision-making</strong> with data-driven insights</li>
            <li><strong>Cost reduction</strong> by streamlining operations</li>
            <li><strong>Innovation acceleration</strong> through new approaches</li>
        </ul>
        
        <h4>Future Outlook</h4>
        <p>Looking ahead, the trajectory of ${topic} suggests continued growth and evolution. Experts predict that within the next decade, ${topic} will become even more integrated into our daily lives and business operations.</p>
        
        <p><strong>The most exciting development</strong> is the potential for ${topic} to address some of society's most pressing challenges. From healthcare to education, environmental sustainability to economic development, the possibilities are truly remarkable.</p>
        
        <h4>Conclusion</h4>
        <p>In conclusion, ${topic} represents not just a technological advancement but a fundamental shift in how we approach problems and opportunities. As we continue to explore and develop this field, it's clear that ${topic} will play an increasingly important role in shaping our future.</p>
        
        <p>Whether you're a business leader, educator, student, or simply curious about the future, understanding ${topic} is essential for navigating the changes ahead and leveraging the opportunities they present.</p>
    `;
}
