
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendRfpEmail } from '@/lib/emailClient';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        const { vendorIds } = await request.json();

        if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
            return NextResponse.json(
                { error: 'No vendors selected' },
                { status: 400 }
            );
        }

        const rfp = await prisma.rfp.findUnique({
            where: { id: parseInt(id) },
        });

        if (!rfp) {
            return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
        }

        const vendors = await prisma.vendor.findMany({
            where: {
                id: { in: vendorIds.map((vid: any) => parseInt(vid)) },
            },
        });

        // Create email content
        // We include [RFP-ID] in subject for tracking replies later
        const subject = `Request for Proposal: ${rfp.title} [RFP-${rfp.id}]`;
        const htmlContent = `
      <h2>${rfp.title}</h2>
      <p>Dear Vendor,</p>
      <p>We are inviting you to submit a proposal for the following requirements:</p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
        ${rfp.description.replace(/\n/g, '<br/>')}
      </blockquote>
      <p><strong>Budget Indication:</strong> ${rfp.budget ? `${rfp.budget} ${rfp.currency}` : 'Not disclosed'}</p>
      <p><strong>Deadline:</strong> ${rfp.deliveryDeadline ? new Date(rfp.deliveryDeadline).toLocaleDateString() : 'ASAP'}</p>
      
      <p>Please reply to this email with your proposal details (Price, Delivery timeline, Warranty terms).</p>
      <p>Thank you.</p>
    `;

        // Send in parallel (or sequential if avoiding rate limits)
        const results = await Promise.allSettled(
            vendors.map((v: any) => sendRfpEmail(v.email, subject, htmlContent))
        );

        // Update status to SENT
        await prisma.rfp.update({
            where: { id: rfp.id },
            data: { status: 'SENT' }
        });

        return NextResponse.json({ success: true, sentCount: results.filter((r: any) => r.status === 'fulfilled').length });

    } catch (error) {
        console.error('Error sending RFP:', error);
        return NextResponse.json(
            { error: 'Failed to send emails' },
            { status: 500 }
        );
    }
}
