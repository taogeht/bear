#!/bin/bash

echo "Opening the Parent-Teacher Communication App..."

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

echo ""
echo "====== IMPORTANT LOGIN INSTRUCTIONS ======"
echo "Remember to set up your Supabase configuration in supabase-config.js!"
echo ""
echo "Admin Teacher Login:"
echo "  Email: bear@bigbearsports.net"
echo "  Password: password123"
echo ""
echo "Sample Teacher Login:"
echo "  Email: teacher@example.com"
echo "  Password: password123"
echo ""
echo "Sample Parent Login:"
echo "  Email: parent1@example.com (or parent2/parent3@example.com)"
echo "  Password: password123"
echo ""
echo "If you encounter form submission errors, run the fix-forms-schema.sql script"
echo "in your Supabase SQL Editor to add any missing database columns."
echo "==========================================" 