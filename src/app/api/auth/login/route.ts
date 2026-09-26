import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please provide both email and password.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        role: user.role,
        shopName: user.shopName,
        ownerName: user.ownerName,
        email: user.email,
        phone: user.phone,
        dlNumber: user.dlNumber,
        gstNumber: user.gstNumber,
        isApproved: user.isApproved,
        creditLimit: user.creditLimit,
        currentBalance: user.currentBalance,
        address: user.address,
        pincode: user.pincode
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed: ' + error.message }, { status: 500 });
  }
}
