
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('render.com')
        ? {
            rejectUnauthorized: false,
            sslmode: 'require'
        }
        : {
            rejectUnauthorized: false
        }
});

async function verifyUser() {
    console.log(`Checking for recent creator users`);
    try {
        const client = await pool.connect();
        const timeRes = await client.query("SELECT NOW()");
        console.log("🕒 DB Time:", timeRes.rows[0].now);

        const res = await client.query("SELECT id, name, email, role, created_at FROM users WHERE role = 'creator' ORDER BY created_at DESC LIMIT 5");
        if (res.rows.length > 0) {
            console.log('✅ Recent Creators found:', res.rows);
        } else {
            console.log('❌ No recent creators found.');
        }
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Query failed:', err);
        process.exit(1);
    }
}

verifyUser();
