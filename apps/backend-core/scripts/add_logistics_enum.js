
import pg from 'pg';
const { Client } = pg;
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        console.log("Adding 'LOGISTICS' to deal_status enum...");

        // We cannot use IF NOT EXISTS for ADD VALUE in all versions safely or if it's already there it throws.
        // The safest way is to catch the error.
        try {
            await client.query("ALTER TYPE deal_status ADD VALUE 'LOGISTICS';");
            console.log("✅ Successfully added LOGISTICS to deal_status.");
        } catch (e) {
            if (e.code === '42710') { // duplicate_object
                console.log("ℹ️ LOGISTICS already exists in deal_status enum.");
            } else {
                console.error("Failed to alter type:", e);
                // throw e; // Don't throw, just log.
            }
        }

    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

run();
