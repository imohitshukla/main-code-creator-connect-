import { client } from '../config/database.js';

export const getCreatorByUsername = async (c) => {
  try {
    const username = c.req.param('username');
    const creator = await client.query(`
      SELECT cp.id, cp.bio, cp.niche, cp.social_media, cp.portfolio_links,
             cp.follower_count, cp.engagement_rate, cp.audience, cp.budget,
             u.email, u.name, cp.is_verified,
             mk.id as media_kit_id, mk.title, mk.description, mk.content, mk.views, mk.downloads
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN media_kits mk ON mk.creator_id = u.id AND mk.is_public = true
      WHERE u.email = $1
    `, [username]);
    if (creator.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }
    // Group media kits
    const creatorData = {
      id: creator.rows[0].id,
      name: creator.rows[0].name,
      email: creator.rows[0].email,
      bio: creator.rows[0].bio,
      niche: creator.rows[0].niche,
      social_media: creator.rows[0].social_media,
      portfolio_links: creator.rows[0].portfolio_links,
      follower_count: creator.rows[0].follower_count,
      engagement_rate: creator.rows[0].engagement_rate,
      audience: creator.rows[0].audience,
      budget: creator.rows[0].budget,
      is_verified: creator.rows[0].is_verified,
      media_kits: creator.rows.filter(row => row.media_kit_id).map(row => ({
        id: row.media_kit_id,
        title: row.title,
        description: row.description,
        content: row.content,
        views: row.views,
        downloads: row.downloads
      }))
    };
    return c.json({ creator: creatorData });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch creator' }, 500);
  }
};

export const getCreators = async (c) => {
  try {
    const { niche, minFollowers, minEngagement, maxBudget } = c.req.query();
    let query = `
      SELECT cp.id, cp.bio, cp.niche, cp.social_links, cp.portfolio_links,
             cp.follower_count, cp.engagement_rate, cp.audience, cp.budget,
             u.email, u.name, cp.is_verified
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (niche && niche !== 'All') {
      params.push(`%${niche}%`);
      query += ` AND cp.niche ILIKE $${params.length}`;
    }

    if (minFollowers) {
      params.push(parseInt(minFollowers));
      query += ` AND cp.follower_count >= $${params.length}`;
    }

    if (minEngagement) {
      params.push(parseFloat(minEngagement));
      query += ` AND cp.engagement_rate >= $${params.length}`;
    }

    if (maxBudget) {
      params.push(parseFloat(maxBudget));
      query += ` AND cp.budget <= $${params.length}`;
    }

    const creators = await client.query(query, params);
    return c.json({ creators: creators.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch creators' }, 500);
  }
};

export const getCreatorById = async (c) => {
  try {
    const id = c.req.param('id');
    const creator = await client.query(`
      SELECT cp.id, cp.bio, cp.niche, cp.social_links, cp.portfolio_links,
             cp.follower_count, cp.engagement_rate, cp.audience, cp.budget,
             u.email, u.name
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `, [id]);
    if (creator.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }
    return c.json({ creator: creator.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch creator' }, 500);
  }
};

export const updateCreatorProfile = async (c) => {
  try {
    const userId = c.get('userId');
    const { bio, niche, social_links, portfolio_links, audience, budget } = await c.req.json();

    await client.query(`
      UPDATE creator_profiles
      SET bio = $1, niche = $2, social_links = $3, portfolio_links = $4, audience = $5, budget = $6, updated_at = NOW()
      WHERE user_id = $7
    `, [bio, niche, social_links, portfolio_links, audience, budget, userId]);

    return c.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
};

export const verifyCreator = async (c) => {
  try {
    const creatorId = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'brand' && userRole !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await client.query(`
      UPDATE creator_profiles SET verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [creatorId]);

    return c.json({ message: 'Creator verified successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to verify creator' }, 500);
  }
};

export const getVerifiedCreators = async (c) => {
  try {
    const creators = await client.query(`
      SELECT cp.id, cp.bio, cp.niche, cp.social_links, cp.portfolio_links,
             cp.follower_count, cp.engagement_rate, cp.audience, cp.budget,
             u.email, u.name, cp.verified
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.verified = TRUE
    `);
    return c.json({ creators: creators.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch verified creators' }, 500);
  }
};
