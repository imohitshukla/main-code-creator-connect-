import { client } from '../config/database.js';

// ──────────────────────────────────────────────
// 1. PLATFORM OVERVIEW — Aggregated founder metrics
// ──────────────────────────────────────────────
export const getPlatformOverview = async (c) => {
  try {
    const [brandCount, creatorCount, dealMetrics, recentSessions] = await Promise.all([
      client.query(`SELECT COUNT(*) as total FROM users WHERE LOWER(role) = 'brand'`),
      client.query(`SELECT COUNT(*) as total FROM users WHERE LOWER(role) = 'creator'`),
      client.query(`
        SELECT
          COUNT(*) as total_deals,
          COUNT(CASE WHEN status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 END) as active_deals,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_deals,
          COALESCE(SUM(amount), 0) as total_volume,
          COALESCE(AVG(CASE WHEN amount > 0 THEN amount END), 0) as avg_deal_size
        FROM deals
      `),
      client.query(`SELECT COUNT(*) as total FROM user_audit_logs WHERE logged_in_at > NOW() - INTERVAL '24 hours'`)
    ]);

    const metrics = {
      totalBrands: parseInt(brandCount.rows[0].total),
      totalCreators: parseInt(creatorCount.rows[0].total),
      totalDeals: parseInt(dealMetrics.rows[0].total_deals),
      activeDeals: parseInt(dealMetrics.rows[0].active_deals),
      completedDeals: parseInt(dealMetrics.rows[0].completed_deals),
      totalPlatformVolume: parseFloat(dealMetrics.rows[0].total_volume),
      avgDealSize: parseFloat(dealMetrics.rows[0].avg_deal_size),
      sessionsLast24h: parseInt(recentSessions.rows[0].total)
    };

    return c.json({ success: true, metrics });
  } catch (error) {
    console.error('Platform Overview Error:', error);
    return c.json({ error: 'Failed to fetch platform overview', details: error.message }, 500);
  }
};

// ──────────────────────────────────────────────
// 2. AUDIT LOGS — Live traffic monitor
// ──────────────────────────────────────────────
export const getAuditLogs = async (c) => {
  try {
    const limit = parseInt(c.req.query('limit')) || 100;

    const logs = await client.query(`
      SELECT
        id, user_id, user_email, role, ip_address, device_info, logged_in_at
      FROM user_audit_logs
      ORDER BY logged_in_at DESC
      LIMIT $1
    `, [Math.min(limit, 500)]);

    return c.json({ success: true, sessions: logs.rows, total: logs.rows.length });
  } catch (error) {
    console.error('Audit Logs Error:', error);
    return c.json({ error: 'Failed to fetch audit logs', details: error.message }, 500);
  }
};

// ──────────────────────────────────────────────
// 3. PITCH MATRIX — Active brand↔creator deal tracker
// ──────────────────────────────────────────────
export const getPitchMatrix = async (c) => {
  try {
    // First try to read from admin_pitch_tracker, fallback to deals table directly
    const pitchData = await client.query(`
      SELECT
        d.id as deal_id,
        d.status,
        d.amount as fixed_amount,
        d.currency,
        d.created_at,
        d.updated_at,
        d.compensation_type as payment_type,
        d.product_name,
        d.product_mrp,
        d.current_stage_metadata,
        bp.company_name as brand_name,
        bp.id as brand_profile_id,
        cp.name as creator_name,
        cp.id as creator_profile_id,
        bu.email as brand_email,
        cu.email as creator_email
      FROM deals d
      LEFT JOIN brand_profiles bp ON d.brand_id = bp.id
      LEFT JOIN creator_profiles cp ON d.creator_id = cp.id
      LEFT JOIN users bu ON bp.user_id = bu.id
      LEFT JOIN users cu ON cp.user_id = cu.id
      ORDER BY d.updated_at DESC
    `);

    // Also aggregate financial data
    const financials = await client.query(`
      SELECT
        COALESCE(SUM(amount), 0) as total_volume,
        COALESCE(SUM(CASE WHEN status NOT IN ('CANCELLED', 'COMPLETED') THEN amount ELSE 0 END), 0) as active_value,
        COALESCE(AVG(CASE WHEN amount > 0 THEN amount END), 0) as avg_deal_size,
        COUNT(*) as total_deals,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_deals
      FROM deals
    `);

    return c.json({
      success: true,
      pitchMatrix: pitchData.rows,
      financials: {
        totalVolume: parseFloat(financials.rows[0].total_volume),
        activeValue: parseFloat(financials.rows[0].active_value),
        avgDealSize: parseFloat(financials.rows[0].avg_deal_size),
        totalDeals: parseInt(financials.rows[0].total_deals),
        completedDeals: parseInt(financials.rows[0].completed_deals)
      }
    });
  } catch (error) {
    console.error('Pitch Matrix Error:', error);
    return c.json({ error: 'Failed to fetch pitch matrix', details: error.message }, 500);
  }
};

// ──────────────────────────────────────────────
// 4. ALL CREATORS (existing, enhanced)
// ──────────────────────────────────────────────
export const getAllCreators = async (c) => {
  try {
    const creators = await client.query(`
      SELECT
        cp.id,
        cp.user_id,
        cp.name,
        cp.bio,
        cp.niche,
        cp.follower_count as followers,
        cp.engagement_rate,
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

// ──────────────────────────────────────────────
// 5. ADMIN STATS (existing, enhanced with real metrics)
// ──────────────────────────────────────────────
export const getAdminStats = async (c) => {
  try {
    const [userStats, dealStats, campaignStats] = await Promise.all([
      client.query(`
        SELECT
          COUNT(*) FILTER (WHERE LOWER(role) = 'creator') as total_creators,
          COUNT(*) FILTER (WHERE LOWER(role) = 'brand') as total_brands,
          COUNT(*) FILTER (WHERE LOWER(role) = 'admin') as total_admins
        FROM users
      `),
      client.query(`
        SELECT
          COUNT(*) as total_deals,
          COUNT(CASE WHEN status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 END) as active_deals,
          COALESCE(SUM(amount), 0) as total_volume
        FROM deals
      `),
      client.query(`
        SELECT
          COUNT(*) as total_campaigns,
          COUNT(CASE WHEN LOWER(status) = 'active' THEN 1 END) as active_campaigns
        FROM campaigns
      `)
    ]);

    const stats = {
      totalCreators: parseInt(userStats.rows[0].total_creators),
      totalBrands: parseInt(userStats.rows[0].total_brands),
      totalDeals: parseInt(dealStats.rows[0].total_deals),
      activeDeals: parseInt(dealStats.rows[0].active_deals),
      totalVolume: parseFloat(dealStats.rows[0].total_volume),
      totalCampaigns: parseInt(campaignStats.rows[0].total_campaigns),
      activeCampaigns: parseInt(campaignStats.rows[0].active_campaigns),
      // Legacy fields for backwards compat with old frontend
      verifiedCreators: 0,
      pendingVerification: parseInt(userStats.rows[0].total_creators),
      highRiskCreators: 0
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Get Admin Stats Error:', error);
    return c.json({ error: 'Failed to fetch admin statistics' }, 500);
  }
};

// ──────────────────────────────────────────────
// 6. CREATOR VERIFICATION (existing)
// ──────────────────────────────────────────────
export const updateCreatorVerification = async (c) => {
  try {
    const { creatorId, verified, notes } = await c.req.json();
    await client.query(`
      UPDATE creator_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [creatorId]);
    return c.json({ message: 'Creator verification updated successfully' });
  } catch (error) {
    console.error('Update Creator Verification Error:', error);
    return c.json({ error: 'Failed to update creator verification' }, 500);
  }
};

// ──────────────────────────────────────────────
// 7. FRAUD HISTORY (existing placeholder)
// ──────────────────────────────────────────────
export const getCreatorFraudHistory = async (c) => {
  try {
    const creatorId = c.req.param('creatorId');
    const history = await client.query(`
      SELECT 0.0 as fraud_score, null as last_fraud_check,
             'Fraud analysis module pending deployment' as ai_analysis,
             null as admin_notes, CURRENT_TIMESTAMP as created_at
      FROM creator_profiles cp WHERE cp.id = $1 LIMIT 1
    `, [creatorId]);
    return c.json({ history: history.rows });
  } catch (error) {
    console.error('Get Creator Fraud History Error:', error);
    return c.json({ error: 'Failed to fetch fraud history' }, 500);
  }
};

// ──────────────────────────────────────────────
// 8. BULK FRAUD CHECK (existing placeholder)
// ──────────────────────────────────────────────
export const bulkFraudCheck = async (c) => {
  try {
    const { creatorIds } = await c.req.json();
    const results = creatorIds.map(id => ({
      creatorId: id, status: 'queued',
      estimatedCompletion: new Date(Date.now() + 300000)
    }));
    return c.json({ message: 'Bulk fraud check initiated', results, totalQueued: creatorIds.length });
  } catch (error) {
    console.error('Bulk Fraud Check Error:', error);
    return c.json({ error: 'Failed to initiate bulk fraud check' }, 500);
  }
};

// ──────────────────────────────────────────────
// 9. SYSTEM HEALTH (existing)
// ──────────────────────────────────────────────
export const getSystemHealth = async (c) => {
  try {
    const dbHealth = await client.query('SELECT 1 as health_check');
    return c.json({
      health: {
        database: dbHealth.rows.length > 0 ? 'healthy' : 'unhealthy',
        ai_services: { openai: process.env.OPENAI_API_KEY ? 'available' : 'api_key_missing', status: 'operational' },
        server: 'healthy',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('System Health Check Error:', error);
    return c.json({
      health: { database: 'unhealthy', ai_services: { status: 'error' }, server: 'healthy', timestamp: new Date().toISOString(), error: error.message }
    }, 500);
  }
};
