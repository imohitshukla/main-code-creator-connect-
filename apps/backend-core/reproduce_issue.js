import { client } from './config/database.js';

async function reproduceIssue() {
    try {
        // 1. Get the user ID for our test user
        const email = 'test_brand_1739417600@example.com';
        const userRes = await client.query('SELECT id, email, role FROM users WHERE email = $1', [email]);

        if (userRes.rows.length === 0) {
            console.log('User not found, constructing dummy user...');
            // You might want to insert one if needed, but let's see if we can find one first.
            // If we can't find the specific one, we'll pick the latest brand user.
            const latestBrand = await client.query('SELECT id, email FROM users WHERE role = $1 ORDER BY id DESC LIMIT 1', ['brand']);
            if (latestBrand.rows.length === 0) {
                console.error('No brand users found to test with.');
                return;
            }
            console.log('Using latest brand user:', latestBrand.rows[0]);
            await testInsert(latestBrand.rows[0].id);
        } else {
            console.log('Found test user:', userRes.rows[0]);
            await testInsert(userRes.rows[0].id);
        }

    } catch (err) {
        console.error('Setup Error:', err);
    } finally {
        client.end();
    }
}

async function testInsert(userId) {
    const query = `
    INSERT INTO brand_profiles (user_id, company_name, website, industry, company_size)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      company_name = EXCLUDED.company_name,
      website = EXCLUDED.website,
      industry = EXCLUDED.industry,
      company_size = EXCLUDED.company_size,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

    // Values from the failed browser test
    const values = [
        userId,
        "Test Brand AI",
        "https://testbrandai.com",
        "SaaS & Tech",
        "1-10 (Startup)"
    ];

    console.log('Attempting INSERT with values:', values);

    try {
        const result = await client.query(query, values);
        console.log('✅ INSERT SUCCESS:', result.rows[0]);
    } catch (error) {
        console.error('❌ INSERT FAILED with error:');
        console.error(error);
    }
}

reproduceIssue();
