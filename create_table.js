import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

// Read the SQL file
const sqlCommand = fs.readFileSync('./create_saved_tweets_table.sql', 'utf8');

async function createTable() {
  console.log('Creating saved_tweets table...');
  console.log('SQL command:', sqlCommand);
  
  try {
    // First, try to create the table using direct SQL
    // This might not work if the RPC function doesn't exist
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: sqlCommand });
      
      if (error) {
        throw error;
      }
      
      console.log('Table created successfully using RPC!');
      return;
    } catch (rpcError) {
      console.log('RPC method failed:', rpcError.message);
      console.log('Trying alternative method...');
    }
    
    // Alternative method: Try to insert a record, which will create the table if it doesn't exist
    console.log('Attempting to create table by inserting a record...');
    
    // First, try to query the table to see if it exists
    const { error: queryError } = await supabase
      .from('saved_tweets')
      .select('*')
      .limit(1);
    
    if (!queryError) {
      console.log('Table already exists!');
      return;
    }
    
    // Try to insert a record, which will create the table
    const { error: insertError } = await supabase
      .from('saved_tweets')
      .insert([{ content: 'Test tweet - will be deleted' }]);
    
    if (insertError) {
      console.error('Error inserting record:', insertError.message || insertError);
      
      // Provide manual instructions
      console.log('\nPlease create the table manually using the Supabase dashboard:');
      console.log('1. Go to https://app.supabase.com/');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor (left sidebar)');
      console.log('4. Create a new query');
      console.log('5. Paste and run the following SQL:');
      console.log('\n```sql');
      console.log(sqlCommand);
      console.log('```\n');
      
      return;
    }
    
    console.log('Table created successfully by inserting a record!');
    
    // Delete the test record
    const { error: deleteError } = await supabase
      .from('saved_tweets')
      .delete()
      .eq('content', 'Test tweet - will be deleted');
    
    if (deleteError) {
      console.error('Error deleting test record:', deleteError.message || deleteError);
    } else {
      console.log('Test record deleted successfully.');
    }
  } catch (error) {
    console.error('Error creating table:', error.message || error);
    
    // Provide manual instructions
    console.log('\nPlease create the table manually using the Supabase dashboard:');
    console.log('1. Go to https://app.supabase.com/');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor (left sidebar)');
    console.log('4. Create a new query');
    console.log('5. Paste and run the following SQL:');
    console.log('\n```sql');
    console.log(sqlCommand);
    console.log('```\n');
  }
}

// Execute the function
createTable(); 