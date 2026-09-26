const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sakthimurugan Medical Agencies database (PostgreSQL)...');

  // Clear existing in reverse dependency order
  try {
    await prisma.paymentTransaction.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Note: Tables clean or fresh.');
  }

  // 1. Seed Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const retailerPassword = await bcrypt.hash('Retailer@123', 10);

  const admin = await prisma.user.create({
    data: {
      role: 'ADMIN',
      shopName: 'Sakthimurugan Wholesale Central Depot',
      ownerName: 'S. Murugesan (Managing Director)',
      email: 'admin@sakthimurugan.com',
      phone: '+91 94433 12345',
      passwordHash: adminPassword,
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
      pincode: '638001'
    }
  });

  const approvedRetailer = await prisma.user.create({
    data: {
      role: 'RETAILER',
      shopName: 'Erode City Medicals & General Stores',
      ownerName: 'K. Senthil Kumar',
      email: 'erode_pharmacy@gmail.com',
      phone: '+91 98427 55678',
      passwordHash: retailerPassword,
      dlNumber: 'TN-ERD-20B-48291 / 21B-48292',
      dlDocumentUrl: '/uploads/sample_dl.pdf',
      gstNumber: '33AABCE5678F1ZQ',
      gstDocumentUrl: '/uploads/sample_gst.pdf',
      bankAccount: '50100234981123',
      bankIfsc: 'ICIC0000214',
      isApproved: true,
      creditLimit: 150000,
      currentBalance: 34500,
      address: '124, Gandhiji Road, Near Railway Station, Erode - 638002',
      pincode: '638002'
    }
  });

  const perunduraiRetailer = await prisma.user.create({
    data: {
      role: 'RETAILER',
      shopName: 'Perundurai Health Care Pharmacy',
      ownerName: 'V. Rajeshwaran',
      email: 'perundurai_care@gmail.com',
      phone: '+91 97880 11223',
      passwordHash: retailerPassword,
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
      pincode: '638052'
    }
  });

  const pendingRetailer = await prisma.user.create({
    data: {
      role: 'RETAILER',
      shopName: 'Bhavani Sri Krishna Medicals',
      ownerName: 'M. Anand',
      email: 'bhavani_medicals@gmail.com',
      phone: '+91 99441 78901',
      passwordHash: retailerPassword,
      dlNumber: 'TN-ERD-20B-99120',
      dlDocumentUrl: '/uploads/sample_dl.pdf',
      gstNumber: '33ACDPR1122K1Z9',
      gstDocumentUrl: '/uploads/sample_gst.pdf',
      bankAccount: '60291039485',
      bankIfsc: 'IOBA0000452',
      isApproved: false,
      creditLimit: 0,
      currentBalance: 0,
      address: '88, Kooduthurai Main Road, Bhavani, Erode - 638301',
      pincode: '638301'
    }
  });

  // 2. Seed Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    }),
    prisma.product.create({
      data: {
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
        gstRate: 12.0
      }
    })
  ]);

  // 3. Seed Orders & Payment Transactions
  const order1 = await prisma.order.create({
    data: {
      invoiceNumber: 'SMM-INV-2026-0041',
      retailerId: approvedRetailer.id,
      totalAmount: 18450.0,
      deliveryType: 'DOOR_DELIVERY',
      deliveryAddress: '124, Gandhiji Road, Near Railway Station, Erode - 638002',
      dispatchRoute: 'Erode Central Route (Van TN-33-AX-8910)',
      paymentMethod: 'CREDIT_ACCOUNT',
      paymentStatus: 'CREDIT_ACCOUNT',
      orderStatus: 'COMPLETED',
      notes: 'B2B Wholesale dispatch - Batch verified with invoice stamp',
      items: {
        create: [
          { productId: products[0].id, quantity: 20, unitType: 'BOX', priceAtPurchase: 310.0 },
          { productId: products[2].id, quantity: 10, unitType: 'BOX', priceAtPurchase: 1150.0 }
        ]
      }
    }
  });

  await prisma.paymentTransaction.create({
    data: {
      retailerId: approvedRetailer.id,
      orderId: order1.id,
      transactionType: 'DEBIT',
      amount: 18450.0,
      balanceAfter: 18450.0,
      paymentMode: 'CREDIT_PURCHASE',
      referenceNumber: order1.invoiceNumber,
      notes: 'Wholesale Invoice SMM-INV-2026-0041'
    }
  });

  const order2 = await prisma.order.create({
    data: {
      invoiceNumber: 'SMM-INV-2026-0058',
      retailerId: approvedRetailer.id,
      totalAmount: 16050.0,
      deliveryType: 'DOOR_DELIVERY',
      deliveryAddress: '124, Gandhiji Road, Near Railway Station, Erode - 638002',
      dispatchRoute: 'Erode Central Route (Van TN-33-AX-8910)',
      paymentMethod: 'CREDIT_ACCOUNT',
      paymentStatus: 'CREDIT_ACCOUNT',
      orderStatus: 'DISPATCHED',
      notes: 'Out for morning delivery with driver Ravi (+91 94421 88990)',
      items: {
        create: [
          { productId: products[1].id, quantity: 5, unitType: 'BOX', priceAtPurchase: 1820.0 },
          { productId: products[6].id, quantity: 4, unitType: 'BOX', priceAtPurchase: 1450.0 },
          { productId: products[5].id, quantity: 1, unitType: 'BOX', priceAtPurchase: 1240.0 }
        ]
      }
    }
  });

  await prisma.paymentTransaction.create({
    data: {
      retailerId: approvedRetailer.id,
      orderId: order2.id,
      transactionType: 'DEBIT',
      amount: 16050.0,
      balanceAfter: 34500.0,
      paymentMode: 'CREDIT_PURCHASE',
      referenceNumber: order2.invoiceNumber,
      notes: 'Wholesale Invoice SMM-INV-2026-0058 (15-day credit cycle)'
    }
  });

  await prisma.paymentTransaction.create({
    data: {
      retailerId: perunduraiRetailer.id,
      orderId: null,
      transactionType: 'DEBIT',
      amount: 68200.0,
      balanceAfter: 68200.0,
      paymentMode: 'CREDIT_PURCHASE',
      referenceNumber: 'SMM-INV-2026-0019',
      notes: 'Opening Balance - Perundurai Pharmacy'
    }
  });

  console.log('Seed completed successfully for Sakthimurugan Medical Agencies (SMM)!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
