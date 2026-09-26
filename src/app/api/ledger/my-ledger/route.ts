import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const transactions = await prisma.ledgerTransaction.findMany({
      where: { retailerId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      retailer: {
        id: user.id,
        shopName: user.shopName,
        ownerName: user.ownerName,
        creditLimit: user.creditLimit,
        currentBalance: user.currentBalance,
        availableCredit: Math.max(0, user.creditLimit - user.currentBalance)
      },
      transactions
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve ledger statement: ' + error.message }, { status: 500 });
  }
}
