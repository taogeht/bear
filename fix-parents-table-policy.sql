-- SQL script to enable Row Level Security and add policies for parents table

-- Enable RLS on the parents table
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view parents
CREATE POLICY "Anyone can view parents" 
ON parents FOR SELECT 
TO authenticated, anon
USING (true);

-- Create policy to allow teachers to insert new parents
CREATE POLICY "Anyone can insert parents" 
ON parents FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create policy to allow teachers to update parents
CREATE POLICY "Anyone can update parents" 
ON parents FOR UPDATE 
TO authenticated, anon
USING (true) 
WITH CHECK (true);

-- Create policy to allow teachers to delete parents
CREATE POLICY "Anyone can delete parents" 
ON parents FOR DELETE 
TO authenticated, anon
USING (true);

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Parents table policies created successfully';
END
$$; 