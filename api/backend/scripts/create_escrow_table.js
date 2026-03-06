import { client } from '../config/database.js';

const run = async () => {
    await client.connect();
    try {
        // 1. Create escrow_payments table
        await client.query(`
      CREATE TABLE IF NOT EXISTS escrow_payments (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE UNIQUE,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'PENDING',
        funded_at TIMESTAMP,
        released_at TIMESTAMP,
        live_post_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ escrow_payments table created (or already exists)');

        // 2. Add payment_status column to deals if it doesn't exist
        await client.query(`
      ALTER TABLE deals
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';
    `);
        console.log('✅ payment_status column added to deals (or already exists)');

        // 3. Add live_post_url column to deals if not exists
        await client.query(`
      ALTER TABLE deals
      ADD COLUMN IF NOT EXISTS live_post_url TEXT;
    `);
        console.log('✅ live_post_url column added to deals (or already exists)');

        console.log('🎉 Escrow migration complete!');
    } catch (err) {
        console.error('❌ Migration error:', err);
    } finally {
        await client.end();
    }
};

run();
