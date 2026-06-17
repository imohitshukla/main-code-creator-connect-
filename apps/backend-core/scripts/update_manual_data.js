import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const CORRECT_DATA = [
  { name: 'Deepika Khattar', followers: '129k' },
  { name: 'Shreeya Rajesh', followers: '13.5k' },
  { name: 'Rahul & Ishita', followers: '157k' },
  { name: 'Shivam Kumar', followers: '102k' },
  { name: 'Abhishek Rawat', followers: '60.2k' },
  { name: 'Anmol Warikoo', followers: '58.9k' },
  { name: 'Yad Rathour', followers: '38k' },
  { name: 'Rahul', followers: '44.7k' },
  { name: 'Mohit', followers: '77.9k' },
  { name: 'Harshit Arora', followers: '11k' },
  { name: 'Divyansh Mishra', followers: '140k' }
];

async function updateManualData() {
  try {
    await client.connect();
    console.log('✅ Connected to NeonDB');

    for (const creator of CORRECT_DATA) {
      // Find user by name ignoring spaces
      const userRes = await client.query(
        `SELECT id FROM users WHERE TRIM(name) ILIKE $1 AND role = 'creator' LIMIT 1`,
        [creator.name]
      );

      if (userRes.rows.length > 0) {
        const userId = userRes.rows[0].id;
        
        // Update users table
        await client.query(
          `UPDATE users SET followers_count = $1 WHERE id = $2`,
          [creator.followers, userId]
        );

        // Convert '129k' to 129000 for the cache table
        const parsedFollowers = Math.round(parseFloat(creator.followers.replace('k', '')) * 1000);

        // Update cache table if it exists, to ensure UI is completely in sync
        await client.query(
          `UPDATE creator_analytics_cache 
           SET follower_count = $1
           WHERE creator_id = $2`,
          [parsedFollowers, userId]
        );

        console.log(`✅ Updated "${creator.name}": ${creator.followers} followers`);
      } else {
        console.log(`⚠️  Creator NOT FOUND in DB: "${creator.name}"`);
      }
    }

    console.log(`🎉 Done! Manually updated followers for all creators.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

updateManualData();
