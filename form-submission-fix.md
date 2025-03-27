# Fixing Form Submission Errors

If you're encountering errors when submitting forms in the Parent-Teacher Communication App, it's likely due to missing columns in your forms table. This guide will help you solve those issues.

## Common Error Messages

- `"Could not find the 'lifeHomework' column of 'forms' in the schema cache"`
- `"Could not find the '...' column of 'forms' in the schema cache"`

These errors indicate that your database table structure doesn't match what the application is expecting.

## Solution: Fix the Database Schema

### Step 1: Run the Fix Script

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `fix-forms-schema.sql`
4. Run the SQL script
5. You should see notices indicating which columns have been added

### Step 2: Verify the Fix

1. Open your app and try submitting a form again
2. The form should now submit successfully

## Understanding the Fix

The fix script:

1. Checks if the required columns exist in your forms table
2. Adds any missing columns with the correct data type (TEXT)
3. Provides feedback on which columns were added

## Required Columns

The forms table requires the following columns:

**Teacher Form Fields:**
- `teacherMood` - Teacher's mood emoji
- `weeklySong` - Weekly song assignment
- `videoHomework` - Video homework
- `weeklyHomework` - Weekly homework assignment
- `lifeHomework` - Life homework
- `practiceContent` - Practice content
- `teacherComments` - Teacher's comments

**Parent Form Fields:**
- `sleepTime` - Child's sleep time
- `helpNeeded` - Help needed
- `breakfast` - Breakfast emoji
- `watch` - Things to watch
- `watch2` - Additional things to watch
- `todo` - Things to do
- `todo2` - Additional things to do
- `parentShare` - Parent sharing
- `parentComments` - Parent's comments

## Troubleshooting

If you continue to experience issues:

1. Check the browser console for specific error messages
2. Run the following SQL query to verify all columns exist:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'forms'
   ORDER BY ordinal_position;
   ```
3. If new columns are missing, add them manually:
   ```sql
   ALTER TABLE forms ADD COLUMN "column_name" TEXT;
   ``` 