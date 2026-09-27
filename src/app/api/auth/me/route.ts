import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch counts of projects, conversions, tests
  const [projectCount, conversionCount, testCount] = await Promise.all([
    prisma.project.count({ where: { userId: user.id } }),
    prisma.conversion.count({ where: { userId: user.id } }),
    prisma.testCase.count({ where: { conversion: { userId: user.id } } }),
  ]);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      theme: user.preferences?.theme || 'dark',
      stats: {
        projects: projectCount,
        conversions: conversionCount,
        tests: testCount,
      },
    },
  });
}
