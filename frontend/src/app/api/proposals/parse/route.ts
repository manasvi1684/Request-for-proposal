
import { NextResponse } from 'next/server';
import { model } from '@/lib/aiClient';
import { PROPOSAL_PARSING_PROMPT } from '@/lib/aiPrompts';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { vendorText, rfpId } = await request.json();

        if (!vendorText || !rfpId) {
            return NextResponse.json(
                { error: 'Vendor text and RFP ID are required' },
                { status: 400 }
            );
        }

        // specific RFP context to help parsing (so AI knows what items we are looking for)
        const rfp = await prisma.rfp.findUnique({
            where: { id: parseInt(rfpId) },
            select: { description: true, structuredData: true, budget: true, currency: true }
        });

        if (!rfp) {
            return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
        }

        const rfpContext = JSON.stringify({
            description: rfp.description,
            structuredDetails: rfp.structuredData !== '{}' ? JSON.parse(rfp.structuredData) : null
        });

        const prompt = PROPOSAL_PARSING_PROMPT
            .replace('{{rfpContext}}', rfpContext)
            .replace('{{vendorText}}', vendorText);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        const cleanedText = textResponse.replace(/```json\n?|\n?```/g, '').trim();
        let structuredData;
        try {
            structuredData = JSON.parse(cleanedText);
        } catch (e) {
            console.error("AI JSON parse error:", e);
            return NextResponse.json({ error: "Failed to parse AI response as JSON", raw: textResponse }, { status: 500 });
        }

        return NextResponse.json(structuredData);
    } catch (error) {
        console.error('Error parsing proposal:', error);
        return NextResponse.json(
            { error: 'AI parsing failed' },
            { status: 500 }
        );
    }
}
