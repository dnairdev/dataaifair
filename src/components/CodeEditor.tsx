import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Bug, 
  Lightbulb, 
  Target, 
  BookOpen,
  AlertCircle,
  Info,
  Brain,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { AISuggestion } from '../types';
import CodeExplorationModal from './CodeExplorationModal';
import LearningPrompt from './LearningPrompt';
import { explainCode } from '../utils/aiHelpers';
import { toast } from 'react-hot-toast';

const CodeEditor: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    updateFileContent, 
    suggestions,
    settings,
    addAISuggestion,
    dismissSuggestion,
    toggleProjectBuilder,
    userUseCase,
    userProgress
  } = useStore();

  const [showExploration, setShowExploration] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [editorValue, setEditorValue] = useState('');
  const editorRef = useRef<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<{ overview: string; lineByLine: Array<{ lineNumber: number; code: string; explanation: string }> } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

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

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add custom keybindings for learning features
    if (monaco) {
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
    }
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

  const handleExplainCode = async () => {
    if (!activeFile) return;

    setIsExplaining(true);
    setShowExplanation(true);
    
    try {
      const codeExplanation = await explainCode(
        activeFile.content,
        activeFile.language,
        activeFile.name
      );
      setExplanation(codeExplanation);
      
      // Update progress when explaining code (increases critical thinking)
      const currentProgress = userProgress;
      const newCriticalThinking = Math.min(100, currentProgress.criticalThinkingScore + 2);
      const newFamiliarity = Math.min(100, currentProgress.codebaseFamiliarityScore + 1);
      
      // Update progress in store
      useStore.setState({
        userProgress: {
          ...currentProgress,
          criticalThinkingScore: newCriticalThinking,
          codebaseFamiliarityScore: newFamiliarity
        }
      });
      
      // Add as a learning suggestion
      addAISuggestion({
        type: 'explanation',
        content: `Line-by-line code explanation generated for ${activeFile.name}`,
        fileId: activeFile.id,
        priority: 'medium',
        requiresUserAction: false,
        dismissed: false
      });

      toast.success('Line-by-line explanation generated!');
    } catch (error) {
      console.error('Error explaining code:', error);
      toast.error('Failed to generate explanation');
      setExplanation(null);
    } finally {
      setIsExplaining(false);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 text-7xl">
            🥥
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to Cocode{userUseCase ? '!' : ''}
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {userUseCase ? (
              <>
                We've personalized your experience based on your goals. 
                Let's start building something amazing!
              </>
            ) : (
              <>
                An AI-assisted IDE that teaches you to code by building projects. 
                Learn concepts, not just copy code.
              </>
            )}
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg text-left border border-gray-100">
              <Sparkles className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Build Any Product</div>
                <div className="text-sm text-gray-600">
                  Describe what you want to build, and we'll create a step-by-step learning plan
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg text-left border border-gray-100">
              <Brain className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Learn by Doing</div>
                <div className="text-sm text-gray-600">
                  Each step includes explanations so you understand the "why" behind the code
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg text-left border border-gray-100">
              <Target className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Track Progress</div>
                <div className="text-sm text-gray-600">
                  Build critical thinking skills while staying familiar with your codebase
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Get started by:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  // This will be handled by Sidebar component
                  window.dispatchEvent(new CustomEvent('openCreateFileModal'));
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
              >
                Create a File
              </button>
              <button
                onClick={() => {
                  toggleProjectBuilder();
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Start Building
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950">
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

          {/* Explain Code Button */}
          <button
            onClick={handleExplainCode}
            disabled={isExplaining || !activeFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Explain this code automatically"
          >
            {isExplaining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Explain Code</span>
              </>
            )}
          </button>

          {/* Quick Actions */}
          <button
            onClick={() => setShowExploration(true)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Start Code Exploration (Ctrl+E)"
          >
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Run Code (Ctrl+R)"
          >
            <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              contextmenu: true,
              mouseWheelZoom: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: true,
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

      {/* Code Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg">
                  <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Code Explanation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeFile?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowExplanation(false);
                  setExplanation(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isExplaining ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Analyzing your code line by line...</p>
                  </div>
                </div>
              ) : explanation ? (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Overview</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{explanation.overview}</p>
                  </div>

                  {/* Line by Line */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Line-by-Line Explanation</h3>
                    <div className="space-y-3">
                      {explanation.lineByLine.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border border-gray-100 dark:border-gray-800"
                        >
                          <div className="flex-shrink-0 w-12 text-right">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.lineNumber}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mb-1 whitespace-pre-wrap break-words">
                              {item.code || '\u00A0'}
                            </code>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.explanation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-900">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowExplanation(false);
                    setExplanation(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                {explanation && (
                  <button
                    onClick={() => {
                      if (activeFile) {
                        const explanationText = `Line-by-line explanation for ${activeFile.name}:\n\n${explanation.overview}\n\n${explanation.lineByLine.map(item => `Line ${item.lineNumber}: ${item.explanation}`).join('\n')}`;
                        addAISuggestion({
                          type: 'explanation',
                          content: explanationText,
                          fileId: activeFile.id,
                          priority: 'medium',
                          requiresUserAction: false,
                          dismissed: false
                        });
                        toast.success('Explanation saved to learning suggestions!');
                      }
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save to Learning
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;

