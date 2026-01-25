import { client } from '../config/database.js';

async function migrate() {
    try {
        await client.connect();
        console.log('✅ Connected to DB');

        console.log('--- RUNNING MIGRATION PHASE 2 ---');

        // Check if instagram_handle exists
        const check = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'instagram_handle';
    `);

        if (check.rows.length === 0) {
            await client.query(`ALTER TABLE "users" ADD COLUMN "instagram_handle" VARCHAR(255);`);
            console.log('✅ Added column: instagram_handle');
        } else {
            console.log('ℹ️ Column instagram_handle already exists');
        }

        // Ensure others are there just in case
        await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "niche" VARCHAR(255) DEFAULT 'General Creator';`);
        await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "location" VARCHAR(255) DEFAULT 'India';`);
        await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "followers_count" VARCHAR(50) DEFAULT '0';`);

        console.log('--- MIGRATION COMPLETE ---');

    } catch (err) {
        console.error('❌ MIGRATION FAILED:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
