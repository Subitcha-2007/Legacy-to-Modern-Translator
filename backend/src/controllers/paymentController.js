const { store } = require('../db');

// Retailer: View own personal Payment Details, Outstanding Balance, and Payment History
const getRetailerPaymentDetails = (req, res) => {
  try {
    const retailer = store.findUserById(req.user.id);
    if (!retailer) {
      return res.status(404).json({ error: 'Retailer account not found.' });
    }
    const transactions = store.getPaymentTransactions(req.user.id);

    return res.json({
      retailer: {
        id: retailer.id,
        shopName: retailer.shopName,
        ownerName: retailer.ownerName,
        creditLimit: retailer.creditLimit || 0,
        currentBalance: retailer.currentBalance || 0,
        availableCredit: Math.max(0, (retailer.creditLimit || 0) - (retailer.currentBalance || 0))
      },
      transactions
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve payment details.' });
  }
};

// Admin: View all retail clients, outstanding debt balances, and 15-day / 30-day credit cycles
const getAllRetailerPayments = (req, res) => {
  try {
    const allUsers = store.getUsers().filter(u => u.role === 'RETAILER');
    const allTxns = store.getPaymentTransactions();

    const now = new Date();

    const retailClients = allUsers.map(retailer => {
      const retailerTxns = allTxns.filter(t => Number(t.retailerId) === Number(retailer.id));
      
      // Calculate aging: look at oldest unpaid DEBIT transaction or recent activity
      let overdueCycle = 'CURRENT'; // 'CURRENT' | '15_DAYS' | '30_DAYS_PLUS'
      let daysOutstanding = 0;

      if ((retailer.currentBalance || 0) > 0 && retailerTxns.length > 0) {
        const lastDebit = retailerTxns.find(t => t.transactionType === 'DEBIT');
        if (lastDebit) {
          const debitDate = new Date(lastDebit.createdAt);
          const diffMs = now - debitDate;
          daysOutstanding = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          if (daysOutstanding > 30) {
            overdueCycle = '30_DAYS_PLUS';
          } else if (daysOutstanding > 15) {
            overdueCycle = '15_DAYS';
          }
        }
      }

      return {
        id: retailer.id,
        shopName: retailer.shopName || retailer.ownerName,
        ownerName: retailer.ownerName,
        phone: retailer.phone,
        email: retailer.email,
        dlNumber: retailer.dlNumber,
        gstNumber: retailer.gstNumber,
        creditLimit: retailer.creditLimit || 0,
        currentBalance: retailer.currentBalance || 0,
        availableCredit: Math.max(0, (retailer.creditLimit || 0) - (retailer.currentBalance || 0)),
        daysOutstanding,
        overdueCycle,
        isApproved: retailer.isApproved,
        transactionCount: retailerTxns.length
      };
    });

    const totalOutstandingDebt = retailClients.reduce((acc, c) => acc + (c.currentBalance || 0), 0);
    const totalCreditSanctioned = retailClients.reduce((acc, c) => acc + (c.creditLimit || 0), 0);

    return res.json({
      summary: {
        totalOutstandingDebt,
        totalCreditSanctioned,
        totalRetailers: retailClients.length,
        critical30DaysCount: retailClients.filter(c => c.overdueCycle === '30_DAYS_PLUS').length,
        due15DaysCount: retailClients.filter(c => c.overdueCycle === '15_DAYS').length
      },
      clients: retailClients,
      recentTransactions: allTxns.slice(0, 25)
    });
  } catch (error) {
    console.error('Error fetching wholesale payment details:', error);
    return res.status(500).json({ error: 'Failed to retrieve wholesale payment details.' });
  }
};

// Admin: Record manual payment entry (Cash, Cheque, NEFT/UPI) to credit a retailer's account
const recordPayment = (req, res) => {
  try {
    const {
      retailerId,
      amount,
      paymentMode, // 'CASH', 'CHEQUE', 'NEFT_RTGS', 'UPI'
      referenceNumber, // Cheque number or UTR
      notes
    } = req.body;

    if (!retailerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid retailer and payment amount are required.' });
    }

    const retailer = store.findUserById(retailerId);
    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found.' });
    }

    const numAmount = Number(amount);

    let defaultNotes = notes;
    if (!defaultNotes) {
      if (paymentMode === 'CHEQUE') {
        defaultNotes = `Cheque Payment (Ref: ${referenceNumber || 'N/A'}) credited to account`;
      } else if (paymentMode === 'NEFT_RTGS' || paymentMode === 'UPI') {
        defaultNotes = `Bank transfer / UPI payment (UTR: ${referenceNumber || 'N/A'}) received`;
      } else {
        defaultNotes = `Cash payment of ₹${numAmount.toLocaleString('en-IN')} received at Erode Central Depot`;
      }
    }

    const newTxn = store.createPaymentTransaction({
      retailerId: retailer.id,
      orderId: null,
      transactionType: 'CREDIT', // Payment received decrements debt
      amount: numAmount,
      paymentMode: paymentMode || 'CASH',
      referenceNumber: referenceNumber || null,
      notes: defaultNotes
    });

    const updatedRetailer = store.findUserById(retailer.id);

    return res.status(201).json({
      message: `Payment of ₹${numAmount.toLocaleString('en-IN')} successfully credited to ${retailer.shopName}.`,
      transaction: newTxn,
      retailer: {
        id: updatedRetailer.id,
        shopName: updatedRetailer.shopName,
        currentBalance: updatedRetailer.currentBalance,
        availableCredit: Math.max(0, updatedRetailer.creditLimit - updatedRetailer.currentBalance)
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return res.status(500).json({ error: 'Failed to record payment: ' + error.message });
  }
};

// Account Statement generator for a specific retailer
const getAccountStatement = (req, res) => {
  try {
    const retailerId = req.params.retailerId || req.user.id;

    // Role check: Retailer can only fetch their own statement
    if (req.user.role === 'RETAILER' && Number(retailerId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to view this account statement.' });
    }

    const retailer = store.findUserById(retailerId);
    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found.' });
    }

    const transactions = store.getPaymentTransactions(retailerId);

    const agency = {
      name: 'Sakthimurugan Medical Agencies',
      logoText: 'SMM',
      hub: 'Erode Central Wholesale Hub',
      address: 'No. 45, Nethaji Road, Wholesale Market, Erode - 638001, Tamil Nadu',
      phone: '+91 94433 12345',
      email: 'accounts@sakthimurugan.com',
      dlNumber: 'TN-ERD-20B-00129 / TN-ERD-21B-00130',
      gstin: '33AAACS1234M1Z8'
    };

    return res.json({
      statement: {
        agency,
        retailer: {
          id: retailer.id,
          shopName: retailer.shopName,
          ownerName: retailer.ownerName,
          phone: retailer.phone,
          dlNumber: retailer.dlNumber,
          gstNumber: retailer.gstNumber,
          address: retailer.address,
          creditLimit: retailer.creditLimit || 0,
          currentBalance: retailer.currentBalance || 0,
          availableCredit: Math.max(0, (retailer.creditLimit || 0) - (retailer.currentBalance || 0))
        },
        transactions,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate account statement.' });
  }
};

module.exports = {
  getRetailerPaymentDetails,
  getAllRetailerPayments,
  recordPayment,
  getAccountStatement
};
