import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  RefreshCw,
  X,
  File
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

interface FileInfo {
  filename: string;
  original_name: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  path: string;
  exists?: boolean;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
    
    // Listen for file storage updates from other components
    const handleFileStorageUpdate = () => {
      loadFiles();
    };
    
    window.addEventListener('fileStorageUpdated', handleFileStorageUpdate);
    
    return () => {
      window.removeEventListener('fileStorageUpdated', handleFileStorageUpdate);
    };
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.listFiles();
      setFiles(response.files || []);
    } catch (error: any) {
      // Check HTTP status code first (most reliable)
      const statusCode = error?.status;
      if (statusCode === 404 || statusCode >= 500) {
        setFiles([]);
        console.warn('Backend server not available. File storage requires the backend to be running.');
        return;
      }
      
      // Check if it's a network/connection error or 404
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorLower = errorMessage.toLowerCase();
      
      // Check for various error patterns
      const isConnectionError = errorLower.includes('failed to fetch') || 
                                errorLower.includes('networkerror') || 
                                errorLower.includes('fetch') ||
                                errorLower.includes('network request failed') ||
                                errorLower.includes('err_network') ||
                                errorLower.includes('connection') ||
                                errorLower.includes('refused') ||
                                errorLower.includes('err_connection') ||
                                errorLower.includes('network') ||
                                errorLower.includes('cors') ||
                                errorLower.includes('load failed');
      
      const isNotFoundError = errorLower.includes('404') || 
                              errorLower.includes('not found') ||
                              errorLower.includes('file not found') ||
                              errorLower.includes('cannot get') ||
                              errorMessage.includes('404');
      
      // Check if it's an API error with status code
      const isApiError = errorLower.includes('api error');
      
      // Don't show error toast for connection issues, 404s, or API errors when backend is down
      // The backend might not be running, which is expected
      if (isConnectionError || isNotFoundError || isApiError) {
        setFiles([]);
        console.warn('Backend server not available. File storage requires the backend to be running.', error);
        // Don't show toast - just silently handle it
        return;
      }
      
      // Only log unexpected errors, don't show toast
      console.error('Unexpected error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      await apiService.uploadFile(file);
      toast.success(`File "${file.name}" uploaded successfully!`);
      await loadFiles();
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorLower = errorMessage.toLowerCase();
      
      // Check if backend is not available
      const isConnectionError = errorLower.includes('failed to fetch') || 
                                errorLower.includes('networkerror') || 
                                errorLower.includes('404') ||
                                errorLower.includes('not found');
      
      if (isConnectionError) {
        toast.error('Backend server is not running. Please start it to upload files.');
      } else {
        toast.error(`Failed to upload file: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      const blob = await apiService.downloadFile(file.filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded "${file.original_name}"`);
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('404') || errorLower.includes('not found')) {
        toast.error(`File "${file.original_name}" not found on server`);
      } else {
        toast.error(`Failed to download file: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      return;
    }

    try {
      await apiService.deleteFile(file.filename);
      toast.success(`File "${file.original_name}" deleted`);
      await loadFiles();
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('404') || errorLower.includes('not found')) {
        // File already doesn't exist, just refresh the list
        await loadFiles();
      } else {
        toast.error(`Failed to delete file: ${errorMessage}`);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            File Storage
          </h2>
          <button
            onClick={loadFiles}
            disabled={isLoading}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Refresh files"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No files uploaded</p>
            <p className="text-xs mt-1">Upload files to use them in your code</p>
            <p className="text-xs mt-2 text-gray-400">
              Make sure the backend server is running
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p>Loading files...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.filename}
                className="group p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                        {file.original_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Zone - at the bottom */}
        <div className="mt-4 p-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-600">
                Drop file here or <span className="text-primary-600 font-medium">click to upload</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

