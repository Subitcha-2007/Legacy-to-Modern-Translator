import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SAMPLE_PRESETS } from '@/lib/samplePresets';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create Demo Project
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Enterprise Legacy Suite (Demo)',
      description: 'Pre-populated showcase containing jQuery UI, ES5 XHR and AngularJS migration modules',
      sourceLanguage: 'jQuery / JavaScript',
      targetLanguage: 'React + TypeScript',
    },
  });

  // Create conversions from presets
  for (const preset of SAMPLE_PRESETS) {
    const conversion = await prisma.conversion.create({
      data: {
        projectId: project.id,
        userId: user.id,
        sourceLanguage: preset.sourceLang,
        targetLanguage: preset.targetLang,
        legacyCode: preset.legacyCode,
        modernCode: preset.modernCode,
        strategy: 'Production Ready',
        aiMode: 'Balanced',
        status: 'COMPLETED',
        confidence: preset.confidence,
        changesCount: preset.changesCount,
        deprecatedCount: preset.deprecatedCount,
        depsCount: preset.depsCount,
        insightsJson: JSON.stringify(preset.insights),
      },
    });

    // Create test cases
    for (const tc of preset.testCases) {
      await prisma.testCase.create({
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
    }
  }

  return NextResponse.json({
    success: true,
    projectId: project.id,
    message: 'Demo project and test suites successfully loaded.',
  });
}
