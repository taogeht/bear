-- Get a list of all tables in the database
SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';

-- For each table, show detailed column information
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'forms' ORDER BY ordinal_position;

-- Get constraints information for forms table
