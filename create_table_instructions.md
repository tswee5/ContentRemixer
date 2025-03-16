# Creating the Saved Tweets Table in Supabase

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

## Verifying the Table

After creating the table, you can verify it was created successfully by running the following command in your terminal:

```bash
curl -X GET "https://gpygcvvanmqzrxcqtcqo.supabase.co/rest/v1/saved_tweets?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWdjdnZhbm1xenJ4Y3F0Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTE3NzIsImV4cCI6MjA1NzU2Nzc3Mn0.h4bteGlGMRQgD1Btg7U-Q_55wfzVW0r97JYi_2HyFyI" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWdjdnZhbm1xenJ4Y3F0Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTE3NzIsImV4cCI6MjA1NzU2Nzc3Mn0.h4bteGlGMRQgD1Btg7U-Q_55wfzVW0r97JYi_2HyFyI"
```

If the table was created successfully, you should see an empty array (`[]`) as the response.

## Testing the Table

You can test inserting a record into the table with this command:

```bash
curl -X POST "https://gpygcvvanmqzrxcqtcqo.supabase.co/rest/v1/saved_tweets" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWdjdnZhbm1xenJ4Y3F0Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTE3NzIsImV4cCI6MjA1NzU2Nzc3Mn0.h4bteGlGMRQgD1Btg7U-Q_55wfzVW0r97JYi_2HyFyI" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWdjdnZhbm1xenJ4Y3F0Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTE3NzIsImV4cCI6MjA1NzU2Nzc3Mn0.h4bteGlGMRQgD1Btg7U-Q_55wfzVW0r97JYi_2HyFyI" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"content": "Test tweet from curl"}'
```

Then query the table again to see the inserted record:

```bash
curl -X GET "https://gpygcvvanmqzrxcqtcqo.supabase.co/rest/v1/saved_tweets?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWdjdnZhbm1xenJ4Y3F0Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTE3NzIsImV4cCI6MjA1NzU2Nzc3Mn0.h4bteGlGMRQgD1Btg7U-Q_55wfzVW0r97JYi_2HyFyI" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWdjdnZhbm1xenJ4Y3F0Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5OTE3NzIsImV4cCI6MjA1NzU2Nzc3Mn0.h4bteGlGMRQgD1Btg7U-Q_55wfzVW0r97JYi_2HyFyI"
``` 