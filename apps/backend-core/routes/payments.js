import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createOrder, verifyPayment, releaseEscrow, getDealPayment } from '../controllers/paymentController.js';

const payments = new Hono();

// Brand: create Razorpay order to fund escrow
payments.post('/create-order', authMiddleware, createOrder);

// System: verify Razorpay signature and mark escrow as FUNDED
payments.post('/verify', authMiddleware, verifyPayment);

// Creator: submit live post link, release escrow, complete deal
payments.post('/release/:dealId', authMiddleware, releaseEscrow);

// Both: get escrow payment status for a deal
payments.get('/deal/:dealId', authMiddleware, getDealPayment);

export default payments;
