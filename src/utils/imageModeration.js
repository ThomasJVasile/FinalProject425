export async function moderateImage(file) {
    const API_KEY = "AIzaSyCnLXo-E5mBROorRzf4KgH0k_nTqo4EaU0"; 
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64Image = reader.result.split(",")[1];
            const requestBody = {
                requests: [
                    {
                        image: { content: base64Image },
                        features: [{ type: "SAFE_SEARCH_DETECTION" }]
                    }
                ]
            };

            try {
                const response = await fetch(
                    `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody),
                    }
                );
                const data = await response.json();
                const safeSearch = data.responses[0].safeSearchAnnotation;

                const isSafe = !["LIKELY", "VERY_LIKELY"].some((risk) =>
                    ["adult", "violence", "racy", "medical", "spoof"].some(
                        (key) => safeSearch[key] === risk
                    )
                );

                resolve(isSafe);
            } catch (error) {
                console.error("Error scanning image:", error);
                resolve(false);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}
