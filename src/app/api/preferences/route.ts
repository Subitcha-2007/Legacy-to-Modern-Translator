import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preference = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    success: true,
    theme: preference?.theme || 'dark',
  });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { theme } = body;

  if (!theme || !['dark', 'light', 'system'].includes(theme)) {
    return NextResponse.json({ error: 'Invalid theme value. Allowed: dark, light, system' }, { status: 400 });
  }

  const updated = await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      theme,
    },
    update: {
      theme,
    },
  });

  return NextResponse.json({
    success: true,
    theme: updated.theme,
    message: 'Theme preference saved.',
  });
}
