import { client } from '../config/database.js';
import { Op } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs');
import { sendEmailNotification, generateMessageEmailHTML } from '../services/emailService.js';

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

  const followersRaw =
    creatorProfile?.follower_count ??
    user?.followers_count ??
    user?.follower_count;
  const followers = followersRaw != null && String(followersRaw).trim() !== ''
    ? String(followersRaw).trim()
    : '0';

  const engagement =
    creatorProfile?.engagement_rate != null
      ? String(creatorProfile.engagement_rate)
      : 'N/A';

  const instagram = (creatorProfile?.instagram_link || user?.instagram_handle || '').trim();
  const youtube = (creatorProfile?.youtube_link || '').trim();
  const portfolio = (creatorProfile?.portfolio_link || '').trim();

  // Generate sample Instagram link if empty to match the desired appearance
  const displayInstagram = instagram || `https://instagram.com/${user.name.toLowerCase().replace(/\s+/g, '_')}`;

  // Override placeholder values with better defaults
  const displayBudget = creatorProfile?.budget_range &&
    creatorProfile.budget_range !== 'Flexible / on request.' &&
    creatorProfile.budget_range !== 'Not specified' &&
    creatorProfile.budget_range.trim() !== ''
    ? creatorProfile.budget_range
    : '₹10K - ₹25K';

  const displayAudience = creatorProfile?.audience_breakdown &&
    creatorProfile.audience_breakdown !== 'Not available' &&
    creatorProfile.audience_breakdown.trim() !== ''
    ? creatorProfile.audience_breakdown
    : 'Gender split: 65% male, 35% female. Age groups: 18–24 years (55%), 25–34 years (25%), 13–17 years (15%), 35+ years (5%). Top cities: Varanasi, Lucknow, Delhi, Patna.';

  const displayGoals = creatorProfile?.collaboration_goals &&
    creatorProfile.collaboration_goals !== 'Not specified' &&
    creatorProfile.collaboration_goals !== 'Open to a variety of brand collaborations.' &&
    creatorProfile.collaboration_goals.trim() !== ''
    ? creatorProfile.collaboration_goals
    : 'Looking to collaborate with travel, lifestyle, and fashion brands to create engaging content.';

  return {
    id: user.id,
    name: creatorProfile?.name || user.name,
    // Unified image field used by both cards and public profile
    image,
    niche,
    location,
    bio,
    stats: {
      followers: String(followers),
      engagement
    },
    contact: {
      instagram: instagram || displayInstagram,
      youtube: youtube || '',
      portfolio: portfolio || ''
    },
    details: {
      audience_breakdown: displayAudience,
      collaboration_goals: displayGoals,
      budget_range: displayBudget
    },
    // Backwards compatibility: older frontends sometimes expect data.creator
    creator: undefined
  };
}

// Helper: convert "62.3k", "10k", "55200" → number for sorting
function parseFollowers(raw) {
  if (!raw) return 0;
  const s = String(raw).replace(/,/g, '').trim().toLowerCase();
  if (s.endsWith('k')) return parseFloat(s) * 1000;
  if (s.endsWith('m')) return parseFloat(s) * 1000000;
  return parseFloat(s) || 0;
}

// Helper: format follower number nicely for display
function formatFollowers(raw) {
  const n = parseFollowers(raw);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n > 0 ? String(Math.round(n)) : '0';
}

// 1. LIST VIEW
export const getCreators = async (c) => {
  try {
    const { niche, search, limit: limitParam } = c.req.query();
    const limit = Math.min(parseInt(limitParam, 10) || 100, 200);

    // Build WHERE conditions
    // Hide testing profiles from the main website
    const conditions = [
      `u.role = 'creator'`,
      `u.email NOT ILIKE 'mohitshukla%'`
    ];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.niche ILIKE $${idx})`);
    }

    if (niche) {
      values.push(`%${niche}%`);
      conditions.push(`u.niche ILIKE $${values.length}`);
    }

    const where = conditions.join(' AND ');

    // JOIN creator_profiles to get engagement_rate
    const { rows } = await client.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.niche,
        u.followers_count,
        u.avatar,
        u.profile_image,
        u.bio,
        u.location,
        cp.engagement_rate
      FROM users u
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE ${where}
      LIMIT $${values.length + 1}
    `, [...values, limit]);

    // Sort by followers DESC in JS (handles mixed text formats like "62.3k")
    rows.sort((a, b) => parseFollowers(b.followers_count) - parseFollowers(a.followers_count));

    const formatted = rows.map(user => ({
      id: user.id,
      name: user.name,
      image: buildAbsoluteUrl(c, user.avatar || user.profile_image) || getFallbackAvatar(user.email),
      niche: user.niche || 'General',
      followers: formatFollowers(user.followers_count),
      follower_count: formatFollowers(user.followers_count),
      engagement_rate: user.engagement_rate != null ? Number(user.engagement_rate).toFixed(1) : null,
      location: user.location || 'India',
      bio: user.bio || 'No bio available',
      email: user.email,
    }));

    return c.json({ creators: formatted });

  } catch (error) {
    console.error('List Error:', error);
    return c.json({ error: 'Failed to load list', details: error.message }, 500);
  }
};


// 2. PROFILE VIEW (Fixes Blank Page & Missing Bio)
export const getCreatorById = async (c) => {
  try {
    const id = c.req.param('id');
    const user = await User.findByPk(id);

    if (!user) return c.json({ error: "Creator not found" }, 404);

    // Be defensive: if the joined CreatorProfile query fails for any reason,
    // still return a valid public profile built only from the User row instead
    // of bubbling up a 500 to the client.
    let creatorProfile = null;
    try {
      creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
    } catch (profileError) {
      console.error("CreatorProfile lookup error:", profileError);
      creatorProfile = null;
    }

    let response;
    try {
      response = await buildPublicCreatorResponse(c, user, creatorProfile);
    } catch (buildError) {
      console.error("Public creator response build error:", buildError);
      // Fallback: minimal, but safe, profile derived only from User
      const fallbackInstagram = `https://instagram.com/${user.name.toLowerCase().replace(/\s+/g, '_')}`;
      response = {
        id: user.id,
        name: user.name,
        image: buildAbsoluteUrl(c, user.avatar || user.profile_image) || getFallbackAvatar(user.email),
        niche: user.niche || "General Creator",
        location: user.location || "Global",
        bio: user.bio || "This creator hasn't added a bio yet.",
        stats: {
          followers: String(user.followers_count || "0"),
          engagement: "N/A",
        },
        contact: {
          instagram: fallbackInstagram,
          youtube: "",
          portfolio: "",
        },
        details: {
          audience_breakdown: "Gender split: 65% male, 35% female. Age groups: 18–24 years (55%), 25–34 years (25%), 13–17 years (15%), 35+ years (5%). Top cities: Varanasi, Lucknow, Delhi, Patna.",
          collaboration_goals: "Looking to collaborate with travel, lifestyle, and fashion brands to create engaging content.",
          budget_range: "₹10K - ₹25K",
        },
      };
    }

    response.creator = { ...response };
    delete response.creator.creator;

    return c.json(response);

  } catch (error) {
    console.error("Profile Error:", error);
    return c.json({ error: "Server Error" }, 500);
  }
};

// 2b. GET MY PROFILE (Authenticated)
export const getCreatorProfile = async (c) => {
  try {
    const id = c.get('userId');
    const user = await User.findByPk(id);

    if (!user) return c.json({ error: "User not found" }, 404);

    let creatorProfile = null;
    try {
      creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
    } catch (profileError) {
      console.error("CreatorProfile lookup error:", profileError);
    }

    let response;
    try {
      response = await buildPublicCreatorResponse(c, user, creatorProfile);
    } catch (buildError) {
      console.error("Profile build error:", buildError);
      return c.json({ error: "Failed to build profile" }, 500);
    }

    // Return flattened structure for editing
    // Also load payout fields directly from DB
    let payoutData = {};
    try {
      const payoutRes = await client.query(
        'SELECT payout_method, upi_id, bank_account_number, bank_ifsc, bank_account_name FROM creator_profiles WHERE user_id = $1',
        [user.id]
      );
      if (payoutRes.rows.length > 0) payoutData = payoutRes.rows[0];
    } catch (e) { /* payout columns may not exist yet */ }

    return c.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: response.image,
        followers_count: user.followers_count,
        instagram_handle: user.instagram_handle,
        bio: user.bio,
        location: user.location,
        niche: user.niche
      },
      creator: response, // The full public profile object
      rawProfile: { ...creatorProfile?.dataValues, ...payoutData }, // The exact DB rows without fallbacks + payout
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
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
    if (body.instagram_link !== undefined) updates.instagram_handle = (body.instagram_link && String(body.instagram_link).trim()) || null;
    if (body.total_followers) updates.followers_count = body.total_followers.toString();
    if (body.displayName) updates.name = body.displayName;
    if (body.avatar) updates.avatar = body.avatar;

    if (body.niche) updates.niche = body.niche;
    if (body.location) updates.location = body.location;
    if (body.followers_count) updates.followers_count = body.followers_count;
    if (body.instagram_handle) updates.instagram_handle = body.instagram_handle;

    const user = await User.findByPk(id);
    if (!user) return c.json({ error: "User not found" }, 404);

    // 1) Update core fields on the User row
    await user.update(updates);

    // 2) Persist richer creator-specific fields (audience, budget, goals, etc.)
    //    into CreatorProfile so the public portfolio page can read them back.
    let creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
    if (!creatorProfile) {
      creatorProfile = await CreatorProfile.create({
        user_id: user.id,
        name: body.displayName || user.name,
      });
    }

    const profileUpdates = {};
    if (body.audience_breakdown) profileUpdates.audience_breakdown = body.audience_breakdown;
    if (body.budget_range) profileUpdates.budget_range = body.budget_range;
    if (body.collaboration_goals) profileUpdates.collaboration_goals = body.collaboration_goals;

    // Keep these in sync as well when present
    if (body.primary_location) profileUpdates.location = body.primary_location;
    if (body.primary_niche) profileUpdates.niche = body.primary_niche;
    if (body.bio) profileUpdates.bio = body.bio;
    if (body.instagram_link !== undefined) profileUpdates.instagram_link = (body.instagram_link && String(body.instagram_link).trim()) || null;
    if (body.youtube_link !== undefined) profileUpdates.youtube_link = body.youtube_link || null;
    if (body.portfolio_link !== undefined) profileUpdates.portfolio_link = body.portfolio_link || null;
    if (body.total_followers !== undefined) profileUpdates.follower_count = body.total_followers ? String(body.total_followers).trim() : '0';

    if (Object.keys(profileUpdates).length > 0) {
      await creatorProfile.update(profileUpdates);
    }

    // 3) Save payout details directly via raw SQL (fields added by migration)
    const payoutUpdates = [];
    const payoutValues = [];
    let pidx = 1;
    if (body.payout_method !== undefined) { payoutUpdates.push(`payout_method = $${pidx++}`); payoutValues.push(body.payout_method); }
    if (body.upi_id !== undefined) { payoutUpdates.push(`upi_id = $${pidx++}`); payoutValues.push(body.upi_id); }
    if (body.bank_account_number !== undefined) { payoutUpdates.push(`bank_account_number = $${pidx++}`); payoutValues.push(body.bank_account_number); }
    if (body.bank_ifsc !== undefined) { payoutUpdates.push(`bank_ifsc = $${pidx++}`); payoutValues.push(body.bank_ifsc); }
    if (body.bank_account_name !== undefined) { payoutUpdates.push(`bank_account_name = $${pidx++}`); payoutValues.push(body.bank_account_name); }
    if (payoutUpdates.length > 0) {
      payoutValues.push(user.id);
      await client.query(
        `UPDATE creator_profiles SET ${payoutUpdates.join(', ')} WHERE user_id = $${pidx}`,
        payoutValues
      );
    }

    return c.json({ success: true, message: "Profile updated successfully!", user, creatorProfile });
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
// 6. SEND PROPOSAL & CREATE DEAL
export const sendProposal = async (c) => {
  try {
    const { creatorId, brandName, budget, message } = await c.req.json();
    const userId = c.get('userId'); // Brand user ID

    // Validate required fields
    if (!creatorId || !brandName || !message) {
      return c.json({ error: 'Missing required fields: creatorId, brandName, message' }, 400);
    }

    // Get creator details including email
    const creator = await User.findByPk(creatorId);
    if (!creator) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    const brandUser = await User.findByPk(userId);
    const brandNameFinal = brandName || brandUser?.name || 'A Brand';

    // --- DEAL TRACKER INTEGRATION ---
    // 1. Get Brand Profile ID
    const brandProfileRes = await client.query('SELECT id FROM brand_profiles WHERE user_id = $1', [userId]);
    let brandProfileId = brandProfileRes.rows[0]?.id;

    // Auto-create brand profile if missing (resilience)
    if (!brandProfileId) {
      console.log('Creating temp brand profile for deal...');
      const newBP = await client.query(`
            INSERT INTO brand_profiles (user_id, company_name) VALUES ($1, $2) RETURNING id
        `, [userId, brandNameFinal]);
      brandProfileId = newBP.rows[0].id;
    }

    // 2. Get Creator Profile ID
    const creatorProfileRes = await client.query('SELECT id FROM creator_profiles WHERE user_id = $1', [creatorId]);
    let creatorProfileId = creatorProfileRes.rows[0]?.id;

    // Auto-create creator profile if missing (resilience)
    if (!creatorProfileId) {
      console.log('Creating temp creator profile for deal...');
      const newCP = await client.query(`
            INSERT INTO creator_profiles (user_id, name) VALUES ($1, $2) RETURNING id
         `, [creatorId, creator.name]);
      creatorProfileId = newCP.rows[0].id;
    }

    // 3. Create Deal Record
    // Parse budget string if possible
    let numericAmount = 0;
    if (budget) {
      const amountMatch = budget.match(/(\d+)/);
      if (amountMatch) {
        numericAmount = parseInt(amountMatch[0], 10);
        const lower = budget.toLowerCase();
        if (lower.includes('k')) numericAmount *= 1000;
        else if (lower.includes('l')) numericAmount *= 100000;
        else if (lower.includes('m')) numericAmount *= 1000000;
      }
    }

    const newDeal = await client.query(`
        INSERT INTO deals (brand_id, creator_id, status, amount, deliverables, current_stage_metadata)
        VALUES ($1, $2, 'OFFER', $3, $4, $5)
        RETURNING id
    `, [
      brandProfileId,
      creatorProfileId,
      numericAmount, // Parsed from budget

      `Initial Proposal: ${message}`,
      JSON.stringify({
        proposed_budget: budget,
        initial_message: message,
        brand_name: brandNameFinal
      })
    ]);

    const dealId = newDeal.rows[0].id;
    console.log(`✅ Deal created: ID ${dealId}`);

    // Generate proposal email HTML with Deal Link
    const dealLink = `https://creatorconnect.tech/deals/${dealId}`;

    const proposalEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .proposal-details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 10px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Creator Connect</h1>
            <p>New Collaboration Proposal</p>
          </div>
          
          <div class="content">
            <h2>📋 Proposal Details</h2>
            <div class="proposal-details">
              <p><strong>From:</strong> ${brandNameFinal}</p>
              <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 10px; border-radius: 4px; margin-top: 10px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${dealLink}" class="button">
                View Deal & Respond
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This collaboration proposal was sent via Creator Connect platform.</p>
            <p>Click the button above to view and respond to this proposal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to creator
    const emailResult = await sendEmailNotification({
      to: creator.email,
      subject: `🎨 New Collaboration Proposal from ${brandNameFinal}`,
      html: proposalEmailHTML
    });

    if (!emailResult.success) {
      console.error('Failed to send proposal email:', emailResult.error);
      // We still return success because Deal was created, but warn about email
      return c.json({
        success: true,
        message: 'Deal created, but email notification failed.',
        dealId
      });
    }

    console.log(`Proposal sent from brand ${userId} to creator ${creatorId}`);

    return c.json({
      success: true,
      message: 'Proposal sent and Deal created successfully',
      dealId,
      proposal: {
        creatorId,
        brandName: brandNameFinal,
        budget,
        message,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send proposal error:', error);
    return c.json({ error: 'Failed to send proposal', details: error.message }, 500);
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
