-- SQL script to fix date formatting in forms table

-- Update forms to ensure consistent date formatting
UPDATE forms
SET day = EXTRACT(DAY FROM week_start::date)::text,
    month = EXTRACT(MONTH FROM week_start::date)::text,
    year = EXTRACT(YEAR FROM week_start::date)::text
WHERE week_start IS NOT NULL;

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Forms date formatting has been fixed';
END
$$; 