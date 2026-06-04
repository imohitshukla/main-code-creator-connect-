import { client } from '../config/database.js';

async function inspectData() {
  try {
    const users = await client.query('SELECT id, email, role FROM users LIMIT 10;');
    console.log('\n--- USERS ---');
    console.log(users.rows);

    const creators = await client.query('SELECT id, user_id, name, niche, follower_count, engagement_rate FROM creator_profiles LIMIT 10;');
    console.log('\n--- CREATOR PROFILES ---');
    console.log(creators.rows);

    const campaigns = await client.query('SELECT id, title, budget_range FROM campaigns LIMIT 10;');
    console.log('\n--- CAMPAIGNS ---');
    console.log(campaigns.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error inspecting database:', error);
    process.exit(1);
  }
}

inspectData();
