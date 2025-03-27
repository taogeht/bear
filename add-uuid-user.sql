-- Add parent with specific UUID
INSERT INTO parents (id, name, email, password)
VALUES (
  '3e282c5f-8c07-4c3c-9e3b-fcd29a3aba95', 
  'UUID Parent', 
  'uuid-parent@example.com', 
  'password123'
) 
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, 
    password = EXCLUDED.password;

-- Add teacher with specific UUID (if needed)
INSERT INTO teachers (id, name, email, password)
VALUES (
  '3e282c5f-8c07-4c3c-9e3b-fcd29a3aba95', 
  'UUID Teacher', 
  'uuid-teacher@example.com', 
  'password123'
) 
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, 
    password = EXCLUDED.password;

-- Note: You should run only one of these queries depending on
-- whether you need a parent or teacher with this UUID.
-- The ON CONFLICT clause will update the user if it already exists. 