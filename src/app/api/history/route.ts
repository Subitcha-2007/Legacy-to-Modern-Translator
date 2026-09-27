import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status');

  const conversions = await prisma.conversion.findMany({
    where: {
      userId: user.id,
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(search
        ? {
            OR: [
              { sourceLanguage: { contains: search } },
              { targetLanguage: { contains: search } },
              { project: { name: { contains: search } } },
            ],
          }
        : {}),
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
      _count: {
        select: { testCases: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, history: conversions });
}
