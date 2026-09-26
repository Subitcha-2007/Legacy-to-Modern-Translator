import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ONLINE',
    agency: 'Sakthimurugan Medical Agencies',
    badge: 'SMM',
    hub: 'Erode, Tamil Nadu',
    architecture: 'Unified Full-Stack Next.js 14 App Router',
    port: 3000,
    database: 'SQLite (Prisma ORM)',
    timestamp: new Date().toISOString()
  });
}
