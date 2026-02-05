import { client } from '../config/database.js';

async function updateDivyansh() {
    try {
        await client.connect();
        console.log('✅ Connected to DB');
        const res = await client.query(`
      UPDATE users 
      SET 
        niche = 'Actor & Lifestyle', 
        followers_count = '60k', 
        location = 'Varanasi, India'
      WHERE id = 5
      RETURNING *;
    `);
        console.log('✅ Update successful:', res.rows[0]);
    } catch (err) {
        console.error('❌ Update failed:', err);
    } finally {
        process.exit(0);
    }
}

updateDivyansh();
