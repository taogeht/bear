-- This script adds or updates the admin teacher account
-- Run this in your Supabase SQL Editor

-- Check if admin teacher exists
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM teachers WHERE email = 'bear@bigbearsports.net') INTO admin_exists;
    
    IF admin_exists THEN
        -- Update existing admin
        UPDATE teachers 
        SET 
            name = 'Admin Teacher',
            password = 'password123'
        WHERE email = 'bear@bigbearsports.net';
        
        RAISE NOTICE 'Admin teacher account updated successfully!';
    ELSE
        -- Insert new admin
        INSERT INTO teachers (name, email, password)
        VALUES ('Admin Teacher', 'bear@bigbearsports.net', 'password123');
        
        RAISE NOTICE 'Admin teacher account created successfully!';
    END IF;
END
$$; 