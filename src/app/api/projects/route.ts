import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { conversions: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ success: true, projects });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, sourceLanguage, targetLanguage } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || 'Modernization workspace',
      sourceLanguage: sourceLanguage || 'jQuery / JavaScript',
      targetLanguage: targetLanguage || 'React + TypeScript',
    },
  });

  return NextResponse.json({ success: true, project, message: 'Project created successfully.' });
}
