import { client } from '../config/database.js';
import axios from 'axios';

const INSTAGRAM_API_BASE = 'https://graph.instagram.com';
const TIKTOK_API_BASE = 'https://open-api.tiktok.com';

export const getAnalytics = async (c) => {
  try {
    const campaignId = c.req.param('campaignId');
    const userId = c.get('userId');

    // Verify access (brand or assigned creator)
    const accessCheck = await client.query(`
      SELECT 1 FROM campaigns c
      LEFT JOIN proposals p ON c.id = p.campaign_id
      WHERE c.id = $1 AND (c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $2) OR p.creator_id = (SELECT id FROM creator_profiles WHERE user_id = $2))
    `, [campaignId, userId]);

    if (accessCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const analytics = await client.query(`
      SELECT a.*, c.title as campaign_title, cp.name as creator_name
      FROM analytics a
      JOIN campaigns c ON a.campaign_id = c.id
      LEFT JOIN creator_profiles cp ON a.creator_id = cp.id
      WHERE a.campaign_id = $1
      ORDER BY a.created_at DESC
    `, [campaignId]);

    return c.json({ analytics: analytics.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
};

export const updateAnalyticsFromSocial = async (c) => {
  try {
    const { campaignId, creatorId, platform, accessToken } = await c.req.json();
    const userId = c.get('userId');

    // Verify access
    const accessCheck = await client.query(`
      SELECT 1 FROM campaigns c
      WHERE c.id = $1 AND c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $2)
    `, [campaignId, userId]);

    if (accessCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    let metrics = {};

    if (platform === 'instagram') {
      const response = await axios.get(`${INSTAGRAM_API_BASE}/me/media`, {
        params: { access_token: accessToken, fields: 'engagement,impressions,reach' }
      });
      metrics = {
        engagement: response.data.data.reduce((sum, post) => sum + (post.engagement || 0), 0),
        impressions: response.data.data.reduce((sum, post) => sum + (post.impressions || 0), 0),
        reach: response.data.data.reduce((sum, post) => sum + (post.reach || 0), 0)
      };
    } else if (platform === 'tiktok') {
      const response = await axios.get(`${TIKTOK_API_BASE}/research/video/query/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { fields: 'view_count,like_count,comment_count,share_count' }
      });
      metrics = {
        views: response.data.data.reduce((sum, video) => sum + (video.view_count || 0), 0),
        likes: response.data.data.reduce((sum, video) => sum + (video.like_count || 0), 0),
        comments: response.data.data.reduce((sum, video) => sum + (video.comment_count || 0), 0),
        shares: response.data.data.reduce((sum, video) => sum + (video.share_count || 0), 0)
      };
    }

    // Calculate engagement rate and ROI (simplified)
    const engagementRate = metrics.likes ? (metrics.likes / metrics.views) * 100 : 0;
    const roi = metrics.impressions ? (metrics.impressions * 0.01) : 0; // Placeholder calculation

    await client.query(`
      INSERT INTO analytics (campaign_id, creator_id, metrics, engagement_rate, roi, impressions, clicks, conversions, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (campaign_id, creator_id) DO UPDATE SET
        metrics = EXCLUDED.metrics,
        engagement_rate = EXCLUDED.engagement_rate,
        roi = EXCLUDED.roi,
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        updated_at = CURRENT_TIMESTAMP
    `, [campaignId, creatorId, JSON.stringify(metrics), engagementRate, roi, metrics.impressions || 0, metrics.clicks || 0, metrics.conversions || 0]);

    return c.json({ message: 'Analytics updated successfully', metrics });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update analytics' }, 500);
  }
};

export const getROIAnalysis = async (c) => {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    let query;
    if (userRole === 'brand') {
      query = `
        SELECT c.title, AVG(a.roi) as avg_roi, SUM(a.impressions) as total_impressions,
               SUM(a.clicks) as total_clicks, SUM(a.conversions) as total_conversions
        FROM campaigns c
        LEFT JOIN analytics a ON c.id = a.campaign_id
        WHERE c.brand_id = (SELECT id FROM brand_profiles WHERE user_id = $1)
        GROUP BY c.id, c.title
      `;
    } else {
      query = `
        SELECT c.title, a.roi, a.impressions, a.clicks, a.conversions
        FROM campaigns c
        JOIN proposals p ON c.id = p.campaign_id
        LEFT JOIN analytics a ON c.id = a.campaign_id AND p.creator_id = a.creator_id
        WHERE p.creator_id = (SELECT id FROM creator_profiles WHERE user_id = $1)
      `;
    }

    const results = await client.query(query, [userId]);
    return c.json({ roiAnalysis: results.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch ROI analysis' }, 500);
  }
};
