const { store } = require('../db');

// Public or Admin endpoint for Demo Switcher: returns all users currently in database
const getDemoRetailers = (req, res) => {
  try {
    const users = store.getUsers();
    const admin = users.find(u => u.role === 'ADMIN');
    const retailers = users
      .filter(u => u.role === 'RETAILER')
      .map(r => ({
        id: r.id,
        role: r.role,
        shopName: r.shopName || r.ownerName,
        ownerName: r.ownerName,
        email: r.email,
        phone: r.phone,
        isApproved: r.isApproved,
        creditLimit: r.creditLimit || 0,
        currentBalance: r.currentBalance || 0,
        availableCredit: Math.max(0, (r.creditLimit || 0) - (r.currentBalance || 0)),
        address: r.address || '',
        createdAt: r.createdAt
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      admin: admin ? {
        id: admin.id,
        role: admin.role,
        shopName: admin.shopName,
        ownerName: admin.ownerName,
        email: admin.email
      } : null,
      retailers
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch demo retailers: ' + error.message });
  }
};

// Admin list of all registered retailers
const getAllRetailers = (req, res) => {
  try {
    const users = store.getUsers().filter(u => u.role === 'RETAILER');
    return res.json({
      count: users.length,
      retailers: users.map(r => ({
        id: r.id,
        role: r.role,
        shopName: r.shopName,
        ownerName: r.ownerName,
        email: r.email,
        phone: r.phone,
        dlNumber: r.dlNumber,
        dlDocumentUrl: r.dlDocumentUrl,
        gstNumber: r.gstNumber,
        gstDocumentUrl: r.gstDocumentUrl,
        bankAccount: r.bankAccount,
        bankIfsc: r.bankIfsc,
        isApproved: r.isApproved,
        creditLimit: r.creditLimit || 0,
        currentBalance: r.currentBalance || 0,
        availableCredit: Math.max(0, (r.creditLimit || 0) - (r.currentBalance || 0)),
        address: r.address,
        pincode: r.pincode,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch retailers: ' + error.message });
  }
};

const getPendingRetailers = (req, res) => {
  try {
    const pending = store.getUsers().filter(u => u.role === 'RETAILER' && !u.isApproved);
    return res.json({
      count: pending.length,
      retailers: pending.map(r => ({
        id: r.id,
        shopName: r.shopName,
        ownerName: r.ownerName,
        email: r.email,
        phone: r.phone,
        dlNumber: r.dlNumber,
        dlDocumentUrl: r.dlDocumentUrl,
        gstNumber: r.gstNumber,
        gstDocumentUrl: r.gstDocumentUrl,
        bankAccount: r.bankAccount,
        bankIfsc: r.bankIfsc,
        address: r.address,
        pincode: r.pincode,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pending retailers: ' + error.message });
  }
};

const approveRetailer = (req, res) => {
  try {
    const retailerId = req.params.id;
    const { creditLimit, notes } = req.body;

    const user = store.findUserById(retailerId);
    if (!user) {
      return res.status(404).json({ error: 'Retailer not found.' });
    }

    const assignedCreditLimit = creditLimit !== undefined ? Number(creditLimit) : 100000;

    const updated = store.updateUser(retailerId, {
      isApproved: true,
      creditLimit: assignedCreditLimit
    });

    return res.json({
      message: `Shop "${updated.shopName}" has been successfully approved with a wholesale credit limit of ₹${assignedCreditLimit.toLocaleString('en-IN')}.`,
      retailer: {
        id: updated.id,
        shopName: updated.shopName,
        isApproved: updated.isApproved,
        creditLimit: updated.creditLimit,
        currentBalance: updated.currentBalance
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to approve retailer: ' + error.message });
  }
};

const rejectRetailer = (req, res) => {
  try {
    const retailerId = req.params.id;
    const { reason } = req.body;

    const user = store.findUserById(retailerId);
    if (!user) {
      return res.status(404).json({ error: 'Retailer not found.' });
    }

    const updated = store.updateUser(retailerId, {
      isApproved: false,
      rejectionReason: reason || 'Drug License / GST verification failed.'
    });

    return res.json({
      message: `Retailer "${user.shopName}" application rejected.`,
      retailer: updated
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reject retailer.' });
  }
};

const getDashboardStats = (req, res) => {
  try {
    const users = store.getUsers();
    const orders = store.getOrders();
    const products = store.getProducts();

    const retailers = users.filter(u => u.role === 'RETAILER');
    const pendingRetailers = retailers.filter(u => !u.isApproved);
    const approvedRetailers = retailers.filter(u => u.isApproved);

    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');
    const dispatchedOrders = orders.filter(o => o.orderStatus === 'DISPATCHED');

    const totalOutstandingDebt = approvedRetailers.reduce((sum, r) => sum + (r.currentBalance || 0), 0);
    const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 20);
    const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

    return res.json({
      stats: {
        totalRetailers: retailers.length,
        approvedRetailersCount: approvedRetailers.length,
        pendingApprovalsCount: pendingRetailers.length,
        totalProducts: products.length,
        lowStockProductsCount: lowStockProducts.length,
        outOfStockProductsCount: outOfStockProducts.length,
        totalOrders: orders.length,
        pendingOrdersCount: pendingOrders.length,
        dispatchedOrdersCount: dispatchedOrders.length,
        totalOutstandingDebt,
        totalRevenue
      },
      recentOrders: orders.slice(0, 5),
      pendingKYCList: pendingRetailers.slice(0, 5)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate admin statistics.' });
  }
};

module.exports = {
  getDemoRetailers,
  getAllRetailers,
  getPendingRetailers,
  approveRetailer,
  rejectRetailer,
  getDashboardStats
};
