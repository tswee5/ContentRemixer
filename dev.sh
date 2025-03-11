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

# Start the development server
echo "Starting the development server..."
echo "This will run both the Vite dev server and the API proxy server."
echo "Open http://localhost:5173 in your browser for the development server."
echo "The API proxy will be available at http://localhost:3000/api/v1"
echo ""
echo "Press Ctrl+C to stop the servers."
echo ""

# Run the development server
npm run dev:all 