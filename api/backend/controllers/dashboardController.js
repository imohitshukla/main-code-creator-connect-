import { client } from '../config/database.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile, BrandProfile } = require('../models/index.cjs');

// Get role-specific dashboard data
export const getDashboard = async (c) => {
  try {
    const userId = c.get('userId');

    // Get user role
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    if (user.role === 'creator') {
      return await getCreatorDashboard(c, userId);
    } else if (user.role === 'brand') {
      return await getBrandDashboard(c, userId);
    } else {
      return c.json({ error: 'Invalid user role' }, 400);
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    return c.json({ error: 'Failed to load dashboard' }, 500);
  }
};

// Creator Dashboard - "Tell Brands About You"
const getCreatorDashboard = async (c, userId) => {
  try {
    // Get creator profile with metrics
    const profileResult = await client.query(`
      SELECT 
        cp.*,
        u.name as user_name,
        u.email,
        u.avatar as avatar
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = $1
    `, [userId]);

    // Get creator's active deals
    const dealsResult = await client.query(`
      SELECT 
        d.*,
        c.title as campaign_title,
        u.name as brand_name
      FROM deals d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON c.brand_id = u.id
      WHERE d.creator_id = $1
      ORDER BY d.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get creator's recent messages
    const messagesResult = await client.query(`
      SELECT 
        m.*,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM messages m
      JOIN conversations conv ON m.conversation_id = conv.id
      JOIN users u ON m.sender_id = u.id
      WHERE (conv.participant_1_id = $1 OR conv.participant_2_id = $1)
        AND m.sender_id != $1
      ORDER BY m.created_at DESC
      LIMIT 5
    `, [userId]);

    const profile = profileResult.rows[0] || {};

    return c.json({
      role: 'creator',
      profile: {
        name: profile.user_name || profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        niche: profile.niche,
        follower_count: profile.follower_count,
        engagement_rate: profile.engagement_rate,
        budget_range: profile.budget_range,
        is_verified: profile.is_verified,
        social_media: profile.social_media,
        portfolio_links: profile.portfolio_links
      },
      stats: {
        active_deals: dealsResult.rows.filter(d => d.status === 'active').length,
        completed_deals: dealsResult.rows.filter(d => d.status === 'completed').length,
        total_earnings: dealsResult.rows.reduce((sum, d) => sum + (d.budget || 0), 0)
      },
      recent_activity: {
        deals: dealsResult.rows,
        messages: messagesResult.rows
      },
      actions: [
        'Complete your profile to attract more brands',
        'Upload portfolio samples',
        'Set your pricing tiers',
        'Connect social media accounts'
      ]
    });
  } catch (error) {
    console.error('Creator dashboard error:', error);
    return c.json({ error: 'Failed to load creator dashboard' }, 500);
  }
};

// Brand Dashboard - "Tell Creators More About You"
export const getBrandDashboard = async (c, userId) => {
  try {
    // Get brand profile with business details
    const profileResult = await client.query(`
      SELECT 
        bp.*,
        u.name as user_name,
        u.email
      FROM brand_profiles bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.user_id = $1
    `, [userId]);

    // Get brand's active campaigns
    const campaignsResult = await client.query(`
      SELECT 
        c.*,
        COUNT(d.id) as deal_count
      FROM campaigns c
      LEFT JOIN deals d ON c.id = d.campaign_id
      WHERE c.brand_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get brand's recent deal activity
    const dealsResult = await client.query(`
      SELECT 
        d.*,
        u.name as creator_name,
        u.avatar as creator_avatar
      FROM deals d
      JOIN users u ON d.creator_id = u.id
      WHERE d.brand_id = $1
      ORDER BY d.created_at DESC
      LIMIT 5
    `, [userId]);

    const profile = profileResult.rows[0] || {};

    return c.json({
      role: 'brand',
      profile: {
        company_name: profile.company_name,
        industry_vertical: profile.industry_vertical,
        website_url: profile.website_url,
        linkedin_page: profile.linkedin_page,
        company_size: profile.company_size,
        hq_location: profile.hq_location,
        gst_tax_id: profile.gst_tax_id,
        typical_budget_range: profile.typical_budget_range,
        looking_for: profile.looking_for,
        description: profile.description,
        email: profile.email
      },
      stats: {
        active_campaigns: campaignsResult.rows.filter(c => c.status === 'active').length,
        total_campaigns: campaignsResult.rows.length,
        active_deals: dealsResult.rows.filter(d => d.status === 'active').length,
        total_spent: dealsResult.rows.reduce((sum, d) => sum + (d.budget || 0), 0)
      },
      recent_activity: {
        campaigns: campaignsResult.rows,
        deals: dealsResult.rows
      },
      actions: [
        'Complete your business profile',
        'Create your first campaign',
        'Set campaign budget ranges',
        'Verify your GST/Tax ID'
      ]
    });
  } catch (error) {
    console.error('Brand dashboard error:', error);
    return c.json({ error: 'Failed to load brand dashboard' }, 500);
  }
};

// Get onboarding flow based on user role
export const getOnboardingFlow = async (c) => {
  try {
    const userId = c.get('userId');

    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    if (user.role === 'creator') {
      return c.json({
        role: 'creator',
        title: 'Tell Brands About You',
        description: 'Complete your creator profile to attract the best brand partnerships',
        steps: [
          {
            id: 'basic_info',
            title: 'Basic Information',
            fields: ['name', 'bio', 'niche', 'location']
          },
          {
            id: 'social_media',
            title: 'Social Media & Portfolio',
            fields: ['instagram_handle', 'youtube_channel', 'portfolio_links']
          },
          {
            id: 'pricing',
            title: 'Pricing & Availability',
            fields: ['budget_range', 'follower_count', 'engagement_rate']
          }
        ]
      });
    } else if (user.role === 'brand') {
      return c.json({
        role: 'brand',
        title: 'Tell Creators More About You',
        description: 'Complete your business profile to find the perfect creator partnerships',
        steps: [
          {
            id: 'company_identity',
            title: 'Company Identity',
            fields: ['company_name', 'industry_vertical', 'website_url', 'linkedin_page']
          },
          {
            id: 'business_details',
            title: 'Business Details',
            fields: ['company_size', 'hq_location', 'gst_tax_id']
          },
          {
            id: 'campaign_preferences',
            title: 'Campaign Preferences',
            fields: ['typical_budget_range', 'looking_for']
          }
        ]
      });
    }
  } catch (error) {
    console.error('Onboarding flow error:', error);
    return c.json({ error: 'Failed to load onboarding flow' }, 500);
  }
};
