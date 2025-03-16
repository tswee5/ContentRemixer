#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if Supabase credentials are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "Error: Supabase URL and anon key are required"
  echo "Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  exit 1
fi

# Extract project reference from the URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed -n 's/https:\/\/\([^.]*\)\.supabase\.co.*/\1/p')

echo "Creating saved_tweets table in Supabase project: $PROJECT_REF"

# SQL command to create the table
SQL_COMMAND="CREATE TABLE IF NOT EXISTS saved_tweets (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());"

echo "Executing SQL command: $SQL_COMMAND"

# Provide manual instructions
echo "Please create the table manually using the Supabase dashboard:"
echo ""
echo "1. Go to https://app.supabase.com/"
echo "2. Select your project"
echo "3. Go to the SQL Editor (left sidebar)"
echo "4. Create a new query"
echo "5. Paste and run the following SQL:"
echo ""
echo "$SQL_COMMAND"
echo ""
echo "6. After creating the table, run the verification command below to verify"
echo ""

# Verification command
VERIFY_CMD="curl -X GET '$VITE_SUPABASE_URL/rest/v1/saved_tweets?select=*&limit=1' -H 'apikey: $VITE_SUPABASE_ANON_KEY' -H 'Authorization: Bearer $VITE_SUPABASE_ANON_KEY'"

echo "To verify the table exists, run this command:"
echo "$VERIFY_CMD"
echo ""

# Ask if the user wants to verify now
read -p "Do you want to verify if the table exists now? (y/n): " VERIFY_NOW

if [ "$VERIFY_NOW" = "y" ] || [ "$VERIFY_NOW" = "Y" ]; then
  echo "Verifying table exists..."
  curl -s -X GET "$VITE_SUPABASE_URL/rest/v1/saved_tweets?select=*&limit=1" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
    -o /tmp/supabase_verify.json
  
  # Check if the response contains an error
  if grep -q "does not exist" /tmp/supabase_verify.json; then
    echo "Verification failed. Table does not exist."
    cat /tmp/supabase_verify.json
  else
    echo "Verification succeeded! Table exists."
    cat /tmp/supabase_verify.json
  fi
fi

# Ask if the user wants to try inserting a test record
read -p "Do you want to try inserting a test record? (y/n): " INSERT_TEST

if [ "$INSERT_TEST" = "y" ] || [ "$INSERT_TEST" = "Y" ]; then
  echo "Inserting test record..."
  curl -s -X POST "$VITE_SUPABASE_URL/rest/v1/saved_tweets" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d '{"content": "Test tweet from terminal"}' \
    -o /tmp/supabase_insert.json
  
  # Check if the response contains an error
  if grep -q "error" /tmp/supabase_insert.json; then
    echo "Insert failed. Response:"
    cat /tmp/supabase_insert.json
  else
    echo "Insert succeeded! Test record created."
    
    # Verify the record was inserted
    echo "Fetching records to verify..."
    curl -s -X GET "$VITE_SUPABASE_URL/rest/v1/saved_tweets?select=*" \
      -H "apikey: $VITE_SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
  fi
fi 