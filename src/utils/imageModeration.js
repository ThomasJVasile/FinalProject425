// export async function moderateImage(file) {
//     const API_KEY = "89eb1f223e6b58304beb9ed876d3a421eb901676"; 
//     const reader = new FileReader();

//     return new Promise((resolve, reject) => {
//         reader.onloadend = async () => {
//             const base64Image = reader.result.split(",")[1];
//             const requestBody = {
//                 requests: [
//                     {
//                         image: { content: base64Image },
//                         features: [{ type: "SAFE_SEARCH_DETECTION" }]
//                     }
//                 ]
//             };

//             try {
//                 const response = await fetch(
//                     `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(requestBody),
//                     }
//                 );
//                 const data = await response.json();
//                 const safeSearch = data.responses[0].safeSearchAnnotation;

//                 const isSafe = !["LIKELY", "VERY_LIKELY"].some((risk) =>
//                     ["adult", "violence", "racy", "medical", "spoof"].some(
//                         (key) => safeSearch[key] === risk
//                     )
//                 );

//                 resolve(isSafe);
//             } catch (error) {
//                 console.error("Error scanning image:", error);
//                 resolve(false);
//             }
//         };

//         reader.onerror = (error) => reject(error);
//         reader.readAsDataURL(file);
//     });
// }89eb1f223e6b58304beb9ed876d3a421eb901676


export async function moderateImage(file) {
    const API_KEY = "AIzaSyBUmsNkBgo1DXHz-71HU4Q4tkHyvsCnxRQ";  // Make sure you have the correct API key here
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
                
                console.log("🔍 Image Moderation Response:", JSON.stringify(data, null, 2)); 

                if (!data.responses || !data.responses[0].safeSearchAnnotation) {
                    console.warn("⚠️ SafeSearch response is missing. Assuming safe.");
                    resolve(true);
                    return;
                }

                const safeSearch = data.responses[0].safeSearchAnnotation;

                console.log("📸 Image Safety Ratings:", safeSearch); 

                const isSafe = !["LIKELY", "VERY_LIKELY"].some((risk) =>
                    ["adult", "violence", "racy", "medical", "spoof"].some(
                        (key) => safeSearch[key] === risk
                    )
                );

                console.log(`🟢 Image Moderation Decision: ${isSafe ? "SAFE ✅" : "BLOCKED 🚫"}`);
                resolve(isSafe);
            } catch (error) {
                console.error("❌ Error scanning image:", error);
                resolve(true);  // If API fails, assume the image is safe to avoid blocking all uploads
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}
