import client from '../config/database.js';

export const getCreators = async (c) => {
  try {
    const creators = await client.query(`
      SELECT cp.id, cp.bio, cp.niche, cp.social_links, cp.portfolio_links,
             u.email
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
    `);
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
             u.email
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
    const { bio, niche, social_links, portfolio_links } = await c.req.json();

    await client.query(`
      UPDATE creator_profiles
      SET bio = $1, niche = $2, social_links = $3, portfolio_links = $4, updated_at = NOW()
      WHERE user_id = $5
    `, [bio, niche, social_links, portfolio_links, userId]);

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
             u.email, cp.verified
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
