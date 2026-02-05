// Script to populate sample data for creator profiles to match the desired appearance
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { User, CreatorProfile, sequelize } = require('./backend/models/index.cjs');

async function populateSampleData() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get all users
    const users = await User.findAll();
    console.log(`Found ${users.length} users to update.`);

    for (const user of users) {
      // Check if creator profile exists
      let creatorProfile = await CreatorProfile.findOne({ where: { user_id: user.id } });
      
      if (!creatorProfile) {
        // Create new creator profile
        creatorProfile = await CreatorProfile.create({
          user_id: user.id,
          name: user.name,
        });
        console.log(`Created creator profile for user ${user.id} (${user.name})`);
      }

      // Update with sample data to match the first image
      await creatorProfile.update({
        instagram_link: 'https://instagram.com/' + user.name.toLowerCase().replace(/\s+/g, '_'),
        budget_range: '₹10K - ₹25K',
        audience_breakdown: 'Gender split: 65% male, 35% female. Age groups: 18–24 years (55%), 25–34 years (25%), 13–17 years (15%), 35+ years (5%). Top cities: Varanasi, Lucknow, Delhi, Patna.',
        collaboration_goals: 'Looking to collaborate with travel, lifestyle, and fashion brands to create engaging content.',
        follower_count: user.followers_count || '55.2k',
        engagement_rate: 3.5,
        location: user.location || 'Bhaderwah, Jammu & Kashmir',
        niche: user.niche || 'Viral Travel Photographer & Reel Creator'
      });

      console.log(`Updated profile for ${user.name} with sample data.`);
    }

    console.log('Sample data population completed successfully!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  } finally {
    await sequelize.close();
  }
}

populateSampleData();
