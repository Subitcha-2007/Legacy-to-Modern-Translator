import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const [
      orders,
      users,
      products
    ] = await Promise.all([
      prisma.order.findMany({
        include: {
          retailer: true,
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany(),
      prisma.product.findMany()
    ]);

    const retailers = users.filter(u => u.role === 'RETAILER');
    const approvedRetailers = retailers.filter(u => u.isApproved);
    const pendingRetailers = retailers.filter(u => !u.isApproved);

    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');
    const dispatchedOrders = orders.filter(o => o.orderStatus === 'DISPATCHED');
    const totalOutstandingDebt = approvedRetailers.reduce((sum, r) => sum + (r.currentBalance || 0), 0);
    const lowStockProducts = products.filter(p => p.stockQuantity <= 20);

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount: pendingOrders.length,
        dispatchedOrdersCount: dispatchedOrders.length,
        approvedRetailersCount: approvedRetailers.length,
        pendingKYCCount: pendingRetailers.length,
        totalOutstandingDebt,
        lowStockCount: lowStockProducts.length,
        totalCatalogItems: products.length
      },
      recentOrders: orders.slice(0, 5),
      pendingKYCList: pendingRetailers.slice(0, 5)
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin stats: ' + error.message }, { status: 500 });
  }
}
