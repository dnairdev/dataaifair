# Jupyter-Style Notebook Setup Guide

This guide explains how to set up and use the Jupyter/Colab-style Python Data Science notebook IDE.

## Architecture Overview

- **Frontend**: React + Vite SPA with notebook UI (vertical cells)
- **Backend**: FastAPI with persistent Python kernels per session
- **AI Provider**: Swappable interface for explanations (currently mock, ready for OpenAI)

## Setup Instructions

### 1. Frontend (Already Running)

The frontend is already set up and running. The notebook UI replaces the file-based editor.

### 2. Backend Setup

```bash
cd backend
./setup.sh
```

Or manually:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m ipykernel install --user --name dataaifair --display-name "Python (DataAIFair)"
```

### 3. Start Backend Server

```bash
cd backend
source venv/bin/activate
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

The backend will run on `http://localhost:8000`

### 4. Configure Frontend

Make sure `VITE_API_URL` is set in `.env`:

```
VITE_API_URL=http://localhost:8000/api
```

## Features

### Notebook UI
- **Vertical cells**: Code and markdown cells arranged vertically
- **Cell execution**: Run individual cells with output below
- **Output types**: Text, HTML, images, DataFrames, errors

### AI Features
- **Explain Mode**: Toggle to get inline explanations
- **Explain Code**: Click lightbulb icon on any cell
- **Explain Plot**: Click "Explain Plot" button on image outputs
- **Error Tutor**: Automatically opens on errors with helpful guidance

### Variable Inspector
- **Right sidebar**: Shows all variables in the Python kernel
- **DataFrame detection**: Automatically detects pandas DataFrames
- **Array detection**: Shows numpy arrays with shape info
- **Variable preview**: Expand variables to see details

### Data Science Focus
- **Auto-imports**: pandas, numpy, matplotlib, seaborn, plotly pre-loaded
- **Plot capture**: matplotlib/plotly plots automatically captured
- **DataFrame display**: HTML tables for DataFrames
- **Variable tracking**: Tracks variables before/after cell execution

## Usage

1. **Add a cell**: Click "Add Code Cell" or "Add Markdown"
2. **Write code**: Type Python code in the cell
3. **Run cell**: Click the play button or press Shift+Enter
4. **View output**: Output appears below the cell
5. **Explain code**: Click the lightbulb icon for explanations
6. **Inspect variables**: Check the right sidebar for all variables

## API Endpoints

- `POST /api/execute` - Execute Python code
- `GET /api/variables/{sessionId}` - Get variables
- `POST /api/sessions/{sessionId}/restart` - Restart kernel
- `DELETE /api/sessions/{sessionId}` - Shutdown kernel

## AI Provider

The `aiProvider.ts` interface allows swapping between mock and real AI implementations:

```typescript
// Current: Mock implementation
import { aiProvider } from './services/aiProvider';

// To switch to OpenAI (future):
import { OpenAIProvider } from './services/openaiProvider';
setAIProvider(new OpenAIProvider());
```

## Troubleshooting

### Backend not starting
- Check Python version (3.8+)
- Verify all dependencies installed
- Check if port 8000 is available

### Kernel errors
- Ensure IPython kernel is installed: `python -m ipykernel install --user`
- Check kernel name matches in `kernel_manager.py`

### Variables not showing
- Variables update after cell execution
- Check browser console for errors
- Verify backend is running and accessible



