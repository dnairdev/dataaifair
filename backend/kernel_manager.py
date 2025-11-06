"""
Python Kernel Manager for executing code in isolated sessions
Fixed implementation
"""
import asyncio
from jupyter_client import BlockingKernelClient
from jupyter_client.manager import KernelManager as SyncKernelManager
from typing import Dict, Optional, List
import json
import base64
import io
from datetime import datetime
import queue

# Import VariableSnapshot for type checking
try:
    from types import SimpleNamespace
    VariableSnapshot = SimpleNamespace  # Will be converted to dict
except:
    pass

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
        self.kernels: Dict[str, SyncKernelManager] = {}
        self.clients: Dict[str, BlockingKernelClient] = {}
    
    def get_kernel(self, session_id: str) -> SyncKernelManager:
        """Get or create a kernel for a session"""
        if session_id not in self.kernels:
            # Create new kernel
            kernel_manager = SyncKernelManager()
            kernel_manager.start_kernel()
            kernel_client = kernel_manager.client()
            
            self.kernels[session_id] = kernel_manager
            self.clients[session_id] = kernel_client
            
            # Initialize with data science imports and file storage access
            from file_storage import file_storage
            storage_path = file_storage.get_storage_directory()
            
            init_code = f"""
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from IPython.display import display, HTML, Image
import json
import io
import base64
import os

# File storage directory - files uploaded to the IDE are available here
FILE_STORAGE_DIR = r"{storage_path}"
os.chdir(FILE_STORAGE_DIR)  # Change working directory to file storage

# Suppress the FigureCanvasAgg warning globally
import warnings
warnings.filterwarnings('ignore', message='.*FigureCanvasAgg.*', category=UserWarning)
warnings.filterwarnings('ignore', message='.*non-interactive.*', category=UserWarning)

# Override plt.show() to automatically save plots as base64
_original_show = plt.show
def _show_override(*args, **kwargs):
    \"\"\"Override plt.show() to save plot as base64 image\"\"\"
    try:
        fig = plt.gcf()
        if fig.get_axes():  # Only save if there are axes
            buf = io.BytesIO()
            fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
            buf.seek(0)
            img_data = buf.getvalue()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
            # Use IPython's display with dict format - this sends display_data message
            # The format is: {'image/png': base64_string}
            display({'image/png': img_base64}, raw=True)
            plt.close(fig)
    except Exception as e:
        # If display fails, try original show (will just warn)
        import traceback
        traceback.print_exc()
        pass

plt.show = _show_override

# Also override seaborn's show if it exists
try:
    import seaborn as sns
    if hasattr(sns, 'show'):
        sns._original_show = sns.show
        sns.show = lambda: plt.show()
except:
    pass
"""
            # Execute init synchronously
            try:
                kernel_client.execute(init_code)
            except Exception as e:
                print(f"Init error: {e}")
        
        return self.kernels[session_id]
    
    async def execute_code(self, session_id: str, code: str) -> ExecutionResult:
        """Execute code in a kernel session"""
        import time
        start_time = time.time()
        
        result = ExecutionResult()
        
        # Ensure kernel exists
        self.get_kernel(session_id)
        client = self.clients[session_id]
        
        try:
            # Use execute_interactive which handles message collection automatically
            # This is the proper way to execute code and get output with BlockingKernelClient
            try:
                # Execute code
                msg_id = client.execute(code)
                print(f"DEBUG: Executed code with msg_id: {msg_id}")
                
                # Collect IOPub messages WHILE waiting for shell reply
                # IOPub messages (stdout/stderr) arrive DURING execution
                shell_reply = None
                import time
                start_wait = time.time()
                max_wait = 10
                msg_count = 0
                execution_done = False
                
                # Process messages until we get the shell reply
                while not execution_done and (time.time() - start_wait) < max_wait:
                    # Check for IOPub messages first (they arrive during execution)
                    try:
                        msg = client.get_iopub_msg(timeout=0.1)
                        msg_type = msg['msg_type']
                        content = msg['content']
                        
                        # Filter messages for our execution
                        parent_msg_id = msg.get('parent_header', {}).get('msg_id')
                        if parent_msg_id and parent_msg_id != msg_id:
                            continue
                        
                        msg_count += 1
                        print(f"DEBUG: IOPub msg {msg_count}: type={msg_type}")
                        
                        if msg_type == 'stream':
                            stream_name = content['name']
                            text = content['text']
                            print(f"DEBUG: Stream - {stream_name}: {repr(text[:100])}")
                            if stream_name == 'stdout':
                                result.stdout += text
                            elif stream_name == 'stderr':
                                result.stderr += text
                                result.success = False
                        
                        elif msg_type == 'execute_result':
                            data = content['data']
                            print(f"DEBUG: Execute result - keys: {list(data.keys())}")
                            if 'image/png' in data:
                                result.plots.append(data['image/png'])
                            elif 'text/html' in data:
                                result.dataframes.append(data['text/html'])
                            elif 'text/plain' in data:
                                result.stdout += data['text/plain']
                        
                        elif msg_type == 'display_data':
                            data = content['data']
                            print(f"DEBUG: Display data - keys: {list(data.keys())}")
                            if 'image/png' in data:
                                result.plots.append(data['image/png'])
                                print(f"DEBUG: Found plot in display_data (main loop)!")
                            elif 'text/html' in data:
                                result.dataframes.append(data['text/html'])
                        
                        elif msg_type == 'error':
                            result.success = False
                            result.error = '\n'.join(content['traceback'])
                            result.stderr = result.error
                            execution_done = True
                        
                        elif msg_type == 'status':
                            if content['execution_state'] == 'idle':
                                # Execution complete, but continue to check shell channel
                                pass
                    
                    except queue.Empty:
                        # No IOPub messages, check shell channel
                        try:
                            shell_reply = client.get_shell_msg(timeout=0.1)
                            if shell_reply.get('parent_header', {}).get('msg_id') == msg_id:
                                execution_done = True
                                print(f"DEBUG: Got shell reply: {shell_reply.get('content', {}).get('status')}")
                                if shell_reply['content']['status'] == 'error':
                                    result.success = False
                                    if not result.error:
                                        result.error = '\n'.join(shell_reply['content']['traceback'])
                                        result.stderr = result.error
                                break
                        except queue.Empty:
                            # Continue waiting
                            continue
                
                # Get shell reply if we don't have it yet
                if not shell_reply:
                    try:
                        shell_reply = client.get_shell_msg(timeout=2)
                        if shell_reply.get('parent_header', {}).get('msg_id') == msg_id:
                            if shell_reply['content']['status'] == 'error':
                                result.success = False
                                if not result.error:
                                    result.error = '\n'.join(shell_reply['content']['traceback'])
                                    result.stderr = result.error
                    except queue.Empty:
                        pass
                
                # Collect any remaining IOPub messages (including display_data from plt.show())
                # We need to wait a bit longer for display_data messages which can arrive after execution
                for _ in range(50):  # Increased from 10 to 50 to catch late-arriving messages
                    try:
                        msg = client.get_iopub_msg(timeout=0.1)  # Increased timeout
                        parent_msg_id = msg.get('parent_header', {}).get('msg_id')
                        if parent_msg_id and parent_msg_id != msg_id:
                            continue
                        
                        msg_type = msg['msg_type']
                        content = msg['content']
                        
                        print(f"DEBUG: Late IOPub msg: type={msg_type}")
                        
                        if msg_type == 'stream':
                            stream_name = content['name']
                            text = content['text']
                            if stream_name == 'stdout':
                                result.stdout += text
                            elif stream_name == 'stderr':
                                result.stderr += text
                                result.success = False
                        
                        elif msg_type == 'execute_result':
                            data = content['data']
                            print(f"DEBUG: Execute result - keys: {list(data.keys())}")
                            if 'image/png' in data:
                                result.plots.append(data['image/png'])
                                print(f"DEBUG: Found plot in execute_result!")
                            elif 'text/html' in data:
                                result.dataframes.append(data['text/html'])
                            elif 'text/plain' in data:
                                result.stdout += data['text/plain']
                        
                        elif msg_type == 'display_data':
                            data = content['data']
                            print(f"DEBUG: Display data - keys: {list(data.keys())}")
                            if 'image/png' in data:
                                result.plots.append(data['image/png'])
                                print(f"DEBUG: Found plot in display_data!")
                            elif 'text/html' in data:
                                result.dataframes.append(data['text/html'])
                    except queue.Empty:
                        break
                
                print(f"DEBUG: Collected {msg_count} IOPub messages, stdout length: {len(result.stdout)}")
                
            except Exception as e:
                print(f"DEBUG: Exception in execution: {e}")
                import traceback
                traceback.print_exc()
                raise
            
            # Get variables snapshot
            try:
                vars_code = """
import json
import pandas as pd
import numpy as np

_vars = []
for name in dir():
    if not name.startswith('_') and name not in ['In', 'Out', 'get_ipython', 'exit', 'quit', 'pd', 'np', 'json', 'pd', 'np', 'matplotlib', 'plt', 'sns', 'px', 'go', 'display', 'HTML', 'io', 'base64']:
        try:
            obj = eval(name)
            obj_type = type(obj).__name__
            
            var_info = {'name': name, 'type': obj_type}
            
            if isinstance(obj, pd.DataFrame):
                var_info['type'] = 'DataFrame'
                var_info['shape'] = str(obj.shape)
                var_info['preview'] = obj.head().to_string()
                var_info['summary'] = obj.describe().to_string() if len(obj.select_dtypes(include=[np.number]).columns) > 0 else 'No numeric columns'
                var_info['value'] = f"DataFrame with {obj.shape[0]} rows and {obj.shape[1]} columns"
            elif isinstance(obj, np.ndarray):
                var_info['type'] = 'ndarray'
                var_info['shape'] = str(obj.shape)
                var_info['preview'] = str(obj[:10] if obj.size > 10 else obj)
                var_info['value'] = f"ndarray of shape {obj.shape}"
            elif isinstance(obj, (list, tuple)):
                var_info['type'] = type(obj).__name__
                var_info['shape'] = f"({len(obj)},)"
                var_info['preview'] = str(obj[:10] if len(obj) > 10 else obj)
                var_info['value'] = f"{type(obj).__name__} with {len(obj)} elements"
            elif isinstance(obj, dict):
                var_info['type'] = 'dict'
                var_info['shape'] = f"({len(obj)} keys)"
                var_info['preview'] = str(list(obj.keys())[:10])
                var_info['value'] = f"dict with {len(obj)} keys"
            else:
                var_info['value'] = str(obj)[:200]
            
            _vars.append(var_info)
        except Exception as e:
            pass

print(json.dumps(_vars))
"""
                # Execute variable extraction
                vars_msg_id = client.execute(vars_code)
                vars_shell_reply = client.get_shell_msg(timeout=5)
                
                # Get the output
                vars_output = ""
                for _ in range(10):
                    try:
                        msg = client.get_iopub_msg(timeout=0.2)
                        if msg.get('parent_header', {}).get('msg_id') == vars_msg_id:
                            if msg['msg_type'] == 'stream' and msg['content']['name'] == 'stdout':
                                vars_output += msg['content']['text']
                    except queue.Empty:
                        break
                
                if vars_output:
                    import json
                    try:
                        variables_list = json.loads(vars_output.strip())
                        # Convert to dict format (VariableSnapshot is a TypeScript type, not Python)
                        result.variables = [dict(v) for v in variables_list]
                        print(f"DEBUG: Extracted {len(result.variables)} variables: {[v.get('name') for v in result.variables]}")
                    except Exception as e:
                        print(f"DEBUG: Failed to parse variables: {e}")
                        import traceback
                        traceback.print_exc()
            except Exception as e:
                print(f"DEBUG: Variable extraction error: {e}")
                import traceback
                traceback.print_exc()
            
            result.execution_time = time.time() - start_time
            print(f"DEBUG: Final result - stdout: {repr(result.stdout)}")
            print(f"DEBUG: stdout length: {len(result.stdout)}, stderr length: {len(result.stderr)}")
            
        except Exception as e:
            result.success = False
            result.error = str(e)
            result.stderr = str(e)
            result.execution_time = time.time() - start_time
            print(f"DEBUG: Exception during execution: {e}")
        
        return result
    
    def restart_kernel(self, session_id: str):
        """Restart a kernel"""
        if session_id in self.kernels:
            self.kernels[session_id].restart_kernel()
            self.clients[session_id] = self.kernels[session_id].client()
    
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

