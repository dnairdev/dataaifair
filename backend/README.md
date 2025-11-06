# FastAPI Backend for DataAIFair Python Notebook

This backend provides Python kernel execution for the Jupyter-style notebook IDE.

## Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Install IPython kernel:**
```bash
python -m ipykernel install --user --name dataaifair --display-name "Python (DataAIFair)"
```

3. **Start the FastAPI server:**
```bash
uvicorn main:app --reload --port 8000
```

Or use the development script:
```bash
python main.py
```

## API Endpoints

### POST `/api/execute`
Execute Python code in a persistent kernel session.

**Request:**
```json
{
  "code": "import pandas as pd\ndf = pd.DataFrame({'a': [1, 2, 3]})\nprint(df)",
  "cellId": "cell-123",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "stdout": "...",
  "stderr": null,
  "output": [
    {
      "type": "text",
      "data": "...",
      "mimeType": "text/plain"
    }
  ],
  "executionTime": 0.05,
  "variables": [...]
}
```

### GET `/api/variables/{sessionId}`
Get current variables in the kernel session.

### POST `/api/sessions/{sessionId}/restart`
Restart the kernel for a session.

### DELETE `/api/sessions/{sessionId}`
Shutdown kernel for a session.

### GET `/health`
Health check endpoint.

## Features

- Persistent Python kernels per session
- Safe code execution
- DataFrame detection and HTML rendering
- Plot capture (matplotlib, plotly, seaborn)
- Variable inspection
- Error handling and traceback capture

## Development

The backend uses:
- FastAPI for the web framework
- Jupyter Client for kernel management
- IPython kernels for code execution



