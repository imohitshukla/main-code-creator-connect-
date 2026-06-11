import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Business Upgrade Migrations...');

        // 1. Create Notifications Table
        console.log('Creating notifications table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        type VARCHAR(50), 
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ Notifications table created.');

        // 2. Create Applications Table
        console.log('Creating applications table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        campaign_id INT REFERENCES campaigns(id),
        creator_id INT REFERENCES creator_profiles(id),
        brand_id INT REFERENCES brand_profiles(id),
        status VARCHAR(20) DEFAULT 'PENDING',
        cover_letter TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✅ Applications table created.');

        // 3. Update Conversations Table
        console.log('Updating conversations table...');
        // Check if column exists first to avoid errors on re-run
        const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='conversations' AND column_name='deal_id';
    `);

        if (checkColumn.rows.length === 0) {
            await client.query(`
        ALTER TABLE conversations ADD COLUMN deal_id INT REFERENCES deals(id);
      `);
            console.log('✅ deal_id column added to conversations.');
        } else {
            console.log('ℹ️ deal_id column already exists.');
        }

        console.log('🎉 All migrations applied successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
};

runMigrations();
