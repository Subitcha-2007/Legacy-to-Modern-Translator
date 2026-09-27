import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      userId: user.id, // User ownership isolation
    },
    include: {
      conversions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, project });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, sourceLanguage, targetLanguage } = body;

  const existing = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(sourceLanguage ? { sourceLanguage } : {}),
      ...(targetLanguage ? { targetLanguage } : {}),
    },
  });

  return NextResponse.json({ success: true, project: updated, message: 'Project updated successfully.' });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
  }

  await prisma.project.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true, message: 'Project deleted successfully.' });
}
