# Fix Login for Supabase Auth Users

The login issue you're experiencing occurs because users added via the Supabase Authentication panel don't automatically appear in your custom `teachers` table. Your application is checking the custom table, not the Auth system.

## Understanding the Issue

There are two separate user systems in your application:

1. **Supabase Auth** - Where you added your user through the Authentication → Users panel
2. **Custom `teachers` table** - Where your application's login function is looking for users

## Solution: Sync Auth Users to Custom Table

Follow these steps to fix the issue:

### Option 1: Run the Sync Script (Recommended)

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `sync-auth-users.sql`
4. Run the SQL query
5. This will find all users in Supabase Auth and add them to your `teachers` table with the same UUID

### Option 2: Manually Add the User to Teachers Table

1. Open `check-database.html` in your browser
2. Scroll down to "Add Test Users" section
3. Input:
   - Email: bear@bigbearsports.net (must match your Auth user's email)
   - Name: Admin Teacher
   - Password: password123
4. Click "Add Test Teacher"
5. Note: The UUIDs won't match between Auth and your teachers table with this method

## Verifying the Fix

1. Open `check-database.html` in your browser
2. Click "Check Teachers Table"
3. Verify that you see your Auth user's email in the teachers table

If you don't see your user in the teachers table, something went wrong with the sync.

## For Future Development

For a more robust solution, you should either:

1. **Use Supabase Auth for authentication** and then use the Auth user's UUID to lookup additional information in your teachers/parents tables.

    OR

2. **Create a trigger on the Auth table** to automatically add new Auth users to your custom tables.

## Need More Help?

If the sync script doesn't resolve your issue:

1. Check the RLS policies to ensure they allow anonymous access to the teachers table
2. Verify that both your Auth user and teachers table entry have the same email address
3. Try running the SQL schema from scratch with `supabase-schema.sql` 