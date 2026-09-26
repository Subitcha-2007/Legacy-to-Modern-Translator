const paymentController = require('./paymentController');

module.exports = {
  getRetailerLedger: paymentController.getRetailerPaymentDetails,
  getAllLedgers: paymentController.getAllRetailerPayments,
  recordPayment: paymentController.recordPayment,
  getAccountStatement: paymentController.getAccountStatement
};
