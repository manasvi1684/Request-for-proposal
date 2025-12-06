
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testAI() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing with Key:", key ? key.substring(0, 10) + "..." : "MISSING");

    if (!key) {
        console.error("❌ No API Key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    // Try the model we configured
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const prompt = "Explain JSON in 5 words.";
        console.log(`Sending prompt to gemini-pro: "${prompt}"`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("✅ Success! Response:", text);
    } catch (error) {
        console.error("❌ Error generating content:");
        console.error(error);
    }
}

testAI();
