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

// CORS helper function
const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  
  if (!origin) {
    return false; // No origin, no CORS headers needed
  }
  
  const isAllowed = allowedOrigins.includes(origin) || 
                    (originRegex && originRegex.test(origin));
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return true;
  }
  
  return false;
};

// CRITICAL: Handle OPTIONS preflight requests FIRST (before ANY other middleware)
// This MUST be the first route handler to catch all OPTIONS requests
app.use((req, res, next) => {
  // Intercept ALL OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    console.log(`[CORS-PREFLIGHT] ⚡ OPTIONS intercepted for: ${req.originalUrl || req.url}`);
    console.log(`[CORS-PREFLIGHT] Origin: ${origin || 'no origin'}`);
    console.log(`[CORS-PREFLIGHT] Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`[CORS-PREFLIGHT] Request headers:`, JSON.stringify(req.headers, null, 2));
    
    // Check if origin is in allowed list
    const isAllowed = !origin || 
                      allowedOrigins.includes(origin) || 
                      (originRegex && originRegex.test(origin));
    
    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');
      console.log(`[CORS-PREFLIGHT] ✅ Sending CORS headers for origin: ${origin}`);
      return res.status(200).end();
    } else if (!origin) {
      // No origin header (same-origin or tool like Postman)
      console.log(`[CORS-PREFLIGHT] No origin header, allowing`);
      return res.status(200).end();
    } else {
      console.warn(`[CORS-PREFLIGHT] ❌ Origin not allowed: ${origin}`);
      console.warn(`[CORS-PREFLIGHT] Allowed origins: ${allowedOrigins.join(', ')}`);
      // Still send CORS headers but with error status (some browsers need this)
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
      return res.status(403).end();
    }
  }
  next();
});

// Also register explicit OPTIONS handler as backup
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS-PREFLIGHT-BACKUP] OPTIONS via app.options('*') for: ${req.originalUrl || req.url}`);
  
  const isAllowed = !origin || 
                    allowedOrigins.includes(origin) || 
                    (originRegex && originRegex.test(origin));
  
  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  res.status(200).end();
});

// Log ALL incoming requests (after OPTIONS handler)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[Request] ${req.method} ${req.originalUrl || req.url} from origin: ${origin || 'no origin'}`);
  
  // Add CORS headers to all responses as fallback
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) || 
                      (originRegex && originRegex.test(origin));
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  next();
});

// Security middleware - configure to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - MUST be before rate limiting
// The cors package automatically handles OPTIONS preflight requests
app.use(cors({
  origin: (origin, callback) => {
    console.log(`[CORS] Request from origin: ${origin || 'no origin'}`);
    console.log(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
    
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) {
      console.log('[CORS] ✅ Allowing request with no origin');
      return callback(null, true);
    }

    // Check explicit allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Allowing origin (explicit match): ${origin}`);
      return callback(null, true);
    }

    // Check regex pattern
    if (originRegex && originRegex.test(origin)) {
      console.log(`[CORS] ✅ Allowing origin (regex match): ${origin}`);
      return callback(null, true);
    }

    console.warn(`[CORS] ❌ Blocked CORS origin: ${origin}`);
    console.warn(`[CORS] Allowed origins list: ${JSON.stringify(allowedOrigins)}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false, // Let cors handle preflight
  optionsSuccessStatus: 200 // Some legacy browsers (IE11) choke on 204
}));

// Rate limiting - skip OPTIONS requests
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for OPTIONS requests
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Test endpoint to verify Node.js backend is running
app.get('/api/test', (req, res) => {
  console.log(`[Test] GET /api/test - Node.js backend responding`);
  res.json({ 
    status: 'OK', 
    service: 'Node.js Backend',
    port: PORT,
    timestamp: new Date().toISOString(),
    pythonBackend: PYTHON_SERVICE_URL,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    corsOrigins: allowedOrigins,
    routes: {
      ai: '/api/ai/*',
      projects: '/api/projects/*',
      learning: '/api/learning/*'
    },
    message: 'If you see this, Railway is correctly routing to Node.js backend!'
  });
});

// Simple backend identifier endpoint
app.get('/backend-type', (req, res) => {
  res.json({ backend: 'Node.js', port: PORT, timestamp: new Date().toISOString() });
});

// CORS test endpoint - explicitly sets CORS headers
app.get('/api/cors-test', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS-TEST] GET /api/cors-test from origin: ${origin}`);
  
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) || 
                      (originRegex && originRegex.test(origin));
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  res.json({ 
    message: 'CORS test endpoint',
    origin: origin,
    allowedOrigins: allowedOrigins,
    corsHeadersSet: !!res.getHeader('Access-Control-Allow-Origin')
  });
});

// Diagnostic endpoint to check backend status
app.get('/api/diagnostic', (req, res) => {
  res.json({
    backend: 'Node.js',
    port: PORT,
    pythonBackendUrl: PYTHON_SERVICE_URL,
    openaiKeySet: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    corsOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
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
  const origin = req.headers.origin;
  const targetUrl = new URL(PYTHON_SERVICE_URL);
  const fullPath = req.originalUrl || req.url;
  
  console.log(`[Proxy] Proxying ${req.method} ${fullPath} to Python backend`);
  
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
    // Preserve CORS headers from our middleware
    const headers = { ...proxyRes.headers };
    
    // Add CORS headers if origin is allowed
    if (origin) {
      const isAllowed = allowedOrigins.includes(origin) || 
                        (originRegex && originRegex.test(origin));
      if (isAllowed) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
    }
    
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy] Error proxying to Python backend:', err.message);
    if (!res.headersSent) {
      // Add CORS headers to error response
      if (origin) {
        const isAllowed = allowedOrigins.includes(origin) || 
                          (originRegex && originRegex.test(origin));
        if (isAllowed) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
      }
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

const server = app.listen(PORT, '0.0.0.0', () => {
  const actualPort = server.address().port;
  console.log(`🚀 Cocode Backend API (Node.js) running on port ${actualPort}`);
  console.log(`📊 Environment PORT: ${process.env.PORT || 'not set (using default 3001)'}`);
  console.log(`📊 Actual listening port: ${actualPort}`);
  
  if (actualPort !== 3001) {
    console.warn(`⚠️  WARNING: Node.js is listening on port ${actualPort}, not 3001!`);
    console.warn(`⚠️  Railway MUST route public traffic to port ${actualPort} for this to work!`);
  } else {
    console.log(`✅ Node.js is correctly listening on port 3001`);
  }
  
  if (SERVICE_URL) {
    console.log(`🌐 External base URL: ${SERVICE_URL}`);
    console.log(`📡 Health check: ${new URL('/health', SERVICE_URL).toString()}`);
  } else {
    console.log(`📡 Health check: http://localhost:${actualPort}/health`);
  }
  console.log(`🔗 Allowed Frontend Origins: ${allowedOrigins.join(', ') || 'None specified'}`);
  if (originRegex) {
    console.log(`🔀 Allowing origins matching regex: ${originRegex}`);
  }
  console.log(`🧠 Python service URL: ${PYTHON_SERVICE_URL}`);
  console.log(`📋 Registered Node.js routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /api/test`);
  console.log(`   - POST /api/ai/* (Node.js - AI chatbot routes)`);
  console.log(`   - POST /api/projects/* (Node.js)`);
  console.log(`   - POST /api/learning/* (Node.js)`);
  console.log(`📋 Proxied to Python backend:`);
  console.log(`   - POST /api/execute/* -> Python`);
  console.log(`   - POST /api/files/* -> Python`);
  console.log(`   - POST /api/variables/* -> Python`);
  console.log(`   - POST /api/sessions/* -> Python`);
  console.log(`\n✅ Node.js backend ready! Railway should route to port ${actualPort}`);
});

module.exports = app;
