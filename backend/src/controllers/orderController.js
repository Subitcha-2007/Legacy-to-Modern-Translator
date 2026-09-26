const { store } = require('../db');

const createOrder = (req, res) => {
  try {
    const retailer = req.user;
    const {
      items,
      deliveryType, // 'DOOR_DELIVERY' | 'STORE_PICKUP'
      deliveryAddress,
      dispatchRoute,
      paymentMethod, // 'ONLINE' | 'CASH' | 'CREDIT_ACCOUNT'
      notes
    } = req.body;

    if (!retailer.isApproved) {
      return res.status(403).json({
        error: 'Your retail medical shop account is pending verification by Sakthimurugan Medical Agencies. Bulk order placement will be unlocked once approved.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one tablet item.' });
    }

    // Validate items, calculate total, and check stock
    let totalAmount = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const product = store.findProductById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ID ${item.productId} not found.` });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for ${product.brandName}.` });
      }

      const unitType = item.unitType === 'STRIP' ? 'STRIP' : 'BOX';
      const unitPrice = unitType === 'BOX' ? product.pricePerBox : product.pricePerStrip;
      const requiredBoxes = unitType === 'BOX' ? qty : Math.ceil(qty / 10);

      if (product.stockQuantity < requiredBoxes) {
        return res.status(400).json({
          error: `Insufficient wholesale stock for ${product.brandName}. Available: ${product.stockQuantity} boxes.`
        });
      }

      const itemTotal = unitPrice * qty;
      totalAmount += itemTotal;

      orderItemsToCreate.push({
        productId: product.id,
        quantity: qty,
        unitType,
        priceAtPurchase: unitPrice
      });
    }

    // Round totalAmount
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Check Credit Account limit
    const isCreditAccount = paymentMethod === 'CREDIT_ACCOUNT' || paymentMethod === 'CREDIT_LEDGER';

    if (isCreditAccount) {
      const currentDebt = Number(retailer.currentBalance || 0);
      const limit = Number(retailer.creditLimit || 0);
      const projectedDebt = currentDebt + totalAmount;

      if (projectedDebt > limit) {
        return res.status(400).json({
          error: `Credit limit exceeded! Your approved credit limit is ₹${limit.toLocaleString('en-IN')}, outstanding balance is ₹${currentDebt.toLocaleString('en-IN')}. Available credit is ₹${Math.max(0, limit - currentDebt).toLocaleString('en-IN')}, but this order totals ₹${totalAmount.toLocaleString('en-IN')}. Please choose another payment method or settle your outstanding balance.`
        });
      }
    }

    let defaultRoute = dispatchRoute;
    if (!defaultRoute) {
      if (deliveryType === 'DOOR_DELIVERY') {
        defaultRoute = 'Erode Town & Perundurai Route (SMM Fleet Van)';
      } else {
        defaultRoute = 'Wholesale Depot Counter Pickup (Erode)';
      }
    }

    // Determine initial payment status
    let paymentStatus = 'PENDING';
    if (paymentMethod === 'ONLINE') {
      paymentStatus = 'PAID';
    } else if (isCreditAccount) {
      paymentStatus = 'CREDIT_ACCOUNT';
    }

    // Normalize paymentMethod name
    const normalizedPaymentMethod = isCreditAccount ? 'CREDIT_ACCOUNT' : (paymentMethod || 'CASH');

    // Create Order
    const newOrder = store.createOrder(
      {
        retailerId: retailer.id,
        totalAmount,
        deliveryType: deliveryType || 'DOOR_DELIVERY',
        deliveryAddress: deliveryAddress || retailer.address || 'Erode Shop Address',
        dispatchRoute: defaultRoute,
        paymentMethod: normalizedPaymentMethod,
        paymentStatus,
        notes: notes || 'Wholesale order received via SMM portal'
      },
      orderItemsToCreate
    );

    // If Credit Account, record Debit entry in PaymentTransaction and update retailer balance
    if (isCreditAccount) {
      store.createPaymentTransaction({
        retailerId: retailer.id,
        orderId: newOrder.id,
        transactionType: 'DEBIT',
        amount: totalAmount,
        paymentMode: 'CREDIT_PURCHASE',
        referenceNumber: newOrder.invoiceNumber,
        notes: `Wholesale purchase on Credit Account (Invoice: ${newOrder.invoiceNumber})`
      });
    }

    return res.status(201).json({
      message: 'Wholesale order placed successfully with Sakthimurugan Medical Agencies.',
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Failed to place order: ' + error.message });
  }
};

const getRetailerOrders = (req, res) => {
  try {
    const orders = store.getOrders(req.user.id);
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
};

const getAdminOrders = (req, res) => {
  try {
    const orders = store.getOrders();
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve wholesale orders.' });
  }
};

const updateOrderStatus = (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus, dispatchRoute, paymentStatus, notes } = req.body;

    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (dispatchRoute) updates.dispatchRoute = dispatchRoute;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (notes) updates.notes = notes;

    const updated = store.updateOrderStatus(orderId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json({
      message: 'Order dispatch status updated successfully.',
      order: updated
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
};

const getInvoiceData = (req, res) => {
  try {
    const order = store.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Role check: Retailer can only view their own invoice
    if (req.user.role === 'RETAILER' && Number(order.retailerId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to view this invoice.' });
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

    return res.json({
      invoice: {
        order,
        agency: agencyDetails,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate invoice data.' });
  }
};

module.exports = {
  createOrder,
  getRetailerOrders,
  getAdminOrders,
  updateOrderStatus,
  getInvoiceData
};
