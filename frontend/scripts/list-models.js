
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No API Key found");
        return;
    }

    // Debug: print part of key to verify it's reading correct one
    console.log("Using Key:", key.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(key);

    // Note: List models is usually on the 'genAI' instance or a manager, 
    // but the SDK structure varies. We'll try to use the fetch directly if SDK doesn't expose it easily,
    // or use the model manager if available in this version.
    // Actually, for this SDK version, we usually just try a known working model.
    // But let's try a direct REST call to see what this key can see.

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Available Models:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
