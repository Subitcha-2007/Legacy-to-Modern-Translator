import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, error } = await verifyAuth(req);
  if (!user || error) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      role: user.role,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      phone: user.phone,
      dlNumber: user.dlNumber,
      gstNumber: user.gstNumber,
      bankAccount: user.bankAccount,
      bankIfsc: user.bankIfsc,
      isApproved: user.isApproved,
      creditLimit: user.creditLimit,
      currentBalance: user.currentBalance,
      address: user.address,
      pincode: user.pincode
    }
  });
}
