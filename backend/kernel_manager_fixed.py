"""
Python Kernel Manager for executing code in isolated sessions
Fixed implementation
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
            
            # Initialize with data science imports (async)
            init_code = """
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from IPython.display import display, HTML
import json
import io
import base64
"""
            # Execute init in background
            asyncio.create_task(self._execute_init(session_id, init_code))
        
        return self.kernels[session_id]
    
    async def _execute_init(self, session_id: str, code: str):
        """Execute initialization code"""
        try:
            client = self.clients[session_id]
            msg_id = client.execute(code)
            # Wait a bit for initialization
            await asyncio.sleep(0.5)
        except Exception as e:
            print(f"Init error: {e}")
    
    async def execute_code(self, session_id: str, code: str) -> ExecutionResult:
        """Execute code in a kernel session"""
        import time
        start_time = time.time()
        
        result = ExecutionResult()
        
        # Ensure kernel exists
        self.get_kernel(session_id)
        client = self.clients[session_id]
        
        try:
            # Execute code
            msg_id = client.execute(code)
            
            # Wait for execution to complete
            while True:
                try:
                    msg = client.get_iopub_msg(timeout=2)
                    msg_type = msg['msg_type']
                    content = msg['content']
                    
                    if msg_type == 'status':
                        if content['execution_state'] == 'idle':
                            break
                    
                    if msg_type == 'stream':
                        stream_name = content['name']
                        text = content['text']
                        if stream_name == 'stdout':
                            result.stdout += text
                        elif stream_name == 'stderr':
                            result.stderr += text
                            result.success = False
                    
                    if msg_type == 'execute_result':
                        data = content['data']
                        if 'image/png' in data:
                            result.plots.append(data['image/png'])
                        elif 'text/html' in data:
                            result.dataframes.append(data['text/html'])
                        elif 'text/plain' in data:
                            result.stdout += data['text/plain']
                    
                    if msg_type == 'display_data':
                        data = content['data']
                        if 'image/png' in data:
                            result.plots.append(data['image/png'])
                        elif 'text/html' in data:
                            result.dataframes.append(data['text/html'])
                    
                    if msg_type == 'error':
                        result.success = False
                        result.error = '\n'.join(content['traceback'])
                        result.stderr = result.error
                
                except Exception as e:
                    # Timeout or other error
                    break
            
            # Get execution result
            try:
                reply = client.get_shell_msg(timeout=1)
                if reply['content']['status'] == 'error':
                    result.success = False
                    if not result.error:
                        result.error = '\n'.join(reply['content']['traceback'])
                        result.stderr = result.error
            except:
                pass
            
            # Get variables snapshot (simplified)
            try:
                vars_code = """
import json
_vars = {}
for name in dir():
    if not name.startswith('_') and not name in ['In', 'Out', 'get_ipython', 'exit', 'quit']:
        try:
            obj = eval(name)
            obj_type = type(obj).__name__
            if isinstance(obj, (pd.DataFrame,)):
                _vars[name] = {
                    'name': name,
                    'type': 'DataFrame',
                    'shape': str(obj.shape),
                    'preview': str(obj.head()),
                    'summary': str(obj.describe())
                }
            elif isinstance(obj, (np.ndarray,)):
                _vars[name] = {
                    'name': name,
                    'type': 'ndarray',
                    'shape': str(obj.shape),
                    'preview': str(obj[:5] if len(obj) > 5 else obj)
                }
            else:
                _vars[name] = {
                    'name': name,
                    'type': obj_type,
                    'value': str(obj)[:100]
                }
        except:
            pass
print(json.dumps(_vars))
"""
                # Note: This is simplified - full implementation would need better handling
            except:
                pass
            
            result.execution_time = time.time() - start_time
            
        except Exception as e:
            result.success = False
            result.error = str(e)
            result.stderr = str(e)
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
            if session_id in self.clients:
                del self.clients[session_id]
    
    async def get_variables(self, session_id: str) -> List[Dict]:
        """Get current variables in kernel"""
        # Simplified - would need better implementation
        return []



