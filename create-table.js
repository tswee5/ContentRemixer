import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables
config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and anon key are required.');
  console.error('Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function createSavedTweetsTable() {
  console.log('Checking if saved_tweets table exists...');
  
  try {
    // Try to query the table to see if it exists
    const { error: queryError } = await supabase
      .from('saved_tweets')
      .select('*')
      .limit(1);
    
    // If there's no error, the table exists
    if (!queryError) {
      console.log('Table already exists!');
      return;
    }
    
    // Check if the error is about the table not existing
    if (queryError && queryError.message && queryError.message.includes('does not exist')) {
      console.log('Table does not exist. Creating it...');
      
      // Display SQL instructions for manual creation
      const sqlContent = `
CREATE TABLE IF NOT EXISTS saved_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;
      
      console.log('\n=== MANUAL TABLE CREATION REQUIRED ===');
      console.log('Please follow these steps to create the table:');
      console.log('1. Log in to your Supabase dashboard at https://app.supabase.com/');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Create a new query');
      console.log('5. Paste the following SQL:');
      console.log('\n```sql');
      console.log(sqlContent);
      console.log('```\n');
      console.log('6. Click "Run" to execute the query');
      console.log('7. After creating the table, run this script again to verify');
      console.log('=== END OF INSTRUCTIONS ===\n');
      
      // Exit with a special code to indicate manual intervention is needed
      process.exit(2);
    } else {
      console.error('Unexpected error:', queryError);
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

createSavedTweetsTable(); 