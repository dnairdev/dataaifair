#!/bin/bash

echo "🚀 Setting up DataAIFair Backend API..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your OpenAI API key!"
    echo "   OPENAI_API_KEY=your_api_key_here"
    echo ""
fi

echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "To start the backend server:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "The API will be available at:"
echo "  http://localhost:3001"
echo ""
echo "Don't forget to:"
echo "  1. Add your OpenAI API key to .env"
echo "  2. Start the backend server"
echo "  3. Update frontend to use real API"
echo ""
echo "Happy coding with real AI! 🧠✨"
