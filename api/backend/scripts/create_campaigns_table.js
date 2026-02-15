import { client } from '../config/database.js';

const createCampaignsTable = async () => {
    await client.connect();

    try {
        // 1. Create ENUMs (Handle existing)
        try {
            await client.query(`CREATE TYPE campaign_product_type AS ENUM ('UGC', 'Reels', 'YouTube', 'TikTok', 'Other');`);
            console.log('✅ Created ENUM campaign_product_type');
        } catch (e) {
            if (e.code === '42710') console.log('⚠️ ENUM campaign_product_type already exists', e.message);
            else throw e;
        }

        try {
            await client.query(`CREATE TYPE campaign_status AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');`);
            console.log('✅ Created ENUM campaign_status');
        } catch (e) {
            if (e.code === '42710') console.log('⚠️ ENUM campaign_status already exists');
            else throw e;
        }

        // 2. Drop Table
        console.log('🗑️ Dropping existing campaigns table...');
        await client.query(`DROP TABLE IF EXISTS campaigns CASCADE;`);

        // 3. Create Table
        console.log('🔨 Creating campaigns table...');
        const createQuery = `
      CREATE TABLE campaigns (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES brand_profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        product_type campaign_product_type NOT NULL,
        budget_range VARCHAR(50),
        description TEXT,
        requirements TEXT,
        status campaign_status DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await client.query(createQuery);
        console.log('✅ Campaigns table created successfully.');

    } catch (error) {
        console.error('❌ Error in migration:', error);
    } finally {
        client.end();
    }
};

createCampaignsTable();
