import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const orderId = Number(params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        retailer: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (user.role === 'RETAILER' && order.retailerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this invoice.' }, { status: 403 });
    }

    const agencyDetails = {
      agencyName: 'Sakthimurugan Medical Agencies',
      logoText: 'SMM',
      tagline: 'Leading Wholesale Pharmaceutical Distributor & Stockist',
      address: 'No. 45, Nethaji Road, Wholesale Market Complex, Erode - 638001, Tamil Nadu',
      phone: '+91 94433 12345 / 0424-2256789',
      email: 'orders@sakthimurugan.com',
      dlNumber: 'TN-ERD-20B-00129 / TN-ERD-21B-00130',
      gstin: '33AAACS1234M1Z8',
      fssai: '12423005000182'
    };

    return NextResponse.json({
      invoice: {
        order,
        agency: agencyDetails,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate invoice data: ' + error.message }, { status: 500 });
  }
}
