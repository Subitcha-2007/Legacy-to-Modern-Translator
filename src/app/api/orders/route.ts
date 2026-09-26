import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'RETAILER') {
      return NextResponse.json({ error: 'Only retail medical shop accounts can place wholesale orders.' }, { status: 403 });
    }

    if (!user.isApproved) {
      return NextResponse.json({
        error: 'Your retail medical shop account is pending verification by Sakthimurugan Medical Agencies. Bulk order placement will be unlocked once approved.'
      }, { status: 403 });
    }

    const {
      items,
      deliveryType,
      deliveryAddress,
      dispatchRoute,
      paymentMethod,
      notes
    } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one tablet item.' }, { status: 400 });
    }

    let totalAmount = 0;
    const validatedItems: { product: any; quantity: number; unitType: string; unitPrice: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: Number(item.productId) } });
      if (!product) {
        return NextResponse.json({ error: `Product ID ${item.productId} not found.` }, { status: 404 });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return NextResponse.json({ error: `Invalid quantity for ${product.brandName}.` }, { status: 400 });
      }

      const unitType = item.unitType === 'STRIP' ? 'STRIP' : 'BOX';
      const unitPrice = unitType === 'BOX' ? product.pricePerBox : product.pricePerStrip;
      const requiredBoxes = unitType === 'BOX' ? qty : Math.ceil(qty / 10);

      if (product.stockQuantity < requiredBoxes) {
        return NextResponse.json({
          error: `Insufficient wholesale stock for ${product.brandName}. Available: ${product.stockQuantity} boxes.`
        }, { status: 400 });
      }

      totalAmount += unitPrice * qty;
      validatedItems.push({
        product,
        quantity: qty,
        unitType,
        unitPrice
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Credit Ledger (Payment Details) verification
    if (paymentMethod === 'CREDIT_LEDGER') {
      const currentDebt = Number(user.currentBalance || 0);
      const limit = Number(user.creditLimit || 0);
      const projectedDebt = currentDebt + totalAmount;

      if (projectedDebt > limit) {
        return NextResponse.json({
          error: `Credit limit exceeded! Your approved credit limit is ₹${limit.toLocaleString('en-IN')}, current balance is ₹${currentDebt.toLocaleString('en-IN')}. Available credit is ₹${Math.max(0, limit - currentDebt).toLocaleString('en-IN')}, but this order totals ₹${totalAmount.toLocaleString('en-IN')}. Please choose another payment method or pay your outstanding ledger balance.`
        }, { status: 400 });
      }
    }

    let defaultRoute = dispatchRoute;
    if (!defaultRoute) {
      defaultRoute = deliveryType === 'DOOR_DELIVERY'
        ? 'Erode Town & Perundurai Route (SMM Fleet Van)'
        : 'Wholesale Depot Counter Pickup (Erode)';
    }

    const countOrders = await prisma.order.count();
    const invoiceNumber = `SMM-INV-${new Date().getFullYear()}-${String(countOrders + 1).padStart(4, '0')}`;

    let paymentStatus = 'PENDING';
    if (paymentMethod === 'ONLINE') paymentStatus = 'PAID';
    else if (paymentMethod === 'CREDIT_LEDGER') paymentStatus = 'CREDIT_LEDGER';

    // Perform transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          invoiceNumber,
          retailerId: user.id,
          totalAmount,
          deliveryType: deliveryType || 'DOOR_DELIVERY',
          deliveryAddress: deliveryAddress || user.address || 'Erode Shop Address',
          dispatchRoute: defaultRoute,
          paymentMethod: paymentMethod || 'CASH',
          paymentStatus,
          orderStatus: 'PENDING',
          notes: notes || 'Wholesale order received via SMM portal',
          items: {
            create: validatedItems.map(vi => ({
              productId: vi.product.id,
              quantity: vi.quantity,
              unitType: vi.unitType,
              priceAtPurchase: vi.unitPrice
            }))
          }
        },
        include: {
          items: {
            include: { product: true }
          },
          retailer: true
        }
      });

      // Update product stocks
      for (const vi of validatedItems) {
        const decrement = vi.unitType === 'BOX' ? vi.quantity : Math.ceil(vi.quantity / 10);
        await tx.product.update({
          where: { id: vi.product.id },
          data: {
            stockQuantity: Math.max(0, vi.product.stockQuantity - decrement)
          }
        });
      }

      // If credit ledger, create DEBIT transaction and update retailer balance
      if (paymentMethod === 'CREDIT_LEDGER') {
        const newBalance = (user.currentBalance || 0) + totalAmount;
        await tx.user.update({
          where: { id: user.id },
          data: { currentBalance: newBalance }
        });

        await tx.ledgerTransaction.create({
          data: {
            retailerId: user.id,
            orderId: order.id,
            transactionType: 'DEBIT',
            amount: totalAmount,
            balanceAfter: newBalance,
            paymentMode: 'INVOICE_PURCHASE',
            referenceNumber: invoiceNumber,
            notes: `Wholesale purchase on Credit Ledger (Invoice: ${invoiceNumber})`
          }
        });
      }

      return order;
    });

    return NextResponse.json({
      message: 'Wholesale order placed successfully with Sakthimurugan Medical Agencies.',
      order: newOrder
    }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to place order: ' + error.message }, { status: 500 });
  }
}
