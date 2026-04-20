import { client } from '../config/database.js';

/**
 * External Proxy/Scraping Interface (Simulated RapidAPI / Instaloader logic)
 * In a production setting with a paid RapidAPI key, you would swap this logic 
 * out for an Axios fetch to: https://instagram-data-scraper-api.p.rapidapi.com/v1/profile
 */
async function fetchSocialMetrics(creator) {
    console.log(`[EngUpdater] 🌐 Fetching social metrics for ${creator.instagram_handle || creator.name}...`);
    
    // Simulate network delay for API proxy
    await new Promise(resolve => setTimeout(resolve, 800));

    // Convert follower format (e.g. "50k", "1m") to number
    let followersRaw = creator.followers_count || '0';
    let followersNum = 0;
    
    const s = String(followersRaw).replace(/,/g, '').trim().toLowerCase();
    if (s.endsWith('k')) followersNum = parseFloat(s) * 1000;
    else if (s.endsWith('m')) followersNum = parseFloat(s) * 1000000;
    else followersNum = parseFloat(s) || 1000; // Default 1000 minimum if parsed fails

    // Realistic engagement algorithms: 
    // Small creators (< 10k) usually have high engagement (4% - 8%)
    // Mid creators (10k - 100k) have medium engagement (2% - 5%)
    // Large creators (> 100k) have lower engagement (1% - 3%)
    let baseRate = 2.5;

    if (followersNum < 10000) {
        baseRate = 5.0;
    } else if (followersNum < 100000) {
        baseRate = 3.5;
    } else if (followersNum < 500000) {
        baseRate = 2.0;
    } else {
        baseRate = 1.2;
    }

    const seed = creator.name.charCodeAt(0) + creator.id;
    const variance = (seed % 100) / 100; // Value between 0 and 0.99
    
    // Calculate final rate with variance
    const finalRate = baseRate * (0.75 + (variance * 0.5));
    const clampedRate = Math.max(0.5, Math.min(12.0, finalRate));

    // Simulate organic follower growth or churn (-1% to +3% weekly)
    const growthFactor = 0.99 + (Math.random() * 0.04);
    const newFollowersNum = Math.max(10, Math.floor(followersNum * growthFactor));
    
    // Format back to K/M if desired, or keep as string format
    let formattedFollowers = newFollowersNum.toString();
    if (newFollowersNum >= 1000000) {
        formattedFollowers = (newFollowersNum / 1000000).toFixed(1) + 'M';
    } else if (newFollowersNum >= 10000) {
        formattedFollowers = (newFollowersNum / 1000).toFixed(1) + 'k';
    }

    // Simulate a 5% chance of the Instagram API failing or account being private
    if (Math.random() < 0.05) {
        throw new Error("ACCOUNT_PRIVATE_OR_NOT_FOUND");
    }
    
    return {
        engagement_rate: parseFloat(clampedRate.toFixed(2)),
        follower_count: formattedFollowers
    };
}

export const runEngagementRateUpdater = async () => {
    const summary = { processed: 0, updated: 0, errors: 0, details: [] };
    
    try {
        console.log('\n[EngUpdater] 🔄 Starting API Sync Job (Followers & Engagement)...');
        
        // 1. Find ALL creator profiles to sync, bounded to 200 at a time to prevent timeout limits
        const { rows: creators } = await client.query(`
            SELECT cp.id as profile_id, u.id, u.name, u.followers_count, u.niche, u.instagram_handle, cp.engagement_rate
            FROM creator_profiles cp
            JOIN users u ON cp.user_id = u.id
            WHERE u.role = 'creator'
            LIMIT 200
        `);

        if (creators.length === 0) {
            console.log('[EngUpdater] ✅ No creator profiles found to sync.');
            return summary;
        }

        console.log(`[EngUpdater] 🔍 Initiating external API sync for ${creators.length} creators...`);
        summary.processed = creators.length;

        // 2. Loop through all creators and fetch latest metrics
        for (const creator of creators) {
            try {
                // External proxy fetch logic
                const { engagement_rate, follower_count } = await fetchSocialMetrics(creator);
                
                // 3. Update the database securely using PG Driver
                // Note: We also sync followers back to the User table to ensure parity
                await client.query('BEGIN');
                
                await client.query(`
                    UPDATE creator_profiles 
                    SET 
                        engagement_rate = $1, 
                        follower_count = $2,
                        last_updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                `, [engagement_rate, follower_count, creator.profile_id]);

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
        console.error('[EngUpdater] 🚨 Critical Error in Auto-Engagement Rate Job:', error);
        summary.errors++;
        summary.details.push({ error: error.message });
        return summary;
    }
};
