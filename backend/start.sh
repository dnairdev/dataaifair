#!/bin/bash
set -e

echo "🚀 Starting Cocode backends..."

# Start Python backend in background
echo "📦 Starting Python backend on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/python.log 2>&1 &
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

# Start Node.js backend in foreground (Railway monitors this)
# This must be the last command so Railway knows the container is running
echo "📦 Starting Node.js backend on port ${PORT:-3001}..."
echo "✅ Both backends are running. Node.js will run in foreground."
exec node server.js

