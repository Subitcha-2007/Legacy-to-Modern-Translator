import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export const JWT_SECRET = process.env.JWT_SECRET || 'sakthimurugan_secret_jwt_key_erode_2026';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
  });
}

export async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization token required' };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return { user: null, error: 'User account not found' };
    }

    return { user, error: null };
  } catch (err: any) {
    return { user: null, error: 'Invalid or expired token' };
  }
}
