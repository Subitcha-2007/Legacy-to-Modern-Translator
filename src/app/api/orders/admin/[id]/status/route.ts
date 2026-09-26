import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const orderId = Number(params.id);
    const body = await req.json();
    const { orderStatus, dispatchRoute, paymentStatus, notes } = body;

    const data: any = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (dispatchRoute) data.dispatchRoute = dispatchRoute;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (notes) data.notes = notes;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        retailer: true,
        items: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Order dispatch status updated successfully.',
      order: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update order status: ' + error.message }, { status: 500 });
  }
}
