import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Folder, 
  Search, 
  GitBranch, 
  Settings,
  BookOpen,
  Target,
  Lightbulb,
  Zap,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
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
    files: true,
    learning: true,
    insights: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const extension = fileName.includes('.') ? '' : '.tsx';
      createFile({
        name: fileName + extension,
        content: '',
        language: 'typescript',
        path: '/',
        isOpen: true,
        isDirty: false
      });
    }
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
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* File Explorer */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Explorer
          </h2>
          <button
            onClick={handleCreateFile}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Create new file"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Files Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('files')}
            className="flex items-center space-x-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {expandedSections.files ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Folder className="w-4 h-4" />
            <span>Files ({files.length})</span>
          </button>
          
          {expandedSections.files && (
            <div className="ml-6 space-y-1">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    activeFileId === file.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Start code exploration"
                    >
                      <Target className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                      title="Delete file"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {files.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No files yet. Create one to get started!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection('learning')}
          className="flex items-center space-x-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {expandedSections.learning ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <BookOpen className="w-4 h-4" />
          <span>Learning Progress</span>
        </button>
        
        {expandedSections.learning && (
          <div className="ml-6 mt-3 space-y-3">
            {/* Critical Thinking Score */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Critical Thinking</span>
                <span className="font-medium">{userProgress.criticalThinkingScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress.criticalThinkingScore}%` }}
                />
              </div>
            </div>

            {/* Codebase Familiarity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Codebase Familiarity</span>
                <span className="font-medium">{userProgress.codebaseFamiliarityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress.codebaseFamiliarityScore}%` }}
                />
              </div>
            </div>

            {/* Learning Streak */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Learning Streak</span>
              </div>
              <span className="font-medium text-yellow-600">{userProgress.streak} days</span>
            </div>

            {/* Recent Achievements */}
            {userProgress.achievements.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Achievements</div>
                <div className="space-y-1">
                  {userProgress.achievements.slice(0, 3).map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-2 text-xs">
                      <span className="text-yellow-500">🏆</span>
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {achievement.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Start Learning Session</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Explore Codebase</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <GitBranch className="w-4 h-4" />
            <span className="text-sm font-medium">Code Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
