const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { store } = require('../db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      email,
      phone,
      password,
      dlNumber,
      gstNumber,
      bankAccount,
      bankIfsc,
      address,
      pincode,
      termsAccepted
    } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must accept Sakthimurugan Medical Agencies Wholesale Terms & Conditions.' });
    }

    if (!email || !password || !ownerName || !shopName || !phone || !dlNumber) {
      return res.status(400).json({
        error: 'Please fill all mandatory fields: Shop Name, Owner Name, Email, Phone, Password, and Drug License (DL) Number.'
      });
    }

    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let dlDocumentUrl = null;
    let gstDocumentUrl = null;

    if (req.files) {
      if (req.files.dlDocument && req.files.dlDocument[0]) {
        dlDocumentUrl = `/uploads/${req.files.dlDocument[0].filename}`;
      }
      if (req.files.gstDocument && req.files.gstDocument[0]) {
        gstDocumentUrl = `/uploads/${req.files.gstDocument[0].filename}`;
      }
    }

    const newUser = store.createUser({
      role: 'RETAILER',
      shopName,
      ownerName,
      email,
      phone,
      passwordHash,
      dlNumber,
      dlDocumentUrl: dlDocumentUrl || '/uploads/sample_dl.pdf',
      gstNumber: gstNumber || null,
      gstDocumentUrl: gstDocumentUrl || '/uploads/sample_gst.pdf',
      bankAccount: bankAccount || null,
      bankIfsc: bankIfsc || null,
      isApproved: false, // Default: Pending approval by admin
      creditLimit: 0,
      currentBalance: 0,
      address,
      pincode
    });

    return res.status(201).json({
      message: 'Registration submitted successfully. Your account is waiting for admin approval.',
      user: {
        id: newUser.id,
        shopName: newUser.shopName,
        ownerName: newUser.ownerName,
        email: newUser.email,
        phone: newUser.phone,
        dlNumber: newUser.dlNumber,
        isApproved: newUser.isApproved,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        role: user.role,
        shopName: user.shopName,
        ownerName: user.ownerName,
        email: user.email,
        phone: user.phone,
        dlNumber: user.dlNumber,
        gstNumber: user.gstNumber,
        isApproved: user.isApproved,
        creditLimit: user.creditLimit,
        currentBalance: user.currentBalance,
        address: user.address,
        pincode: user.pincode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

const demoLogin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required for demo login.' });
    }

    const user = store.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found in database.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: `Demo login switched to ${user.shopName || user.ownerName}`,
      token,
      user: {
        id: user.id,
        role: user.role,
        shopName: user.shopName,
        ownerName: user.ownerName,
        email: user.email,
        phone: user.phone,
        dlNumber: user.dlNumber,
        gstNumber: user.gstNumber,
        isApproved: user.isApproved,
        creditLimit: user.creditLimit,
        currentBalance: user.currentBalance,
        address: user.address,
        pincode: user.pincode
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({ error: 'Demo switch failed: ' + error.message });
  }
};

const getMe = (req, res) => {
  const user = req.user;
  return res.json({
    user: {
      id: user.id,
      role: user.role,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      phone: user.phone,
      dlNumber: user.dlNumber,
      gstNumber: user.gstNumber,
      bankAccount: user.bankAccount,
      bankIfsc: user.bankIfsc,
      isApproved: user.isApproved,
      creditLimit: user.creditLimit,
      currentBalance: user.currentBalance,
      address: user.address,
      pincode: user.pincode
    }
  });
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe
};
