-- First, create templates for the two weeks
INSERT INTO weekly_templates (week_start, week_end, weeklysong, videohomework, weeklystorybook, lifehomework, practicecontent, created_at, updated_at)
VALUES 
('2024-03-24', '2024-03-28', 'Old MacDonald Had a Farm', 'Watch Pete the Cat: Wheels on the Bus', 'The Very Hungry Caterpillar', 'Visit a local farm or zoo', 'Practice animal sounds and movements', NOW(), NOW()),
('2024-03-31', '2024-04-04', 'Twinkle Twinkle Little Star', 'Watch Baby Shark Space Adventure', 'Goodnight Moon', 'Observe the night sky with parents', 'Draw pictures of stars and planets', NOW(), NOW());

-- Insert sample form data for a few sample parent IDs
-- Replace these with actual parent IDs from your database if needed
DO $$
DECLARE
    parent_ids UUID[] := ARRAY[
        '00000000-0000-0000-0000-000000000001',  -- Sample parent ID 1 - replace with real ID
        '00000000-0000-0000-0000-000000000002',  -- Sample parent ID 2 - replace with real ID
        '00000000-0000-0000-0000-000000000003'   -- Sample parent ID 3 - replace with real ID
    ];
    current_parent_id UUID;
BEGIN
    -- Loop through our sample parent IDs
    FOREACH current_parent_id IN ARRAY parent_ids
    LOOP
        -- March 24-28 data
        INSERT INTO forms (
            parent_id, week_start, year, month, day,
            teachermood, weeklysong, videohomework, weeklystorybook, lifehomework, practicecontent, teachercomments,
            sleeptime, helpneeded, breakfast, watch, watch2, todo, todo2, parentshare, parentcomments,
            created_at, updated_at
        ) VALUES (
            current_parent_id, 
            '2024-03-24', '2024', '3', '24',
            '5', -- Happy mood
            'Old MacDonald Had a Farm', 
            'Watch Pete the Cat: Wheels on the Bus', 
            'The Very Hungry Caterpillar', 
            'Visit a local farm or zoo', 
            'Practice animal sounds and movements',
            'Your child is doing well with animal sounds!',
            -- Parent responses for March 24-28 (add some variety)
            CASE WHEN random() > 0.5 THEN '8 hours' ELSE '9 hours' END,
            CASE WHEN random() > 0.7 THEN 'Yes, with phonics' ELSE 'No' END,
            CASE WHEN random() > 0.3 THEN 'Cereal and fruit' ELSE 'Eggs and toast' END,
            'Watched Pete the Cat video twice',
            CASE WHEN random() > 0.5 THEN 'Also watched animal documentaries' ELSE NULL END,
            'Visited the local petting zoo',
            CASE WHEN random() > 0.6 THEN 'Made animal flashcards' ELSE NULL END,
            CASE WHEN random() > 0.4 THEN 'My child loved the farm animals!' ELSE 'We practiced animal sounds together' END,
            CASE WHEN random() > 0.7 THEN 'Could we have more songs next week?' ELSE NULL END,
            NOW() - interval '14 days', NOW() - interval '12 days'
        )
        ON CONFLICT (parent_id, week_start) DO NOTHING;
        
        -- March 31-April 4 data
        INSERT INTO forms (
            parent_id, week_start, year, month, day,
            teachermood, weeklysong, videohomework, weeklystorybook, lifehomework, practicecontent, teachercomments,
            sleeptime, helpneeded, breakfast, watch, watch2, todo, todo2, parentshare, parentcomments,
            created_at, updated_at
        ) VALUES (
            current_parent_id, 
            '2024-03-31', '2024', '3', '31',
            '4', -- Mostly happy mood
            'Twinkle Twinkle Little Star', 
            'Watch Baby Shark Space Adventure', 
            'Goodnight Moon', 
            'Observe the night sky with parents', 
            'Draw pictures of stars and planets',
            'Your child is learning the space-themed vocabulary well!',
            -- Parent responses for March 31-April 4 (add some variety)
            CASE WHEN random() > 0.5 THEN '8.5 hours' ELSE '7 hours' END,
            CASE WHEN random() > 0.7 THEN 'Yes, with reading' ELSE 'No' END,
            CASE WHEN random() > 0.3 THEN 'Oatmeal' ELSE 'Pancakes' END,
            'Watched the Baby Shark space video',
            CASE WHEN random() > 0.5 THEN 'Also watched a planetarium video' ELSE NULL END,
            'Looked at stars through a telescope',
            CASE WHEN random() > 0.6 THEN 'Drew a solar system picture' ELSE NULL END,
            CASE WHEN random() > 0.4 THEN 'My child is fascinated by planets now!' ELSE 'We learned the names of all planets' END,
            CASE WHEN random() > 0.7 THEN 'Could we have more space activities?' ELSE NULL END,
            NOW() - interval '7 days', NOW() - interval '5 days'
        )
        ON CONFLICT (parent_id, week_start) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Sample data inserted for weeks of March 24-28 and March 31-April 4';
END $$;

-- Optional: Add a check to see how much data was inserted
SELECT 
    week_start, 
    COUNT(*) as form_count 
FROM forms 
WHERE week_start IN ('2024-03-24', '2024-03-31')
GROUP BY week_start
ORDER BY week_start; 