const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Vendors
    const vendors = [
        {
            name: 'TechFlow Solutions',
            email: 'sales@techflow.example.com',
            contactInfo: '1-800-TECHFLOW',
            notes: 'Reliable for high-end laptops, usually standard delivery.',
        },
        {
            name: 'Office Depot Pro',
            email: 'b2b@officedepotpro.example.com',
            contactInfo: 'Steve J. (Account Mgr)',
            notes: 'Good for bulk orders, flexible payment terms.',
        },
        {
            name: 'RapidSupply Inc',
            email: 'orders@rapidsupply.example.com',
            contactInfo: 'HQ in Seattle',
            notes: 'Fastest delivery but slightly higher prices.',
        },
    ];

    for (const v of vendors) {
        const existing = await prisma.vendor.findUnique({ where: { email: v.email } });
        if (!existing) {
            await prisma.vendor.create({ data: v });
            console.log(`Created vendor: ${v.name}`);
        }
    }

    // 2. Create an optional example RFP (completed)
    const rfpTitle = 'Q3 Office Stationery';
    const rfp = await prisma.rfp.findFirst({ where: { title: rfpTitle } });

    if (!rfp) {
        await prisma.rfp.create({
            data: {
                title: rfpTitle,
                description: 'Need basic stationery for the new branch. 500 notepads, 1000 pens, 50 staplers. Budget $2000.',
                budget: 2000,
                currency: 'USD',
                status: 'AWARDED',
                structuredData: JSON.stringify({
                    budget: 2000,
                    currency: 'USD',
                    items: [
                        { name: 'Notepads', quantity: 500, specs: 'Standard A4' },
                        { name: 'Pens', quantity: 1000, specs: 'Blue ink ballpoint' }
                    ]
                }),
            }
        });
        console.log('Created example RFP: Q3 Office Stationery');
    }

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
