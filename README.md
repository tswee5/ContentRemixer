# Content Remixer

A versatile content remixing tool built with React and Tailwind CSS, powered by Claude AI.

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

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## Usage

1. Paste your content into the input box
2. Click the "Remix Content" button
3. View the remixed content in the output box

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