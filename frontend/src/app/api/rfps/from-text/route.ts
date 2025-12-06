
import { NextResponse } from 'next/server';
import { model } from '@/lib/aiClient';
import { RFP_GENERATION_PROMPT } from '@/lib/aiPrompts';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text input is required' },
                { status: 400 }
            );
        }

        const prompt = RFP_GENERATION_PROMPT.replace('{{userInput}}', text);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Parse the JSON. Clean up markdown code blocks if present.
        const cleanedText = textResponse.replace(/```json\n?|\n?```/g, '').trim();
        let structuredData;
        try {
            structuredData = JSON.parse(cleanedText);
        } catch (e) {
            console.error("AI JSON parse error:", e);
            // Fallback or retry logic could go here. 
            // For now, return error or raw text wrapped.
            return NextResponse.json({ error: "Failed to parse AI response as JSON", raw: textResponse }, { status: 500 });
        }

        return NextResponse.json(structuredData);
    } catch (error) {
        console.error('Error generating RFP structure:', error);
        return NextResponse.json(
            { error: 'AI generation failed' },
            { status: 500 }
        );
    }
}
