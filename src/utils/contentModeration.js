export async function moderateContent(text) {
    const API_KEY = "AIzaSyCnLXo-E5mBROorRzf4KgH0k_nTqo4EaU0"; 
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`;

    const requestBody = {
        comment: { text },
        languages: ["en"],
        requestedAttributes: { TOXICITY: {} }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        const toxicityScore = data.attributeScores.TOXICITY.summaryScore.value;
        return toxicityScore < 0.5; 
    } catch (error) {
        console.error("Error moderating content:", error);
        return false; 
    }
}
