-- Update brand_profiles table to match the comprehensive form structure
-- Migration: 20240208-update-brand-profiles.sql

-- Add missing columns for comprehensive brand onboarding
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS linkedin_page VARCHAR(500),
ADD COLUMN IF NOT EXISTS company_size VARCHAR(50) CHECK (company_size IN ('Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)')),
ADD COLUMN IF NOT EXISTS hq_location TEXT,
ADD COLUMN IF NOT EXISTS gst_tax_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS typical_budget_range VARCHAR(50) CHECK (typical_budget_range IN ('₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+')),
ADD COLUMN IF NOT EXISTS looking_for JSONB;

-- Rename existing columns to match the form field names
ALTER TABLE brand_profiles 
RENAME COLUMN industry TO industry_vertical_old,
RENAME COLUMN website TO website_url_old;

-- Add new columns with correct names
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS industry_vertical VARCHAR(50) CHECK (industry_vertical IN ('E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 'Finance', 'Travel', 'Food & Beverage', 'Other')),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);

-- Migrate data from old columns to new columns
UPDATE brand_profiles 
SET 
  industry_vertical = industry_vertical_old,
  website_url = website_url_old
WHERE industry_vertical_old IS NOT NULL OR website_url_old IS NOT NULL;

-- Add constraints and indexes
ALTER TABLE brand_profiles 
ADD CONSTRAINT IF NOT EXISTS brand_profiles_user_id_unique UNIQUE (user_id),
ADD CONSTRAINT IF NOT EXISTS brand_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_industry ON brand_profiles(industry_vertical);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_budget ON brand_profiles(typical_budget_range);

-- Update comment
COMMENT ON TABLE brand_profiles IS 'Comprehensive brand profiles for business onboarding and matchmaking';

-- Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'brand_profiles' 
ORDER BY ordinal_position;
