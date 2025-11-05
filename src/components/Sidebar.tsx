import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Folder, 
  Target,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { CodeFile } from '../types';

const Sidebar: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    setActiveFile, 
    createFile, 
    deleteFile,
    sidebarOpen,
    userProgress,
    startCodeExploration
  } = useStore();

  const [expandedSections, setExpandedSections] = useState({
    files: true
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('typescript');

  // Listen for open create file modal event
  useEffect(() => {
    const handleOpenModal = () => {
      setShowCreateModal(true);
    };
    window.addEventListener('openCreateFileModal', handleOpenModal);
    return () => {
      window.removeEventListener('openCreateFileModal', handleOpenModal);
    };
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    return languageMap[ext || ''] || 'typescript';
  };

  const getDefaultExtension = (language: string): string => {
    const extensionMap: Record<string, string> = {
      'typescript': '.tsx',
      'javascript': '.jsx',
      'css': '.css',
      'html': '.html',
      'json': '.json',
      'markdown': '.md',
      'python': '.py',
      'java': '.java',
      'cpp': '.cpp',
      'c': '.c',
      'go': '.go',
      'rust': '.rs',
      'php': '.php',
      'ruby': '.rb',
      'swift': '.swift',
      'kotlin': '.kt'
    };
    return extensionMap[language] || '.tsx';
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      return;
    }

    // Ensure file has extension
    let fileName = newFileName.trim();
    if (!fileName.includes('.')) {
      fileName = fileName + getDefaultExtension(selectedLanguage);
    }

    // Check if file already exists
    const fileExists = files.some(f => f.name === fileName);
    if (fileExists) {
      toast.error(`File "${fileName}" already exists. Please choose a different name.`);
      return;
    }

    const language = getLanguageFromExtension(fileName);

    // Get default content based on file type
    let defaultContent = '';
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      defaultContent = `import React from 'react';

export default function ${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')}() {
  return (
    <div>
      <h1>${fileName.split('.')[0]}</h1>
    </div>
  );
}`;
    } else if (fileName.endsWith('.ts')) {
      defaultContent = `// ${fileName}\n\nexport default {};`;
    } else if (fileName.endsWith('.css')) {
      defaultContent = `/* ${fileName} */\n\n`;
    } else if (fileName.endsWith('.html')) {
      defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
</head>
<body>
  <h1>${fileName}</h1>
</body>
</html>`;
    } else if (fileName.endsWith('.json')) {
      defaultContent = `{\n  \n}`;
    }

    createFile({
      name: fileName,
      content: defaultContent,
      language: language,
      path: '/',
      isOpen: true,
      isDirty: false
    });

    // Reset form and close modal
    setNewFileName('');
    setSelectedLanguage('typescript');
    setShowCreateModal(false);
    toast.success(`File "${fileName}" created successfully!`);
  };

  const handleFileClick = (file: CodeFile) => {
    setActiveFile(file.id);
  };

  const handleStartExploration = (file: CodeFile) => {
    startCodeExploration(file.id, 1, Math.max(1, file.content.split('\n').length));
  };

  const getFileIcon = (file: CodeFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return '🔷';
      case 'jsx':
      case 'js':
        return '🟨';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      case 'json':
        return '📄';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  if (!sidebarOpen) return null;

  return (
    <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
      {/* File Explorer */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Explorer
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Create new file"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Files Section */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('files')}
            className="flex items-center space-x-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {expandedSections.files ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Folder className="w-4 h-4" />
            <span>Files ({files.length})</span>
          </button>
          
          {expandedSections.files && (
            <div className="ml-6 space-y-1 mt-2">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    activeFileId === file.id
                      ? 'bg-gray-900 text-white border border-gray-900'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-sm">{getFileIcon(file)}</span>
                    <span className="text-sm truncate">{file.name}</span>
                    {file.isDirty && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartExploration(file);
                      }}
                      className="p-1 rounded hover:bg-gray-200"
                      title="Start code exploration"
                    >
                      <Target className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                      className="p-1 rounded hover:bg-red-100 text-red-600"
                      title="Delete file"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {files.length === 0 && (
                <div className="text-sm text-gray-500 italic py-4 text-center">
                  No files yet. Create one to get started!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Files</div>
            <div className="text-lg font-bold text-gray-900">{userProgress.totalFilesExplored}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Sessions</div>
            <div className="text-lg font-bold text-gray-900">{userProgress.totalLearningSessions}</div>
          </div>
        </div>
      </div>

      {/* Create File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New File
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewFileName('');
                    setSelectedLanguage('typescript');
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFile();
                      } else if (e.key === 'Escape') {
                        setShowCreateModal(false);
                      }
                    }}
                    placeholder="e.g., App.tsx, utils.ts, styles.css"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Include extension or select language below
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language / Type
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      // Auto-add extension if filename doesn't have one
                      if (newFileName && !newFileName.includes('.')) {
                        const ext = getDefaultExtension(e.target.value);
                        const nameWithoutExt = newFileName.replace(/\.\w+$/, '');
                        setNewFileName(nameWithoutExt + ext);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="typescript">TypeScript (.ts, .tsx)</option>
                    <option value="javascript">JavaScript (.js, .jsx)</option>
                    <option value="css">CSS (.css)</option>
                    <option value="html">HTML (.html)</option>
                    <option value="json">JSON (.json)</option>
                    <option value="markdown">Markdown (.md)</option>
                    <option value="python">Python (.py)</option>
                    <option value="java">Java (.java)</option>
                    <option value="cpp">C++ (.cpp)</option>
                    <option value="c">C (.c)</option>
                    <option value="go">Go (.go)</option>
                    <option value="rust">Rust (.rs)</option>
                    <option value="php">PHP (.php)</option>
                    <option value="ruby">Ruby (.rb)</option>
                    <option value="swift">Swift (.swift)</option>
                    <option value="kotlin">Kotlin (.kt)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewFileName('');
                    setSelectedLanguage('typescript');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  disabled={!newFileName.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
