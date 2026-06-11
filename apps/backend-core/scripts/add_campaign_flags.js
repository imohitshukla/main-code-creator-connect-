import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const migrate = async () => {
    try {
        console.log('Running migration: Add is_urgent and is_featured to campaigns...');

        // Add columns if they don't exist
        await pool.query(`
      ALTER TABLE campaigns 
      ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    `);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
