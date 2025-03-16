import { config } from 'dotenv';
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

// Extract project reference from the URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

// Function to get PostgreSQL connection info
async function getConnectionInfo() {
  console.log('Supabase Project Information:');
  console.log('----------------------------');
  console.log(`Project Reference: ${projectRef}`);
  console.log(`API URL: ${supabaseUrl}`);
  
  console.log('\nTo create the saved_tweets table, you have two options:');
  
  console.log('\nOption 1: Use the Supabase Dashboard SQL Editor');
  console.log('-------------------------------------------');
  console.log('1. Go to https://app.supabase.com/project/_/sql');
  console.log('2. Create a new query');
  console.log('3. Paste and run the following SQL:');
  console.log('\n```sql');
  console.log(`CREATE TABLE IF NOT EXISTS saved_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`);
  console.log('```');
  
  console.log('\nOption 2: Use the Supabase REST API');
  console.log('--------------------------------');
  console.log('Run the following curl command in your terminal:');
  console.log('\n```bash');
  console.log(`curl -X POST '${supabaseUrl}/rest/v1/saved_tweets' \\
  -H 'apikey: ${supabaseKey}' \\
  -H 'Authorization: Bearer ${supabaseKey}' \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: return=minimal' \\
  -d '{"content": "Test tweet"}'`);
  console.log('```');
  
  console.log('\nThis will attempt to insert a test record, which will create the table if it doesn\'t exist.');
  console.log('If you get an error about the table not existing, you\'ll need to use Option 1.');
  
  console.log('\nTo verify the table exists, run:');
  console.log('\n```bash');
  console.log(`curl -X GET '${supabaseUrl}/rest/v1/saved_tweets?select=*' \\
  -H 'apikey: ${supabaseKey}' \\
  -H 'Authorization: Bearer ${supabaseKey}'`);
  console.log('```');
}

getConnectionInfo(); 