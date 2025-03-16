# Saved Tweets Feature

This feature allows you to save generated tweets to a Supabase database and access them later from the "Saved Tweets" sidebar in the Content Remixer application.

## Setup Instructions

### 1. Create the Saved Tweets Table in Supabase

Follow these steps to create the `saved_tweets` table in your Supabase project:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (`gpygcvvanmqzrxcqtcqo`)
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query"
5. Paste the following SQL code:

```sql
-- Create the saved_tweets table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

6. Click "Run" to execute the query

### 2. Verify the Table Was Created

After creating the table, you can verify it was created successfully by running the following command in your terminal:

```bash
node saved_tweets_cli.js list
```

You should see a message saying "No saved tweets found." if the table was created successfully but is empty.

## Using the Saved Tweets Feature

### In the Content Remixer Application

1. Generate tweets using the "Generate Tweets" option
2. Click the "Save" button next to any tweet you want to save
3. Click the "Saved Tweets" button in the top right to view your saved tweets
4. From the saved tweets sidebar, you can:
   - View all your saved tweets
   - Tweet directly from the saved list
   - Delete tweets you no longer need

### Using the Command Line Interface

You can also manage your saved tweets from the command line using the `saved_tweets_cli.js` script:

```bash
# List all saved tweets
node saved_tweets_cli.js list

# Add a new tweet
node saved_tweets_cli.js add "This is a test tweet"

# Delete a tweet by ID
node saved_tweets_cli.js delete <id>

# Show help
node saved_tweets_cli.js help
```

## Troubleshooting

If you encounter any issues with the saved tweets feature:

1. Make sure the `saved_tweets` table exists in your Supabase project
2. Check that your Supabase URL and anon key are correctly set in the `.env` file
3. Verify that your Supabase project has the correct permissions for the `saved_tweets` table

## Technical Details

The saved tweets feature uses:

- Supabase as the database backend
- React for the frontend UI
- The Supabase JavaScript client for database operations

The saved tweets are stored with the following structure:
- `id`: A UUID that serves as the primary key
- `content`: The text content of the tweet
- `created_at`: The timestamp when the tweet was saved 