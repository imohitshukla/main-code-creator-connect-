const { Hono } = require('hono');
const { authMiddleware } = require('../middleware/auth.js');
const { createContract, signContract, createPaymentIntent, releaseEscrow, getPayments } = require('../controllers/paymentController.js');

const payments = new Hono();

payments.post('/contract', authMiddleware, createContract);
payments.put('/contract/:id/sign', authMiddleware, signContract);
payments.post('/intent', authMiddleware, createPaymentIntent);
payments.put('/escrow/:id/release', authMiddleware, releaseEscrow);
payments.get('/', authMiddleware, getPayments);

module.exports = payments;
