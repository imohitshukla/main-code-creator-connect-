import { pool } from '../config/database.js';

// Create a new campaign
export const createCampaign = async (c) => {
  try {
    const user = c.get('user');
    const {
      title,
      product_type,
      budget_range,
      description,
      requirements,
      is_urgent = false,
      is_featured = false
    } = await c.req.json();

    // 1. Validate Input
    if (!title || !product_type) {
      return c.json({ error: 'Title and Product Type are required' }, 400);
    }

    // 2. Get Brand ID from Brand Profile
    // We need to link the campaign to the BRAND PROFILE, not just the user.
    const brandRes = await pool.query('SELECT id FROM brand_profiles WHERE user_id = $1', [user.id]);

    if (brandRes.rows.length === 0) {
      return c.json({ error: 'Brand profile not found. Please complete onboarding.' }, 404);
    }
    const brandId = brandRes.rows[0].id;

    // 3. Insert Campaign
    const query = `
      INSERT INTO campaigns (brand_id, title, product_type, budget_range, description, requirements, is_urgent, is_featured, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
      RETURNING *;
    `;
    const values = [brandId, title, product_type, budget_range, description, requirements, is_urgent, is_featured];
    const result = await pool.query(query, values);

    return c.json({
      success: true,
      campaign: result.rows[0]
    }, 201);

  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ error: 'Server error creating campaign' }, 500);
  }
};

// Get all campaigns for the logged-in brand
export const getBrandCampaigns = async (c) => {
  try {
    const user = c.get('user');

    // 1. Get Brand ID
    const brandRes = await pool.query('SELECT id FROM brand_profiles WHERE user_id = $1', [user.id]);
    if (brandRes.rows.length === 0) {
      return c.json({ campaigns: [] }); // No profile = no campaigns
    }
    const brandId = brandRes.rows[0].id;

    // 2. Fetch Campaigns
    const query = `
      SELECT * FROM campaigns 
      WHERE brand_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [brandId]);

    return c.json({ campaigns: result.rows });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: 'Server error fetching campaigns' }, 500);
  }
};

// Get ALL active campaigns (Marketplace)
export const getAllCampaigns = async (c) => {
  try {
    // 1. Fetch Active Campaigns
    // Join with brand_profiles to get company name if needed
    const query = `
      SELECT c.*, bp.company_name as brand_name, c.brand_id as brand_profile_id, bp.user_id as brand_user_id
      FROM campaigns c
      JOIN brand_profiles bp ON c.brand_id = bp.id
      WHERE c.status = 'ACTIVE'
      ORDER BY c.is_featured DESC, c.created_at DESC;
    `;
    const result = await pool.query(query);

    return c.json({ campaigns: result.rows });

  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return c.json({ error: 'Server error fetching all campaigns' }, 500);
  }
};

// Delete a campaign
export const deleteCampaign = async (c) => {
  try {
    const user = c.get('user');
    const campaignId = c.req.param('id');

    // 1. Verify Ownership
    // Ensure the campaign belongs to a brand profile owned by this user
    const checkQuery = `
      SELECT c.id 
      FROM campaigns c
      JOIN brand_profiles bp ON c.brand_id = bp.id
      WHERE c.id = $1 AND bp.user_id = $2
    `;
    const checkRes = await pool.query(checkQuery, [campaignId, user.id]);

    if (checkRes.rows.length === 0) {
      return c.json({ error: 'Campaign not found or unauthorized' }, 404);
    }

    // 2. Delete
    await pool.query('DELETE FROM campaigns WHERE id = $1', [campaignId]);

    return c.json({ success: true, message: 'Campaign deleted' });

  } catch (error) {
    console.error('Error deleting campaign:', error);
    return c.json({ error: 'Server error deleting campaign' }, 500);
  }
};
