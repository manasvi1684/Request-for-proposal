
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vendors' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, contactInfo, notes } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Check for existing email to avoid unique constraint error
        const existing = await prisma.vendor.findUnique({
            where: { email },
        });
        if (existing) {
            return NextResponse.json(
                { error: 'Vendor with this email already exists' },
                { status: 409 }
            )
        }

        const vendor = await prisma.vendor.create({
            data: {
                name,
                email,
                contactInfo,
                notes,
            },
        });

        return NextResponse.json(vendor, { status: 201 });
    } catch (error) {
        console.error('Error creating vendor:', error);
        return NextResponse.json(
            { error: 'Failed to create vendor' },
            { status: 500 }
        );
    }
}
