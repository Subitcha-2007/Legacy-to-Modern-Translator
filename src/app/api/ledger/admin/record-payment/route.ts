import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const {
      retailerId,
      amount,
      paymentMode,
      referenceNumber,
      notes
    } = await req.json();

    if (!retailerId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Retailer ID and valid payment amount are required.' }, { status: 400 });
    }

    const targetRetailer = await prisma.user.findUnique({
      where: { id: Number(retailerId) }
    });

    if (!targetRetailer) {
      return NextResponse.json({ error: 'Retailer not found.' }, { status: 404 });
    }

    const paymentAmount = Number(amount);
    const newBalance = Math.max(0, (targetRetailer.currentBalance || 0) - paymentAmount);

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetRetailer.id },
        data: { currentBalance: newBalance }
      });

      const transaction = await tx.ledgerTransaction.create({
        data: {
          retailerId: targetRetailer.id,
          transactionType: 'CREDIT',
          amount: paymentAmount,
          balanceAfter: newBalance,
          paymentMode: paymentMode || 'CASH',
          referenceNumber: referenceNumber || null,
          notes: notes || `Payment received via ${paymentMode || 'Cash'} from ${targetRetailer.shopName || targetRetailer.ownerName}`
        }
      });

      return { updatedUser, transaction };
    });

    return NextResponse.json({
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully for ${targetRetailer.shopName}. New outstanding balance is ₹${newBalance.toLocaleString('en-IN')}.`,
      transaction: result.transaction,
      updatedRetailer: {
        id: targetRetailer.id,
        shopName: targetRetailer.shopName,
        currentBalance: newBalance
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment: ' + error.message }, { status: 500 });
  }
}
