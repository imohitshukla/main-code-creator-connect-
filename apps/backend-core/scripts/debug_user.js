import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile } = require('../models/index.cjs');

console.log('--- START DEBUG SCRIPT ---');
console.log('User Model:', !!User);
console.log('CreatorProfile Model:', !!CreatorProfile);

async function testFetch() {
    try {
        console.log('Attempting to find User 5...');
        const user = await User.findOne({
            where: { id: 5 },
            include: [{
                model: CreatorProfile,
                as: 'creatorProfile',
                required: false
            }]
        });

        if (user) {
            console.log('✅ User Found:', user.toJSON());
        } else {
            console.log('⚠️ User 5 NOT FOUND');
        }
    } catch (error) {
        console.error('❌ QUERY FAILED:', error);
    }
}

testFetch();
