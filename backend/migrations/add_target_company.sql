-- Migration: Add target_company to interviews table
-- Run this SQL in PostgreSQL database

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS target_company VARCHAR;

-- This column stores the target company for interview prep
-- Examples: "Google", "Amazon", "Meta", "Microsoft", "Netflix", etc.
