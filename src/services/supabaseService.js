import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are defined
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and anon key are required. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all saved tweets
 * @returns {Promise<Array>} Array of saved tweets
 */
export async function fetchSavedTweets() {
  const { data, error } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }
  
  return data;
}

/**
 * Save a tweet to the database
 * @param {string} content - The content of the tweet
 * @returns {Promise<Object|null>} The saved tweet or null if there was an error
 */
export async function saveTweet(content) {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    console.error('Tweet content is required and must be a non-empty string');
    return null;
  }

  const { data, error } = await supabase
    .from('saved_tweets')
    .insert([{ content: content.trim() }])
    .select();
    
  if (error) {
    console.error('Error saving tweet:', error);
    return null;
  }
  
  return data[0];
}

/**
 * Delete a tweet from the database
 * @param {string} id - The ID of the tweet to delete
 * @returns {Promise<boolean>} True if the tweet was deleted successfully, false otherwise
 */
export async function deleteTweet(id) {
  if (!id) {
    console.error('Tweet ID is required');
    return false;
  }

  const { error } = await supabase
    .from('saved_tweets')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting tweet:', error);
    return false;
  }
  
  return true;
}

/**
 * Check if the saved_tweets table exists
 * @returns {Promise<boolean>} True if the table exists, false otherwise
 */
export async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error && error.code === '42P01') { // PostgreSQL error code for "relation does not exist"
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
}

export default {
  fetchSavedTweets,
  saveTweet,
  deleteTweet,
  checkTableExists,
  supabase
}; 