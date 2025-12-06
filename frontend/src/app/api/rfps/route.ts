
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const rfps = await prisma.rfp.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { proposals: true },
                },
            },
        });
        return NextResponse.json(rfps);
    } catch (error) {
        console.error('Error fetching RFPs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch RFPs' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, budget, currency, deliveryDeadline, structuredData } = body;

        // Basic validation
        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            );
        }

        // Default structured data is empty or based on description if we were doing it synchrononously, 
        // but here we just initialize it.
        const rfp = await prisma.rfp.create({
            data: {
                title,
                description,
                budget: budget ? parseFloat(budget) : null,
                currency: currency || 'USD',
                deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : null,
                structuredData: structuredData || '{}', // Persist AI structure or default to empty
            },
        });

        return NextResponse.json(rfp, { status: 201 });
    } catch (error) {
        console.error('Error creating RFP:', error);
        return NextResponse.json(
            { error: 'Failed to create RFP' },
            { status: 500 }
        );
    }
}
