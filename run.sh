#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please run setup.sh first."
  exit 1
fi

# Check if API key is set
if grep -q "your_api_key_here" .env; then
  echo "Error: API key not set in .env file. Please update it with your actual API key."
  exit 1
fi

# Check if dist directory exists
if [ ! -d dist ]; then
  echo "Building the application..."
  npm run build
fi

# Start the server
echo "Starting the server..."
echo "Open http://localhost:3000 in your browser"
npm run start 