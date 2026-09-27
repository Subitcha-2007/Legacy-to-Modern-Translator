import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversion = await prisma.conversion.findFirst({
    where: {
      id: params.id,
      userId: user.id, // User ownership check
    },
    include: {
      project: true,
      testCases: true,
    },
  });

  if (!conversion) {
    return NextResponse.json({ error: 'Conversion not found' }, { status: 404 });
  }

  let insights: string[] = [];
  if (conversion.insightsJson) {
    try {
      insights = JSON.parse(conversion.insightsJson);
    } catch (e) {
      insights = [];
    }
  }

  return NextResponse.json({
    success: true,
    conversion: {
      ...conversion,
      insights,
    },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.conversion.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Conversion not found or unauthorized' }, { status: 404 });
  }

  await prisma.conversion.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true, message: 'Conversion record deleted successfully.' });
}
