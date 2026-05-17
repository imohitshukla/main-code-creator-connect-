import { client } from '../config/database.js';

/**
 * Idempotent migration for Admin Oversight Dashboard tables.
 * Safe to run on every server startup — uses IF NOT EXISTS / IF NOT EXISTS guards.
 */
export async function migrateAdminTables() {
  try {
    console.log('🔄 [MIGRATION] Running admin tables migration...');

    // 1. user_audit_logs — tracks every successful login
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        ip_address VARCHAR(100),
        device_info TEXT,
        logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Index for fast lookups by user and time
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time
      ON user_audit_logs (user_id, logged_in_at DESC);
    `);

    console.log('✅ [MIGRATION] user_audit_logs table ready');

    // 2. admin_pitch_tracker — admin-friendly view of all deal/pitch interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_pitch_tracker (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER UNIQUE,
        brand_id INTEGER,
        brand_name VARCHAR(255),
        creator_id INTEGER,
        creator_name VARCHAR(255),
        initiated_by VARCHAR(50) DEFAULT 'brand',
        status VARCHAR(50) DEFAULT 'OFFER',
        payment_type VARCHAR(50) DEFAULT 'CASH',
        fixed_amount NUMERIC(12,2) DEFAULT 0.00,
        product_name VARCHAR(255),
        product_mrp NUMERIC(12,2),
        variable_terms TEXT,
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes for admin queries
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pitch_tracker_brand ON admin_pitch_tracker (brand_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pitch_tracker_creator ON admin_pitch_tracker (creator_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pitch_tracker_status ON admin_pitch_tracker (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pitch_tracker_deal ON admin_pitch_tracker (deal_id);`);

    console.log('✅ [MIGRATION] admin_pitch_tracker table ready');

    // 3. Ensure avatar column exists on users table (needed by /me endpoint)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'avatar'
        ) THEN
          ALTER TABLE users ADD COLUMN avatar TEXT;
        END IF;
      END $$;
    `);

    console.log('✅ [MIGRATION] Admin tables migration complete');
  } catch (error) {
    // Non-fatal: log and continue — don't crash the server
    console.error('❌ [MIGRATION] Admin tables migration error:', error.message);
  }
}
