#!/usr/bin/env node

import { config } from 'dotenv';
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

// Promisify exec
const execPromise = promisify(exec);

async function debugSupabase() {
  console.log('=== Supabase Debug Information ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');
  
  // Check if we can connect to Supabase
  console.log('\n=== Testing Supabase Connection ===');
  try {
    const { stdout: healthOutput } = await execPromise(`curl -s "${supabaseUrl}/rest/v1/"`);
    console.log('Connection response:', healthOutput);
  } catch (error) {
    console.error('Connection error:', error.message);
  }
  
  // List all tables
  console.log('\n=== Listing Tables ===');
  try {
    const { stdout: tablesOutput } = await execPromise(`curl -s "${supabaseUrl}/rest/v1/?apikey=${supabaseKey}"`);
    console.log('Tables response:', tablesOutput);
  } catch (error) {
    console.error('Error listing tables:', error.message);
  }
  
  // Check saved_tweets table
  console.log('\n=== Checking saved_tweets Table ===');
  try {
    const command = `curl -v -X GET "${supabaseUrl}/rest/v1/saved_tweets?select=*" -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}"`;
    console.log('Running command:', command);
    
    const { stdout, stderr } = await execPromise(command);
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);
  } catch (error) {
    console.error('Error checking saved_tweets table:', error.message);
  }
  
  // Try to add a tweet
  console.log('\n=== Trying to Add a Tweet ===');
  try {
    const command = `curl -v -X POST "${supabaseUrl}/rest/v1/saved_tweets" -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"content": "Debug test tweet"}'`;
    console.log('Running command:', command);
    
    const { stdout, stderr } = await execPromise(command);
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);
  } catch (error) {
    console.error('Error adding tweet:', error.message);
  }
  
  // Check if the table was created in the correct schema
  console.log('\n=== Checking Schema Information ===');
  try {
    const command = `curl -s -X GET "${supabaseUrl}/rest/v1/rpc/schema_information" -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}" -H "Content-Type: application/json" -d '{}'`;
    console.log('Running command:', command);
    
    const { stdout } = await execPromise(command);
    console.log('Schema information:', stdout);
  } catch (error) {
    console.error('Error checking schema information:', error.message);
    console.log('This is expected if the schema_information RPC function does not exist.');
  }
}

debugSupabase().catch(error => {
  console.error('Debug script error:', error);
}); 