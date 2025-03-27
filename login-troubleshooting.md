# Login Troubleshooting Guide

If you're having trouble logging in with your admin teacher account (bear@bigbearsports.net), here are the steps to fix the issue:

## 1. Check Database for Admin User

The error message "JSON object requested, multiple (or no) rows returned" (PGRST116) typically means the user doesn't exist in the database. To fix this:

1. Open `check-database.html` in your browser
2. Click on "Check Teachers Table" to see if your admin account exists
3. If your admin account isn't listed, you need to add it

## 2. Add Admin User to Database

### Option 1: Use the Check Database Tool
1. Open `check-database.html` in your browser
2. Scroll down to "Add Test Users" section
3. Input:
   - Email: bear@bigbearsports.net
   - Name: Admin Teacher
   - Password: password123
4. Click "Add Test Teacher"

### Option 2: Run SQL Script
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `add-admin-teacher.sql`
4. Run the SQL query

## 3. Verify Credentials

Make sure you're using these exact credentials when logging in:
- Email: bear@bigbearsports.net
- Password: password123

## 4. Check Supabase Configuration

Ensure your Supabase URL and API key in `supabase-config.js` match your actual Supabase project settings:

```javascript
const SUPABASE_URL = 'https://dpaqeqosxerbfxldwlvq.supabase.co';
const SUPABASE_KEY = 'your-actual-api-key';
```

## 5. Common Issues and Solutions

### Email Typos
Double-check that you're using the exact email: bear@bigbearsports.net

### Database Schema Issues
If you've made changes to the database schema, you might need to reset it:
1. Go to your Supabase SQL Editor
2. Run the contents of `supabase-schema.sql` to reset and recreate all tables

### RLS (Row Level Security) Issues
Make sure the RLS policies allow anonymous SELECT access to the teachers table:
1. In Supabase, go to Authentication > Policies
2. Check that the `select_teachers` policy exists and is enabled

## Testing Login

After making these changes, try logging in again:
1. Open `index.html` in your browser
2. Click on "Teacher Login"
3. Enter email: bear@bigbearsports.net
4. Enter password: password123

## Still Having Issues?

If you're still experiencing problems:
1. Open your browser's console (F12 or Right-click > Inspect > Console)
2. Try logging in again
3. Check for any error messages in the console
4. Note the specific error and refer to the appropriate section above 