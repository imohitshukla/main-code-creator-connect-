
import { client } from './config/database.js';

async function resetBrandProfile() {
    const email = 'fresh_brand_test_v1@example.com';

    try {
        await client.connect();

        // Get User ID
        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.log('User not found');
            return;
        }
        const userId = userRes.rows[0].id;

        // Delete Brand Profile
        await client.query('DELETE FROM brand_profiles WHERE user_id = $1', [userId]);
        console.log(`✅ Deleted brand profile for user ${userId} (${email})`);

        // Ensure role is BRAND
        await client.query("UPDATE users SET role = 'brand' WHERE id = $1", [userId]);
        console.log(`✅ Ensured role is 'brand'`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // client.end(); // Pool doesn't need end() if we just want script to finish, but good practice
        process.exit(0);
    }
}

resetBrandProfile();
