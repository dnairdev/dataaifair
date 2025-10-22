import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Bug, 
  Lightbulb, 
  Target, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { AISuggestion } from '../types';
import CodeExplorationModal from './CodeExplorationModal';
import LearningPrompt from './LearningPrompt';

const CodeEditor: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    updateFileContent, 
    suggestions,
    activeExploration,
    settings,
    addAISuggestion,
    dismissSuggestion
  } = useStore();

  const [showExploration, setShowExploration] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [editorValue, setEditorValue] = useState('');
  const editorRef = useRef<any>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  useEffect(() => {
    if (activeFile) {
      setEditorValue(activeFile.content);
    }
  }, [activeFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFileId) {
      setEditorValue(value);
      updateFileContent(activeFileId, value);
    }
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add custom keybindings for learning features
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      // Start learning session
      console.log('Start learning session');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
      // Start code exploration
      if (activeFileId) {
        setShowExploration(true);
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      // Show hints
      const fileSuggestions = suggestions.filter(s => s.fileId === activeFileId);
      if (fileSuggestions.length > 0) {
        setSelectedSuggestion(fileSuggestions[0]);
      }
    });
  };

  const getFileSuggestions = () => {
    if (!activeFileId) return [];
    return suggestions.filter(s => s.fileId === activeFileId && !s.dismissed);
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'hint':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'question':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'explanation':
        return <Info className="w-4 h-4 text-green-500" />;
      case 'challenge':
        return <Target className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSuggestionColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No file selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create a new file or open an existing one to start coding
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {activeFile.name}
            </span>
            {activeFile.isDirty && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{activeFile.language}</span>
            <span>•</span>
            <span>{activeFile.content.split('\n').length} lines</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Learning Mode Indicator */}
          {settings.learningMode && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
              <BookOpen className="w-3 h-3" />
              <span>Learning Mode</span>
            </div>
          )}

          {/* Quick Actions */}
          <button
            onClick={() => setShowExploration(true)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Start Code Exploration (Ctrl+E)"
          >
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Run Code (Ctrl+R)"
          >
            <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Debug (Ctrl+D)"
          >
            <Bug className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={activeFile.language}
            value={editorValue}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              fontSize: settings.fontSize,
              tabSize: settings.tabSize,
              wordWrap: settings.wordWrap ? 'on' : 'off',
              minimap: { enabled: true },
              lineNumbers: 'on',
              rulers: [80, 120],
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: true,
              smoothScrolling: true,
              contextmenu: true,
              mouseWheelZoom: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: 'matchingDocuments',
              parameterHints: { enabled: true },
              hover: { enabled: true },
              folding: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              }
            }}
          />

          {/* AI Suggestions Overlay */}
          {getFileSuggestions().length > 0 && (
            <div className="absolute top-4 right-4 w-80 space-y-2 max-h-96 overflow-y-auto">
              {getFileSuggestions().map(suggestion => (
                <div
                  key={suggestion.id}
                  className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.priority)} shadow-lg`}
                >
                  <div className="flex items-start space-x-2">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.content}
                      </div>
                      {suggestion.requiresUserAction && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => setSelectedSuggestion(suggestion)}
                            className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            Learn More
                          </button>
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Sidebar */}
        {settings.learningMode && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Learning Insights
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Code Analysis
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  This file contains {activeFile.content.split('\n').length} lines of {activeFile.language} code.
                  {activeFile.content.length > 1000 && ' Consider breaking this into smaller functions.'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Learning Opportunities
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    • Explore function dependencies
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    • Understand data flow
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    • Review error handling
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowExploration(true)}
                className="w-full p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Start Code Exploration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showExploration && activeFileId && (
        <CodeExplorationModal
          fileId={activeFileId}
          onClose={() => setShowExploration(false)}
        />
      )}

      {selectedSuggestion && (
        <LearningPrompt
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
        />
      )}
    </div>
  );
};

export default CodeEditor;
