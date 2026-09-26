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
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Drug License / GST verification failed.';

    const updated = await prisma.user.update({
      where: { id: retailerId },
      data: {
        isApproved: false
      }
    });

    return NextResponse.json({
      message: `Retailer "${updated.shopName}" application rejected: ${reason}`,
      retailer: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reject retailer: ' + error.message }, { status: 500 });
  }
}
