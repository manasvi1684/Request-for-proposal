
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { model } from '@/lib/aiClient';
import { COMPARISON_PROMPT } from '@/lib/aiPrompts';
import { calculateScore } from '@/lib/scoring';

export async function GET(request: Request, props: { params: Promise<{ rfpId: string }> }) {
    try {
        const params = await props.params;
        const rfpId = parseInt(params.rfpId);

        const rfp = await prisma.rfp.findUnique({
            where: { id: rfpId },
            include: { proposals: { include: { vendor: true } } }
        });

        if (!rfp) {
            return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
        }

        if (rfp.proposals.length < 2) {
            return NextResponse.json({
                error: 'Need at least 2 proposals to compare',
                proposals: rfp.proposals
            }, { status: 400 });
        }

        // 1. Calculate Scores
        const proposalsWithScores = rfp.proposals.map((p: any) => {
            const score = calculateScore(p, {
                budget: rfp.budget,
                deliveryDeadline: rfp.deliveryDeadline
            }, rfp.proposals);
            return { ...p, calculatedScore: score };
        });

        // 2. AI Comparison
        const rfpSummary = {
            title: rfp.title,
            description: rfp.description,
            budget: rfp.budget,
            deadline: rfp.deliveryDeadline,
            requirements: rfp.structuredData
        };

        const proposalsSummary = proposalsWithScores.map((p: any) => ({
            id: p.id,
            vendor: p.vendor.name,
            price: p.totalPrice,
            delivery: p.deliveryDays,
            warranty: p.warrantyMonths,
            score: p.calculatedScore,
            notes: JSON.parse(p.parsedData) // Pass full details to AI
        }));

        const prompt = COMPARISON_PROMPT
            .replace('{{rfpData}}', JSON.stringify(rfpSummary))
            .replace('{{proposalsData}}', JSON.stringify(proposalsSummary));

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiRecommendationRaw = response.text();

        let aiRecommendation;
        try {
            const cleanedText = aiRecommendationRaw.replace(/```json\n?|\n?```/g, '').trim();
            aiRecommendation = JSON.parse(cleanedText);
        } catch {
            aiRecommendation = { reasoning: "Could not parse AI recommendation", recommended_vendor_id: null };
        }

        return NextResponse.json({
            proposals: proposalsWithScores,
            recommendation: aiRecommendation
        });

    } catch (error) {
        console.error('Error comparing options:', error);
        return NextResponse.json(
            { error: 'Comparison failed' },
            { status: 500 }
        );
    }
}
