import { client } from '../config/database.js';

async function migrate() {
    try {
        await client.connect();
        console.log('✅ Connected to DB');

        console.log('--- RUNNING MIGRATION ---');

        // Check if columns exist to avoid errors (idempotency)
        const check = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name IN ('niche', 'location', 'followers_count');
    `);

        const existingCols = check.rows.map(r => r.column_name);

        if (!existingCols.includes('niche')) {
            await client.query(`ALTER TABLE "users" ADD COLUMN "niche" VARCHAR(255) DEFAULT 'General';`);
            console.log('✅ Added column: niche');
        } else {
            console.log('ℹ️ Column niche already exists');
        }

        if (!existingCols.includes('location')) {
            await client.query(`ALTER TABLE "users" ADD COLUMN "location" VARCHAR(255) DEFAULT 'India';`);
            console.log('✅ Added column: location');
        } else {
            console.log('ℹ️ Column location already exists');
        }

        if (!existingCols.includes('followers_count')) {
            await client.query(`ALTER TABLE "users" ADD COLUMN "followers_count" VARCHAR(50) DEFAULT '0';`);
            console.log('✅ Added column: followers_count');
        } else {
            console.log('ℹ️ Column followers_count already exists');
        }

        console.log('--- MIGRATION COMPLETE ---');

    } catch (err) {
        console.error('❌ MIGRATION FAILED:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
