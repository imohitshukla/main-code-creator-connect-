import { client } from '../config/database.js';

async function migrate() {
    try {
        console.log('Starting migration: Changing follower_count to VARCHAR...');

        // Change column type to VARCHAR to support "60.7k+"
        await client.query(`
      ALTER TABLE creator_profiles
      ALTER COLUMN follower_count TYPE VARCHAR(255) USING follower_count::varchar;
    `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
