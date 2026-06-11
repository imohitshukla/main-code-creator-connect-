import { client } from '../config/database.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay — keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// ────────────────────────────────────────────────────────────
// 1. Brand creates a Razorpay order to fund escrow
// POST /api/payments/create-order
// Body: { deal_id }
// ────────────────────────────────────────────────────────────
export const createOrder = async (c) => {
  try {
    const user = c.get('user');
    const { deal_id } = await c.req.json();

    if (!deal_id) return c.json({ error: 'deal_id is required' }, 400);

    // Fetch deal + verify brand ownership
    const dealRes = await client.query(`
      SELECT d.*, b.user_id as brand_user_id
      FROM deals d
      JOIN brand_profiles b ON d.brand_id = b.id
      WHERE d.id = $1
    `, [deal_id]);

    if (dealRes.rows.length === 0) return c.json({ error: 'Deal not found' }, 404);
    const deal = dealRes.rows[0];

    if (deal.brand_user_id !== user.id) {
      return c.json({ error: 'Only the brand can fund this deal' }, 403);
    }

    // Check if already funded
    const existingEscrow = await client.query(
      'SELECT * FROM escrow_payments WHERE deal_id = $1',
      [deal_id]
    );
    if (existingEscrow.rows.length > 0 && existingEscrow.rows[0].status === 'FUNDED') {
      return c.json({ error: 'Escrow already funded for this deal' }, 400);
    }

    const amountPaise = Math.round(Number(deal.amount || deal.budget || 0) * 100); // Razorpay works in paise
    if (amountPaise === 0) return c.json({ error: 'Deal has no amount set' }, 400);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: deal.currency || 'INR',
      receipt: `deal_${deal_id}_${Date.now()}`,
      notes: {
        deal_id: String(deal_id),
        brand_user_id: String(user.id),
      },
    });

    // Upsert escrow_payments record as PENDING
    await client.query(`
      INSERT INTO escrow_payments (deal_id, razorpay_order_id, amount, currency, status)
      VALUES ($1, $2, $3, $4, 'PENDING')
      ON CONFLICT (deal_id) DO UPDATE
        SET razorpay_order_id = EXCLUDED.razorpay_order_id,
            status = 'PENDING',
            updated_at = CURRENT_TIMESTAMP
    `, [deal_id, order.id, deal.amount || deal.budget, deal.currency || 'INR']);

    return c.json({
      success: true,
      order_id: order.id,
      amount: amountPaise,
      currency: deal.currency || 'INR',
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return c.json({ error: 'Failed to create payment order', details: error.message }, 500);
  }
};

// ────────────────────────────────────────────────────────────
// 2. Verify Razorpay payment signature & mark escrow as FUNDED
// POST /api/payments/verify
// Body: { deal_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ────────────────────────────────────────────────────────────
export const verifyPayment = async (c) => {
  try {
    const { deal_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return c.json({ error: 'Invalid payment signature — possible fraud attempt' }, 400);
    }

    // Mark escrow as FUNDED
    await client.query(`
      UPDATE escrow_payments
      SET razorpay_payment_id = $1,
          status = 'FUNDED',
          funded_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE deal_id = $2
    `, [razorpay_payment_id, deal_id]);

    // Update deal's payment_status
    await client.query(`
      UPDATE deals SET payment_status = 'FUNDED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [deal_id]);

    // Insert in-app notification for creator
    try {
      await client.query(`
        INSERT INTO notifications (user_id, type, message, link)
        SELECT cr.user_id, 'ESCROW_FUNDED',
          '💰 Funds have been secured in escrow for your deal!',
          '/deals/' || $1
        FROM deals d
        JOIN creator_profiles cr ON d.creator_id = cr.id
        WHERE d.id = $1
      `, [deal_id]);
    } catch (notifyErr) {
      console.error('Failed to send escrow funded notification:', notifyErr);
    }

    return c.json({ success: true, message: 'Payment verified. Escrow funded!' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return c.json({ error: 'Payment verification failed', details: error.message }, 500);
  }
};

// ────────────────────────────────────────────────────────────
// 3. Release escrow to creator (triggered after go-live)
// POST /api/payments/release/:dealId
// Body: { live_post_url }
// ────────────────────────────────────────────────────────────
export const releaseEscrow = async (c) => {
  try {
    const user = c.get('user');
    const dealId = c.req.param('dealId');
    const { live_post_url } = await c.req.json();

    if (!live_post_url) return c.json({ error: 'Live post URL is required' }, 400);

    // Fetch deal + verify it's the creator
    const dealRes = await client.query(`
      SELECT d.*, cr.user_id as creator_user_id
      FROM deals d
      JOIN creator_profiles cr ON d.creator_id = cr.id
      WHERE d.id = $1
    `, [dealId]);

    if (dealRes.rows.length === 0) return c.json({ error: 'Deal not found' }, 404);
    const deal = dealRes.rows[0];

    if (deal.creator_user_id !== user.id && user.role !== 'ADMIN') {
      return c.json({ error: 'Only the creator or admin can submit live link' }, 403);
    }

    // Check escrow is funded
    const escrowRes = await client.query(
      'SELECT * FROM escrow_payments WHERE deal_id = $1',
      [dealId]
    );
    if (escrowRes.rows.length === 0 || escrowRes.rows[0].status !== 'FUNDED') {
      return c.json({ error: 'Escrow is not in FUNDED state' }, 400);
    }

    // Mark escrow as RELEASED
    await client.query(`
      UPDATE escrow_payments
      SET status = 'RELEASED',
          live_post_url = $1,
          released_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE deal_id = $2
    `, [live_post_url, dealId]);

    // Update deal: add live_post_url, payment_status, move to COMPLETED
    await client.query(`
      UPDATE deals
      SET payment_status = 'RELEASED',
          live_post_url = $1,
          status = 'COMPLETED',
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [live_post_url, dealId]);

    // Notify brand
    try {
      await client.query(`
        INSERT INTO notifications (user_id, type, message, link)
        SELECT b.user_id, 'DEAL_COMPLETED',
          '🎉 Creator submitted live link! Deal is now complete. Payment released.',
          '/deals/' || $1
        FROM deals d
        JOIN brand_profiles b ON d.brand_id = b.id
        WHERE d.id = $1
      `, [dealId]);
    } catch (notifyErr) {
      console.error('Failed to send completion notification:', notifyErr);
    }

    return c.json({ success: true, message: 'Escrow released. Deal completed!' });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    return c.json({ error: 'Failed to release escrow', details: error.message }, 500);
  }
};

// ────────────────────────────────────────────────────────────
// 4. Get escrow payment status for a deal
// GET /api/payments/deal/:dealId
// ────────────────────────────────────────────────────────────
export const getDealPayment = async (c) => {
  try {
    const user = c.get('user');
    const dealId = c.req.param('dealId');

    // Verify user belongs to deal
    const accessCheck = await client.query(`
      SELECT 1
      FROM deals d
      LEFT JOIN brand_profiles b ON d.brand_id = b.id
      LEFT JOIN creator_profiles cr ON d.creator_id = cr.id
      WHERE d.id = $1 AND (b.user_id = $2 OR cr.user_id = $2)
    `, [dealId, user.id]);

    if (accessCheck.rows.length === 0 && user.role !== 'ADMIN') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const escrowRes = await client.query(
      'SELECT * FROM escrow_payments WHERE deal_id = $1',
      [dealId]
    );

    const payment = escrowRes.rows[0] || null;
    return c.json({ payment });
  } catch (error) {
    console.error('Error fetching deal payment:', error);
    return c.json({ error: 'Failed to fetch payment info' }, 500);
  }
};
