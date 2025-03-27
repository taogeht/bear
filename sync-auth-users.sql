-- This script syncs users from Supabase Auth to the teachers table
-- Run this in your Supabase SQL Editor

-- Get a list of all Auth users
DO $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Loop through Auth users
    FOR auth_user IN 
        SELECT id, email FROM auth.users
    LOOP
        -- Check if this Auth user already exists in the teachers table
        IF NOT EXISTS (SELECT 1 FROM teachers WHERE email = auth_user.email) THEN
            -- Insert the Auth user into the teachers table
            INSERT INTO teachers (id, name, email, password)
            VALUES (
                auth_user.id, 
                split_part(auth_user.email, '@', 1), -- Use part before @ as name
                auth_user.email,
                'password123' -- Default password
            );
            
            RAISE NOTICE 'Added Auth user % to teachers table', auth_user.email;
        ELSE
            -- Update the existing teacher record to match the Auth ID
            UPDATE teachers
            SET id = auth_user.id
            WHERE email = auth_user.email AND id != auth_user.id;
            
            RAISE NOTICE 'Updated teacher % to match Auth ID', auth_user.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Completed syncing Auth users to teachers table';
END
$$; 