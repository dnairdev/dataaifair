#!/bin/bash
# Setup script for FastAPI Python Kernel Backend

echo "Setting up DataAIFair Python Kernel Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install IPython kernel
echo "Installing IPython kernel..."
python -m ipykernel install --user --name dataaifair --display-name "Python (DataAIFair)"

echo "Setup complete!"
echo ""
echo "To start the backend server:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Or use uvicorn directly:"
echo "  uvicorn main:app --reload --port 8000"
