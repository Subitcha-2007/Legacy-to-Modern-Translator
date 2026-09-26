import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const pending = await prisma.user.findMany({
      where: {
        role: 'RETAILER',
        isApproved: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      count: pending.length,
      retailers: pending
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch pending retailers: ' + error.message }, { status: 500 });
  }
}
