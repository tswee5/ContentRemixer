#!/usr/bin/env node

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

// Promisify exec for curl commands
const execPromise = promisify(exec);

async function testSaveTweet() {
  console.log('=== Testing Tweet Saving ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');
  
  // Test 1: Save tweet using Supabase JS client
  console.log('\n=== Test 1: Save tweet using Supabase JS client ===');
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .insert([{ content: 'Test tweet via JS client' }])
      .select();
    
    console.log('Response data:', data);
    console.log('Response error:', error);
    
    if (error) {
      console.error('Failed to save tweet using JS client');
    } else if (data && data.length > 0) {
      console.log('Successfully saved tweet using JS client!');
      console.log('Tweet ID:', data[0].id);
    } else {
      console.log('No error, but no data returned either.');
    }
  } catch (error) {
    console.error('Exception when saving tweet using JS client:', error.message);
  }
  
  // Test 2: Save tweet using curl with verbose output
  console.log('\n=== Test 2: Save tweet using curl with verbose output ===');
  try {
    const command = `curl -v -X POST "${supabaseUrl}/rest/v1/saved_tweets" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}" \\
      -H "Content-Type: application/json" \\
      -H "Prefer: return=representation" \\
      -d '{"content": "Test tweet via curl"}'`;
    
    const { stdout, stderr } = await execPromise(command);
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);
    
    if (stdout.includes('"id"')) {
      console.log('Successfully saved tweet using curl!');
    } else {
      console.log('Failed to save tweet using curl or no ID returned');
    }
  } catch (error) {
    console.error('Exception when saving tweet using curl:', error.message);
  }
  
  // Test 3: List tweets to see if they were saved
  console.log('\n=== Test 3: List tweets to verify saving ===');
  try {
    // First with JS client
    console.log('Listing tweets with JS client:');
    const { data: jsData, error: jsError } = await supabase
      .from('saved_tweets')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('JS client data:', jsData);
    console.log('JS client error:', jsError);
    
    // Then with curl
    console.log('\nListing tweets with curl:');
    const { stdout } = await execPromise(`curl -s "${supabaseUrl}/rest/v1/saved_tweets?select=*" -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}"`);
    console.log('Curl response:', stdout);
    
    try {
      const tweets = JSON.parse(stdout);
      console.log('Number of tweets found:', tweets.length);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  } catch (error) {
    console.error('Exception when listing tweets:', error.message);
  }
  
  // Test 4: Check if the table exists and its structure
  console.log('\n=== Test 4: Check table structure ===');
  try {
    // This will only work if you have the pg_dump RPC function set up
    const command = `curl -s -X POST "${supabaseUrl}/rest/v1/rpc/get_table_definition" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}" \\
      -H "Content-Type: application/json" \\
      -d '{"table_name": "saved_tweets"}'`;
    
    try {
      const { stdout } = await execPromise(command);
      console.log('Table definition:', stdout);
    } catch (e) {
      console.log('Could not get table definition (this is expected if the RPC function does not exist)');
    }
    
    // Try to get table info from information_schema
    console.log('\nChecking information_schema:');
    const infoCommand = `curl -s -X GET "${supabaseUrl}/rest/v1/information_schema/tables?select=*&table_name=eq.saved_tweets" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}"`;
    
    try {
      const { stdout } = await execPromise(infoCommand);
      console.log('Information schema response:', stdout);
    } catch (e) {
      console.log('Could not query information_schema');
    }
  } catch (error) {
    console.error('Exception when checking table structure:', error.message);
  }
}

testSaveTweet().catch(error => {
  console.error('Test script error:', error);
}); 