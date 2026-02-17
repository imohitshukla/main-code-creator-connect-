
import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

async function test(connectionString, label) {
    if (!connectionString) {
        console.log(`⚠️  Skipping ${label}: No connection string`);
        return;
    }
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    try {
        console.log(`Testing ${label}...`);
        await client.connect();
        console.log(`✅ ${label} WORKED!`);
        await client.end();
        return true;
    } catch (e) {
        console.error(`❌ ${label} FAILED:`, e.message);
        return false;
    }
}

async function run() {
    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) {
        console.error("No DATABASE_URL found");
        return;
    }

    const worked = await test(originalUrl, "Original URL");

    if (!worked) {
        // Try removing c-3.
        // Assuming format postgres://user:pass@host:port/db...
        // Identify host: ep-fragrant-water-ah4w7ajv.c-3.us-east-1.aws.neon.tech
        const modifiedUrl = originalUrl.replace('.c-3.us-east-1', '.us-east-1');

        // Only run if it actually changed
        if (modifiedUrl !== originalUrl) {
            await test(modifiedUrl, "Modified URL (no c-3)");
        } else {
            console.log("Could not construct modified URL automatically.");
        }
    }
}

run();
