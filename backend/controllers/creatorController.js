import { client } from '../config/database.js';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs');

// 1. LIST VIEW (Fixes "0 Followers" on the cards)
// Backend for /api/creators?search=...
export const getCreators = async (c) => {
  try {
    const { niche, search } = c.req.query();

    // Explicitly fetching columns needed for the card
    // Removing 'role' check if it was causing issues, or keeping it if safe. 
    // User requested removing it in "Safe Mode", but here they just said "Replace".
    // I'll keep it simple: findAll users.
    const whereClause = {};
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
      attributes: ['id', 'name', 'profile_image', 'avatar', 'niche', 'followers_count', 'location', 'bio', 'email']
    });

    const formatted = users.map(user => ({
      id: user.id,
      name: user.name,
      // Logic from user snippet + fallback
      image: user.profile_image || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      niche: user.niche || "General",
      // Map BOTH followers (for new frontend) and follower_count (for existing Filter.tsx)
      followers: user.followers_count || "0",
      follower_count: user.followers_count || "0",
      location: user.location || "India",
      bio: user.bio || "No bio available"
    }));

    // Return wrapped object because Filter.tsx expects data.creators.map
    return c.json({ creators: formatted });

  } catch (error) {
    console.error("List Error:", error);
    return c.json({ error: "Failed to load list", details: error.message }, 500);
  }
};

// 2. PROFILE VIEW (Fixes Blank Page & Missing Bio)
export const getCreatorById = async (c) => {
  try {
    const id = c.req.param('id');
    const user = await User.findByPk(id);

    if (!user) return c.json({ error: "Creator not found" }, 404);

    // ✅ STRICT JSON STRUCTURE matching frontend expectation
    const response = {
      id: user.id,
      name: user.name,
      image: user.profile_image || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      niche: user.niche || "General Creator",
      location: user.location || "Global",
      bio: user.bio || "This creator hasn't added a bio yet.",
      // The frontend expects a 'stats' object. We must provide it.
      stats: {
        followers: user.followers_count || "0", // Maps DB column to Frontend key
        engagement: "N/A"
      },
      contact: {
        instagram: user.instagram_handle || "#"
      },
      // Keep details to prevent crash if other components use it
      details: {
        audience_breakdown: "Not available",
        collaboration_goals: "Not specified"
      }
    };

    return c.json({ creator: response }); // Frontend fetching /api/creators/:id needs to extract this?
    // User Step 2 Code: .then(res => res.json()).then(data => setCreator(data));
    // User Step 2 Code also says: if (!creator || !creator.name) ...
    // If I return { creator: { name: ... } }, then data.name is undefined.
    // I MUST return the object DIRECTLY for the NEW Frontend.
    // BUT previous frontend (PublicProfile.tsx in Step 982) did `setCreator(data.creator || data)`.
    // The NEW frontend code provided in this prompt (Step 1044) does `setCreator(data)`.
    // So I should return the object directly: `c.json(response)`.
    // BUT wait, `Filter.tsx` (List) expects `{ creators: [] }`. That is a different route.
    // So `getCreators` (List) -> `{ creators: [] }`.
    // `getCreatorById` (Profile) -> `response` (Flat Object).
    // I will do that.
    return c.json(response);

  } catch (error) {
    console.error("Profile Error:", error);
    return c.json({ error: "Server Error" }, 500);
  }
};

// 3. SAVE: Update Profile (Preserved)
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
    return c.json({ success: true, message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Update Error:", error);
    return c.json({ error: "Failed to update profile", details: error.message }, 500);
  }
};

// 4. GET BY USERNAME (Preserved)
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
    return c.json({ error: "Server Error" }, 500);
  }
};

// 5. VERIFY CREATOR (Preserved)
export const verifyCreator = async (c) => {
  try {
    return c.json({ message: 'Creator verified successfully (Mock)' });
  } catch (error) {
    return c.json({ error: 'Failed to verify creator' }, 500);
  }
};

// 6. GET VERIFIED CREATORS (Preserved)
export const getVerifiedCreators = async (c) => {
  try {
    return c.json({ creators: [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch verified creators' }, 500);
  }
};
