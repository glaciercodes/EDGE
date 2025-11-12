class AIContentDetector {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.updateButtonState();
    }

    initializeElements() {
        this.textInput = document.getElementById('textInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.charCount = document.getElementById('charCount');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultSection = document.getElementById('resultSection');
        this.errorSection = document.getElementById('errorSection');
        this.resultContent = document.getElementById('resultContent');
        this.errorContent = document.getElementById('errorContent');
    }

    setupEventListeners() {
        this.textInput.addEventListener('input', () => {
            this.updateButtonState();
            this.updateCharCount();
        });

        this.analyzeBtn.addEventListener('click', () => this.analyzeText());
        this.clearBtn.addEventListener('click', () => this.clearText());
    }

    updateCharCount() {
        const count = this.textInput.value.length;
        this.charCount.textContent = count;
        
        // Update color based on length
        if (count < 100) {
            this.charCount.style.color = '#ef4444';
        } else if (count < 200) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#10b981';
        }
    }

    updateButtonState() {
        const text = this.textInput.value.trim();
        this.analyzeBtn.disabled = text.length < 100;
    }

    async analyzeText() {
        const text = this.textInput.value.trim();
        
        if (text.length < 100) {
            this.showError('Please enter at least 100 characters for accurate analysis.');
            return;
        }

        this.showLoading();
        this.hideResults();
        this.hideError();

        try {
            const result = await this.callDetectionAPI(text);
            this.displayResult(result);
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Failed to analyze text. Please try again.');
        }
    }

    async callDetectionAPI(text) {
        const response = await fetch('/api/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text.substring(0, 4000) }) // Limit text length
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`Server error: ${response.status}`);
            }
            throw new Error(errorData.error || 'Analysis failed');
        }

        const result = await response.json();
        return result;
    }

    displayResult(result) {
        const confidence = result.confidence;
        const isAI = result.isAI;
        const reasoning = result.reasoning;

        // Determine confidence level and color
        let confidenceLevel, confidenceClass;
        if (confidence >= 0.7) {
            confidenceLevel = 'High confidence';
            confidenceClass = isAI ? 'ai-high' : 'human-high';
        } else if (confidence >= 0.6) {
            confidenceLevel = 'Moderate confidence';
            confidenceClass = 'uncertain';
        } else {
            confidenceLevel = 'Low confidence';
            confidenceClass = 'uncertain';
        }

        const confidencePercent = Math.round(confidence * 100);

        this.resultContent.innerHTML = `
            <div class="confidence-meter">
                <div class="confidence-fill ${confidenceClass}" style="width: ${confidencePercent}%"></div>
            </div>
            <div class="confidence-labels">
                <span>0%</span>
                <span>${confidenceLevel}</span>
                <span>100%</span>
            </div>
            
            <div class="result-text ${isAI ? 'ai' : 'human'}">
                ${isAI ? '🤖 AI Generated' : '👤 Human Written'}
            </div>
            
            <div class="confidence-score">
                Confidence: ${confidencePercent}%
            </div>
            
            ${reasoning ? `
                <div class="reasoning">
                    <strong>Analysis:</strong> ${reasoning}
                </div>
            ` : ''}
        `;

        this.hideLoading();
        this.showResults();
    }

    showError(message) {
        this.errorContent.innerHTML = `
            <p>${message}</p>
            <div class="error-details">
                <strong>Tips:</strong><br>
                • Ensure your text is at least 100 characters<br>
                • Check your internet connection<br>
                • Try again in a few moments
            </div>
        `;
        this.hideLoading();
        this.hideResults();
        this.showErrorSection();
    }

    clearText() {
        this.textInput.value = '';
        this.updateButtonState();
        this.updateCharCount();
        this.hideResults();
        this.hideError();
    }

    showLoading() {
        this.loadingSection.classList.remove('hidden');
        this.analyzeBtn.disabled = true;
    }

    hideLoading() {
        this.loadingSection.classList.add('hidden');
        this.updateButtonState();
    }

    showResults() {
        this.resultSection.classList.remove('hidden');
    }

    hideResults() {
        this.resultSection.classList.add('hidden');
    }

    showErrorSection() {
        this.errorSection.classList.remove('hidden');
    }

    hideError() {
        this.errorSection.classList.add('hidden');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIContentDetector();
});
