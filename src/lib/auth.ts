import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const AUTH_SECRET = process.env.AUTH_SECRET || 'legacy-modern-super-secure-production-jwt-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; name: string }): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    let token: string | null = null;

    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token) {
      const cookie = request.cookies.get('token');
      if (cookie) {
        token = cookie.value;
      }
    }

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}
