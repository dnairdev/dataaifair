"""
Python Kernel Manager for executing code in isolated sessions
"""
import asyncio
from jupyter_client import AsyncKernelClient
from jupyter_client.manager import AsyncKernelManager
from typing import Dict, Optional, List
import json
import base64
import io
from datetime import datetime

class ExecutionResult:
    def __init__(self):
        self.success: bool = True
        self.stdout: str = ""
        self.stderr: str = ""
        self.error: Optional[str] = None
        self.execution_time: float = 0.0
        self.variables: List[Dict] = []
        self.plots: List[str] = []  # Base64 encoded images
        self.dataframes: List[str] = []  # HTML representations

class KernelManager:
    def __init__(self):
        self.kernels: Dict[str, AsyncKernelManager] = {}
        self.clients: Dict[str, AsyncKernelClient] = {}
    
    def get_kernel(self, session_id: str) -> AsyncKernelManager:
        """Get or create a kernel for a session"""
        if session_id not in self.kernels:
            # Create new kernel
            kernel_manager = AsyncKernelManager()
            kernel_manager.start_kernel()
            kernel_client = kernel_manager.client()
            kernel_client.start_channels()
            
            self.kernels[session_id] = kernel_manager
            self.clients[session_id] = kernel_client
            
            # Initialize with data science imports
            init_code = """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from IPython.display import display, HTML
import json
"""
            asyncio.create_task(self._execute_init(session_id, init_code))
        
        return self.kernels[session_id]
    
    async def _execute_init(self, session_id: str, code: str):
        """Execute initialization code"""
        client = self.clients[session_id]
        client.execute(code)
    
    async def execute_code(self, session_id: str, code: str) -> ExecutionResult:
        """Execute code in a kernel session - wrapper method"""
        return await self._execute_code_internal(session_id, code)
    
    async def _execute_code_internal(self, session_id: str, code: str) -> ExecutionResult:
        """Execute code in a kernel session"""
        import time
        start_time = time.time()
        
        result = ExecutionResult()
        client = self.clients[session_id]
        
        try:
            # Execute code
            msg_id = client.execute(code)
            
            # Wait for execution to complete
            while True:
                msg = client.get_iopub_msg(timeout=1)
                msg_type = msg['msg_type']
                
                if msg_type == 'status' and msg['content']['execution_state'] == 'idle':
                    break
                
                if msg_type == 'stream':
                    stream_name = msg['content']['name']
                    text = msg['content']['text']
                    if stream_name == 'stdout':
                        result.stdout += text
                    elif stream_name == 'stderr':
                        result.stderr += text
                        result.success = False
                
                if msg_type == 'execute_result':
                    data = msg['content']['data']
                    if 'image/png' in data:
                        result.plots.append(data['image/png'])
                    elif 'text/html' in data:
                        result.dataframes.append(data['text/html'])
                    elif 'text/plain' in data:
                        result.stdout += data['text/plain']
                
                if msg_type == 'display_data':
                    data = msg['content']['data']
                    if 'image/png' in data:
                        result.plots.append(data['image/png'])
                    elif 'text/html' in data:
                        result.dataframes.append(data['text/html'])
            
            # Get execution result
            reply = client.get_shell_msg(timeout=1)
            if reply['content']['status'] == 'error':
                result.success = False
                result.error = '\n'.join(reply['content']['traceback'])
                result.stderr = result.error
            
            # Get variables (simple snapshot)
            vars_code = """
import json
_vars = {}
for name in dir():
    if not name.startswith('_'):
        obj = eval(name)
        if isinstance(obj, (pd.DataFrame, np.ndarray)):
            _vars[name] = {
                'type': type(obj).__name__,
                'shape': str(obj.shape) if hasattr(obj, 'shape') else None,
                'preview': str(obj.head()) if hasattr(obj, 'head') else str(obj[:5])
            }
print(json.dumps(_vars))
"""
            # Note: This is a simplified version. Full implementation would need better variable inspection
            
            result.execution_time = time.time() - start_time
            
        except Exception as e:
            result.success = False
            result.error = str(e)
            result.execution_time = time.time() - start_time
        
        return result
    
    def restart_kernel(self, session_id: str):
        """Restart a kernel"""
        if session_id in self.kernels:
            self.kernels[session_id].restart_kernel()
            self.clients[session_id] = self.kernels[session_id].client()
            self.clients[session_id].start_channels()
    
    def shutdown_kernel(self, session_id: str):
        """Shutdown a kernel"""
        if session_id in self.kernels:
            self.kernels[session_id].shutdown_kernel()
            del self.kernels[session_id]
            del self.clients[session_id]
    
    async def get_variables(self, session_id: str) -> List[Dict]:
        """Get current variables in kernel"""
        # Simplified - would need better implementation
        return []

