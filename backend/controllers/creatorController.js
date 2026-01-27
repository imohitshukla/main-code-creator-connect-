import { client } from '../config/database.js';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs'); // Keep CreatorProfile import just in case, but main logic uses User

// 1. SEARCH: Get all creators for the list
export const getCreators = async (c) => {
  try {
    const { niche, search } = c.req.query();

    const whereClause = { role: 'creator' };

    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
        { niche: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (niche) {
      whereClause.niche = { [Op.iLike]: `%${niche}%` };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'profile_image', 'avatar', 'niche', 'followers_count', 'location', 'email']
    });

    // Format for frontend
    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      // Handle various image sources
      image: u.profile_image || u.avatar || `https://i.pravatar.cc/150?u=${u.email}`,
      niche: u.niche || "General",
      followers: u.followers_count || "0",
      location: u.location || "India"
    }));

    return c.json({ creators: formatted });
  } catch (error) {
    console.error("Search Error:", error);
    return c.json({ error: "Failed to load creators" }, 500);
  }
};

// 2. VIEW: Get Single Profile (Fixes "Divyansh not showing")
export const getCreatorById = async (c) => {
  try {
    const id = c.req.param('id');
    const user = await User.findByPk(id);

    if (!user) return c.json({ error: "Creator not found" }, 404);

    const response = {
      id: user.id,
      name: user.name,
      image: user.profile_image || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      niche: user.niche || "General Creator",
      location: user.location || "India",
      bio: user.bio || "No bio added yet.",
      stats: {
        followers: user.followers_count || "0",
        engagement: "N/A"
      },
      contact: {
        instagram: user.instagram_handle || "#"
      },
      // Frontend expects these to avoid crash
      details: {
        audience_breakdown: "Not available",
        collaboration_goals: "Not specified"
      }
    };

    return c.json({ creator: response });
  } catch (error) {
    console.error("Profile Load Error:", error);
    return c.json({ error: "Server Error" }, 500);
  }
};

// 3. SAVE: Update Profile (Fixes "Failed to save profile")
export const updateCreatorProfile = async (c) => {
  try {
    // Middleware attaches userId to context
    const id = c.get('userId');

    // Get data from frontend form
    // Note: Frontend sends snake_case or specific names, we must map them IF they differ.
    // Based on previous code, frontend sends: primary_niche, primary_location, total_followers, bio, instagram_link
    const body = await c.req.json();

    // Map Frontend fields to DB fields
    const updates = {
      updated_at: new Date()
    };

    if (body.primary_niche) updates.niche = body.primary_niche;
    if (body.primary_location) updates.location = body.primary_location;
    if (body.bio) updates.bio = body.bio;
    if (body.instagram_link) updates.instagram_handle = body.instagram_link;
    if (body.total_followers) updates.followers_count = body.total_followers.toString();
    if (body.displayName) updates.name = body.displayName;
    if (body.avatar) updates.avatar = body.avatar; // if using SmartAvatar

    // Also support direct naming if frontend changes
    if (body.niche) updates.niche = body.niche;
    if (body.location) updates.location = body.location;
    if (body.followers_count) updates.followers_count = body.followers_count;
    if (body.instagram_handle) updates.instagram_handle = body.instagram_handle;

    const user = await User.findByPk(id);
    if (!user) return c.json({ error: "User not found" }, 404);

    // Update the USER table directly (No CreatorProfile table needed)
    await user.update(updates);

    console.log(`✅ Profile Updated for User ${id}`);

    return c.json({ success: true, message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Update Error:", error);
    return c.json({ error: "Failed to update profile", details: error.message }, 500);
  }
};
