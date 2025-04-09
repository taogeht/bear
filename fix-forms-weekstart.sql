-- SQL script to fix week_start values in forms table

-- Update forms with incorrect week_start values
UPDATE forms 
SET week_start = '2025-04-07'
WHERE week_start = '2025-04-05';

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Forms week_start dates have been fixed';
END
$$; 