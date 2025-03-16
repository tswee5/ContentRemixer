import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

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

// Get the SQL command from command line arguments
const sqlCommand = process.argv.slice(2).join(' ');

if (!sqlCommand) {
  console.error('Error: SQL command is required.');
  console.error('Usage: node supabase-sql.js "YOUR SQL COMMAND HERE"');
  console.error('Example: node supabase-sql.js "SELECT * FROM saved_tweets"');
  process.exit(1);
}

// Function to execute SQL command using curl
async function executeSqlWithCurl() {
  const execPromise = promisify(exec);
  
  // Extract project reference from the URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  
  // Construct the curl command
  const curlCommand = `curl -X POST 'https://${projectRef}.supabase.co/rest/v1/rpc/execute_sql' \\
    -H 'apikey: ${supabaseKey}' \\
    -H 'Authorization: Bearer ${supabaseKey}' \\
    -H 'Content-Type: application/json' \\
    -d '{"sql": "${sqlCommand.replace(/"/g, '\\"')}"}'`;
  
  try {
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.error('Error executing SQL command:', stderr);
      return;
    }
    
    // Try to parse the JSON response
    try {
      const response = JSON.parse(stdout);
      console.log('SQL command executed successfully!');
      console.log('Response:', JSON.stringify(response, null, 2));
    } catch (parseError) {
      console.log('Response:', stdout);
    }
  } catch (error) {
    console.error('Error executing curl command:', error.message);
  }
}

// Function to execute SQL command using the REST API
async function executeSqlWithRest() {
  try {
    // Make a POST request to the execute_sql RPC function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql: sqlCommand
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error executing SQL command:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('SQL command executed successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error executing SQL command:', error.message);
  }
}

// Try both methods
async function executeSQL() {
  console.log(`Executing SQL command: ${sqlCommand}`);
  
  try {
    await executeSqlWithRest();
  } catch (restError) {
    console.error('REST API method failed:', restError.message);
    console.log('Trying curl method...');
    
    try {
      await executeSqlWithCurl();
    } catch (curlError) {
      console.error('Curl method failed:', curlError.message);
      console.error('Both methods failed to execute the SQL command.');
      
      // Provide instructions for manual execution
      console.log('\n=== MANUAL SQL EXECUTION ===');
      console.log('Please execute this SQL command in the Supabase dashboard:');
      console.log('\n```sql');
      console.log(sqlCommand);
      console.log('```\n');
    }
  }
}

executeSQL(); 