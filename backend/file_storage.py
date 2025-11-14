"""
File Storage System for Cocode IDE
Stores files that can be accessed by notebook code execution
"""
import os
import shutil
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import json

class FileStorage:
    def __init__(self, storage_dir: str = "file_storage"):
        """Initialize file storage with a directory"""
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        self.metadata_file = self.storage_dir / "metadata.json"
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> Dict:
        """Load file metadata"""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_metadata(self):
        """Save file metadata"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def upload_file(self, filename: str, content: bytes, file_type: str = "csv") -> Dict:
        """Upload a file to storage"""
        # Sanitize filename
        safe_filename = self._sanitize_filename(filename)
        file_path = self.storage_dir / safe_filename
        
        # Write file
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Update metadata
        self.metadata[safe_filename] = {
            "original_name": filename,
            "filename": safe_filename,
            "file_type": file_type,
            "size": len(content),
            "uploaded_at": datetime.now().isoformat(),
            "path": str(file_path)
        }
        self._save_metadata()
        
        return self.metadata[safe_filename]
    
    def get_file(self, filename: str) -> Optional[bytes]:
        """Get file content"""
        safe_filename = self._sanitize_filename(filename)
        file_path = self.storage_dir / safe_filename
        
        if file_path.exists() and file_path.is_file():
            with open(file_path, 'rb') as f:
                return f.read()
        return None
    
    def delete_file(self, filename: str) -> bool:
        """Delete a file"""
        safe_filename = self._sanitize_filename(filename)
        file_path = self.storage_dir / safe_filename
        
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            if safe_filename in self.metadata:
                del self.metadata[safe_filename]
            self._save_metadata()
            return True
        return False
    
    def list_files(self) -> List[Dict]:
        """List all files in storage"""
        files = []
        for filename, meta in self.metadata.items():
            file_path = self.storage_dir / filename
            if file_path.exists():
                files.append({
                    **meta,
                    "exists": True
                })
            else:
                # Clean up metadata for non-existent files
                del self.metadata[filename]
        self._save_metadata()
        return files
    
    def get_file_path(self, filename: str) -> Optional[str]:
        """Get the absolute path to a file (for kernel access)"""
        safe_filename = self._sanitize_filename(filename)
        file_path = self.storage_dir / safe_filename
        
        if file_path.exists() and file_path.is_file():
            return str(file_path.absolute())
        return None
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to prevent directory traversal"""
        # Remove path components
        filename = os.path.basename(filename)
        # Remove dangerous characters
        filename = "".join(c for c in filename if c.isalnum() or c in "._-")
        return filename
    
    def get_storage_directory(self) -> str:
        """Get the storage directory path (for kernel access)"""
        return str(self.storage_dir.absolute())

# Global file storage instance
file_storage = FileStorage()

