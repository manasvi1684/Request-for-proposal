
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id);

        const rfp = await prisma.rfp.findUnique({
            where: { id },
            include: {
                proposals: {
                    include: { vendor: true },
                },
            },
        });

        if (!rfp) {
            return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
        }

        return NextResponse.json(rfp);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch RFP' }, { status: 500 });
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id);
        const body = await request.json();

        const updatedRfp = await prisma.rfp.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedRfp);
    } catch (error) {
        console.error('Error updating RFP:', error);
        return NextResponse.json({ error: 'Failed to update RFP' }, { status: 500 });
    }
}
