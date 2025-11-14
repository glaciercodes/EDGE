class AIDetector {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.wordCount = document.getElementById('wordCount');
        this.resultSection = document.getElementById('resultSection');
        this.loadingSection = document.getElementById('loadingSection');
        this.errorSection = document.getElementById('errorSection');
        
        this.init();
    }

    init() {
        this.textInput.addEventListener('input', this.updateWordCount.bind(this));
        this.analyzeBtn.addEventListener('click', this.analyzeText.bind(this));
        document.getElementById('analyzeAgain').addEventListener('click', this.resetAnalysis.bind(this));
    }

    updateWordCount() {
        const text = this.textInput.value.trim();
        const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
        const count = words.length;
        
        this.wordCount.textContent = count;
        this.wordCount.className = 'word-count';
        
        if (count < 50) {
            this.wordCount.classList.add('error');
            this.analyzeBtn.disabled = true;
        } else if (count > 1500) {
            this.wordCount.classList.add('error');
            this.analyzeBtn.disabled = true;
        } else {
            this.wordCount.classList.add('success');
            this.analyzeBtn.disabled = false;
        }
    }

    async analyzeText() {
        const text = this.textInput.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length < 50 || words.length > 1500) {
            this.showError('Please enter text between 50 and 1500 words.');
            return;
        }

        this.showLoading();
        
        try {
            const result = await this.callAIDetectionAPI(text);
            this.displayResults(result);
        } catch (error) {
            console.error('Error analyzing text:', error);
            this.showError('Failed to analyze text. Please try again.');
        }
    }

    async callAIDetectionAPI(text) {
        // This would typically call your Vercel serverless function
        // For now, we'll simulate the API response
        return await simulateAIDetection(text);
    }

    displayResults(result) {
        this.hideLoading();
        
        const humanPercent = Math.round(result.human * 100);
        const aiPercent = Math.round(result.ai * 100);
        
        document.getElementById('humanPercent').textContent = `${humanPercent}%`;
        document.getElementById('aiPercent').textContent = `${aiPercent}%`;
        document.getElementById('humanProgress').style.width = `${humanPercent}%`;
        document.getElementById('aiProgress').style.width = `${aiPercent}%`;
        
        const confidence = document.getElementById('confidence');
        if (humanPercent >= 70) {
            confidence.textContent = '✅ This text appears to be mostly human-written.';
            confidence.style.color = '#4CAF50';
        } else if (aiPercent >= 70) {
            confidence.textContent = '⚠️ This text appears to be mostly AI-generated.';
            confidence.style.color = '#ff6b6b';
        } else {
            confidence.textContent = '🔍 This text appears to be a mix of human and AI content.';
            confidence.style.color = '#ffa500';
        }
        
        this.resultSection.classList.remove('hidden');
    }

    showLoading() {
        this.loadingSection.classList.remove('hidden');
        this.resultSection.classList.add('hidden');
        this.errorSection.classList.add('hidden');
        this.analyzeBtn.disabled = true;
    }

    hideLoading() {
        this.loadingSection.classList.add('hidden');
        this.analyzeBtn.disabled = false;
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.errorSection.classList.remove('hidden');
        this.resultSection.classList.add('hidden');
        this.loadingSection.classList.add('hidden');
    }

    hideError() {
        this.errorSection.classList.add('hidden');
    }

    resetAnalysis() {
        this.textInput.value = '';
        this.wordCount.textContent = '0';
        this.wordCount.className = 'word-count';
        this.resultSection.classList.add('hidden');
        this.analyzeBtn.disabled = true;
    }
}

// Simulated AI detection function (replace with actual API call)
async function simulateAIDetection(text) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple simulation based on text characteristics
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Basic heuristics for simulation
    let aiScore = 0;
    
    // Check for repetitive patterns
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const diversityRatio = uniqueWords.size / words.length;
    if (diversityRatio < 0.5) aiScore += 0.3;
    
    // Check sentence length variation
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const lengthVariance = Math.max(...sentenceLengths) - Math.min(...sentenceLengths);
    if (lengthVariance < 5) aiScore += 0.2;
    
    // Check for common AI patterns
    const aiPatterns = ['as an AI', 'however, it is important', 'in conclusion', 'additionally'];
    if (aiPatterns.some(pattern => text.toLowerCase().includes(pattern))) {
        aiScore += 0.3;
    }
    
    // Add some randomness for demo
    aiScore += (Math.random() * 0.2) - 0.1;
    aiScore = Math.max(0, Math.min(1, aiScore));
    
    return {
        human: 1 - aiScore,
        ai: aiScore,
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIDetector();
});
