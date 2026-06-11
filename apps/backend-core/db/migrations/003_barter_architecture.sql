-- Migration: Add Barter Architecture fields

-- 1. Add shipping details to creator_profiles
ALTER TABLE creator_profiles 
ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- 2. Add barter tracking fields to deals
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS compensation_type VARCHAR(50) DEFAULT 'CASH',
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS product_mrp DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_awb VARCHAR(255),
ADD COLUMN IF NOT EXISTS product_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS barter_tos_accepted_at TIMESTAMP WITH TIME ZONE;
