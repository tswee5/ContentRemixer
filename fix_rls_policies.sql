-- Enable Row Level Security (RLS) on the saved_tweets table
ALTER TABLE saved_tweets ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON saved_tweets;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON saved_tweets;
DROP POLICY IF EXISTS "Allow read-only access for anonymous users" ON saved_tweets;

-- Create a policy that allows all operations for anonymous users (using the anon key)
CREATE POLICY "Allow all operations for anonymous users" 
  ON saved_tweets 
  FOR ALL 
  TO anon 
  USING (true) 
  WITH CHECK (true);

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
  ON saved_tweets 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'saved_tweets'; 