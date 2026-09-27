import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { moderniseLegacyCode } from '@/services/aiService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  const conversions = await prisma.conversion.findMany({
    where: {
      userId: user.id,
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
      testCases: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, conversions });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    projectId,
    legacyCode,
    sourceLanguage = 'jQuery / JavaScript',
    targetLanguage = 'React + TypeScript',
    strategy = 'Production Ready',
    aiMode = 'Balanced',
  } = body;

  if (!legacyCode || !legacyCode.trim()) {
    return NextResponse.json({ error: 'Legacy source code is required for modernization.' }, { status: 400 });
  }

  // 1. Process AI conversion via backend service
  const aiResult = await moderniseLegacyCode({
    legacyCode: legacyCode.trim(),
    sourceLanguage,
    targetLanguage,
    strategy,
    aiMode,
  });

  // 2. Persist to relational database
  const conversion = await prisma.conversion.create({
    data: {
      userId: user.id,
      projectId: projectId || null,
      sourceLanguage,
      targetLanguage,
      legacyCode: legacyCode.trim(),
      modernCode: aiResult.modernCode,
      strategy,
      aiMode,
      status: 'COMPLETED',
      confidence: aiResult.confidence,
      changesCount: aiResult.changesCount,
      deprecatedCount: aiResult.deprecatedCount,
      depsCount: aiResult.depsCount,
      insightsJson: JSON.stringify(aiResult.insights),
    },
  });

  // 3. Persist generated test cases
  const createdTestCases = [];
  for (const tc of aiResult.testCases) {
    const createdTc = await prisma.testCase.create({
      data: {
        conversionId: conversion.id,
        testName: tc.testName,
        type: tc.type,
        status: tc.status,
        duration: tc.duration,
        scenario: tc.scenario,
        expectedResult: tc.expectedResult,
        actualResult: tc.actualResult,
        testCode: tc.testCode,
      },
    });
    createdTestCases.push(createdTc);
  }

  return NextResponse.json({
    success: true,
    conversion: {
      ...conversion,
      testCases: createdTestCases,
      insights: aiResult.insights,
    },
    message: 'Conversion completed and saved to database.',
  });
}
