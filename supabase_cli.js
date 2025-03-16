#!/usr/bin/env node

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

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

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

// Display help if no command is provided
if (!command) {
  showHelp();
  rl.close();
  process.exit(0);
}

// Main function to handle commands
async function main() {
  try {
    switch (command) {
      case 'init':
        await initializeTable();
        break;
      case 'sql':
        if (args.length < 2) {
          console.error('Error: SQL command is required.');
          console.error('Usage: node supabase_cli.js sql "YOUR SQL COMMAND HERE"');
          rl.close();
          process.exit(1);
        }
        await executeSql(args.slice(1).join(' '));
        break;
      case 'list':
        await listTweets();
        break;
      case 'add':
        if (args.length < 2) {
          console.error('Error: Tweet content is required.');
          console.error('Usage: node supabase_cli.js add "Your tweet content"');
          rl.close();
          process.exit(1);
        }
        await addTweet(args.slice(1).join(' '));
        break;
      case 'delete':
        if (args.length < 2) {
          console.error('Error: Tweet ID is required.');
          console.error('Usage: node supabase_cli.js delete <id>');
          rl.close();
          process.exit(1);
        }
        await deleteTweet(args[1]);
        break;
      case 'help':
        showHelp();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        rl.close();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    rl.close();
    process.exit(1);
  }
  
  rl.close();
}

// Function to initialize the saved_tweets table
async function initializeTable() {
  console.log('Initializing saved_tweets table...');
  
  // SQL command to create the table
  const sqlCommand = `
CREATE TABLE IF NOT EXISTS saved_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;
  
  try {
    // First check if the table already exists
    const { error: queryError } = await supabase
      .from('saved_tweets')
      .select('*')
      .limit(1);
    
    if (!queryError) {
      console.log('Table already exists!');
      return;
    }
    
    // Try to execute the SQL command using curl
    console.log('Creating table using curl...');
    
    const execPromise = promisify(exec);
    const curlCommand = `curl -s -X POST "${supabaseUrl}/rest/v1/sql" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}" \\
      -H "Content-Type: application/json" \\
      -d '{"query": "${sqlCommand.replace(/"/g, '\\"').replace(/\n/g, ' ')}"}'`;
    
    try {
      const { stdout, stderr } = await execPromise(curlCommand);
      
      if (stderr) {
        console.error('Error executing curl command:', stderr);
        throw new Error(stderr);
      }
      
      // Check if the response contains an error
      if (stdout.includes('error')) {
        console.error('Error creating table:', stdout);
        throw new Error(stdout);
      }
      
      console.log('Table created successfully!');
      
      // Verify the table exists
      const { error: verifyError } = await supabase
        .from('saved_tweets')
        .select('*')
        .limit(1);
      
      if (verifyError) {
        if (verifyError.message.includes('does not exist')) {
          console.error('Table creation failed: The table does not exist after creation attempt.');
          throw new Error('Table creation failed');
        } else {
          console.error('Error verifying table:', verifyError.message);
          throw new Error(verifyError.message);
        }
      }
      
      console.log('Table verified successfully!');
    } catch (curlError) {
      console.error('Curl method failed:', curlError.message);
      
      // Try alternative method: direct POST to the table endpoint
      console.log('Trying alternative method...');
      
      // Try to insert a record, which will create the table
      const { error: insertError } = await supabase
        .from('saved_tweets')
        .insert([{ content: 'Test tweet - will be deleted' }]);
      
      if (insertError) {
        console.error('Error inserting record:', insertError.message || insertError);
        
        // Last resort: Ask user to create the table manually
        console.log('\nAutomatic table creation failed. Would you like to create it manually? (y/n)');
        const answer = await question('> ');
        
        if (answer.toLowerCase() === 'y') {
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
    }
  } catch (error) {
    console.error('Error initializing table:', error.message || error);
    throw error;
  }
}

// Function to execute custom SQL commands
async function executeSql(sqlCommand) {
  console.log('Executing SQL command:', sqlCommand);
  
  try {
    // Execute the SQL command using curl
    const execPromise = promisify(exec);
    const curlCommand = `curl -s -X POST "${supabaseUrl}/rest/v1/sql" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}" \\
      -H "Content-Type: application/json" \\
      -d '{"query": "${sqlCommand.replace(/"/g, '\\"')}"}'`;
    
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.error('Error executing curl command:', stderr);
      throw new Error(stderr);
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
    console.error('Error executing SQL command:', error.message || error);
    
    // Try alternative method using the REST API
    console.log('Trying alternative method...');
    
    try {
      // For SELECT queries, try to use the REST API
      if (sqlCommand.trim().toUpperCase().startsWith('SELECT')) {
        const table = sqlCommand.match(/FROM\s+([^\s;]+)/i)?.[1];
        
        if (table) {
          console.log(`Detected SELECT from table: ${table}`);
          
          // Extract any WHERE conditions
          const whereMatch = sqlCommand.match(/WHERE\s+(.+?)(?:ORDER BY|GROUP BY|LIMIT|;|$)/i);
          const whereCondition = whereMatch ? whereMatch[1].trim() : null;
          
          // Extract ORDER BY
          const orderByMatch = sqlCommand.match(/ORDER BY\s+(.+?)(?:LIMIT|;|$)/i);
          const orderBy = orderByMatch ? orderByMatch[1].trim() : null;
          
          // Extract LIMIT
          const limitMatch = sqlCommand.match(/LIMIT\s+(\d+)/i);
          const limit = limitMatch ? parseInt(limitMatch[1]) : null;
          
          // Build the query
          let query = supabase.from(table).select('*');
          
          if (whereCondition) {
            // This is a simplified approach - complex WHERE conditions won't work
            const [column, operator, value] = whereCondition.split(/\s+/);
            if (column && operator && value) {
              if (operator === '=') {
                query = query.eq(column, value.replace(/'/g, ''));
              } else if (operator === '!=') {
                query = query.neq(column, value.replace(/'/g, ''));
              }
              // Add more operators as needed
            }
          }
          
          if (orderBy) {
            const [column, direction] = orderBy.split(/\s+/);
            if (column) {
              query = query.order(column, { ascending: direction !== 'DESC' });
            }
          }
          
          if (limit) {
            query = query.limit(limit);
          }
          
          const { data, error } = await query;
          
          if (error) {
            console.error('Error executing query:', error.message);
            throw error;
          }
          
          console.log('Query executed successfully!');
          console.log('Results:', JSON.stringify(data, null, 2));
        } else {
          console.error('Could not determine table name from SELECT query');
          throw new Error('Could not determine table name from SELECT query');
        }
      } else {
        console.error('Non-SELECT queries are not supported via the alternative method');
        throw new Error('Non-SELECT queries are not supported via the alternative method');
      }
    } catch (alternativeError) {
      console.error('Alternative method failed:', alternativeError.message || alternativeError);
      throw error;
    }
  }
}

// Function to list all saved tweets
async function listTweets() {
  const { data, error } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tweets:', error.message);
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.log('No saved tweets found.');
    return;
  }
  
  console.log('Saved Tweets:');
  console.log('=============');
  
  data.forEach((tweet, index) => {
    console.log(`[${index + 1}] ID: ${tweet.id}`);
    console.log(`    Content: ${tweet.content}`);
    console.log(`    Created: ${new Date(tweet.created_at).toLocaleString()}`);
    console.log('');
  });
}

// Function to add a new tweet
async function addTweet(content) {
  const { data, error } = await supabase
    .from('saved_tweets')
    .insert([{ content }])
    .select();
  
  if (error) {
    console.error('Error adding tweet:', error.message);
    throw error;
  }
  
  console.log('Tweet added successfully!');
  console.log('ID:', data[0].id);
  console.log('Content:', data[0].content);
  console.log('Created:', new Date(data[0].created_at).toLocaleString());
}

// Function to delete a tweet
async function deleteTweet(id) {
  const { error } = await supabase
    .from('saved_tweets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting tweet:', error.message);
    throw error;
  }
  
  console.log('Tweet deleted successfully!');
}

// Function to show help
function showHelp() {
  console.log('Supabase CLI');
  console.log('===========');
  console.log('');
  console.log('Usage:');
  console.log('  node supabase_cli.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  init                     Initialize the saved_tweets table');
  console.log('  sql <sql_command>        Execute a custom SQL command');
  console.log('  list                     List all saved tweets');
  console.log('  add <content>            Add a new tweet');
  console.log('  delete <id>              Delete a tweet by ID');
  console.log('  help                     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node supabase_cli.js init');
  console.log('  node supabase_cli.js sql "SELECT * FROM saved_tweets"');
  console.log('  node supabase_cli.js list');
  console.log('  node supabase_cli.js add "This is a test tweet"');
  console.log('  node supabase_cli.js delete 123e4567-e89b-12d3-a456-426614174000');
}

// Run the main function
main(); 