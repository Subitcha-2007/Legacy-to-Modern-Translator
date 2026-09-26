import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const retailerId = Number(params.id);
    const { creditLimit } = await req.json();

    const assignedCreditLimit = creditLimit !== undefined ? Number(creditLimit) : 100000;

    const updated = await prisma.user.update({
      where: { id: retailerId },
      data: {
        isApproved: true,
        creditLimit: assignedCreditLimit
      }
    });

    return NextResponse.json({
      message: `Shop "${updated.shopName}" has been successfully approved with a wholesale credit limit of ₹${assignedCreditLimit.toLocaleString('en-IN')}.`,
      retailer: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to approve retailer: ' + error.message }, { status: 500 });
  }
}
