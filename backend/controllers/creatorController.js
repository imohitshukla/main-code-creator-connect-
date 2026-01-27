import { client } from '../config/database.js';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs');

function buildAbsoluteUrl(c, maybeRelativeUrl) {
  if (!maybeRelativeUrl) return '';
  const value = String(maybeRelativeUrl).trim();
  if (!value) return '';

  // Already absolute
  if (/^https?:\/\//i.test(value)) return value;

  // Normalize "uploads/..." -> "/uploads/..."
  const normalized = value.startsWith('uploads/') ? `/${value}` : value;

  // If it's a root-relative path (e.g. "/uploads/x.png"), prefix API origin.
  if (normalized.startsWith('/')) {
    if (!c) return normalized;
    const origin = new URL(c.req.url).origin;
    return `${origin}${normalized}`;
  }

  // As-is fallback
  return normalized;
}

function getFallbackAvatar(email) {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(email || 'user')}`;
}

async function buildPublicCreatorResponse(c, user, creatorProfile) {
  const email = user?.email || '';
  // Prefer the most recently updated avatar over legacy profile_image
  const profileImage =
    creatorProfile?.avatar ||
    creatorProfile?.profile_image ||
    user?.avatar ||
    user?.profile_image ||
    '';

  const image = buildAbsoluteUrl(c, profileImage) || getFallbackAvatar(email);

  const niche = creatorProfile?.niche || user?.niche || 'General Creator';
  const location = creatorProfile?.location || user?.location || 'Global';
  const bio =
    creatorProfile?.bio ||
    user?.bio ||
    "This creator hasn't added a bio yet.";

  const followers =
    creatorProfile?.follower_count ||
    user?.followers_count ||
    '0';

  const engagement =
    creatorProfile?.engagement_rate != null
      ? String(creatorProfile.engagement_rate)
      : 'N/A';

  const instagram =
    creatorProfile?.instagram_link ||
    user?.instagram_handle ||
    '';

  const youtube = creatorProfile?.youtube_link || '';
  const portfolio = creatorProfile?.portfolio_link || '';

  return {
    id: user.id,
    name: creatorProfile?.name || user.name,
    // Unified image field used by both cards and public profile
    image,
    niche,
    location,
    bio,
    stats: {
      followers: String(followers || '0'),
      engagement
    },
    contact: {
      instagram: instagram || '#',
      youtube: youtube || '#',
      portfolio: portfolio || '#'
    },
    details: {
      audience_breakdown: creatorProfile?.audience_breakdown || 'Not available',
      collaboration_goals: creatorProfile?.collaboration_goals || 'Not specified',
      budget_range: creatorProfile?.budget_range || 'Not specified'
    },
    // Backwards compatibility: older frontends sometimes expect data.creator
    creator: undefined
  };
}

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
      // Prefer `avatar` over legacy `profile_image` so newly uploaded photos win
      image: buildAbsoluteUrl(c, user.avatar || user.profile_image) || getFallbackAvatar(user.email),
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

    const creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
    const response = await buildPublicCreatorResponse(c, user, creatorProfile);
    response.creator = { ...response };
    delete response.creator.creator;

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

    // Sequelize will map this to `updated_at` because the User model
    // is configured with `updatedAt: 'updated_at'`.
    const updates = { updatedAt: new Date() };

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

    const creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
    const response = await buildPublicCreatorResponse(c, user, creatorProfile);
    response.creator = { ...response };
    delete response.creator.creator;

    return c.json(response);
  } catch (error) {
    return c.json({ error: "Server Error" }, 500);
  }
};

// 4b. GET BY IDENTIFIER (id or username/email)
export const getCreatorByIdentifier = async (c) => {
  try {
    const identifier = c.req.param('identifier');
    if (!identifier) return c.json({ error: 'Creator not found' }, 404);

    let user;
    if (/^\d+$/.test(identifier)) {
      user = await User.findByPk(identifier);
    } else {
      user = await User.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { name: identifier }]
        }
      });
    }

    if (!user) return c.json({ error: 'Creator not found' }, 404);

    const creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
    const response = await buildPublicCreatorResponse(c, user, creatorProfile);
    response.creator = { ...response };
    delete response.creator.creator;

    return c.json(response);
  } catch (error) {
    console.error('Identifier Error:', error);
    return c.json({ error: 'Server Error' }, 500);
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
