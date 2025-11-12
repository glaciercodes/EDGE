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
