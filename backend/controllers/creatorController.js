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

    // 2. Add Search Logic (User Table Only)
    // We search directly in the columns we just added to the User table
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } }, // User table has name
        { niche: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (niche) {
      whereClause.niche = { [Op.iLike]: `%${niche}%` };
    }

    // 3. The Query (Single Table - No Joins to CreatorProfile)
    // This fixes "CreatorProfile is not associated to User" error
    const creators = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'avatar', 'profile_image', 'niche', 'location', 'followers_count', 'instagram_handle']
    });

    // 4. Format for Frontend
    const formattedCreators = creators.map(user => ({
      id: user.id,
      name: user.name,
      // Handle fallback from profile_image to avatar to gravatar
      image: user.profile_image || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      niche: user.niche || 'General Creator',
      location: user.location || 'India',
      followers: user.followers_count || '0',
      engagement_rate: 0, // Placeholder as we aren't joining profile
      bio: 'Verified Creator', // Placeholder
      portfolio_links: [],
      social_links: user.instagram_handle ? { instagram: user.instagram_handle } : {}
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

    // 1. Fetch the Core User (The "Product")
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'avatar', 'niche', 'location', 'followers_count']
    });

    if (!user) {
      return c.json({ error: "Creator not found" }, 404);
    }

    // 2. Fetch the Details (The "Specs")
    // We query separately to prevent JOIN crashes if profile is missing.
    // Note: Model uses 'user_id' as foreign key
    const profile = await CreatorProfile.findOne({ where: { user_id: id } });

    // 3. Merge & Standardize (The "Amazon Response")
    const response = {
      id: user.id,
      name: user.name || "Creator",
      image: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      avatar: user.avatar, // Keep for SmartAvatar

      // Prefer User table data (Single Table Truth)
      niche: user.niche || profile?.niche || "General Creator",
      location: user.location || profile?.location || "India",
      bio: profile?.bio || "No bio added yet.",

      stats: {
        followers: user.followers_count || profile?.follower_count || "0",
        engagement: profile?.engagement_rate || "N/A"
      },
      pricing: {
        budget: profile?.budget_range || "Open to offers"
      },
      contact: {
        email: user.email,
        instagram: user.instagram_handle || profile?.instagram_link || "",
        youtube: profile?.youtube_link || "",
        portfolio: profile?.portfolio_link || ""
      },
      details: {
        audience_breakdown: profile?.audience_breakdown,
        collaboration_goals: profile?.collaboration_goals
      },
      is_verified: profile?.is_verified
    };

    return c.json({ creator: response }); // Frontend expects { creator: ... }
  } catch (error) {
    console.error("❌ PROFILE LOAD ERROR:", error);
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

    // 1. Sync CRITICAL Data to User Table (The "Single Table Truth")
    // We update the User table so the fast 'getCreatorById' sees this data instantly.
    const userUpdates = {
      // Always update timestamp
      updated_at: new Date()
    };

    if (displayName) userUpdates.name = displayName;
    if (avatar) userUpdates.avatar = avatar; // Or profile_image, depending on what we decided, sticking to avatar/db column
    if (primary_niche) userUpdates.niche = primary_niche;
    if (primary_location) userUpdates.location = primary_location;
    if (total_followers) userUpdates.followers_count = total_followers.toString();
    if (bio) userUpdates.bio = bio;
    if (instagram_link) userUpdates.instagram_handle = instagram_link; // Map link/handle

    // Perform User Update
    await User.update(userUpdates, { where: { id: userId } });
    console.log(`✅ Synced User Table for ID ${userId}`);


    // 2. Update/Upsert CreatorProfile Table (Legacy/Extended Data)
    // We keep this for backward compatibility and for fields that don't exist in User table (like audience_breakdown)
    // Note: We might have removed the association Model side, but the TABLE likely still exists.
    // If we removed the 'CreatorProfile' import or association, this might fail if we try to use the Model.
    // Assuming CreatorProfile model is still imported at the top (it was in Step 951).
    // If the User model lost association, we can still query CreatorProfile directly by user_id if the model exists.

    const [profile, created] = await CreatorProfile.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, name: displayName || 'Creator' }
    });

    await profile.update({
      phone_number,
      location: primary_location,
      niche: primary_niche,
      follower_count: total_followers || '0',
      bio,
      instagram_link,
      youtube_link,
      portfolio_link,
      audience_breakdown,
      budget_range,
      collaboration_goals,
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
