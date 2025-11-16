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

# Make startup script executable
RUN chmod +x /app/start.sh

# Expose both ports (Railway will use PORT env var, default to 3001 for Node.js)
EXPOSE 3001 8000
ENV PORT=3001

# Start both backends
CMD ["/app/start.sh"]


