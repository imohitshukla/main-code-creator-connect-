
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    console.log('Testing connection string (masked):', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!');
        const res = await client.query('SELECT NOW()');
        console.log('Time from DB:', res.rows[0]);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
