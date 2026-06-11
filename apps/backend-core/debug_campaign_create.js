import { client } from './config/database.js';

async function debugCampaignCreate() {
    try {
        await client.connect();
        console.log('✅ Connected to DB');

        const email = 'brand_fix_verify_final_1739556700@example.com';

        // 1. Get User
        const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.log('❌ User not found:', email);
            return;
        }
        const user = userRes.rows[0];
        console.log('✅ User found:', user.id, user.email);

        // 2. Get Brand Profile
        const brandRes = await client.query('SELECT * FROM brand_profiles WHERE user_id = $1', [user.id]);
        if (brandRes.rows.length === 0) {
            console.log('❌ Brand Profile not found for user:', user.id);
            return;
        }
        const brand = brandRes.rows[0];
        console.log('✅ Brand Profile found:', brand.id);

        // 3. Try Insert Campaign
        const query = `
      INSERT INTO campaigns (brand_id, title, product_type, budget_range, description, requirements)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
        const values = [brand.id, 'Debug Test Campaign', 'UGC', '$500', 'Debug Description', 'None'];

        console.log('Attempting INSERT with values:', values);
        const result = await client.query(query, values);
        console.log('✅ Campaign Created:', result.rows[0]);

    } catch (error) {
        console.error('❌ Error in debug script:', error);
    } finally {
        client.end();
    }
}

debugCampaignCreate();
