-- Update the form-history.html file to use the correct field names from the database
-- Script to rename columns in forms table to use consistent naming convention

-- First, check if we need to add any missing columns
DO $$
BEGIN
    -- Check if certain columns exist and add them if not
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'teacher_name') THEN
        ALTER TABLE forms ADD COLUMN teacher_name TEXT;
    END IF;
END $$;

-- Create alias/calculated fields for consistent access
CREATE OR REPLACE VIEW form_view AS
SELECT
    id,
    parent_id,
    teacher_id,
    week_start,
    year,
    month,
    day,
    
    -- Teacher data
    teachermood AS teacher_mood,
    weeklysong AS weekly_song,
    videohomework AS video_homework,
    weeklystorybook AS weekly_storybook,
    lifehomework AS life_homework,
    practicecontent AS practice_content,
    teachercomments AS teacher_comments,
    teacher_name,
    
    -- Parent data
    sleeptime AS sleep_time,
    helpneeded AS help_needed,
    breakfast,
    watch,
    watch2,
    todo,
    todo2,
    parentshare AS parent_share,
    parentcomments AS parent_comments,
    
    created_at,
    updated_at
FROM forms;

-- Alternatively, update the form-history.html file with these changes:
-- 1. Replace all snake_case field accesses with camelCase:
--    - formData.teacher_mood -> formData.teachermood
--    - formData.weekly_song -> formData.weeklysong
--    - formData.video_homework -> formData.videohomework
--    - formData.weekly_storybook -> formData.weeklystorybook
--    - formData.life_homework -> formData.lifehomework
--    - formData.practice_content -> formData.practicecontent
--    - formData.teacher_comments -> formData.teachercomments
--    - formData.sleep_time -> formData.sleeptime
--    - formData.help_needed -> formData.helpneeded
--    - formData.parent_share -> formData.parentshare
--    - formData.parent_comments -> formData.parentcomments

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'Form view created successfully. Update form-history.html to query the form_view instead of the forms table.';
END $$; 