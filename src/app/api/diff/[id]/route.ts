import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find specific conversion or find the latest conversion if 'latest' is passed
  let conversion;
  if (params.id === 'latest') {
    conversion = await prisma.conversion.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { project: true, testCases: true },
    });
  } else {
    conversion = await prisma.conversion.findFirst({
      where: { id: params.id, userId: user.id },
      include: { project: true, testCases: true },
    });
  }

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

  // Calculate line diffs
  const legacyLines = conversion.legacyCode.split('\n');
  const modernLines = conversion.modernCode.split('\n');

  return NextResponse.json({
    success: true,
    diff: {
      id: conversion.id,
      projectName: conversion.project?.name || 'Quick Conversion',
      sourceLanguage: conversion.sourceLanguage,
      targetLanguage: conversion.targetLanguage,
      legacyCode: conversion.legacyCode,
      modernCode: conversion.modernCode,
      legacyLines,
      modernLines,
      changesCount: conversion.changesCount,
      deprecatedCount: conversion.deprecatedCount,
      depsCount: conversion.depsCount,
      confidence: conversion.confidence,
      insights,
      createdAt: conversion.createdAt,
    },
  });
}
