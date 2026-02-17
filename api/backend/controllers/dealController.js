import { client } from '../config/database.js';

// Create a new deal (Offer Pending)
export const createDeal = async (c) => {
  try {
    const user = c.get('user');
    const { brand_id, creator_id, campaign_id, deliverables, amount, currency } = await c.req.json();

    // Validations
    if (!brand_id || !creator_id || !deliverables || !amount) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Ensure the requester is either the brand or the creator involved (usually brand initiates, but let's be flexible or strict based on requirements)
    // For now, let's assume Brand initiates.
    // TODO: proper role check if needed.

    const newDeal = await client.query(`
      INSERT INTO deals (brand_id, creator_id, campaign_id, deliverables, amount, currency, status, current_stage_metadata)
      VALUES ($1, $2, $3, $4, $5, $6, 'OFFER', '{}')
      RETURNING *
    `, [brand_id, creator_id, campaign_id || null, deliverables, amount, currency || 'INR']);

    return c.json({ success: true, deal: newDeal.rows[0] }, 201);
  } catch (error) {
    console.error('Error creating deal:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Get Deal by ID
export const getDealById = async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');

    const result = await client.query(`
      SELECT 
        d.*,
        b.company_name as brand_name,
        b.user_id as brand_user_id,
        cr.name as creator_name,
        cr.user_id as creator_user_id
      FROM deals d
      JOIN brand_profiles b ON d.brand_id = b.id
      JOIN creator_profiles cr ON d.creator_id = cr.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    const deal = result.rows[0];

    // Security: Ensure user belongs to this deal
    // user.id is the login "users" table ID.
    // We need to check if user.id matches deals.brand_user_id OR deals.creator_user_id
    if (user.role !== 'ADMIN' && deal.brand_user_id !== user.id && deal.creator_user_id !== user.id) {
      return c.json({ error: 'Unauthorized access to this deal' }, 403);
    }

    return c.json({ deal });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Update Deal Status (The State Machine)
export const updateDealStatus = async (c) => {
  try {
    const id = c.req.param('id');
    const { status, metadata } = await c.req.json();
    const user = c.get('user');

    // Fetch deal to verify ownership and current status
    const result = await client.query('SELECT * FROM deals WHERE id = $1', [id]);
    if (result.rows.length === 0) return c.json({ error: 'Deal not found' }, 404);

    const deal = result.rows[0];

    // TODO: Add specific logic for who can move to what stage if needed.
    // For now, allow valid transitions.

    const validStatuses = ['OFFER', 'SIGNING', 'LOGISTICS', 'PRODUCTION', 'REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    // Rejection Loop Logic (REVIEW -> PRODUCTION)
    if (deal.status === 'REVIEW' && status === 'PRODUCTION') {
      if (!metadata || !metadata.feedback) {
        return c.json({ error: 'Feedback is required when requesting changes.' }, 400);
      }
    }

    // Prepare new metadata
    let currentMetadata = deal.current_stage_metadata;
    if (typeof currentMetadata === 'string') {
      try {
        currentMetadata = JSON.parse(currentMetadata);
      } catch (e) {
        console.error("Failed to parse current_stage_metadata:", e);
        currentMetadata = {};
      }
    } else if (!currentMetadata) {
      currentMetadata = {};
    }

    const userMetadata = metadata || {};

    // If userMetadata is a string (which shouldn't happen from req.json() but safely handle)
    // Actually req.json() returns object.

    const newMetadata = { ...currentMetadata, ...userMetadata };

    console.log(`Updating deal ${id} status to ${status}. Metadata:`, newMetadata);

    const updatedDeal = await client.query(`
      UPDATE deals
      SET status = $1, current_stage_metadata = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, newMetadata, id]);

    return c.json({ success: true, deal: updatedDeal.rows[0] });
  } catch (error) {
    console.error('Error updating deal status:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
};

// The "Kill Switch"
export const terminateDeal = async (c) => {
  try {
    const id = c.req.param('id');
    const { reason } = await c.req.json();
    const user = c.get('user');

    if (!reason) return c.json({ error: 'Termination reason is required' }, 400);

    // Fetch deal
    const result = await client.query('SELECT * FROM deals WHERE id = $1', [id]);
    if (result.rows.length === 0) return c.json({ error: 'Deal not found' }, 404);
    const deal = result.rows[0];

    // Check permissions (must be party to the deal)
    // We need to join with profiles to verify user_id again, or trust the frontend passes the right ID?
    // Better to verify against DB.
    const accessCheck = await client.query(`
      SELECT 1 
      FROM deals d
      LEFT JOIN brand_profiles b ON d.brand_id = b.id
      LEFT JOIN creator_profiles cr ON d.creator_id = cr.id
      WHERE d.id = $1 AND (b.user_id = $2 OR cr.user_id = $2)
    `, [id, user.id]);

    if (accessCheck.rows.length === 0 && user.role !== 'ADMIN') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update status to 'CANCELLED'
    const metadata = {
      ...deal.current_stage_metadata,
      terminated_by: user.id,
      termination_reason: reason,
      terminated_at: new Date().toISOString()
    };

    const updatedDeal = await client.query(`
      UPDATE deals
      SET status = 'CANCELLED', current_stage_metadata = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [metadata, id]);

    // TODO: Trigger email notification here

    return c.json({ success: true, message: 'Deal terminated', deal: updatedDeal.rows[0] });

  } catch (error) {
    console.error('Error terminating deal:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Get Deals for User (My Deals)
export const getUserDeals = async (c) => {
  try {
    const user = c.get('user');

    let query = '';
    let params = [user.id];

    // Retrieve deals based on user role/profile
    // We need to find the profile ID first for the user
    // Or we can join tables.

    // This query gets all deals where the user is either the brand or the creator
    const deals = await client.query(`
            SELECT 
                d.*,
                b.company_name,
                cr.name as creator_name
            FROM deals d
            LEFT JOIN brand_profiles b ON d.brand_id = b.id
            LEFT JOIN creator_profiles cr ON d.creator_id = cr.id
            WHERE b.user_id = $1 OR cr.user_id = $1
            ORDER BY d.updated_at DESC
        `, [user.id]);

    return c.json({ deals: deals.rows });

  } catch (error) {
    console.error('Error fetching user deals:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
