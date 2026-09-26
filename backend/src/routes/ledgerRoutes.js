const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Professional alias routes for payment details & transactions
router.get('/my-ledger', authenticateToken, requireRole('RETAILER'), paymentController.getRetailerPaymentDetails);
router.get('/statement/:retailerId?', authenticateToken, paymentController.getAccountStatement);
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), paymentController.getAllRetailerPayments);
router.post('/admin/record-payment', authenticateToken, requireRole('ADMIN'), paymentController.recordPayment);

module.exports = router;
