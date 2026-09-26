const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Retailer: personal Payment Details & Payment History
router.get('/my-account', authenticateToken, requireRole('RETAILER'), paymentController.getRetailerPaymentDetails);
router.get('/my-ledger', authenticateToken, requireRole('RETAILER'), paymentController.getRetailerPaymentDetails); // compatibility alias

// Retailer / Admin: Account Statement
router.get('/statement/:retailerId?', authenticateToken, paymentController.getAccountStatement);

// Admin: view all retailer credit accounts & recording manual payments
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), paymentController.getAllRetailerPayments);
router.post('/admin/record-payment', authenticateToken, requireRole('ADMIN'), paymentController.recordPayment);

module.exports = router;
