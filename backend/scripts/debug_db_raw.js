import { client } from '../config/database.js';

async function debug() {
    try {
        console.log('--- CONNECTING ---');
        await client.connect();
        console.log('✅ Connected');

        console.log('--- USER 5 ---');
        const user = await client.query('SELECT id, name, email FROM users WHERE id = 5');
        console.log(user.rows);

        console.log('--- PROFILE for USER 5 ---');
        const profile = await client.query('SELECT * FROM creator_profiles WHERE user_id = 5');
        console.log(profile.rows);

        console.log('--- COLUMNS in creator_profiles ---');
        const cols = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'creator_profiles'
    `);
        console.log(cols.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error('❌ ERROR:', err);
    } finally {
        // client.end(); // Pool might hang but we want to exit
        process.exit(0);
    }
}

debug();
