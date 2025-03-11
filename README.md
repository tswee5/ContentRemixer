# Content Remixer

A simple content remixing tool built with React and Tailwind CSS.

## Features

1. Paste in text you want to remix
2. Click a button to apply the remixing
3. Send the request to AI API endpoint
4. See the remix in the output box

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

## API Integration

The app is currently set up with a placeholder API endpoint. To connect to a real Claude API:

1. Update the fetch URL in `src/App.tsx` to point to your actual API endpoint
2. Ensure your API returns a JSON response with a `remixedText` property

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