
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables. AI features will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

// Use a model that supports JSON mode if possible, or standard Pro
export const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
        responseMimeType: "application/json"
    }
});

// For free-text interaction or where strict JSON isn't enforced by model config (optional)
export const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
