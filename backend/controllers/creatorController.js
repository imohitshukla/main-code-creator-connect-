import { client } from '../config/database.js';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs');

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
    const { niche, search } = c.req.query();

    // 1. Base Query
    const whereClause = { role: 'creator' };

    // 2. Add Search Logic (Case Insensitive)
    // We must search on '$creatorProfile.name$' because 'name' is in the profile table, not users table.
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { '$creatorProfile.name$': { [Op.iLike]: `%${search}%` } },
        { '$creatorProfile.niche$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    // 3. The Query
    const creators = await User.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'avatar'], // User has NO name column
      include: [
        {
          model: CreatorProfile,
          as: 'creatorProfile',
          required: false,
          attributes: ['name', 'niche', 'bio', 'portfolio_links', 'social_media', 'follower_count', 'engagement_rate', 'audience', 'budget', 'is_verified'],
          where: niche ? { niche: { [Op.iLike]: `%${niche}%` } } : undefined
        }
      ],
      // subQuery: false is often needed when querying on included columns with limits/offsets, 
      // though here we don't have limit/offset yet, it's safer for $ reference.
      subQuery: false
    });

    // 4. Safely Format the Data for Frontend
    const formattedCreators = creators.map(user => ({
      id: user.id,
      name: user.creatorProfile?.name || user.email?.split('@')[0] || 'Creator', // Get name from Profile
      image: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      avatar: user.avatar,
      email: user.email,
      niche: user.creatorProfile?.niche || 'General Creator',
      bio: user.creatorProfile?.bio || 'Open to collaborations',
      location: 'India',
      followers: user.creatorProfile?.follower_count ? user.creatorProfile.follower_count.toLocaleString() : 'New',
      engagement_rate: user.creatorProfile?.engagement_rate || 0,
      portfolio_links: user.creatorProfile?.portfolio_links,
      social_links: user.creatorProfile?.social_media
    }));

    return c.json({ creators: formattedCreators });
  } catch (error) {
    console.error("❌ SEARCH API CRASHED:", error);
    return c.json({ error: "Failed to fetch creators", details: error.message }, 500);
  }
};

export const getCreatorById = async (c) => {
  try {
    const id = c.req.param('id');
    // 1. Fetch User + CreatorProfile safely
    const user = await User.findOne({
      where: { id },
      attributes: ['id', 'name', 'email', 'avatar'], // Get avatar from User
      include: [
        {
          model: CreatorProfile,
          as: 'creatorProfile',
          required: false, // Left Join
          attributes: [
            'niche',
            'location',
            'bio',
            'instagram_link',
            'youtube_link',
            'portfolio_link',
            'follower_count',
            'engagement_rate',
            'budget_range',
            'audience_breakdown',
            'collaboration_goals',
            'is_verified'
          ]
        }
      ]
    });

    if (!user) {
      return c.json({ error: "Creator not found" }, 404);
    }

    // 2. Format Response (Flatten for frontend)
    const profileData = {
      id: user.id,
      name: user.creatorProfile?.name || user.name || "Creator",
      image: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      avatar: user.avatar, // Keep strictly for SmartAvatar
      email: user.email,
      niche: user.creatorProfile?.niche || "General",
      location: user.creatorProfile?.location || "India",
      bio: user.creatorProfile?.bio || "No bio yet.",
      is_verified: user.creatorProfile?.is_verified,
      stats: {
        followers: user.creatorProfile?.follower_count || "0",
        engagement: user.creatorProfile?.engagement_rate || "N/A"
      },
      socials: {
        instagram: user.creatorProfile?.instagram_link,
        youtube: user.creatorProfile?.youtube_link,
        portfolio: user.creatorProfile?.portfolio_link
      },
      details: {
        budget_range: user.creatorProfile?.budget_range,
        audience_breakdown: user.creatorProfile?.audience_breakdown,
        collaboration_goals: user.creatorProfile?.collaboration_goals
      }
    };

    return c.json({ creator: profileData });
  } catch (error) {
    console.error("❌ GET CREATOR ID ERROR:", error);
    return c.json({ error: "Server Error", details: error.message }, 500);
  }
};

export const updateCreatorProfile = async (c) => {
  try {
    const userId = c.get('userId');
    const {
      displayName,
      phone_number,
      primary_location,
      primary_niche,
      total_followers,
      bio,
      instagram_link,
      youtube_link,
      portfolio_link,
      audience_breakdown,
      budget_range,
      collaboration_goals,
      avatar
    } = await c.req.json();

    // 1. Update User Table (Name/Email/Avatar if needed)
    if (displayName || avatar) {
      const userUpdates = {};
      if (displayName) userUpdates.name = displayName;
      if (avatar) userUpdates.avatar = avatar;

      if (Object.keys(userUpdates).length > 0) {
        await User.update(userUpdates, { where: { id: userId } });
      }
    }

    // 2. Update/Upsert CreatorProfile Table
    const [profile, created] = await CreatorProfile.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, name: displayName || 'Creator' }
    });

    // 3. Save all fields
    await profile.update({
      phone_number,
      location: primary_location,
      niche: primary_niche,
      follower_count: total_followers || '0',
      engagement_rate: engagement_rate ? parseFloat(engagement_rate) : 0, // Updated this line
      bio,
      instagram_link,
      youtube_link,
      portfolio_link,
      audience_breakdown,
      budget_range,
      collaboration_goals,
      // Keep legacy JSON fields synced just in case, or ignore them. 
      // User didn't ask to remove them, but prioritizing the new columns.
      updated_at: new Date()
    });

    return c.json({ message: "Profile saved successfully", profile });
  } catch (error) {
    console.error("Save Profile Error:", error);
    return c.json({ error: "Failed to save profile", details: error.message }, 500);
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
