-- Migration: Add audio_duration_seconds to answers table
-- Run this SQL manually in your PostgreSQL database or via Alembic

ALTER TABLE answers
ADD COLUMN IF NOT EXISTS audio_duration_seconds FLOAT;

-- This column is optional (nullable) and stores the duration of the audio recording in seconds
-- It will be used for speaking pace analysis (words per minute calculation)
