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