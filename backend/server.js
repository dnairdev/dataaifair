const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const aiRoutes = require('./routes/ai');
const projectRoutes = require('./routes/projects');
const learningRoutes = require('./routes/learning');

const app = express();
// Use Railway's PORT (defaults to 3001 for Node.js)
const PORT = process.env.PORT || 3001;
const SERVICE_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.PUBLIC_BASE_URL ||
  '';
// Python backend runs on port 8000 internally
const PYTHON_SERVICE_URL = (process.env.PYTHON_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');

const rawOrigins =
  process.env.CORS_ALLOW_ORIGINS ||
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  '';
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const allowedOrigins = [
  ...new Set([
    ...defaultOrigins,
    ...rawOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
  ]),
];

let originRegex = null;
if (process.env.CORS_ALLOW_ORIGIN_REGEX) {
  try {
    originRegex = new RegExp(process.env.CORS_ALLOW_ORIGIN_REGEX);
  } catch (error) {
    console.warn(
      '[Backend] Invalid CORS_ALLOW_ORIGIN_REGEX provided. Falling back to explicit origins.',
      error.message,
    );
  }
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (originRegex && originRegex.test(origin)) {
      return callback(null, true);
    }

    console.warn('[Backend] Blocked CORS origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Test endpoint to verify Node.js backend is running
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Node.js Backend',
    timestamp: new Date().toISOString(),
    routes: {
      ai: '/api/ai/*',
      projects: '/api/projects/*',
      learning: '/api/learning/*'
    }
  });
});

// API routes - Node.js handles these (MUST be before Python proxy)
app.use('/api/ai', (req, res, next) => {
  console.log(`[Node.js] AI route: ${req.method} ${req.originalUrl || req.url}`);
  next();
}, aiRoutes);
app.use('/api/projects', (req, res, next) => {
  console.log(`[Node.js] Projects route: ${req.method} ${req.originalUrl || req.url}`);
  next();
}, projectRoutes);
app.use('/api/learning', (req, res, next) => {
  console.log(`[Node.js] Learning route: ${req.method} ${req.originalUrl || req.url}`);
  next();
}, learningRoutes);

// Health check endpoint for Node.js backend
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Cocode Backend API (Node.js)',
    pythonBackend: PYTHON_SERVICE_URL
  });
});

// Proxy Python backend routes (execute, files, variables, sessions)
// These routes are handled by the Python FastAPI backend
const pythonRoutes = ['/api/execute', '/api/variables', '/api/sessions', '/api/files'];
pythonRoutes.forEach(route => {
  app.all(`${route}*`, (req, res) => {
    proxyToPython(req, res);
  });
});

// Helper function to proxy requests to Python backend
function proxyToPython(req, res) {
  const targetUrl = new URL(PYTHON_SERVICE_URL);
  const fullPath = req.originalUrl || req.url;
  
  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 8000,
    path: fullPath,
    method: req.method,
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy] Error proxying to Python backend:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Python backend unavailable', message: err.message });
    }
  });

  // Send request body if present
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    proxyReq.write(bodyData);
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
}

// Frontend static assets
const frontendDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    const acceptHeader = req.headers.accept || '';
    const wantsHtml = acceptHeader.includes('text/html');

    if (!wantsHtml) {
      return next();
    }

    res.sendFile(path.join(frontendDir, 'index.html'), err => {
      if (err) {
        next(err);
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Log unmatched routes before 404
app.use('*', (req, res, next) => {
  console.log(`[404] Unmatched route: ${req.method} ${req.originalUrl || req.url}`);
  console.log(`[404] Request headers:`, req.headers);
  next();
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl || req.url,
    availableRoutes: [
      'GET /health',
      'GET /api/test',
      'POST /api/ai/*',
      'POST /api/projects/*',
      'POST /api/learning/*',
      'POST /api/execute/* (proxied to Python)',
      'POST /api/files/* (proxied to Python)'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Cocode Backend API running on port ${PORT}`);
  if (SERVICE_URL) {
    console.log(`🌐 External base URL: ${SERVICE_URL}`);
    console.log(`📡 Health check: ${new URL('/health', SERVICE_URL).toString()}`);
  } else {
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  }
  console.log(`🔗 Allowed Frontend Origins: ${allowedOrigins.join(', ') || 'None specified'}`);
  if (originRegex) {
    console.log(`🔀 Allowing origins matching regex: ${originRegex}`);
  }
  console.log(`🧠 Python service URL: ${PYTHON_SERVICE_URL}`);
  console.log(`📋 Registered routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/ai/* (Node.js)`);
  console.log(`   - POST /api/projects/* (Node.js)`);
  console.log(`   - POST /api/learning/* (Node.js)`);
  console.log(`   - Proxy: /api/execute/* -> Python`);
  console.log(`   - Proxy: /api/files/* -> Python`);
  console.log(`   - Proxy: /api/variables/* -> Python`);
  console.log(`   - Proxy: /api/sessions/* -> Python`);
});

module.exports = app;
