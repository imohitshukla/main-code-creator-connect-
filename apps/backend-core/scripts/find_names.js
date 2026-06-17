import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findNames() {
  await client.connect();
  const res = await client.query("SELECT id, name FROM users WHERE role = 'creator' LIMIT 20;");
  console.log(res.rows);
  await client.end();
}

findNames().catch(console.error);
