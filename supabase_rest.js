#!/usr/bin/env node

import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
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

// Promisify exec
const execPromise = promisify(exec);

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

// Display help if no command is provided
if (!command) {
  showHelp();
  process.exit(0);
}

// Main function to handle commands
async function main() {
  try {
    switch (command) {
      case 'init':
        await initializeTable();
        break;
      case 'list':
        await listTweets();
        break;
      case 'add':
        if (args.length < 2) {
          console.error('Error: Tweet content is required.');
          console.error('Usage: node supabase_rest.js add "Your tweet content"');
          process.exit(1);
        }
        await addTweet(args.slice(1).join(' '));
        break;
      case 'delete':
        if (args.length < 2) {
          console.error('Error: Tweet ID is required.');
          console.error('Usage: node supabase_rest.js delete <id>');
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
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
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
  
  // First, check if the table exists by trying to query it
  try {
    console.log('Checking if table exists...');
    
    const checkCommand = `curl -s -X GET "${supabaseUrl}/rest/v1/saved_tweets?limit=1" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}"`;
    
    const { stdout: checkOutput } = await execPromise(checkCommand);
    
    // If we get a valid response (empty array or data), the table exists
    if (checkOutput === '[]' || checkOutput.startsWith('[{')) {
      console.log('Table already exists!');
      return;
    }
    
    // If we get here, the table doesn't exist or there was an error
    console.log('Table does not exist. Creating it...');
    
    // Create a temporary SQL file
    const tempSqlFile = 'temp_create_table.sql';
    fs.writeFileSync(tempSqlFile, sqlCommand);
    
    // Use psql command if available
    try {
      console.log('Attempting to create table using curl...');
      
      // Try to create the table using the REST API
      const createCommand = `curl -s -X POST "${supabaseUrl}/rest/v1/rpc/sql" \\
        -H "apikey: ${supabaseKey}" \\
        -H "Authorization: Bearer ${supabaseKey}" \\
        -H "Content-Type: application/json" \\
        -d '{"query": "${sqlCommand.replace(/"/g, '\\"').replace(/\n/g, ' ')}"}'`;
      
      const { stdout: createOutput } = await execPromise(createCommand);
      
      console.log('Response:', createOutput);
      
      // Check if the table was created by trying to query it again
      const { stdout: verifyOutput } = await execPromise(checkCommand);
      
      if (verifyOutput === '[]' || verifyOutput.startsWith('[{')) {
        console.log('Table created successfully!');
      } else {
        console.error('Table creation may have failed. Response:', verifyOutput);
        
        // Try alternative method: direct POST to create a record
        console.log('Trying alternative method: creating a record...');
        
        const insertCommand = `curl -s -X POST "${supabaseUrl}/rest/v1/saved_tweets" \\
          -H "apikey: ${supabaseKey}" \\
          -H "Authorization: Bearer ${supabaseKey}" \\
          -H "Content-Type: application/json" \\
          -H "Prefer: return=minimal" \\
          -d '{"content": "Test tweet - will be deleted"}'`;
        
        const { stdout: insertOutput } = await execPromise(insertCommand);
        
        console.log('Insert response:', insertOutput);
        
        // Check if the table exists now
        const { stdout: finalVerifyOutput } = await execPromise(checkCommand);
        
        if (finalVerifyOutput === '[]' || finalVerifyOutput.startsWith('[{')) {
          console.log('Table created successfully via record insertion!');
          
          // Delete the test record
          console.log('Deleting test record...');
          
          const deleteCommand = `curl -s -X DELETE "${supabaseUrl}/rest/v1/saved_tweets?content=eq.Test%20tweet%20-%20will%20be%20deleted" \\
            -H "apikey: ${supabaseKey}" \\
            -H "Authorization: Bearer ${supabaseKey}"`;
          
          await execPromise(deleteCommand);
          
          console.log('Test record deleted.');
        } else {
          console.error('All automatic methods failed. Please create the table manually using the Supabase dashboard.');
          console.log('SQL command to run:');
          console.log(sqlCommand);
        }
      }
    } catch (error) {
      console.error('Error creating table:', error.message);
      console.error('Please create the table manually using the Supabase dashboard.');
      console.log('SQL command to run:');
      console.log(sqlCommand);
    } finally {
      // Clean up the temporary SQL file
      if (fs.existsSync(tempSqlFile)) {
        fs.unlinkSync(tempSqlFile);
      }
    }
  } catch (error) {
    console.error('Error checking if table exists:', error.message);
    throw error;
  }
}

// Function to list all saved tweets
async function listTweets() {
  try {
    console.log('Fetching saved tweets...');
    
    const command = `curl -s -X GET "${supabaseUrl}/rest/v1/saved_tweets?select=*&order=created_at.desc" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}"`;
    
    const { stdout } = await execPromise(command);
    
    if (stdout === '[]') {
      console.log('No saved tweets found.');
      return;
    }
    
    try {
      const tweets = JSON.parse(stdout);
      
      console.log('Saved Tweets:');
      console.log('=============');
      
      tweets.forEach((tweet, index) => {
        console.log(`[${index + 1}] ID: ${tweet.id}`);
        console.log(`    Content: ${tweet.content}`);
        console.log(`    Created: ${new Date(tweet.created_at).toLocaleString()}`);
        console.log('');
      });
    } catch (parseError) {
      console.error('Error parsing response:', parseError.message);
      console.log('Raw response:', stdout);
    }
  } catch (error) {
    console.error('Error listing tweets:', error.message);
    throw error;
  }
}

// Function to add a new tweet
async function addTweet(content) {
  try {
    console.log('Adding tweet...');
    
    const command = `curl -s -X POST "${supabaseUrl}/rest/v1/saved_tweets" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}" \\
      -H "Content-Type: application/json" \\
      -H "Prefer: return=representation" \\
      -d '{"content": "${content.replace(/"/g, '\\"')}"}'`;
    
    const { stdout } = await execPromise(command);
    
    try {
      const tweets = JSON.parse(stdout);
      
      if (tweets.length > 0) {
        console.log('Tweet added successfully!');
        console.log('ID:', tweets[0].id);
        console.log('Content:', tweets[0].content);
        console.log('Created:', new Date(tweets[0].created_at).toLocaleString());
      } else {
        console.log('Tweet added, but no details returned.');
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError.message);
      console.log('Raw response:', stdout);
    }
  } catch (error) {
    console.error('Error adding tweet:', error.message);
    throw error;
  }
}

// Function to delete a tweet
async function deleteTweet(id) {
  try {
    console.log('Deleting tweet...');
    
    const command = `curl -s -X DELETE "${supabaseUrl}/rest/v1/saved_tweets?id=eq.${id}" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}"`;
    
    const { stdout } = await execPromise(command);
    
    console.log('Tweet deleted successfully!');
  } catch (error) {
    console.error('Error deleting tweet:', error.message);
    throw error;
  }
}

// Function to show help
function showHelp() {
  console.log('Supabase REST CLI');
  console.log('================');
  console.log('');
  console.log('Usage:');
  console.log('  node supabase_rest.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  init                     Initialize the saved_tweets table');
  console.log('  list                     List all saved tweets');
  console.log('  add <content>            Add a new tweet');
  console.log('  delete <id>              Delete a tweet by ID');
  console.log('  help                     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node supabase_rest.js init');
  console.log('  node supabase_rest.js list');
  console.log('  node supabase_rest.js add "This is a test tweet"');
  console.log('  node supabase_rest.js delete 123e4567-e89b-12d3-a456-426614174000');
}

// Run the main function
main(); 