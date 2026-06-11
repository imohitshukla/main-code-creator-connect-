import { client } from '../config/database.js';

/**
 * Idempotent migration for Creator Analytics and Cache tables.
 * Safe to run on every server startup.
 */
export async function migrateAnalyticsCache() {
  try {
    console.log('🔄 [MIGRATION] Running analytics cache tables migration...');

    // 1. Create creator_analytics_cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS creator_analytics_cache (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        platform VARCHAR(20) NOT NULL, -- 'instagram', 'youtube'
        platform_handle VARCHAR(255),
        raw_data JSONB NOT NULL, -- Full API response
        follower_count INTEGER,
        following_count INTEGER,
        post_count INTEGER,
        recent_posts JSONB, -- Unified recent posts JSON list
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
        UNIQUE(creator_id, platform)
      );
    `);

    // Indexes for cache lookups
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cache_creator ON creator_analytics_cache(creator_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cache_expires ON creator_analytics_cache(expires_at);`);

    console.log('✅ [MIGRATION] creator_analytics_cache table ready');

    // 2. Add computed analytics columns to creator_profiles if they do not exist
    const columns = [
      { name: 'computed_engagement_rate', type: 'DECIMAL(5,2)' },
      { name: 'avg_views_per_post', type: 'INTEGER' },
      { name: 'posting_frequency', type: 'DECIMAL(4,2)' }, // posts per week
      { name: 'growth_rate', type: 'DECIMAL(5,2)' }, // % monthly
      { name: 'audience_quality_score', type: 'DECIMAL(3,2)' }, // 0 to 1
      { name: 'last_analytics_run', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'analytics_summary', type: 'JSONB' }
    ];

    for (const col of columns) {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'creator_profiles' AND column_name = '${col.name}'
          ) THEN
            ALTER TABLE creator_profiles ADD COLUMN ${col.name} ${col.type};
          END IF;
        END $$;
      `);
    }

    console.log('✅ [MIGRATION] creator_profiles analytical columns ready');
    console.log('✅ [MIGRATION] Creator analytics migrations completed successfully');
  } catch (error) {
    console.error('❌ [MIGRATION] Analytics cache tables migration error:', error.message);
  }
}
