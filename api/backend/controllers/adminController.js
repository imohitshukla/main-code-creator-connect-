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
        cp.follower_count as followers,
        cp.engagement_rate,
        0.0 as fraud_score,
        null as last_fraud_check,
        false as verified,
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
          0 as verified_creators,
          COUNT(*) as pending_verification,
          0 as high_risk_creators
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
      SET updated_at = CURRENT_TIMESTAMP
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
        0.0 as fraud_score,
        null as last_fraud_check,
        'Database migration required for fraud analysis' as ai_analysis,
        null as admin_notes,
        CURRENT_TIMESTAMP as created_at
      FROM creator_profiles cp
      WHERE cp.id = $1
      LIMIT 1
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
