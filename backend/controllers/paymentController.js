import db from '../config/database.js';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createContract = async (c) => {
  try {
    const { proposalId, terms } = await c.req.json();
    const userId = c.get('userId');

    // Verify proposal ownership (brand)
    const proposal = await db.query(`
      SELECT p.id, c.brand_id FROM proposals p
      JOIN campaigns c ON p.campaign_id = c.id
      WHERE p.id = $1 AND c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $2)
    `, [proposalId, userId]);

    if (proposal.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await db.query(`
      INSERT INTO contracts (proposal_id, terms)
      VALUES ($1, $2)
      RETURNING id, terms, signed, created_at
    `, [proposalId, terms]);

    return c.json({ contract: result.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to create contract' }, 500);
  }
};

export const signContract = async (c) => {
  try {
    const contractId = c.req.param('id');
    const { signatureData } = await c.req.json();
    const userId = c.get('userId');

    // Verify access (brand or creator from proposal)
    const accessCheck = await db.query(`
      SELECT 1 FROM contracts ct
      JOIN proposals p ON ct.proposal_id = p.id
      JOIN campaigns c ON p.campaign_id = c.id
      WHERE ct.id = $1 AND (c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $2) OR p.creator_id = (SELECT id FROM creator_profiles WHERE user_id = $2))
    `, [contractId, userId]);

    if (accessCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await db.query(`
      UPDATE contracts SET signed = TRUE, signature_data = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(signatureData), contractId]);

    return c.json({ message: 'Contract signed successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to sign contract' }, 500);
  }
};

export const createPaymentIntent = async (c) => {
  try {
    const { contractId, amount } = await c.req.json();
    const userId = c.get('userId');

    // Verify contract ownership (brand)
    const contract = await db.query(`
      SELECT ct.id FROM contracts ct
      JOIN proposals p ON ct.proposal_id = p.id
      JOIN campaigns c ON p.campaign_id = c.id
      WHERE ct.id = $1 AND c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $2)
    `, [contractId, userId]);

    if (contract.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency: 'usd',
    //   metadata: { contractId }
    // });

    // Save payment record
    await db.query(`
      INSERT INTO payments (contract_id, amount, status)
      VALUES ($1, $2, 'pending')
    `, [contractId, amount]);

    return c.json({ message: 'Payment intent created (Stripe disabled for testing)' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to create payment intent' }, 500);
  }
};

export const releaseEscrow = async (c) => {
  try {
    const paymentId = c.req.param('id');
    const userId = c.get('userId');

    // Verify payment ownership (creator)
    const payment = await db.query(`
      SELECT p.id FROM payments p
      JOIN contracts ct ON p.contract_id = ct.id
      JOIN proposals pr ON ct.proposal_id = pr.id
      WHERE p.id = $1 AND pr.creator_id = (SELECT id FROM creator_profiles WHERE user_id = $2)
    `, [paymentId, userId]);

    if (payment.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Simulate escrow release (Stripe disabled for testing)
    // await stripe.transfers.create({
    //   amount: Math.round(payment.rows[0].amount * 100),
    //   currency: 'usd',
    //   destination: 'acct_1234567890', // Placeholder - would be creator's Stripe account
    //   transfer_group: payment.rows[0].stripe_id
    // });

    await db.query(`
      UPDATE payments SET escrow_released = TRUE, status = 'released', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [paymentId]);

    return c.json({ message: 'Escrow released successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to release escrow' }, 500);
  }
};

export const getPayments = async (c) => {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    let query;
    if (userRole === 'brand') {
      query = `
        SELECT p.*, ct.terms, c.title as campaign_title
        FROM payments p
        JOIN contracts ct ON p.contract_id = ct.id
        JOIN proposals pr ON ct.proposal_id = pr.id
        JOIN campaigns c ON pr.campaign_id = c.id
        WHERE c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $1)
      `;
    } else {
      query = `
        SELECT p.*, ct.terms, c.title as campaign_title
        FROM payments p
        JOIN contracts ct ON p.contract_id = ct.id
        JOIN proposals pr ON ct.proposal_id = pr.id
        JOIN campaigns c ON pr.campaign_id = c.id
        WHERE pr.creator_id = (SELECT id FROM creator_profiles WHERE user_id = $1)
      `;
    }

    const payments = await db.query(query, [userId]);
    return c.json({ payments: payments.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
};
