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

# Expose ports (Railway will set PORT dynamically, Python uses 8000 internally)
EXPOSE 8000
# Don't set PORT here - let Railway set it dynamically

# Start both backends
CMD ["/app/start.sh"]


