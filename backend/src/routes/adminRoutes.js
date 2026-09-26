const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public demo retailers endpoint for live database-connected Demo Switcher
router.get('/demo-retailers', adminController.getDemoRetailers);

// Admin-only retailer & approval endpoints
router.get('/retailers', authenticateToken, requireRole('ADMIN'), adminController.getAllRetailers);
router.get('/pending-retailers', authenticateToken, requireRole('ADMIN'), adminController.getPendingRetailers);
router.patch('/approve-retailer/:id', authenticateToken, requireRole('ADMIN'), adminController.approveRetailer);
router.patch('/reject-retailer/:id', authenticateToken, requireRole('ADMIN'), adminController.rejectRetailer);
router.get('/dashboard-stats', authenticateToken, requireRole('ADMIN'), adminController.getDashboardStats);

// Admin Inventory APIs per Requirement 13
router.post(
  '/products',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.createProduct
);

router.patch(
  '/products/:id',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.updateProduct
);

router.put(
  '/products/:id',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.updateProduct
);

router.delete(
  '/products/:id',
  authenticateToken,
  requireRole('ADMIN'),
  productController.deleteProduct
);

module.exports = router;
