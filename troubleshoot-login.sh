#!/bin/bash

echo "===== Parent-Teacher Communication App Login Troubleshooter ====="
echo

echo "This script will guide you through troubleshooting login issues:"
echo

echo "1. First, check your Supabase URL and API Key in supabase-config.js"
echo "   - Current URL: 'https://dpaqeqosxerbfxldwlvq.supabase.co'"
echo "   - Verify this matches your Supabase project"
echo

echo "2. Run these SQL commands in your Supabase SQL Editor to check user existence:"
echo "   SELECT * FROM parents WHERE id = '3e282c5f-8c07-4c3c-9e3b-fcd29a3aba95';"
echo "   SELECT * FROM teachers WHERE id = '3e282c5f-8c07-4c3c-9e3b-fcd29a3aba95';"
echo

echo "3. If no users are found, run the add-uuid-user.sql script to create users with the UUID:"
echo "   - Open add-uuid-user.sql"
echo "   - Run the script in your Supabase SQL Editor"
echo

echo "4. Try using the UUID login method:"
echo "   - Open index.html"
echo "   - Choose parent or teacher login"
echo "   - Select the UUID tab"
echo "   - Enter UUID: 3e282c5f-8c07-4c3c-9e3b-fcd29a3aba95"
echo "   - Enter password: password123"
echo

echo "5. Check browser console for detailed error messages:"
echo "   - Right-click in browser > Inspect > Console"
echo "   - Look for any error messages related to Supabase or authentication"
echo

echo "6. Verify your Supabase policies allow anonymous access for login:"
echo "   - In Supabase: Authentication > Policies"
echo "   - Ensure 'select_parents' and 'select_teachers' policies exist and are enabled"
echo

echo "7. If you're still having issues, try running these commands to reset and recreate the database:"
echo "   - First run the supabase-schema.sql script"
echo "   - Then run the add-uuid-user.sql script"
echo 

echo "8. For UUID type issues, check your table definitions:"
echo "   - Ensure parent_id and teacher_id in forms table are UUID type"
echo "   - Ensure id columns in parents and teachers tables are UUID type"
echo

# Open the app for testing after troubleshooting
echo "Opening the application now to test your login..."
echo

# Detect operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux with graphical interface
    if command -v xdg-open &>/dev/null; then
        xdg-open index.html
    else
        echo "Cannot open browser automatically. Please open index.html in your browser."
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start index.html
else
    echo "Cannot open browser automatically. Please open index.html in your browser."
fi 