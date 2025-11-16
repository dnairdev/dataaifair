#!/bin/bash
set -e

echo "🚀 Starting Cocode backends..."

# Start Python backend in background
echo "📦 Starting Python backend on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
PYTHON_PID=$!

# Give Python backend time to start
sleep 2

# Start Node.js backend in foreground (Railway monitors this)
echo "📦 Starting Node.js backend on port ${PORT:-3001}..."
node server.js &
NODE_PID=$!

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down..."
    kill $PYTHON_PID $NODE_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Wait for both processes
wait $PYTHON_PID $NODE_PID

