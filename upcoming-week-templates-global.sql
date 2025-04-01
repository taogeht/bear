-- Check if extension exists first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists
DROP TABLE IF EXISTS upcoming_week_templates CASCADE;

-- Create a table for upcoming week templates (global for all parents)
CREATE TABLE upcoming_week_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start DATE NOT NULL UNIQUE,
    
    -- Form content fields
    weekly_song TEXT,
    video_homework TEXT,
    weekly_storybook TEXT,
    life_homework TEXT,
    practice_content TEXT,
    
    -- Meta info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment
COMMENT ON TABLE upcoming_week_templates IS 'Stores global upcoming week schedule templates created by teachers';

-- Create index for faster lookups
CREATE INDEX idx_upcoming_week_start ON upcoming_week_templates(week_start);

-- No need for RLS as we're using custom auth 