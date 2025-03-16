#!/usr/bin/env node

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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
      case 'list':
        await listTweets();
        break;
      case 'add':
        if (args.length < 2) {
          console.error('Error: Tweet content is required.');
          console.error('Usage: node saved_tweets_cli.js add "Your tweet content"');
          process.exit(1);
        }
        await addTweet(args.slice(1).join(' '));
        break;
      case 'delete':
        if (args.length < 2) {
          console.error('Error: Tweet ID is required.');
          console.error('Usage: node saved_tweets_cli.js delete <id>');
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

// Function to list all saved tweets
async function listTweets() {
  const { data, error } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tweets:', error.message);
    return;
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
    return;
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
    return;
  }
  
  console.log('Tweet deleted successfully!');
}

// Function to show help
function showHelp() {
  console.log('Saved Tweets CLI');
  console.log('===============');
  console.log('');
  console.log('Usage:');
  console.log('  node saved_tweets_cli.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list                     List all saved tweets');
  console.log('  add <content>            Add a new tweet');
  console.log('  delete <id>              Delete a tweet by ID');
  console.log('  help                     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node saved_tweets_cli.js list');
  console.log('  node saved_tweets_cli.js add "This is a test tweet"');
  console.log('  node saved_tweets_cli.js delete 123e4567-e89b-12d3-a456-426614174000');
}

// Run the main function
main(); 