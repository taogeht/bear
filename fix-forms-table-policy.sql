-- SQL script to enable Row Level Security and add policies for forms table

-- Enable RLS on the forms table
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view forms
CREATE POLICY "Anyone can view forms" 
ON forms FOR SELECT 
TO authenticated, anon
USING (true);

-- Create policy to allow anyone to insert new forms
CREATE POLICY "Anyone can insert forms" 
ON forms FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create policy to allow anyone to update forms
CREATE POLICY "Anyone can update forms" 
ON forms FOR UPDATE 
TO authenticated, anon
USING (true) 
WITH CHECK (true);

-- Create policy to allow anyone to delete forms
CREATE POLICY "Anyone can delete forms" 
ON forms FOR DELETE 
TO authenticated, anon
USING (true);

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Forms table policies created successfully';
END
$$; 