const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Multer upload config for retailer registration documents
const registrationUpload = upload.fields([
  { name: 'dlDocument', maxCount: 1 },
  { name: 'gstDocument', maxCount: 1 }
]);

router.post('/register', registrationUpload, authController.register);
router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
