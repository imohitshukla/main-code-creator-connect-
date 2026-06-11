
import { client } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid installed, used random string

const runTest = async () => {
    console.log('🧪 Starting Persistence Test...');
    const testEmail = `test_persist_${Date.now()}@example.com`;
    const testPassword = 'password123';

    try {
        // 1. Create a User (simulating Auth persistence)
        console.log('1. Creating Test User...');
        // Manually inserting without bcrypt for speed, just testing DB write
        const userRes = await client.query(
            `INSERT INTO users (email, password, role) VALUES ($1, $2, 'creator') RETURNING id`,
            [testEmail, testPassword]
        );
        const userId = userRes.rows[0].id;
        console.log(`   ✅ User created with ID: ${userId}`);

        // 2. Create a Profile (simulating Profile persistence)
        console.log('2. Creating Test Profile...');
        await client.query(
            `INSERT INTO creator_profiles (user_id, name, bio) VALUES ($1, 'Test Creator', 'Persistent Bio')`,
            [userId]
        );
        console.log('   ✅ Profile created');

        // 3. Create a Conversation & Message (simulating Message persistence)
        console.log('3. Creating Conversation & Message...');
        // Need a second user for conversation
        const user2Res = await client.query(
            `INSERT INTO users (email, password, role) VALUES ($1, 'pass', 'brand') RETURNING id`,
            [`brand_${Date.now()}@example.com`]
        );
        const user2Id = user2Res.rows[0].id;

        const convRes = await client.query(
            `INSERT INTO conversations (participants) VALUES ($1) RETURNING id`,
            [JSON.stringify([userId, user2Id].sort((a, b) => a - b))]
        );
        const convId = convRes.rows[0].id;

        const msgContent = 'This message MUST survive!';
        await client.query(
            `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)`,
            [convId, userId, msgContent]
        );
        console.log(`   ✅ Message sent to Conv ID: ${convId}`);

        // 4. Verify Reading Back
        console.log('4. Verifying Persistence...');
        const verifyMsg = await client.query(
            `SELECT content FROM messages WHERE conversation_id = $1`,
            [convId]
        );

        if (verifyMsg.rows.length > 0 && verifyMsg.rows[0].content === msgContent) {
            console.log('   🎉 SUCCESS: Message retrieved from DB!');
        } else {
            console.error('   ❌ FAILED: Message not found in DB!');
            process.exit(1);
        }

        const verifyProfile = await client.query(
            `SELECT bio FROM creator_profiles WHERE user_id = $1`,
            [userId]
        );
        if (verifyProfile.rows.length > 0 && verifyProfile.rows[0].bio === 'Persistent Bio') {
            console.log('   🎉 SUCCESS: Profile retrieved from DB!');
        } else {
            console.error('   ❌ FAILED: Profile not found in DB!');
            process.exit(1);
        }

    } catch (err) {
        console.error('❌ Test Failed:', err);
    } finally {
        await client.end();
    }
};

runTest();
