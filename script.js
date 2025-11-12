async function callDetectionAPI(text) {
    console.log('Sending request to API...');
    
    const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.substring(0, 4000) })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
        let errorMessage = 'Failed to analyze text';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('API result:', result);
    return result;
}
