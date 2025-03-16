# Saved Tweets Feature Setup Guide

This guide will walk you through setting up and using the saved tweets feature for the Content Remixer application.

## Table of Contents
1. [Creating the Database Table](#creating-the-database-table)
2. [Using the CLI Tool](#using-the-cli-tool)
3. [Integrating with Your Application](#integrating-with-your-application)
4. [Troubleshooting](#troubleshooting)

## Creating the Database Table

You need to create a `saved_tweets` table in your Supabase database. Follow these steps:

### Option 1: Using the Supabase Dashboard (Recommended)

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the `create_saved_tweets_table.sql` file
6. Click "Run" to execute the query

### Option 2: Using the CLI Tool

Our CLI tool attempts to create the table automatically, but it may not always work due to permission issues:

```bash
./supabase_rest.js init
```

If this fails, please use Option 1.

## Using the CLI Tool

The `supabase_rest.js` script provides a command-line interface for interacting with your saved tweets.

### Prerequisites

Make sure you have:
- Node.js installed
- A `.env` file with your Supabase credentials:
  ```
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

### Available Commands

#### Initialize the Table
```bash
./supabase_rest.js init
```

#### List All Saved Tweets
```bash
./supabase_rest.js list
```

#### Add a New Tweet
```bash
./supabase_rest.js add "Your tweet content here"
```

#### Delete a Tweet
```bash
./supabase_rest.js delete <tweet_id>
```

#### Show Help
```bash
./supabase_rest.js help
```

## Integrating with Your Application

To integrate the saved tweets feature with your React application, you can use the Supabase JavaScript client.

### Example Code

```javascript
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch all saved tweets
async function fetchSavedTweets() {
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

// Function to save a tweet
async function saveTweet(content) {
  const { data, error } = await supabase
    .from('saved_tweets')
    .insert([{ content }])
    .select();
    
  if (error) {
    console.error('Error saving tweet:', error);
    return null;
  }
  
  return data[0];
}

// Function to delete a tweet
async function deleteTweet(id) {
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
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { fetchSavedTweets, saveTweet, deleteTweet } from './supabaseService';

function SavedTweets() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTweets();
  }, []);
  
  async function loadTweets() {
    setLoading(true);
    const data = await fetchSavedTweets();
    setTweets(data);
    setLoading(false);
  }
  
  async function handleSaveTweet(content) {
    const newTweet = await saveTweet(content);
    if (newTweet) {
      setTweets([newTweet, ...tweets]);
    }
  }
  
  async function handleDeleteTweet(id) {
    const success = await deleteTweet(id);
    if (success) {
      setTweets(tweets.filter(tweet => tweet.id !== id));
    }
  }
  
  if (loading) {
    return <div>Loading saved tweets...</div>;
  }
  
  return (
    <div>
      <h2>Saved Tweets</h2>
      {tweets.length === 0 ? (
        <p>No saved tweets yet.</p>
      ) : (
        <ul>
          {tweets.map(tweet => (
            <li key={tweet.id}>
              <p>{tweet.content}</p>
              <button onClick={() => handleDeleteTweet(tweet.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavedTweets;
```

## Troubleshooting

### Table Creation Issues

If you're having trouble creating the table:

1. Make sure you have the necessary permissions in your Supabase project
2. Try creating the table manually using the SQL Editor in the Supabase Dashboard
3. Check that the `uuid-ossp` extension is enabled in your database

### CLI Tool Issues

If the CLI tool is not working:

1. Make sure your `.env` file is correctly set up with your Supabase credentials
2. Check that you have the necessary Node.js packages installed
3. Ensure the script has executable permissions (`chmod +x supabase_rest.js`)

### API Issues

If you're having trouble with the API:

1. Check your Supabase URL and API key
2. Verify that the table exists and has the correct structure
3. Check the browser console for any error messages
4. Make sure your RLS (Row Level Security) policies are correctly set up

### Getting Help

If you continue to have issues, you can:

1. Check the [Supabase documentation](https://supabase.io/docs)
2. Join the [Supabase Discord](https://discord.supabase.com)
3. Open an issue on the project repository 