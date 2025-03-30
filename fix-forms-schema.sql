-- Fix Forms Table Schema
-- This script checks and adds missing columns in the forms table

-- First check if lifeHomework column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'lifeHomework'
    ) THEN
        ALTER TABLE forms ADD COLUMN "lifeHomework" TEXT;
        RAISE NOTICE 'Added missing column: lifeHomework';
    ELSE
        RAISE NOTICE 'Column lifeHomework already exists';
    END IF;
END $$;

-- Check for all other possible missing columns
DO $$
DECLARE
    required_columns TEXT[] := ARRAY[
        'teacherMood', 'weeklySong', 'videoHomework', 'weeklyHomework', 
        'lifeHomework', 'practiceContent', 'teacherComments',
        'sleepTime', 'helpNeeded', 'breakfast', 'watch', 'watch2',
        'todo', 'todo2', 'parentShare', 'parentComments'
    ];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'forms' AND column_name = col
        ) THEN
            EXECUTE format('ALTER TABLE forms ADD COLUMN "%s" TEXT', col);
            RAISE NOTICE 'Added missing column: %', col;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Schema check complete';
END $$;

-- Show table structure for verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms'
ORDER BY ordinal_position;

-- This script will update the forms table schema to match the updated application
-- Run this in the Supabase SQL Editor

-- First, add the weeklyStorybook column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'weeklyStorybook'
    ) THEN
        ALTER TABLE forms ADD COLUMN "weeklyStorybook" TEXT;
    END IF;
END $$;

-- Ensure lifeHomework column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'lifeHomework'
    ) THEN
        ALTER TABLE forms ADD COLUMN "lifeHomework" TEXT;
    END IF;
END $$;

-- Ensure videoHomework column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'videoHomework'
    ) THEN
        ALTER TABLE forms ADD COLUMN "videoHomework" TEXT;
    END IF;
END $$;

-- Ensure weeklySong column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'weeklySong'
    ) THEN
        ALTER TABLE forms ADD COLUMN "weeklySong" TEXT;
    END IF;
END $$;

-- Ensure parent response fields exist
DO $$
BEGIN
    -- Watch (for weekly song progress)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'watch'
    ) THEN
        ALTER TABLE forms ADD COLUMN "watch" TEXT;
    END IF;

    -- Watch2 (for video homework progress)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'watch2'
    ) THEN
        ALTER TABLE forms ADD COLUMN "watch2" TEXT;
    END IF;

    -- Todo (for weekly storybook progress)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'todo'
    ) THEN
        ALTER TABLE forms ADD COLUMN "todo" TEXT;
    END IF;

    -- Todo2 (for life homework progress)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'todo2'
    ) THEN
        ALTER TABLE forms ADD COLUMN "todo2" TEXT;
    END IF;
END $$;

-- Copy data from weeklyHomework to weeklyStorybook if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'weeklyHomework'
    ) THEN
        -- Copy data from old column to new column where new column is null
        UPDATE forms
        SET "weeklyStorybook" = "weeklyHomework"
        WHERE "weeklyStorybook" IS NULL AND "weeklyHomework" IS NOT NULL;

        -- Optionally remove the old column if no longer needed
        -- Commented out for safety - uncomment once confirmed data is migrated
        -- ALTER TABLE forms DROP COLUMN "weeklyHomework";
    END IF;
END $$;

-- Verify the changes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'forms'
ORDER BY column_name; 