-- Create the saved_tweets table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_tweets ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
  ON saved_tweets 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Create a policy that allows read-only access for anonymous users
CREATE POLICY "Allow read-only access for anonymous users" 
  ON saved_tweets 
  FOR SELECT 
  TO anon 
  USING (true); 