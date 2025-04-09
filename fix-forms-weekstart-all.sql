-- SQL script to fix all week_start values in forms table to ensure consistency

-- Update all forms to use Monday (2025-04-07) as the week start consistently
UPDATE forms 
SET week_start = '2025-04-07'
WHERE week_start IN ('2025-04-05', '2025-04-06') 
   OR week_start != '2025-04-07';

-- Update weekly_templates table for consistency
UPDATE weekly_templates
SET week_start = '2025-04-07'
WHERE week_start IN ('2025-04-05', '2025-04-06')
   OR week_start != '2025-04-07';

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'All forms week_start dates have been fixed';
END
$$; 