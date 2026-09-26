const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Retailer endpoints
router.post('/', authenticateToken, requireRole('RETAILER'), orderController.createOrder);
router.get('/my-orders', authenticateToken, requireRole('RETAILER'), orderController.getRetailerOrders);

// Admin endpoints
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), orderController.getAdminOrders);
router.patch('/admin/:id/status', authenticateToken, requireRole('ADMIN'), orderController.updateOrderStatus);

// Shared / Invoice endpoint
router.get('/:id/invoice', authenticateToken, orderController.getInvoiceData);

module.exports = router;
