#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "# Make sure this is your actual API key from Anthropic" > .env
  echo "VITE_CLAUDE_API_KEY=your_api_key_here" >> .env
  echo ".env file created. Please update it with your actual API key."
else
  echo ".env file already exists."
fi

# Remind user to set API key
echo "Don't forget to set your Claude API key in the .env file!"
echo "VITE_CLAUDE_API_KEY=your_api_key_here"

# Build the application
echo "Building the application..."
npm run build

# Instructions for running the app
echo ""
echo "=== RUNNING THE APPLICATION ==="
echo ""
echo "Option 1: Run in development mode (recommended for development)"
echo "  ./dev.sh"
echo ""
echo "Option 2: Run in production mode"
echo "  ./run.sh"
echo ""
echo "Then open your browser to the URL shown in the console"
echo ""
echo "=== TROUBLESHOOTING ==="
echo ""
echo "If you encounter any issues:"
echo "1. Make sure your API key is correctly set in the .env file"
echo "2. Check that ports 3000 and 5173 are not already in use"
echo "3. Look at the console output for any error messages" 