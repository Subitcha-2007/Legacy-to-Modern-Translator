require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderController = require('./controllers/orderController');
const { authenticateToken, requireRole } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (PDFs, tablet images, bank proofs)
const uploadsDirectory = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}
app.use('/uploads', express.static(uploadsDirectory));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    agency: 'Sakthimurugan Medical Agencies',
    badge: 'SMM',
    hub: 'Erode, Tamil Nadu',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ledger', ledgerRoutes); // compatibility alias
app.use('/api/admin', adminRoutes);

// Direct mapping for spec endpoint: GET /api/retailer/orders
app.get('/api/retailer/orders', authenticateToken, requireRole('RETAILER'), orderController.getRetailerOrders);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('================================================================');
  console.log('  SAKTHIMURUGAN MEDICAL AGENCIES ("SMM") - REST API SERVER     ');
  console.log('  Wholesale Pharmaceutical Distributor | Erode, Tamil Nadu     ');
  console.log(`  Server running on http://localhost:${PORT}                   `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health            `);
  console.log('================================================================');
});
