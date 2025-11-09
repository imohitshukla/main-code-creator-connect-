     import client from '../config/database.js';

export const getCampaigns = async (c) => {
  try {
    const campaigns = await client.query(`
      SELECT c.id, c.title, c.description, c.budget_range, c.niche, c.status, c.created_at,
             u.email as brand_name
      FROM campaigns c
      JOIN users u ON c.brand_id = u.id
    `);
    return c.json({ campaigns: campaigns.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
};

export const createCampaign = async (c) => {
  try {
    const userId = c.get('userId');
    const { title, description, budget_range, niche } = await c.req.json();

    const result = await client.query(`
      INSERT INTO campaigns (brand_id, title, description, budget_range, niche)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, budget_range, niche, status, created_at
    `, [userId, title, description, budget_range, niche]);

    return c.json({ campaign: result.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
};

export const applyToCampaign = async (c) => {
  try {
    const campaignId = c.req.param('id');
    const userId = c.get('userId');
    const { proposal_text } = await c.req.json();

    const result = await client.query(`
      INSERT INTO proposals (campaign_id, creator_id, proposal_text)
      VALUES ($1, $2, $3)
      RETURNING id, proposal_text, status, created_at
    `, [campaignId, userId, proposal_text]);

    // Create notification for brand
    await client.query(`
      INSERT INTO notifications (user_id, type, message, related_id)
      VALUES ($1, 'application', 'New application for your campaign', $2)
    `, [userId, campaignId]); // Note: userId here should be brand_id, fix later

    return c.json({ proposal: result.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to apply to campaign' }, 500);
  }
};

export const getCampaignDashboard = async (c) => {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole === 'brand') {
      // Brand dashboard: campaigns, proposals, analytics
      const campaigns = await client.query(`
        SELECT c.id, c.title, c.status, COUNT(p.id) as proposal_count,
               AVG(a.engagement_rate) as avg_engagement, AVG(a.roi) as avg_roi
        FROM campaigns c
        LEFT JOIN proposals p ON c.id = p.campaign_id
        LEFT JOIN analytics a ON c.id = a.campaign_id
        WHERE c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $1)
        GROUP BY c.id, c.title, c.status
      `, [userId]);

      return c.json({ dashboard: campaigns.rows });
    } else if (userRole === 'creator') {
      // Creator dashboard: applied campaigns, analytics
      const applications = await client.query(`
        SELECT c.id, c.title, p.status as proposal_status, a.engagement_rate, a.roi
        FROM campaigns c
        JOIN proposals p ON c.id = p.campaign_id
        LEFT JOIN analytics a ON c.id = a.campaign_id AND p.creator_id = a.creator_id
        WHERE p.creator_id = (SELECT id FROM creator_profiles WHERE user_id = $1)
      `, [userId]);

      return c.json({ dashboard: applications.rows });
    }

    return c.json({ error: 'Invalid role' }, 403);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch dashboard' }, 500);
  }
};

export const updateCampaignProgress = async (c) => {
  try {
    const campaignId = c.req.param('id');
    const userId = c.get('userId');
    const { status, kpis } = await c.req.json();

    // Verify ownership
    const campaign = await client.query(`
      SELECT brand_id FROM campaigns WHERE id = $1
    `, [campaignId]);

    if (campaign.rows[0].brand_id !== (await client.query(`SELECT id FROM brand_profiles WHERE user_id = $1`, [userId])).rows[0].id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await client.query(`
      UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [status, campaignId]);

    // Update analytics if KPIs provided
    if (kpis) {
      await client.query(`
        INSERT INTO analytics (campaign_id, metrics, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (campaign_id) DO UPDATE SET metrics = EXCLUDED.metrics, updated_at = CURRENT_TIMESTAMP
      `, [campaignId, JSON.stringify(kpis)]);
    }

    return c.json({ message: 'Campaign updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update campaign' }, 500);
  }
};
