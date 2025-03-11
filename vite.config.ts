import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Helper function to wait for a specified time
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      {
        name: 'anthropic-api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/v1/messages', async (req, res) => {
            // Only handle POST requests
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end('Method Not Allowed')
              return
            }
            
            // Get request body
            let body = ''
            req.on('data', chunk => {
              body += chunk.toString()
            })
            
            req.on('end', async () => {
              try {
                const requestData = JSON.parse(body)
                console.log('API request:', requestData)
                
                // Check if API key is set
                if (!env.VITE_CLAUDE_API_KEY) {
                  console.error('API key is not set in .env file')
                  res.statusCode = 500
                  res.end(JSON.stringify({ 
                    error: 'Configuration Error',
                    message: 'API key is not set. Please check your .env file.'
                  }))
                  return
                }
                
                console.log('Using API key:', env.VITE_CLAUDE_API_KEY.substring(0, 10) + '...')
                
                // Implement retry logic for overloaded API
                let retries = 0;
                const maxRetries = 3;
                let response;
                
                while (retries <= maxRetries) {
                  try {
                    // Forward to Anthropic API
                    response = await fetch('https://api.anthropic.com/v1/messages', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': env.VITE_CLAUDE_API_KEY,
                        'anthropic-version': '2023-06-01'
                      },
                      body: JSON.stringify(requestData)
                    });
                    
                    // If we get an overloaded error, retry
                    if (response.status === 529) {
                      retries++;
                      if (retries <= maxRetries) {
                        const backoffTime = Math.pow(2, retries) * 1000;
                        console.log(`API overloaded (attempt ${retries}/${maxRetries}), retrying in ${backoffTime}ms...`);
                        await sleep(backoffTime); // Exponential backoff
                        continue;
                      }
                    }
                    
                    // If we get here, we either got a successful response or we've exhausted our retries
                    break;
                  } catch (fetchError) {
                    console.error('Fetch error:', fetchError);
                    retries++;
                    if (retries <= maxRetries) {
                      const backoffTime = Math.pow(2, retries) * 1000;
                      console.log(`Fetch error (attempt ${retries}/${maxRetries}), retrying in ${backoffTime}ms...`);
                      await sleep(backoffTime); // Exponential backoff
                    } else {
                      throw fetchError;
                    }
                  }
                }
                
                // Log response status
                console.log('API response status:', response.status)
                
                // If we still have an overloaded error after all retries
                if (response.status === 529) {
                  res.statusCode = 503;
                  res.end(JSON.stringify({ 
                    error: 'Service Unavailable',
                    message: 'The API is currently overloaded. Please try again later.'
                  }));
                  return;
                }
                
                // Get response text
                const responseText = await response.text()
                
                try {
                  // Try to parse as JSON
                  const responseData = JSON.parse(responseText)
                  console.log('API response:', responseData)
                  
                  // Set response headers
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = response.status
                  
                  // Send response
                  res.end(JSON.stringify(responseData))
                } catch (parseError) {
                  // If not JSON, send as text
                  console.error('Failed to parse response as JSON:', responseText)
                  res.statusCode = response.status
                  res.end(responseText)
                }
              } catch (error) {
                console.error('API error:', error)
                res.statusCode = 500
                res.end(JSON.stringify({ 
                  error: 'Internal Server Error',
                  message: error.message
                }))
              }
            })
          })
        }
      }
    ]
  }
}) 