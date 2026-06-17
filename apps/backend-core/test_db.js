import 'dotenv/config';
import pg from 'pg';
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  await client.connect();
  const res = await client.query("SELECT raw_data FROM creator_analytics_cache LIMIT 1");
  console.log("raw_data type:", typeof res.rows[0].raw_data);
  console.log("raw_data val:", res.rows[0].raw_data);
  await client.end();
}
run().catch(console.error);
