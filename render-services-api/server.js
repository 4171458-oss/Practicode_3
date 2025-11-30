const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// GET endpoint to list Render services
app.get('/services', async (req, res) => {
  try {
    const apiKey = process.env.RENDER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'RENDER_API_KEY environment variable is not set' 
      });
    }

    // Create axios request with timeout and proper connection handling
    const response = await axios.get('https://api.render.com/v1/services', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      timeout: 10000, // 10 seconds timeout
      // Ensure connections are properly closed
      httpAgent: new (require('http').Agent)({ keepAlive: false }),
      httpsAgent: new (require('https').Agent)({ keepAlive: false })
    });
    
    // Return the services list
    res.json({
      success: true,
      count: response.data.length,
      services: response.data
    });
    
  } catch (error) {
    console.error('Error fetching Render services:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Failed to fetch services from Render API',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'No response from Render API',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
  // Axios automatically closes connections after request completes
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown - close server and connections
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

