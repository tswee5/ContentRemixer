# Content Remixer

A web application that allows you to remix your content into different formats using AI, including generating tweets, emails, blog posts, and more.

## New Feature: Save Tweets for Later

You can now save generated tweets to a database and access them later from the "Saved Tweets" sidebar. This feature allows you to:

- Save tweets you like for later use
- View all your saved tweets in a sidebar
- Tweet directly from the saved tweets list
- Delete saved tweets you no longer need

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Supabase account and project at [https://supabase.com](https://supabase.com)
4. In your Supabase project, create a new table called `saved_tweets` with the following columns:
   - `id` (uuid, primary key)
   - `content` (text, not null)
   - `created_at` (timestamp with time zone, default: now())
5. Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```
6. Update the `.env` file with your Supabase URL and anon key from your Supabase project settings
7. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Enter your content in the input box
2. Select a remix option (summarize, simplify, professional tone, etc.)
3. Click "Remix Content" to generate the remixed content
4. For tweets:
   - Click "Save" to save a tweet to your database for later use
   - Click "Tweet" to open Twitter with the tweet pre-filled
5. Click "Saved Tweets" in the top right to view your saved tweets
6. From the saved tweets sidebar, you can:
   - View all your saved tweets
   - Tweet directly from the saved list
   - Delete tweets you no longer need

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Supabase (for database)
- Claude API (for content remixing)

## Features

1. Paste in text you want to remix
2. Choose from multiple remix options:
   - Summarize content
   - Simplify complex text
   - Convert to professional tone
   - Convert to casual tone
   - Generate tweets from blog posts
   - Create professional emails
   - Expand content into blog posts
   - Generate social media posts
3. Send the request to Claude AI API
4. See the remixed content in the output box

## Specialized Remixer Functions

The app now includes specialized remixer functions for different use cases:

### Tweet Generation
- Converts blog posts into a series of tweets
- Follows the style and tone of the original content
- Ensures tweets are under 280 characters
- Returns at least 5 tweet options

### Email Generation
- Converts content into a professional email format
- Includes subject line, greeting, body, and closing
- Maintains professional tone

### Blog Post Generation
- Expands content into a well-structured blog post
- Includes introduction, body paragraphs with subheadings, and conclusion
- Maintains key points from the original content

### Social Media Post Generation
- Creates 3-5 different posts for various platforms
- Each post highlights different aspects of the original content
- Optimized for engagement

## API Integration

The app uses the Anthropic Claude API for content remixing. To set up:

1. Get an API key from Anthropic
2. Create a `.env` file in the root directory with:
   ```
   VITE_CLAUDE_API_KEY=your_api_key_here
   ```
3. Install dependencies and start the server

## Deployment

To build the app for production:

```bash
npm run build
```

The build files will be in the `dist` directory, ready to be deployed to services like Vercel.

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Vite

# challenges 
- add in another AI API
- Add a way to upload audio files tto have them transcribed 
- Click to tweet or to schedule a tweet from the output
- Add a way to save the remized output to a database 