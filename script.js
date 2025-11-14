class ArticleGenerator {
    constructor() {
        this.topicInput = document.getElementById('topicInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.loading = document.getElementById('loading');
        this.resultSection = document.getElementById('resultSection');
        this.articleContent = document.getElementById('articleContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.error = document.getElementById('error');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateArticle());
        this.topicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateArticle();
            }
        });
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
    
    async generateArticle() {
        const topic = this.topicInput.value.trim();
        
        if (!topic) {
            this.showError('Please enter a topic for the article.');
            return;
        }
        
        if (topic.length > 100) {
            this.showError('Topic must be 100 characters or less.');
            return;
        }
        
        this.hideError();
        this.showLoading();
        this.hideResult();
        
        try {
            const response = await fetch('/api/generate-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: topic })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate article');
            }
            
            this.displayArticle(data.article);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'Something went wrong. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    displayArticle(article) {
        this.articleContent.textContent = article;
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.articleContent.textContent);
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            this.copyBtn.style.background = '#6c757d';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.style.background = '#28a745';
            }, 2000);
        } catch (err) {
            this.showError('Failed to copy to clipboard');
        }
    }
    
    showLoading() {
        this.generateBtn.disabled = true;
        this.loading.style.display = 'block';
    }
    
    hideLoading() {
        this.generateBtn.disabled = false;
        this.loading.style.display = 'none';
    }
    
    showError(message) {
        this.error.textContent = message;
        this.error.style.display = 'block';
        this.error.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideError() {
        this.error.style.display = 'none';
    }
    
    hideResult() {
        this.resultSection.style.display = 'none';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArticleGenerator();
});
