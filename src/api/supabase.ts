import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for saved tweets
export interface SavedTweet {
  id?: string;
  content: string;
  created_at?: string;
}

// Function to save a tweet
export const saveTweet = async (content: string): Promise<SavedTweet | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .insert([{ content }])
      .select();
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error saving tweet:', error);
    return null;
  }
};

// Function to get all saved tweets
export const getSavedTweets = async (): Promise<SavedTweet[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching saved tweets:', error);
    return [];
  }
};

// Function to delete a saved tweet
export const deleteSavedTweet = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_tweets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return false;
  }
};

// Function to update a saved tweet
export const updateTweet = async (id: string, content: string): Promise<SavedTweet | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .update({ content })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error updating tweet:', error);
    return null;
  }
}; 