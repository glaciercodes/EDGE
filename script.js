async function callDetectionAPI(text) {
    try {
        const response = await fetch('/api/detect-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        const responseText = await response.text();
        console.log('Raw API response:', responseText);

        if (!response.ok) {
            let errorMessage = 'Failed to analyze text';
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = responseText || `HTTP error: ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        // Parse the successful response
        const result = JSON.parse(responseText);
        return result;
        
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}


displayError(message) {
    this.resultContent.innerHTML = `
        <div class="error-message">
            <p style="color: #ff6b6b; font-weight: 600;">Error: ${message}</p>
            <p>Please try again with different text.</p>
            <details style="margin-top: 10px; color: #666; font-size: 0.9em;">
                <summary>Technical Details</summary>
                <p>If this continues, check your OpenAI API key in Vercel environment variables.</p>
            </details>
        </div>
    `;
    this.showResult();
}



git add .
git commit -m "Fix JSON parsing and error handling"
git push origin main
