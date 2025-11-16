FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy backend source code
COPY . .

# Expose both ports (Railway will use PORT env var, default to 3001 for Node.js)
EXPOSE 3001 8000
ENV PORT=3001

# Create startup script to run both backends
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start Python backend in background\n\
uvicorn main:app --host 0.0.0.0 --port 8000 &\n\
PYTHON_PID=$!\n\
\n\
# Start Node.js backend in foreground\n\
node server.js &\n\
NODE_PID=$!\n\
\n\
# Wait for either process to exit\n\
wait $PYTHON_PID $NODE_PID\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start both backends
CMD ["/app/start.sh"]


