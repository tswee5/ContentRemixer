import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Check if API key is set
if (!process.env.VITE_CLAUDE_API_KEY) {
  console.error('ERROR: VITE_CLAUDE_API_KEY is not set in .env file');
  console.error('Please set your Claude API key in the .env file');
  process.exit(1);
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to Anthropic
app.use('/api/v1', createProxyMiddleware({
  target: 'https://api.anthropic.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1': ''
  },
  onProxyReq: (proxyReq) => {
    // Use the correct header for Anthropic API
    proxyReq.setHeader('x-api-key', process.env.VITE_CLAUDE_API_KEY);
    proxyReq.setHeader('anthropic-version', '2023-06-01');
    
    // Log headers for debugging
    console.log('Proxy request headers:', proxyReq.getHeaders());
    
    // Log the request body for debugging
    const bodyData = [];
    proxyReq.on('data', (chunk) => {
      bodyData.push(chunk);
    });
    proxyReq.on('end', () => {
      const body = Buffer.concat(bodyData).toString();
      console.log('Proxy request body:', body);
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response status for debugging
    console.log(`Proxy response status: ${proxyRes.statusCode}`);
    
    // Log response headers for debugging
    console.log('Proxy response headers:', proxyRes.headers);
    
    // Log the response body for debugging
    const bodyData = [];
    proxyRes.on('data', (chunk) => {
      bodyData.push(chunk);
    });
    proxyRes.on('end', () => {
      const body = Buffer.concat(bodyData).toString();
      console.log('Proxy response body:', body);
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error: ' + err.message);
  },
  logLevel: 'debug'
}));

// All other requests return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 