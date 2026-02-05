import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createContract, signContract, createPaymentIntent, releaseEscrow, getPayments } from '../controllers/paymentController.js';

const payments = new Hono();

payments.post('/contract', authMiddleware, createContract);
payments.put('/contract/:id/sign', authMiddleware, signContract);
payments.post('/intent', authMiddleware, createPaymentIntent);
payments.put('/escrow/:id/release', authMiddleware, releaseEscrow);
payments.get('/', authMiddleware, getPayments);

export default payments;
