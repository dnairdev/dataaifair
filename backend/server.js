const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const aiRoutes = require('./routes/ai');
const projectRoutes = require('./routes/projects');
const learningRoutes = require('./routes/learning');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.PUBLIC_BASE_URL ||
  '';
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'DataAIFair Backend API'
  });
});

// API routes
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/learning', learningRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 DataAIFair Backend API running on port ${PORT}`);
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
});

module.exports = app;
