-- Check if extension exists first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for upcoming week templates
CREATE TABLE upcoming_week_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    
    -- Form content fields
    weekly_song TEXT,
    video_homework TEXT,
    weekly_storybook TEXT,
    life_homework TEXT,
    practice_content TEXT,
    
    -- Meta info
    is_template BOOLEAN DEFAULT true,
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

-- Enable RLS (Row Level Security)
ALTER TABLE upcoming_week_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can read/write all templates
CREATE POLICY teacher_all_access ON upcoming_week_templates 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'userType' = 'teacher'
        )
    );

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
