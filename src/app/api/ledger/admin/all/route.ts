import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const retailers = await prisma.user.findMany({
      where: { role: 'RETAILER' },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const now = new Date();

    const clients = retailers.map(r => {
      let overdueCycle = 'CURRENT';
      let daysOutstanding = 0;

      if (r.currentBalance > 0 && r.transactions.length > 0) {
        const lastDebit = r.transactions.find(t => t.transactionType === 'DEBIT');
        if (lastDebit) {
          const debitDate = new Date(lastDebit.createdAt);
          const diffMs = now.getTime() - debitDate.getTime();
          daysOutstanding = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          if (daysOutstanding > 30) overdueCycle = '30_DAYS_PLUS';
          else if (daysOutstanding > 15) overdueCycle = '15_DAYS';
        }
      }

      return {
        id: r.id,
        shopName: r.shopName || r.ownerName,
        ownerName: r.ownerName,
        phone: r.phone,
        email: r.email,
        dlNumber: r.dlNumber,
        gstNumber: r.gstNumber,
        creditLimit: r.creditLimit,
        currentBalance: r.currentBalance,
        availableCredit: Math.max(0, r.creditLimit - r.currentBalance),
        daysOutstanding,
        overdueCycle,
        isApproved: r.isApproved,
        transactionCount: r.transactions.length
      };
    });

    const totalOutstandingDebt = clients.reduce((acc, c) => acc + (c.currentBalance || 0), 0);
    const totalCreditSanctioned = clients.reduce((acc, c) => acc + (c.creditLimit || 0), 0);

    const allTxns = await prisma.ledgerTransaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        retailer: {
          select: { shopName: true, ownerName: true }
        }
      }
    });

    return NextResponse.json({
      summary: {
        totalOutstandingDebt,
        totalCreditSanctioned,
        totalRetailers: clients.length,
        critical30DaysCount: clients.filter(c => c.overdueCycle === '30_DAYS_PLUS').length,
        due15DaysCount: clients.filter(c => c.overdueCycle === '15_DAYS').length
      },
      clients,
      recentTransactions: allTxns.map(t => ({
        ...t,
        retailerName: t.retailer ? t.retailer.shopName || t.retailer.ownerName : 'Unknown'
      }))
    });
  } catch (error: any) {
    console.error('Error fetching wholesale ledgers:', error);
    return NextResponse.json({ error: 'Failed to retrieve wholesale ledger data: ' + error.message }, { status: 500 });
  }
}
