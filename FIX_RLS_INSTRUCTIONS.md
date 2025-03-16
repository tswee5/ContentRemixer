# Fix Row Level Security (RLS) Policies for Saved Tweets

The issue with your saved tweets not appearing is due to Row Level Security (RLS) policies preventing inserts and reads. Follow these steps to fix it:

## Option 1: Using the Supabase Dashboard (Recommended)

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (`gpygcvvanmqzrxcqtcqo`)
3. In the left sidebar, click on "Table Editor"
4. Find and click on the `saved_tweets` table
5. Click on the "Policies" tab
6. You should see the existing policies (if any)
7. Click "New Policy" button
8. Choose "Create a policy from scratch"
9. For "Policy Name", enter: `Allow all operations for anonymous users`
10. For "Allowed Operations", select "All operations"
11. For "Target Roles", select "anon" (for anonymous access with your anon key)
12. For "Using expression", enter: `true`
13. For "With check expression", enter: `true`
14. Click "Save Policy"
15. Repeat steps 7-14 to create another policy for authenticated users:
    - Policy Name: `Allow all operations for authenticated users`
    - Allowed Operations: All operations
    - Target Roles: authenticated
    - Using expression: true
    - With check expression: true

## Option 2: Using the SQL Editor

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query"
5. Copy and paste the contents of the `fix_rls_policies.sql` file:

```sql
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
```

6. Click "Run" to execute the query

## Verify the Fix

After applying either option, run the following command in your terminal to verify that you can now save and list tweets:

```bash
./supabase_rest.js add "Test tweet after fixing RLS"
./supabase_rest.js list
```

You should now see your saved tweets listed.

## Understanding Row Level Security (RLS)

Row Level Security (RLS) is a feature in PostgreSQL that allows you to control which rows in a table are visible or modifiable by different users. By default, when RLS is enabled but no policies are defined, all operations are denied.

The policies we've created allow:
- Anonymous users (using the anon key) to perform all operations (select, insert, update, delete)
- Authenticated users to perform all operations

This is appropriate for a simple application where you want to allow all users to save and view tweets. For a production application, you might want to implement more restrictive policies based on user IDs or other criteria. 