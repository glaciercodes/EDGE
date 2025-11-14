class StoryGenerator {
    constructor() {
        this.generateBtn = document.getElementById('generateBtn');
        this.loadingElement = document.getElementById('loading');
        this.resultElement = document.getElementById('result');
        this.errorElement = document.getElementById('error');
        this.storyContent = document.getElementById('storyContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.newStoryBtn = document.getElementById('newStoryBtn');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateStory());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.newStoryBtn.addEventListener('click', () => this.resetForm());
    }

    async generateStory() {
        const topic = document.getElementById('topic').value.trim();
        const genre = document.getElementById('genre').value;
        const length = document.getElementById('length').value;
        const style = document.getElementById('style').value;

        if (!topic) {
            this.showError('Please enter a story topic or theme.');
            return;
        }

        this.showLoading();
        this.hideResult();
        this.hideError();

        try {
            const prompt = this.buildPrompt(topic, genre, length, style);
            const story = await this.callOpenAI(prompt);
            
            this.displayStory(story);
            this.showResult();
            
        } catch (error) {
            console.error('Error generating story:', error);
            this.showError('Failed to generate story. Please try again.');
        }
    }

    buildPrompt(topic, genre, length, style) {
        const lengthMap = {
            'short': '1-2 paragraphs',
            'medium': '3-4 paragraphs', 
            'long': '5-6 paragraphs'
        };

        return `Write a ${genre} story about "${topic}". 
                The story should be ${lengthMap[length]} long and written in a ${style} style.
                Make it engaging, creative, and well-structured. 
                Include character development and an interesting plot.`;
    }

    async callOpenAI(prompt) {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data.story;
    }

    displayStory(story) {
        this.storyContent.textContent = story;
    }

    showLoading() {
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';
        this.loadingElement.classList.remove('hidden');
    }

    hideLoading() {
        this.generateBtn.disabled = false;
        this.generateBtn.textContent = 'Generate Story';
        this.loadingElement.classList.add('hidden');
    }

    showResult() {
        this.hideLoading();
        this.resultElement.classList.remove('hidden');
    }

    hideResult() {
        this.resultElement.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        document.getElementById('errorMessage').textContent = message;
        this.errorElement.classList.remove('hidden');
    }

    hideError() {
        this.errorElement.classList.add('hidden');
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.storyContent.textContent);
            this.copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.copyBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    resetForm() {
        this.hideResult();
        document.getElementById('topic').value = '';
        document.getElementById('topic').focus();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryGenerator();
});
