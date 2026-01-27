import { client } from '../config/database.js';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs');

// 1. SEARCH: Safe Mode (Debug 500 Error)
export const getCreators = async (c) => {
  try {
    console.log("🔍 Attempting to fetch creators (Safe Mode)...");

    // 1. Fetch ALL users first (Removing 'where' clause to prevent crashes)
    // We select only the columns we verified exist in your SQL console
    // Explicitly avoiding 'role' check for now to debug
    const users = await User.findAll({
      attributes: ['id', 'name', 'profile_image', 'avatar', 'niche', 'followers_count', 'location', 'email']
    });

    console.log(`✅ Found ${users.length} users.`);

    // 2. Format the data safely
    const formatted = users.map(u => ({
      id: u.id,
      name: u.name || "Anonymous",
      image: u.profile_image || u.avatar || `https://i.pravatar.cc/150?u=${u.email}`,
      niche: u.niche || "General",
      followers: u.followers_count || "0",
      location: u.location || "India"
    }));

    return c.json({ creators: formatted });

  } catch (error) {
    console.error("🔥 SEARCH API CRASH:", error);

    // Send the ACTUAL error details to the frontend so we can see it
    return c.json({
      error: "Failed to load creators",
      details: error.message,
      suggestion: "Check if table 'users' exists and has columns: niche, location"
    }, 500);
  }
};

// 2. VIEW: Get Single Profile
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

// 3. SAVE: Update Profile
export const updateCreatorProfile = async (c) => {
  try {
    const id = c.get('userId');
    const body = await c.req.json();

    const updates = { updated_at: new Date() };

    if (body.primary_niche) updates.niche = body.primary_niche;
    if (body.primary_location) updates.location = body.primary_location;
    if (body.bio) updates.bio = body.bio;
    if (body.instagram_link) updates.instagram_handle = body.instagram_link;
    if (body.total_followers) updates.followers_count = body.total_followers.toString();
    if (body.displayName) updates.name = body.displayName;
    if (body.avatar) updates.avatar = body.avatar;

    if (body.niche) updates.niche = body.niche;
    if (body.location) updates.location = body.location;
    if (body.followers_count) updates.followers_count = body.followers_count;
    if (body.instagram_handle) updates.instagram_handle = body.instagram_handle;

    const user = await User.findByPk(id);
    if (!user) return c.json({ error: "User not found" }, 404);

    await user.update(updates);

    console.log(`✅ Profile Updated for User ${id}`);

    return c.json({ success: true, message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Update Error:", error);
    return c.json({ error: "Failed to update profile", details: error.message }, 500);
  }
};

// 4. GET BY USERNAME
export const getCreatorByUsername = async (c) => {
  try {
    const username = c.req.param('username');
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: username },
          { name: username }
        ]
      }
    });

    if (!user) return c.json({ error: "Creator not found" }, 404);

    const response = {
      id: user.id,
      name: user.name,
      image: user.profile_image || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      niche: user.niche || "General",
      bio: user.bio || "",
      stats: { followers: user.followers_count || "0" },
      contact: { instagram: user.instagram_handle || "#" }
    };

    return c.json({ creator: response });
  } catch (error) {
    console.error("Get By Username Error:", error);
    return c.json({ error: "Server Error" }, 500);
  }
};

// 5. VERIFY CREATOR
export const verifyCreator = async (c) => {
  try {
    return c.json({ message: 'Creator verified successfully (Mock)' });
  } catch (error) {
    return c.json({ error: 'Failed to verify creator' }, 500);
  }
};

// 6. GET VERIFIED CREATORS
export const getVerifiedCreators = async (c) => {
  try {
    return c.json({ creators: [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch verified creators' }, 500);
  }
};
