-- Check if extension exists first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists
DROP TABLE IF EXISTS upcoming_week_templates;

-- Create a table for upcoming week templates
CREATE TABLE upcoming_week_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    
    -- Form content fields
    weekly_song TEXT,
    video_homework TEXT,
    weekly_storybook TEXT,
    life_homework TEXT,
    practice_content TEXT,
    
    -- Meta info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Unique constraint to ensure only one template per parent per week
    UNIQUE(parent_id, week_start)
);

-- Add comment
COMMENT ON TABLE upcoming_week_templates IS 'Stores upcoming week schedule templates created by teachers';

-- Create index for faster lookups
CREATE INDEX idx_upcoming_week_parent_id ON upcoming_week_templates(parent_id);
CREATE INDEX idx_upcoming_week_start ON upcoming_week_templates(week_start);

-- No need for RLS as we're using custom auth
