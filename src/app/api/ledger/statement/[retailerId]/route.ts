import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { retailerId: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const retailerId = Number(params.retailerId) || user.id;

    if (user.role === 'RETAILER' && user.id !== retailerId) {
      return NextResponse.json({ error: 'Unauthorized to view this statement.' }, { status: 403 });
    }

    const retailer = await prisma.user.findUnique({
      where: { id: retailerId }
    });

    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found.' }, { status: 404 });
    }

    const txns = await prisma.ledgerTransaction.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' }
    });

    const statement = {
      agency: {
        name: 'Sakthimurugan Medical Agencies',
        subtitle: 'Wholesale Payment Details & Ledger Statement',
        address: 'No. 45, Nethaji Road, Erode - 638001, Tamil Nadu',
        phone: '+91 94433 12345',
        email: 'accounts@sakthimurugan.com',
        gstin: '33AAACS1234M1Z8'
      },
      retailer: {
        shopName: retailer.shopName,
        ownerName: retailer.ownerName,
        address: retailer.address,
        phone: retailer.phone,
        dlNumber: retailer.dlNumber,
        gstNumber: retailer.gstNumber,
        creditLimit: retailer.creditLimit,
        currentBalance: retailer.currentBalance
      },
      transactions: txns,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({ statement });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate statement: ' + error.message }, { status: 500 });
  }
}
