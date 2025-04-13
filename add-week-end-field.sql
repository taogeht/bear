-- Add week_end field to weekly_templates table
ALTER TABLE weekly_templates ADD COLUMN IF NOT EXISTS week_end DATE;

-- Set default week_end for existing records (week_start + 6 days)
UPDATE weekly_templates
SET week_end = (week_start::DATE + INTERVAL '6 days')::DATE
WHERE week_end IS NULL AND week_start IS NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN weekly_templates.week_end IS 'End date of the weekly template (inclusive)';

DO $$
BEGIN
  RAISE NOTICE 'Added week_end column to weekly_templates table and populated existing records';
END $$; 