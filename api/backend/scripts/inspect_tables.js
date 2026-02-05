import { client } from '../config/database.js';

async function checkColumns() {
    try {
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
        console.log('Columns in USERS table:', res.rows);

        const res2 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'creator_profiles';
    `);
        console.log('Columns in CREATOR_PROFILES table:', res2.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumns();
