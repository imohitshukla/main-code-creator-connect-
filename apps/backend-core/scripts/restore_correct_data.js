/**
 * RESTORE CORRECT CREATOR DATA
 * ============================================================
 * The runEngagementRateUpdater cron job was running in mock mode
 * (no RAPIDAPI_KEY configured).  It used creator.id as a seed to
 * generate fake follower counts and then WROTE them back to NeonDB,
 * overwriting the real data that was manually entered.
 *
 * This script restores the correct data visible in the website
 * screenshots provided by the user.
 *
 * Run with:
 *   node scripts/restore_correct_data.js
 */

import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ── Correct creator data (from the website screenshots) ──────────────────────
// Format: { name, followers_count, engagement_rate }
// followers_count stored as VARCHAR (e.g. "132.2k")
// engagement_rate stored as DECIMAL (e.g. 4.7)
const CORRECT_DATA = [
  { name: 'Deepika Khattar',  followers_count: '132.2k', engagement_rate: 4.7 },
  { name: 'Shreeya Rajesh',   followers_count: '128.8k', engagement_rate: 2.6 },
  { name: 'Rahul & Ishita',   followers_count: '127.0k', engagement_rate: 1.6 },
  { name: 'Shivam Kumar',     followers_count: '121.8k', engagement_rate: 5.7 },
  { name: 'Abhishek Rawat',   followers_count: '120.0k', engagement_rate: 4.7 },
  { name: 'Anmol Warikoo',    followers_count: '116.6k', engagement_rate: 2.6 },
  { name: 'Yad Rathour',      followers_count: '29.3k',  engagement_rate: 3.6 },
  { name: 'Rahul',            followers_count: '24.8k',  engagement_rate: 3.5 },
  { name: 'Mohit',            followers_count: '17.2k',  engagement_rate: 1.6 },
  { name: 'Harshit Arora',    followers_count: '15.5k',  engagement_rate: 7.7 },
  { name: 'Divyansh Mishra',  followers_count: '13.7k',  engagement_rate: 6.7 },
];

async function restoreData() {
  await client.connect();
  console.log('✅ Connected to NeonDB\n');

  let fixed = 0;
  let notFound = 0;

  for (const creator of CORRECT_DATA) {
    // Find user by name
    const userRes = await client.query(
      `SELECT id FROM users WHERE name ILIKE $1 AND role = 'creator' LIMIT 1`,
      [creator.name]
    );

    if (userRes.rows.length === 0) {
      console.warn(`⚠️  Creator NOT FOUND in DB: "${creator.name}"`);
      notFound++;
      continue;
    }

    const userId = userRes.rows[0].id;

    // Update users table (followers_count as varchar)
    await client.query(
      `UPDATE users SET followers_count = $1 WHERE id = $2`,
      [creator.followers_count, userId]
    );

    // Update creator_profiles table
    await client.query(
      `UPDATE creator_profiles 
       SET engagement_rate = $1, follower_count = $2 
       WHERE user_id = $3`,
      [creator.engagement_rate, creator.followers_count, userId]
    );

    console.log(`✅ Restored "${creator.name}": ${creator.followers_count} followers, ${creator.engagement_rate}% ER`);
    fixed++;
  }

  console.log(`\n🎉 Done! Restored ${fixed} creators. ${notFound} not found in DB.\n`);
  await client.end();
}

restoreData().catch(err => {
  console.error('❌ Restore script failed:', err);
  process.exit(1);
});
