const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public / Retailer view
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin-only management
router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.createProduct
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.updateProduct
);

router.patch(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  productController.deleteProduct
);

module.exports = router;
