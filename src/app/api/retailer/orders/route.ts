import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { retailerId: user.id },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve orders: ' + error.message }, { status: 500 });
  }
}
