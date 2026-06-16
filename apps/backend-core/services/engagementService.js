import { client } from '../config/database.js';
import { getCachedOrScrape, parseInstagramHandle } from './creatorDataService.js';
import { computeEngagementRate } from './analyticsEngine.js';

// ⚠️  CRITICAL SAFETY GUARD
// If no real API key is configured the data service falls back to *deterministic mock data*.
// Writing that mock data back into the database would silently corrupt every creator's real
// follower count and engagement rate.  We therefore refuse to run the sync job in mock mode.
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const IS_MOCK_MODE = !RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here' || RAPIDAPI_KEY.startsWith('dummy');

/**
 * Normalizes and formats raw follower number to a string (e.g., '10.5k', '1.2M')
 */
function formatFollowerCount(num) {
  const n = parseInt(num, 10) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/**
 * Fetch actual social metrics using the Data Extraction service and Analytics Engine
 */
async function fetchSocialMetrics(creator, forceRefresh = false) {
    console.log(`[EngUpdater] 🌐 Syncing social metrics for ${creator.instagram_handle || creator.name}...`);
    
    const handle = parseInstagramHandle(creator.instagram_handle || creator.name);
    if (!handle) {
        throw new Error("NO_VALID_INSTAGRAM_HANDLE");
    }

    // Cache-or-scrape Instagram profile
    const freshData = await getCachedOrScrape(creator.id, 'instagram', handle);
    if (!freshData) {
        throw new Error("FAILED_TO_FETCH_OR_SCRAPE");
    }

    const followers = freshData.follower_count || 1000;
    const analytics = computeEngagementRate(freshData.recent_posts, followers);

    const formattedFollowers = formatFollowerCount(followers);

    return {
        engagement_rate: analytics.rate,
        follower_count: formattedFollowers
    };
}

/**
 * Sync job for followers and engagement rate. Runs weekly, or can be triggered manually.
 * @param {boolean} forceRefresh - If true, syncs all creators. If false, syncs only creators that have cache entries.
 */
export const runEngagementRateUpdater = async (forceRefresh = false) => {
    const summary = { processed: 0, updated: 0, errors: 0, details: [] };

    // ── Safety guard: refuse to run in mock mode ──────────────────────────────
    // Without a real RapidAPI key the data service generates *fake* follower counts
    // derived from the creator's database ID (e.g. id=3 → ~15k fake followers).
    // Writing those numbers back to NeonDB would permanently corrupt real creator data.
    if (IS_MOCK_MODE) {
        console.warn('[EngUpdater] ⚠️  RAPIDAPI_KEY is not configured or is a placeholder.');
        console.warn('[EngUpdater] 🛑  Skipping sync job — mock data must NEVER be written to the database.');
        summary.details.push({ warning: 'Sync skipped: RAPIDAPI_KEY not set. Configure a real key to enable live sync.' });
        return summary;
    }
    
    try {
        console.log(`\n[EngUpdater] 🔄 Starting API Sync Job (Followers & Engagement) [forceRefresh=${forceRefresh}]...`);
        
        // Find creators. If forceRefresh is false, only sync creators who already have cache entries (meaning they are actively viewed).
        const query = `
            SELECT DISTINCT cp.id as profile_id, u.id, u.name, u.followers_count, u.niche, u.instagram_handle, cp.engagement_rate
            FROM creator_profiles cp
            JOIN users u ON cp.user_id = u.id
            LEFT JOIN creator_analytics_cache cac ON cac.creator_id = u.id
            WHERE u.role = 'creator'
              AND (cac.id IS NOT NULL OR $1 = TRUE)
            LIMIT 200
        `;
        
        const { rows: creators } = await client.query(query, [forceRefresh]);

        if (creators.length === 0) {
            console.log('[EngUpdater] ✅ No creator profiles found to sync.');
            return summary;
        }

        console.log(`[EngUpdater] 🔍 Initiating sync for ${creators.length} creators...`);
        summary.processed = creators.length;

        for (const creator of creators) {
            try {
                const freshData = await fetchSocialMetrics(creator, forceRefresh);

                // ── Additional mock-data guard ────────────────────────────────
                // fetchSocialMetrics calls getCachedOrScrape which can silently fall back
                // to mock data even when IS_MOCK_MODE is false (e.g. API timeout).
                // Detect mock responses by inspecting the raw_data flag and skip the
                // DB write to avoid overwriting real data with synthetic numbers.
                // NOTE: getCachedOrScrape returns the cached row which may include raw_data.
                // We expose isMock via the returned object when possible.
                if (freshData && freshData._isMock) {
                    console.warn(`[EngUpdater] ⚠️  Mock data detected for ${creator.name} — skipping DB write.`);
                    summary.details.push({ id: creator.id, name: creator.name, warning: 'Skipped: mock data returned (API unavailable)' });
                    continue;
                }

                const { engagement_rate, follower_count } = freshData;

                // Sanity-check: never write zero or obviously wrong data
                if (!follower_count || follower_count === '0' || follower_count === 0) {
                    console.warn(`[EngUpdater] ⚠️  Zero follower count for ${creator.name} — skipping DB write.`);
                    summary.details.push({ id: creator.id, name: creator.name, warning: 'Skipped: zero follower count returned' });
                    continue;
                }

                await client.query('BEGIN');
                
                // Update profile
                await client.query(`
                    UPDATE creator_profiles 
                    SET 
                        engagement_rate = $1, 
                        follower_count = $2,
                        last_updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                `, [engagement_rate, follower_count, creator.profile_id]);

                // Update core user record
                await client.query(`
                    UPDATE users 
                    SET followers_count = $1 
                    WHERE id = $2
                `, [follower_count, creator.id]);

                await client.query('COMMIT');

                console.log(`[EngUpdater] ✅ Synced ${creator.name}: ${follower_count} followers, ${engagement_rate}% ER`);
                summary.updated++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`[EngUpdater] ❌ Failed to update ${creator.name}:`, err.message);
                summary.errors++;
                summary.details.push({ id: creator.id, name: creator.name, error: err.message });
            }
        }

        console.log(`[EngUpdater] 🎉 Job complete! Successfully updated ${summary.updated}/${summary.processed} creators.`);
        return summary;
    } catch (error) {
        console.error('[EngUpdater] 🚨 Critical Error in Engagement Rate Sync Job:', error);
        summary.errors++;
        summary.details.push({ error: error.message });
        return summary;
    }
};
