const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let prisma;
let isPostgresAvailable = false;

// Fallback in-memory / JSON store for seamless local execution if PostgreSQL daemon isn't running
const fallbackDataFile = path.join(__dirname, '..', 'data_store.json');

const initialSeedData = {
  users: [
    {
      id: 1,
      role: 'ADMIN',
      shopName: 'Sakthimurugan Wholesale Central Depot',
      ownerName: 'S. Murugesan (Managing Director)',
      email: 'admin@sakthimurugan.com',
      phone: '+91 94433 12345',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
      dlNumber: 'TN-ERD-20B-00129 / TN-ERD-21B-00130',
      dlDocumentUrl: '/uploads/sample_dl.pdf',
      gstNumber: '33AAACS1234M1Z8',
      gstDocumentUrl: '/uploads/sample_gst.pdf',
      bankAccount: '91802001928374',
      bankIfsc: 'HDFC0001248',
      isApproved: true,
      creditLimit: 0,
      currentBalance: 0,
      address: 'No. 45, Nethaji Road, Wholesale Market, Erode - 638001',
      pincode: '638001',
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString()
    },
    {
      id: 2,
      role: 'RETAILER',
      shopName: 'Erode City Medicals & General Stores',
      ownerName: 'K. Senthil Kumar',
      email: 'erode_pharmacy@gmail.com',
      phone: '+91 98427 55678',
      passwordHash: bcrypt.hashSync('Retailer@123', 10),
      dlNumber: 'TN-ERD-20B-48291 / 21B-48292',
      dlDocumentUrl: '/uploads/sample_dl.pdf',
      gstNumber: '33AABCE5678F1ZQ',
      gstDocumentUrl: '/uploads/sample_gst.pdf',
      bankAccount: '50100234981123',
      bankIfsc: 'ICIC0000214',
      isApproved: true,
      creditLimit: 150000, // ₹1,50,000 credit limit
      currentBalance: 34500, // ₹34,500 current outstanding
      address: '124, Gandhiji Road, Near Railway Station, Erode - 638002',
      pincode: '638002',
      createdAt: new Date('2026-01-15').toISOString(),
      updatedAt: new Date('2026-02-10').toISOString()
    },
    {
      id: 3,
      role: 'RETAILER',
      shopName: 'Perundurai Health Care Pharmacy',
      ownerName: 'V. Rajeshwaran',
      email: 'perundurai_care@gmail.com',
      phone: '+91 97880 11223',
      passwordHash: bcrypt.hashSync('Retailer@123', 10),
      dlNumber: 'TN-ERD-20B-77123 / 21B-77124',
      dlDocumentUrl: '/uploads/sample_dl.pdf',
      gstNumber: '33ABCPR9981G1Z3',
      gstDocumentUrl: '/uploads/sample_gst.pdf',
      bankAccount: '11029384756',
      bankIfsc: 'SBIN0001428',
      isApproved: true,
      creditLimit: 100000,
      currentBalance: 68200,
      address: '22, RS Road, Perundurai, Erode - 638052',
      pincode: '638052',
      createdAt: new Date('2026-02-01').toISOString(),
      updatedAt: new Date('2026-03-01').toISOString()
    },
    {
      id: 4,
      role: 'RETAILER',
      shopName: 'Bhavani Sri Krishna Medicals',
      ownerName: 'M. Anand',
      email: 'bhavani_medicals@gmail.com',
      phone: '+91 99441 78901',
      passwordHash: bcrypt.hashSync('Retailer@123', 10),
      dlNumber: 'TN-ERD-20B-99120',
      dlDocumentUrl: '/uploads/sample_dl.pdf',
      gstNumber: '33ACDPR1122K1Z9',
      gstDocumentUrl: '/uploads/sample_gst.pdf',
      bankAccount: '60291039485',
      bankIfsc: 'IOBA0000452',
      isApproved: false, // Pending KYC verification
      creditLimit: 0,
      currentBalance: 0,
      address: '88, Kooduthurai Main Road, Bhavani, Erode - 638301',
      pincode: '638301',
      createdAt: new Date('2026-03-20').toISOString(),
      updatedAt: new Date('2026-03-20').toISOString()
    }
  ],
  products: [
    {
      id: 1,
      brandName: 'Dolo 650 Tablet',
      genericName: 'Paracetamol 650 mg',
      companyName: 'Micro Labs Limited',
      description: 'Antipyretic and analgesic for fever and mild to moderate body pain.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 310.0,
      pricePerStrip: 22.5,
      stockQuantity: 450,
      batchNumber: 'SMM-DL-8821',
      expiryDate: '10/2027',
      hsnCode: '30049060',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      brandName: 'Augmentin 625 Duo Tablet',
      genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      companyName: 'GlaxoSmithKline (GSK)',
      description: 'Broad-spectrum penicillin-type antibiotic formulation for bacterial infections.',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 1820.0,
      pricePerStrip: 195.0,
      stockQuantity: 180,
      batchNumber: 'SMM-AG-6214',
      expiryDate: '07/2027',
      hsnCode: '30041090',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      brandName: 'Pan 40 Tablet',
      genericName: 'Pantoprazole Gastro-resistant 40 mg',
      companyName: 'Alkem Laboratories Ltd',
      description: 'Proton pump inhibitor (PPI) for gastric acidity, GERD, and peptic ulcers.',
      imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 1150.0,
      pricePerStrip: 125.0,
      stockQuantity: 320,
      batchNumber: 'SMM-PN-4091',
      expiryDate: '11/2027',
      hsnCode: '30049099',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      brandName: 'Azee 500 Tablet',
      genericName: 'Azithromycin Dihydrate 500 mg',
      companyName: 'Cipla Ltd',
      description: 'Macrolide antibiotic for upper and lower respiratory tract infections.',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 920.0,
      pricePerStrip: 110.0,
      stockQuantity: 15,
      batchNumber: 'SMM-AZ-5510',
      expiryDate: '05/2027',
      hsnCode: '30042099',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      brandName: 'Glycomet-GP 2 Tablet',
      genericName: 'Metformin (500mg) + Glimepiride (2mg)',
      companyName: 'USV Private Limited',
      description: 'Dual anti-diabetic medication for management of Type 2 Diabetes Mellitus.',
      imageUrl: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 840.0,
      pricePerStrip: 89.0,
      stockQuantity: 260,
      batchNumber: 'SMM-GM-7703',
      expiryDate: '09/2027',
      hsnCode: '30049099',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 6,
      brandName: 'Telma 40 Tablet',
      genericName: 'Telmisartan 40 mg',
      companyName: 'Glenmark Pharmaceuticals',
      description: 'Angiotensin II receptor blocker (ARB) for essential hypertension management.',
      imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 1240.0,
      pricePerStrip: 130.0,
      stockQuantity: 210,
      batchNumber: 'SMM-TL-4019',
      expiryDate: '12/2027',
      hsnCode: '30049099',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 7,
      brandName: 'Montair-LC Tablet',
      genericName: 'Montelukast Sodium (10mg) + Levocetirizine (5mg)',
      companyName: 'Cipla Ltd',
      description: 'Comprehensive antiallergic for allergic rhinitis, asthma symptoms, and seasonal allergies.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 1450.0,
      pricePerStrip: 155.0,
      stockQuantity: 340,
      batchNumber: 'SMM-ML-1904',
      expiryDate: '06/2027',
      hsnCode: '30049099',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 8,
      brandName: 'Limcee Chewable 500mg',
      genericName: 'Vitamin C (Ascorbic Acid) 500 mg',
      companyName: 'Abbott Healthcare',
      description: 'Nutritional immunity booster and antioxidant tablet formulation.',
      imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 280.0,
      pricePerStrip: 20.0,
      stockQuantity: 0,
      batchNumber: 'SMM-LC-3390',
      expiryDate: '03/2027',
      hsnCode: '29362700',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 9,
      brandName: 'Shelcal 500 Tablet',
      genericName: 'Calcium (500mg) + Vitamin D3 (250 IU)',
      companyName: 'Torrent Pharmaceuticals',
      description: 'Essential calcium supplement for bone density and osteoporosis prevention.',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 960.0,
      pricePerStrip: 105.0,
      stockQuantity: 195,
      batchNumber: 'SMM-SH-5022',
      expiryDate: '01/2028',
      hsnCode: '30045090',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 10,
      brandName: 'Becosules Z Capsules',
      genericName: 'B-Complex Forte with Vitamin C and Zinc',
      companyName: 'Pfizer Ltd',
      description: 'Therapeutic multivitamin formulation for tissue repair and fatigue recovery.',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      pricePerBox: 420.0,
      pricePerStrip: 45.0,
      stockQuantity: 410,
      batchNumber: 'SMM-BZ-1099',
      expiryDate: '04/2027',
      hsnCode: '30045020',
      gstRate: 12.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 1,
      invoiceNumber: 'SMM-INV-2026-0041',
      retailerId: 2,
      totalAmount: 18450.0,
      deliveryType: 'DOOR_DELIVERY',
      deliveryAddress: '124, Gandhiji Road, Near Railway Station, Erode - 638002',
      dispatchRoute: 'Erode Central Route (Van TN-33-AX-8910)',
      paymentMethod: 'CREDIT_ACCOUNT',
      paymentStatus: 'CREDIT_ACCOUNT',
      orderStatus: 'COMPLETED',
      notes: 'B2B Wholesale dispatch - Batch verified with invoice stamp',
      createdAt: new Date('2026-03-10T10:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T16:00:00Z').toISOString()
    },
    {
      id: 2,
      invoiceNumber: 'SMM-INV-2026-0058',
      retailerId: 2,
      totalAmount: 16050.0,
      deliveryType: 'DOOR_DELIVERY',
      deliveryAddress: '124, Gandhiji Road, Near Railway Station, Erode - 638002',
      dispatchRoute: 'Erode Central Route (Van TN-33-AX-8910)',
      paymentMethod: 'CREDIT_ACCOUNT',
      paymentStatus: 'CREDIT_ACCOUNT',
      orderStatus: 'DISPATCHED',
      notes: 'Out for morning delivery with driver Ravi (+91 94421 88990)',
      createdAt: new Date('2026-03-24T09:15:00Z').toISOString(),
      updatedAt: new Date('2026-03-24T14:30:00Z').toISOString()
    }
  ],
  orderItems: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 20,
      unitType: 'BOX',
      priceAtPurchase: 310.0
    },
    {
      id: 2,
      orderId: 1,
      productId: 3,
      quantity: 10,
      unitType: 'BOX',
      priceAtPurchase: 1150.0
    },
    {
      id: 3,
      orderId: 2,
      productId: 2,
      quantity: 5,
      unitType: 'BOX',
      priceAtPurchase: 1820.0
    },
    {
      id: 4,
      orderId: 2,
      productId: 7,
      quantity: 4,
      unitType: 'BOX',
      priceAtPurchase: 1450.0
    },
    {
      id: 5,
      orderId: 2,
      productId: 6,
      quantity: 1,
      unitType: 'BOX',
      priceAtPurchase: 1240.0
    }
  ],
  paymentTransactions: [
    {
      id: 1,
      retailerId: 2,
      orderId: 1,
      transactionType: 'DEBIT',
      amount: 18450.0,
      balanceAfter: 18450.0,
      paymentMode: 'CREDIT_PURCHASE',
      referenceNumber: 'SMM-INV-2026-0041',
      notes: 'Wholesale Invoice SMM-INV-2026-0041',
      createdAt: new Date('2026-03-10T10:30:00Z').toISOString()
    },
    {
      id: 2,
      retailerId: 2,
      orderId: 2,
      transactionType: 'DEBIT',
      amount: 16050.0,
      balanceAfter: 34500.0,
      paymentMode: 'CREDIT_PURCHASE',
      referenceNumber: 'SMM-INV-2026-0058',
      notes: 'Wholesale Invoice SMM-INV-2026-0058 (15-day credit cycle)',
      createdAt: new Date('2026-03-24T09:15:00Z').toISOString()
    },
    {
      id: 3,
      retailerId: 3,
      orderId: null,
      transactionType: 'DEBIT',
      amount: 68200.0,
      balanceAfter: 68200.0,
      paymentMode: 'CREDIT_PURCHASE',
      referenceNumber: 'SMM-INV-2026-0019',
      notes: 'Opening Balance - Perundurai Pharmacy',
      createdAt: new Date('2026-02-25T11:00:00Z').toISOString()
    }
  ]
};

// In-Memory / File-backed Database implementation matching Prisma Schema
class DataStore {
  constructor() {
    this.data = initialSeedData;
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(fallbackDataFile)) {
        const content = fs.readFileSync(fallbackDataFile, 'utf8');
        const parsed = JSON.parse(content);
        // Ensure paymentTransactions is used
        if (parsed.ledgerTransactions && !parsed.paymentTransactions) {
          parsed.paymentTransactions = parsed.ledgerTransactions;
          delete parsed.ledgerTransactions;
        }
        this.data = parsed;
      } else {
        this.saveToFile();
      }
    } catch (err) {
      console.warn('[DataStore] Warning loading file, using memory seed:', err.message);
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(fallbackDataFile, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[DataStore] Warning saving file:', err.message);
    }
  }

  // --- Users ---
  getUsers() {
    return this.data.users;
  }

  findUserById(id) {
    return this.data.users.find(u => Number(u.id) === Number(id));
  }

  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  }

  createUser(userData) {
    const nextId = this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      role: userData.role || 'RETAILER',
      shopName: userData.shopName || '',
      ownerName: userData.ownerName || '',
      email: userData.email,
      phone: userData.phone || '',
      passwordHash: userData.passwordHash,
      dlNumber: userData.dlNumber || null,
      dlDocumentUrl: userData.dlDocumentUrl || null,
      gstNumber: userData.gstNumber || null,
      gstDocumentUrl: userData.gstDocumentUrl || null,
      bankAccount: userData.bankAccount || null,
      bankIfsc: userData.bankIfsc || null,
      isApproved: userData.isApproved || false,
      creditLimit: Number(userData.creditLimit || 0),
      currentBalance: Number(userData.currentBalance || 0),
      address: userData.address || '',
      pincode: userData.pincode || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => Number(u.id) === Number(id));
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToFile();
    return this.data.users[idx];
  }

  // --- Products ---
  getProducts(filters = {}) {
    let list = [...this.data.products];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.brandName.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q)
      );
    }
    if (filters.companyName) {
      list = list.filter(p => p.companyName.toLowerCase() === filters.companyName.toLowerCase());
    }
    if (filters.stockStatus) {
      if (filters.stockStatus === 'in_stock') list = list.filter(p => p.stockQuantity > 20);
      else if (filters.stockStatus === 'low_stock') list = list.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 20);
      else if (filters.stockStatus === 'out_of_stock') list = list.filter(p => p.stockQuantity === 0);
    }
    return list;
  }

  findProductById(id) {
    return this.data.products.find(p => Number(p.id) === Number(id));
  }

  createProduct(productData) {
    const nextId = this.data.products.length ? Math.max(...this.data.products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: nextId,
      brandName: productData.brandName,
      genericName: productData.genericName,
      companyName: productData.companyName,
      description: productData.description || '',
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      pricePerBox: Number(productData.pricePerBox),
      pricePerStrip: Number(productData.pricePerStrip),
      stockQuantity: Number(productData.stockQuantity || 0),
      batchNumber: productData.batchNumber || `SMM-BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: productData.expiryDate || '12/2027',
      hsnCode: productData.hsnCode || '3004',
      gstRate: Number(productData.gstRate || 12.0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(newProduct);
    this.saveToFile();
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => Number(p.id) === Number(id));
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToFile();
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => Number(p.id) === Number(id));
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  // --- Orders ---
  getOrders(retailerId = null) {
    let orders = [...this.data.orders];
    if (retailerId) {
      orders = orders.filter(o => Number(o.retailerId) === Number(retailerId));
    }
    return orders.map(o => {
      const retailer = this.findUserById(o.retailerId);
      const items = this.data.orderItems
        .filter(item => Number(item.orderId) === Number(o.id))
        .map(item => {
          const product = this.findProductById(item.productId);
          return { ...item, product };
        });
      return {
        ...o,
        retailer: retailer ? {
          id: retailer.id,
          shopName: retailer.shopName,
          ownerName: retailer.ownerName,
          phone: retailer.phone,
          dlNumber: retailer.dlNumber,
          gstNumber: retailer.gstNumber,
          address: retailer.address
        } : null,
        items
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findOrderById(id) {
    const order = this.data.orders.find(o => Number(o.id) === Number(id));
    if (!order) return null;
    const retailer = this.findUserById(order.retailerId);
    const items = this.data.orderItems
      .filter(item => Number(item.orderId) === Number(order.id))
      .map(item => {
        const product = this.findProductById(item.productId);
        return { ...item, product };
      });
    return {
      ...order,
      retailer: retailer ? {
        id: retailer.id,
        shopName: retailer.shopName,
        ownerName: retailer.ownerName,
        phone: retailer.phone,
        email: retailer.email,
        dlNumber: retailer.dlNumber,
        gstNumber: retailer.gstNumber,
        address: retailer.address
      } : null,
      items
    };
  }

  createOrder(orderData, itemsData) {
    const nextOrderId = this.data.orders.length ? Math.max(...this.data.orders.map(o => o.id)) + 1 : 1;
    const invoiceNumber = `SMM-INV-${new Date().getFullYear()}-${String(nextOrderId).padStart(4, '0')}`;

    const newOrder = {
      id: nextOrderId,
      invoiceNumber,
      retailerId: Number(orderData.retailerId),
      totalAmount: Number(orderData.totalAmount),
      deliveryType: orderData.deliveryType || 'DOOR_DELIVERY',
      deliveryAddress: orderData.deliveryAddress || '',
      dispatchRoute: orderData.dispatchRoute || (orderData.deliveryType === 'DOOR_DELIVERY' ? 'Erode Central Delivery Fleet' : 'Depot Counter Pickup'),
      paymentMethod: orderData.paymentMethod || 'CASH',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      orderStatus: 'PENDING',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.push(newOrder);

    let nextItemId = this.data.orderItems.length ? Math.max(...this.data.orderItems.map(i => i.id)) + 1 : 1;
    const createdItems = [];

    for (const item of itemsData) {
      const orderItem = {
        id: nextItemId++,
        orderId: nextOrderId,
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitType: item.unitType || 'BOX',
        priceAtPurchase: Number(item.priceAtPurchase)
      };
      this.data.orderItems.push(orderItem);
      createdItems.push(orderItem);

      // Decrement stock if unit is box
      const product = this.findProductById(item.productId);
      if (product) {
        const decrement = item.unitType === 'BOX' ? item.quantity : Math.ceil(item.quantity / 10);
        this.updateProduct(product.id, {
          stockQuantity: Math.max(0, product.stockQuantity - decrement)
        });
      }
    }

    this.saveToFile();
    return this.findOrderById(nextOrderId);
  }

  updateOrderStatus(orderId, statusUpdates) {
    const idx = this.data.orders.findIndex(o => Number(o.id) === Number(orderId));
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...statusUpdates,
      updatedAt: new Date().toISOString()
    };
    this.saveToFile();
    return this.findOrderById(orderId);
  }

  // --- Payment Details & Payment Transactions ---
  getPaymentTransactions(retailerId = null) {
    if (!this.data.paymentTransactions) {
      this.data.paymentTransactions = [];
    }
    let txns = [...this.data.paymentTransactions];
    if (retailerId) {
      txns = txns.filter(t => Number(t.retailerId) === Number(retailerId));
    }
    return txns.map(t => {
      const retailer = this.findUserById(t.retailerId);
      return {
        ...t,
        retailerName: retailer ? retailer.shopName || retailer.ownerName : 'Unknown Shop'
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createPaymentTransaction(txnData) {
    if (!this.data.paymentTransactions) {
      this.data.paymentTransactions = [];
    }
    const nextId = this.data.paymentTransactions.length ? Math.max(...this.data.paymentTransactions.map(t => t.id)) + 1 : 1;
    const retailer = this.findUserById(txnData.retailerId);
    if (!retailer) throw new Error('Retailer not found for payment transaction');

    const amount = Number(txnData.amount);
    let balanceAfter = Number(retailer.currentBalance);

    if (txnData.transactionType === 'DEBIT') {
      balanceAfter += amount; // Increases outstanding balance
    } else if (txnData.transactionType === 'CREDIT') {
      balanceAfter -= amount; // Decreases outstanding balance
    }

    // Update retailer currentBalance
    this.updateUser(retailer.id, { currentBalance: Math.max(0, balanceAfter) });

    const newTxn = {
      id: nextId,
      retailerId: Number(txnData.retailerId),
      orderId: txnData.orderId ? Number(txnData.orderId) : null,
      transactionType: txnData.transactionType, // 'DEBIT' or 'CREDIT'
      amount,
      balanceAfter: Math.max(0, balanceAfter),
      paymentMode: txnData.paymentMode || 'CASH',
      referenceNumber: txnData.referenceNumber || null,
      notes: txnData.notes || '',
      createdAt: new Date().toISOString()
    };

    this.data.paymentTransactions.push(newTxn);
    this.saveToFile();
    return newTxn;
  }
}

const store = new DataStore();

// Attempt to connect to Prisma Client if DATABASE_URL is reachable
try {
  prisma = new PrismaClient();
} catch (err) {
  console.warn('[Prisma] Notice: Using integrated high-performance store:', err.message);
}

module.exports = {
  prisma,
  store,
  isPostgresAvailable
};
