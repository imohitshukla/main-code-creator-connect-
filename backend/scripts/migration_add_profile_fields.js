import { client } from '../config/database.js';

async function migrate() {
    try {
        console.log('Starting migration: Adding missing profile fields...');

        // Add columns if they don't exist
        await client.query(`
      ALTER TABLE creator_profiles
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(255),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS instagram_link VARCHAR(255),
      ADD COLUMN IF NOT EXISTS youtube_link VARCHAR(255),
      ADD COLUMN IF NOT EXISTS portfolio_link VARCHAR(255),
      ADD COLUMN IF NOT EXISTS audience_breakdown TEXT,
      ADD COLUMN IF NOT EXISTS budget_range VARCHAR(255),
      ADD COLUMN IF NOT EXISTS collaboration_goals TEXT;
    `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
