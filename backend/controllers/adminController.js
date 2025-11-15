import { client } from '../config/database.js';

// Get all creators for admin management
export const getAllCreators = async (c) => {
  try {
    const creators = await client.query(`
      SELECT
        cp.id,
        cp.user_id,
        cp.bio,
        cp.niche,
        cp.followers,
        cp.engagement_rate,
        cp.fraud_score,
        cp.last_fraud_check,
        cp.verified,
        u.email,
        u.created_at as user_created_at
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      ORDER BY cp.created_at DESC
    `);

    return c.json({ creators: creators.rows });
  } catch (error) {
    console.error('Get All Creators Error:', error);
    return c.json({ error: 'Failed to fetch creators' }, 500);
  }
};

// Get admin dashboard statistics
export const getAdminStats = async (c) => {
  try {
    const [creatorStats, campaignStats] = await Promise.all([
      client.query(`
        SELECT
          COUNT(*) as total_creators,
          COUNT(CASE WHEN verified = true THEN 1 END) as verified_creators,
          COUNT(CASE WHEN verified IS NULL OR verified = false THEN 1 END) as pending_verification,
          COUNT(CASE WHEN fraud_score > 0.7 THEN 1 END) as high_risk_creators
        FROM creator_profiles
      `),
      client.query(`
        SELECT
          COUNT(*) as total_campaigns,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns
        FROM campaigns
      `)
    ]);

    const stats = {
      totalCreators: parseInt(creatorStats.rows[0].total_creators),
      verifiedCreators: parseInt(creatorStats.rows[0].verified_creators),
      pendingVerification: parseInt(creatorStats.rows[0].pending_verification),
      highRiskCreators: parseInt(creatorStats.rows[0].high_risk_creators),
      totalCampaigns: parseInt(campaignStats.rows[0].total_campaigns),
      activeCampaigns: parseInt(campaignStats.rows[0].active_campaigns)
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Get Admin Stats Error:', error);
    return c.json({ error: 'Failed to fetch admin statistics' }, 500);
  }
};

// Update creator verification status (admin only)
export const updateCreatorVerification = async (c) => {
  try {
    const { creatorId, verified, notes } = await c.req.json();

    await client.query(`
      UPDATE creator_profiles
      SET verified = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [verified, notes, creatorId]);

    return c.json({ message: 'Creator verification updated successfully' });
  } catch (error) {
    console.error('Update Creator Verification Error:', error);
    return c.json({ error: 'Failed to update creator verification' }, 500);
  }
};

// Get fraud analysis history for a creator
export const getCreatorFraudHistory = async (c) => {
  try {
    const creatorId = c.req.param('creatorId');

    const history = await client.query(`
      SELECT
        fraud_score,
        last_fraud_check,
        ai_analysis,
        admin_notes,
        created_at
      FROM creator_profiles cp
      LEFT JOIN fraud_analysis_history fah ON cp.id = fah.creator_id
      WHERE cp.id = $1
      ORDER BY fah.created_at DESC
      LIMIT 10
    `, [creatorId]);

    return c.json({ history: history.rows });
  } catch (error) {
    console.error('Get Creator Fraud History Error:', error);
    return c.json({ error: 'Failed to fetch fraud history' }, 500);
  }
};

// Bulk fraud check for multiple creators
export const bulkFraudCheck = async (c) => {
  try {
    const { creatorIds } = await c.req.json();

    // This would trigger fraud detection for multiple creators
    // For now, return a placeholder response
    const results = creatorIds.map(id => ({
      creatorId: id,
      status: 'queued',
      estimatedCompletion: new Date(Date.now() + 300000) // 5 minutes from now
    }));

    return c.json({
      message: 'Bulk fraud check initiated',
      results,
      totalQueued: creatorIds.length
    });
  } catch (error) {
    console.error('Bulk Fraud Check Error:', error);
    return c.json({ error: 'Failed to initiate bulk fraud check' }, 500);
  }
};

// Get system health and AI service status
export const getSystemHealth = async (c) => {
  try {
    // Check database connectivity
    const dbHealth = await client.query('SELECT 1 as health_check');

    // Check AI service availability (mock for now)
    const aiHealth = {
      openai: process.env.OPENAI_API_KEY ? 'available' : 'api_key_missing',
      status: 'operational'
    };

    const health = {
      database: dbHealth.rows.length > 0 ? 'healthy' : 'unhealthy',
      ai_services: aiHealth,
      server: 'healthy',
      timestamp: new Date().toISOString()
    };

    return c.json({ health });
  } catch (error) {
    console.error('System Health Check Error:', error);
    return c.json({
      health: {
        database: 'unhealthy',
        ai_services: { status: 'error' },
        server: 'healthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }, 500);
  }
};
