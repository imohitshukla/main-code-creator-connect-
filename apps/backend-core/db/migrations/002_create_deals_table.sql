-- 002_create_deals_table.sql

-- Create the ENUM type for deal status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
        CREATE TYPE deal_status AS ENUM (
            'OFFER', 
            'SIGNING', 
            'PRODUCTION', 
            'REVIEW', 
            'APPROVED', 
            'COMPLETED', 
            'CANCELLED'
        );
    END IF;
END $$;

-- Create the deals table
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    brand_id INTEGER NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    creator_id INTEGER NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    campaign_id INTEGER, -- Optional link to a campaign/job post
    
    -- Deal Details
    status deal_status DEFAULT 'OFFER',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR', -- Good practice to store currency
    deliverables TEXT NOT NULL, -- Description of work
    
    -- Stage-specific metadata (JSONB is perfect for flexible data like tracking links, cancellation reasons, etc.)
    -- Examples: 
    -- { "cancellation_reason": "...", "terminated_by": 123 }
    -- { "draft_link": "http...", "revision_notes": "..." }
    -- { "creator_signed": true, "brand_signed": true }
    current_stage_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_deals_brand_id ON deals(brand_id);
CREATE INDEX IF NOT EXISTS idx_deals_creator_id ON deals(creator_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
