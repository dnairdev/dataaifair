"""
FastAPI Backend for Jupyter-style Python Data Science IDE
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import subprocess
import sys
import json
import base64
import io
import os
from datetime import datetime

# Import kernel manager and file storage
from kernel_manager import KernelManager
from file_storage import file_storage

app = FastAPI(title="DataAIFair Python Kernel API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize kernel manager
kernel_manager = KernelManager()

class ExecutionRequest(BaseModel):
    code: str
    cellId: str
    sessionId: Optional[str] = None

class VariableSnapshot(BaseModel):
    name: str
    type: str
    value: str
    shape: Optional[str] = None
    summary: Optional[str] = None
    preview: Optional[str] = None

class CellOutput(BaseModel):
    type: str  # 'text', 'html', 'image', 'dataframe', 'error'
    data: str
    mimeType: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ExecutionResponse(BaseModel):
    success: bool
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    output: Optional[List[CellOutput]] = None
    error: Optional[str] = None
    executionTime: Optional[float] = None
    variables: Optional[List[VariableSnapshot]] = None
    plots: Optional[List[str]] = None  # Base64 encoded images

@app.post("/api/execute", response_model=ExecutionResponse)
async def execute_code(request: ExecutionRequest):
    """Execute Python code in a persistent kernel"""
    try:
        session_id = request.sessionId or "default"
        
        # Get or create kernel for session
        kernel_manager.get_kernel(session_id)
        
        # Execute code
        result = await kernel_manager.execute_code(session_id, request.code)
        
        # Process outputs
        outputs = []
        print(f"DEBUG: Execution result - stdout: {repr(result.stdout)}, stderr: {repr(result.stderr)}")
        print(f"DEBUG: stdout length: {len(result.stdout) if result.stdout else 0}")
        print(f"DEBUG: plots: {len(result.plots)}, dataframes: {len(result.dataframes)}")
        
        if result.stdout:
            outputs.append(CellOutput(
                type='text',
                data=result.stdout,
                mimeType='text/plain'
            ))
        
        if result.stderr:
            outputs.append(CellOutput(
                type='error',
                data=result.stderr,
                mimeType='text/plain'
            ))
        
        # Add plots if any
        for plot in result.plots:
            outputs.append(CellOutput(
                type='image',
                data=plot,
                mimeType='image/png'
            ))
        
        # Add dataframes if any
        for df_html in result.dataframes:
            outputs.append(CellOutput(
                type='dataframe',
                data=df_html,
                mimeType='text/html'
            ))
        
        return ExecutionResponse(
            success=result.success,
            stdout=result.stdout,
            stderr=result.stderr,
            output=outputs,
            error=result.error,
            executionTime=result.execution_time,
            variables=result.variables,
            plots=result.plots
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/variables/{sessionId}")
async def get_variables(sessionId: str):
    """Get current variables in the kernel"""
    try:
        kernel = kernel_manager.get_kernel(sessionId)
        variables = await kernel.get_variables()
        return {"variables": variables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sessions/{sessionId}/restart")
async def restart_kernel(sessionId: str):
    """Restart the kernel for a session"""
    try:
        kernel_manager.restart_kernel(sessionId)
        return {"message": "Kernel restarted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/sessions/{sessionId}")
async def shutdown_kernel(sessionId: str):
    """Shutdown kernel for a session"""
    try:
        kernel_manager.shutdown_kernel(sessionId)
        return {"message": "Kernel shut down successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# File Storage Endpoints

@app.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file to the file storage"""
    try:
        content = await file.read()
        file_type = file.filename.split('.')[-1] if '.' in file.filename else "unknown"
        
        metadata = file_storage.upload_file(file.filename, content, file_type)
        return {
            "success": True,
            "file": metadata,
            "message": f"File '{file.filename}' uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files")
async def list_files():
    """List all files in storage"""
    try:
        files = file_storage.list_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/{filename}")
async def download_file(filename: str):
    """Download a file from storage"""
    try:
        file_content = file_storage.get_file(filename)
        if file_content is None:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get metadata for original filename
        metadata = file_storage.metadata.get(file_storage._sanitize_filename(filename), {})
        original_name = metadata.get("original_name", filename)
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="{original_name}"'}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/files/{filename}")
async def delete_file(filename: str):
    """Delete a file from storage"""
    try:
        success = file_storage.delete_file(filename)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        return {"success": True, "message": f"File '{filename}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/files/export-csv")
async def export_csv(data: Dict[str, Any]):
    """Export data as CSV file"""
    try:
        import csv
        
        # Get data from request
        filename = data.get("filename", "export.csv")
        rows = data.get("rows", [])
        headers = data.get("headers", [])
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        if headers:
            writer.writerow(headers)
        
        for row in rows:
            if isinstance(row, dict):
                writer.writerow([row.get(h, "") for h in headers])
            else:
                writer.writerow(row)
        
        csv_content = output.getvalue().encode('utf-8')
        
        # Save to file storage
        metadata = file_storage.upload_file(filename, csv_content, "csv")
        
        return {
            "success": True,
            "file": metadata,
            "message": f"CSV file '{filename}' exported successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/check/{filename}")
async def check_file_exists(filename: str):
    """Check if a file exists in storage"""
    try:
        file_path = file_storage.get_file_path(filename)
        if file_path:
            return {"exists": True, "path": file_path}
        return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/storage-path")
async def get_storage_path():
    """Get the storage directory path for kernel access"""
    try:
        return {
            "storage_path": file_storage.get_storage_directory(),
            "message": "Use this path to access files in your code"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

