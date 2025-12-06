
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            rfpId,
            vendorId,
            rawText,
            parsedData, // Full JSON object
            // extracted top-level fields
            totalPrice,
            currency,
            deliveryDays,
            warrantyMonths,
            paymentTerms,
            completenessScore
        } = body;

        if (!rfpId || !vendorId || !rawText) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const proposal = await prisma.proposal.create({
            data: {
                rfpId: parseInt(rfpId),
                vendorId: parseInt(vendorId),
                rawText,
                parsedData: JSON.stringify(parsedData),
                totalPrice: totalPrice,
                currency: currency || 'USD',
                deliveryDays: deliveryDays,
                warrantyMonths: warrantyMonths,
                paymentTerms: paymentTerms,
                completenessScore: completenessScore,
            },
        });

        return NextResponse.json(proposal, { status: 201 });
    } catch (error) {
        console.error('Error creating proposal:', error);
        return NextResponse.json(
            { error: 'Failed to create proposal' },
            { status: 500 }
        );
    }
}
