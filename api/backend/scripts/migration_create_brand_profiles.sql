-- Create brand_profiles table for comprehensive brand onboarding
-- Migration: 20240208-create-brand-profiles.sql

DROP TABLE IF EXISTS brand_profiles;

CREATE TABLE brand_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Company Identity
    company_name VARCHAR(255) NOT NULL,
    industry_vertical VARCHAR(50) CHECK (industry_vertical IN ('E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 'Finance', 'Travel', 'Food & Beverage', 'Other')),
    website_url VARCHAR(500),
    linkedin_page VARCHAR(500),
    
    -- Business Details
    company_size VARCHAR(50) CHECK (company_size IN ('Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)')),
    hq_location TEXT,
    gst_tax_id VARCHAR(100),
    
    -- Campaign Preferences (Matchmaking Data)
    typical_budget_range VARCHAR(50) CHECK (typical_budget_range IN ('₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+')),
    looking_for JSONB,
    
    -- Additional Info
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_brand_profiles_industry ON brand_profiles(industry_vertical);
CREATE INDEX idx_brand_profiles_budget ON brand_profiles(typical_budget_range);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brand_profiles_updated_at 
    BEFORE UPDATE ON brand_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE brand_profiles IS 'Comprehensive brand profiles for business onboarding and matchmaking';
