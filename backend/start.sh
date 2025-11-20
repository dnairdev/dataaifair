#!/bin/bash
set -e

echo "🚀 Starting Cocode backends..."

# Start Python backend in background on localhost ONLY (not publicly accessible)
echo "📦 Starting Python backend on localhost:8000 (internal only)..."
uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/python.log 2>&1 &
PYTHON_PID=$!

# Give Python backend time to start
sleep 3

# Verify Python backend started
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Python backend failed to start!"
    cat /tmp/python.log
    exit 1
fi
echo "✅ Python backend started (PID: $PYTHON_PID)"

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down..."
    kill $PYTHON_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# CRITICAL: Use Railway's PORT (Railway sets this automatically)
# If PORT is not set by Railway, default to 3001 for local development
export PORT=${PORT:-3001}
echo "📋 Railway PORT environment variable: ${PORT:-'not set (using default 3001)'}"
echo "📋 Node.js will listen on port: ${PORT}"

# Start Node.js backend in foreground (Railway monitors this)
# This MUST be the last command - Railway monitors this process
echo "📦 Starting Node.js backend on port ${PORT}..."
echo "✅ Both backends are running:"
echo "   - Python: localhost:8000 (internal only)"
echo "   - Node.js: 0.0.0.0:${PORT} (public - Railway routes here)"
echo "🔗 All public traffic should go to Node.js on port ${PORT}"
exec node server.js

