import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email address already exists.' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with default preferences & default initial project
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        preferences: {
          create: {
            theme: 'dark',
          },
        },
        projects: {
          create: {
            name: 'Default Workspace Project',
            description: 'Main project for legacy code conversions and test suites',
            sourceLanguage: 'jQuery / JavaScript',
            targetLanguage: 'React + TypeScript',
          },
        },
      },
      include: {
        preferences: true,
        projects: true,
      },
    });

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        theme: user.preferences?.theme || 'dark',
      },
      token,
      message: 'Account created successfully.',
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
