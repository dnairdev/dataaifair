// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2,
  Code,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Lightbulb,
  Image as ImageIcon,
  BarChart3,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { NotebookCell, CellOutput, ExecutionStatus, ExecutionRequest, VariableSnapshot } from '../types/notebook';
import { aiProvider } from '../services/aiProvider';
import { apiService } from '../services/api';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import ErrorTutor from './ErrorTutor';
import ExplainPlotModal from './ExplainPlotModal';
import NotebookChat from './NotebookChat';
import { detectConceptsFromCode } from '../utils/conceptTracker';

interface NotebookProps {
  notebookId?: string;
}

const Notebook: React.FC<NotebookProps> = ({ notebookId }) => {
  const { setNotebookVariables } = useStore();
  const [cells, setCells] = useState<NotebookCell[]>([
    {
      id: '1',
      type: 'code',
      content: 'import pandas as pd\nimport numpy as np\n\n# Your code here',
      status: 'idle'
    }
  ]);
  const [executingCellId, setExecutingCellId] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showErrorTutor, setShowErrorTutor] = useState<{error: string; code: string; traceback?: string} | null>(null);
  const [showExplainPlot, setShowExplainPlot] = useState<{plotData: string; code: string} | null>(null);
  const [expandedOutputs, setExpandedOutputs] = useState<Set<string>>(new Set());
  const [expandedDownOutputs, setExpandedDownOutputs] = useState<Set<string>>(new Set());
  const cellsEndRef = useRef<HTMLDivElement>(null);
  const cellsContainerRef = useRef<HTMLDivElement>(null);
  const previousCellsLength = useRef(cells.length);
  
  const toggleOutput = (cellId: string) => {
    setExpandedOutputs(prev => {
      const next = new Set(prev);
      if (next.has(cellId)) {
        next.delete(cellId);
      } else {
        next.add(cellId);
      }
      return next;
    });
  };
  
  const toggleOutputDown = (cellId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent toggle
    setExpandedDownOutputs(prev => {
      const next = new Set(prev);
      if (next.has(cellId)) {
        next.delete(cellId);
      } else {
        next.add(cellId);
      }
      return next;
    });
  };

  useEffect(() => {
    // Only auto-scroll if new cells were added (not on every render)
    if (cells.length > previousCellsLength.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (cellsEndRef.current && cellsContainerRef.current) {
          cellsContainerRef.current.scrollTop = cellsContainerRef.current.scrollHeight;
        }
      }, 100);
    }
    previousCellsLength.current = cells.length;
  }, [cells.length]);

  const addCell = (type: 'code' | 'markdown' = 'code', afterId?: string, initialContent: string = '') => {
    const newCell: NotebookCell = {
      id: crypto.randomUUID(),
      type,
      content: type === 'code' ? initialContent : (initialContent || '# Your markdown here'),
      status: 'idle'
    };

    if (afterId) {
      const index = cells.findIndex(c => c.id === afterId);
      setCells(prev => [
        ...prev.slice(0, index + 1),
        newCell,
        ...prev.slice(index + 1)
      ]);
    } else {
      setCells(prev => [...prev, newCell]);
    }
    
    return newCell.id;
  };

  // State to track question answers and pending code
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, Record<string, string>>>({});
  const [pendingCode, setPendingCode] = useState<Record<string, { code: string; explanation?: string }>>({});

  // Function to create coconut confetti animation
  const createCoconutConfetti = () => {
    const confettiCount = 40;
    const container = cellsContainerRef.current;
    if (!container) return;

    // Get container's position relative to viewport
    const rect = container.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const containerLeft = rect.left + window.scrollX;
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Create a wrapper div for confetti that's positioned relative to viewport
    const confettiWrapper = document.createElement('div');
    confettiWrapper.style.position = 'fixed';
    confettiWrapper.style.top = '0';
    confettiWrapper.style.left = '0';
    confettiWrapper.style.width = '100%';
    confettiWrapper.style.height = '100%';
    confettiWrapper.style.pointerEvents = 'none';
    confettiWrapper.style.zIndex = '9999';
    document.body.appendChild(confettiWrapper);

    for (let i = 0; i < confettiCount; i++) {
      const coconut = document.createElement('div');
      coconut.textContent = '🥥';
      coconut.style.position = 'absolute';
      coconut.style.fontSize = `${20 + Math.random() * 15}px`;
      coconut.style.pointerEvents = 'none';
      coconut.style.left = `${containerLeft + Math.random() * containerWidth}px`;
      coconut.style.top = `${containerTop + Math.random() * 100}px`;
      coconut.style.opacity = '1';
      
      confettiWrapper.appendChild(coconut);
      
      const animationDuration = 2000 + Math.random() * 1500;
      const horizontalDistance = (Math.random() - 0.5) * 400;
      const verticalDistance = containerHeight + 200;
      const rotation = 360 * (2 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
      
      coconut.animate([
        { 
          transform: 'translateY(0) translateX(0) rotate(0deg) scale(1)',
          opacity: 1
        },
        { 
          transform: `translateY(${verticalDistance}px) translateX(${horizontalDistance}px) rotate(${rotation}deg) scale(0.5)`,
          opacity: 0
        }
      ], {
        duration: animationDuration,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)'
      }).onfinish = () => {
        coconut.remove();
        if (confettiWrapper.children.length === 0) {
          confettiWrapper.remove();
        }
      };
    }
  };

  // Function to handle question submission
  const handleQuestionSubmit = (questionCellId: string) => {
    const answers = questionAnswers[questionCellId] || {};
    const hasAnswers = Object.keys(answers).length > 0;
    
    if (!hasAnswers) {
      toast.error('Please answer at least one question before viewing the code');
      return;
    }
    
    // Get the pending code for this question cell
    const pending = pendingCode[questionCellId];
    if (!pending) return;
    
    // Find the question cell index
    const questionCellIndex = cells.findIndex(c => c.id === questionCellId);
    if (questionCellIndex === -1) return;
    
    // Insert code cell before the question cell
    const codeCell: NotebookCell = {
      id: crypto.randomUUID(),
      type: 'code',
      content: pending.code,
      status: 'idle'
    };
    
    // Insert code and explanation AFTER the question cell
    setCells(prev => {
      const newCells: NotebookCell[] = [codeCell];
      
      if (pending.explanation) {
        const normalizedExplanation = pending.explanation
          .replace(/\\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim();
        
        const explanationCell: NotebookCell = {
          id: crypto.randomUUID(),
          type: 'markdown',
          content: `## 💡 Explanation\n\n${normalizedExplanation}`,
          status: 'success'
        };
        newCells.push(explanationCell);
      }
      
      // Insert after the question cell
      return [
        ...prev.slice(0, questionCellIndex + 1),
        ...newCells,
        ...prev.slice(questionCellIndex + 1)
      ];
    });
    
    // Create confetti effect with coconut emojis
    createCoconutConfetti();
    
    // Clean up
    setPendingCode(prev => {
      const next = { ...prev };
      delete next[questionCellId];
      return next;
    });
    
    toast.success('Code revealed! You can now run it.');
  };

  // Function to insert code from chat
  const handleInsertCode = (code: string, explanation?: string, questions?: string[]) => {
    console.log('[Notebook] handleInsertCode called with:', {
      codeLength: code?.length || 0,
      codePreview: code?.substring(0, 100) || 'empty',
      hasExplanation: !!explanation,
      explanationLength: explanation?.length || 0,
      hasQuestions: !!questions,
      questionsCount: questions?.length || 0
    });
    
    if (!code || code.trim().length === 0) {
      console.error('[Notebook] ❌ Cannot insert empty code!');
      toast.error('No code to insert');
      return;
    }
    
    // Determine where to insert: if there are existing cells, insert in the middle
    // Otherwise, add at the end
    let insertAfterId: string | undefined;
    
    if (cells.length > 1) {
      // Insert in the middle (after the first cell)
      insertAfterId = cells[0].id;
    }
    
    // If there are questions, create a questions cell first (code will be revealed after answering)
    if (questions && questions.length > 0) {
      const questionCellId = crypto.randomUUID();
      
      // Store the code and explanation to be revealed later
      setPendingCode(prev => ({
        ...prev,
        [questionCellId]: { code, explanation }
      }));
      
      // Create questions cell with interactive text boxes
      const questionsCell: NotebookCell = {
        id: questionCellId,
        type: 'markdown',
        content: `## 🤔 Think About This\n\n${questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n\n')}\n\n*Answer the questions below to reveal the code.*`,
        status: 'success',
        metadata: { questions, isQuestionCell: true }
      };
      
      setCells(prev => {
        if (insertAfterId) {
          const index = prev.findIndex(c => c.id === insertAfterId);
          if (index === -1) return [...prev, questionsCell];
          return [
            ...prev.slice(0, index + 1),
            questionsCell,
            ...prev.slice(index + 1)
          ];
        }
        return [...prev, questionsCell];
      });
      
      toast.success('Questions added! Answer them to reveal the code.');
      return;
    }
    
    // No questions - insert code directly
    const cellId = addCell('code', insertAfterId, code);
    console.log('[Notebook] ✅ Code cell created with ID:', cellId);
    
    // If there's an explanation, add it as a markdown cell
    if (explanation) {
      const normalizedExplanation = explanation
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      
      setCells(prev => {
        const codeCellIndex = prev.findIndex(c => c.id === cellId);
        if (codeCellIndex === -1) return prev;
        
        const explanationCell: NotebookCell = {
          id: crypto.randomUUID(),
          type: 'markdown',
          content: `## 💡 Explanation\n\n${normalizedExplanation}`,
          status: 'success'
        };
        
        return [
          ...prev.slice(0, codeCellIndex + 1),
          explanationCell,
          ...prev.slice(codeCellIndex + 1)
        ];
      });
    }
    
    // Scroll to the new cell
        setTimeout(() => {
          const codeCellElement = document.querySelector(`[data-cell-id="${cellId}"]`);
          if (codeCellElement && cellsContainerRef.current) {
            const container = cellsContainerRef.current;
            const elementTop = codeCellElement.getBoundingClientRect().top;
            const containerTop = container.getBoundingClientRect().top;
            const scrollTop = container.scrollTop;
            container.scrollTo({
              top: scrollTop + elementTop - containerTop - container.clientHeight / 2,
              behavior: 'smooth'
            });
          }
        }, 200);
    
    toast.success('Code inserted! You can now run it.');
  };

  const deleteCell = (id: string) => {
    if (cells.length === 1) {
      toast.error('Cannot delete the last cell');
      return;
    }
    setCells(prev => prev.filter(c => c.id !== id));
  };

  const updateCellContent = (id: string, content: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === id ? { ...cell, content } : cell
    ));
  };

  const executeCell = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') return;

    setExecutingCellId(cellId);
    setCells(prev => prev.map(c => 
      c.id === cellId ? { ...c, status: 'running' } : c
    ));

    try {
      // Call FastAPI backend for execution
      const response = await apiService.executeCode(cell.content, cellId, sessionId);
      
      // Debug: Log the response to see what we're getting
      console.log('Execution response:', {
        success: response.success,
        stdout: response.stdout,
        stderr: response.stderr,
        output: response.output,
        outputLength: response.output?.length || 0
      });
      
      setCells(prev => prev.map(c => {
        if (c.id === cellId) {
          // Auto-expand output when it's first created
          if (response.output && response.output.length > 0) {
            setExpandedOutputs(prevExpanded => new Set([...prevExpanded, cellId]));
          }
          return {
            ...c,
            status: response.success ? 'success' : 'error',
            output: response.output || [],
            error: response.error,
            executionCount: (c.executionCount || 0) + 1,
            executionTime: response.executionTime
          };
        }
        return c;
      }));

      // Update variables if provided
      if (response.variables) {
        setNotebookVariables(response.variables);
      }

      if (response.success) {
        toast.success('Cell executed successfully');
      } else {
        toast.error('Execution failed');
        // Show error tutor for errors
        if (response.error || response.stderr) {
          setShowErrorTutor({
            error: response.error || response.stderr || 'Unknown error',
            code: cell.content,
            traceback: response.stderr
          });
        }
      }
    } catch (error: any) {
      // Check if it's a network/connection error
      const isNetworkError = error instanceof TypeError || 
                            error?.message?.includes('Failed to fetch') ||
                            error?.message?.includes('NetworkError') ||
                            error?.message?.includes('fetch') ||
                            error?.message?.includes('API Error: 0');
      
      let errorMessage: string;
      if (isNetworkError) {
        errorMessage = 'Backend server not running!\n\n' +
                      'To execute Python code, please start the backend:\n\n' +
                      'cd backend\n' +
                      'python main.py\n\n' +
                      'Or: uvicorn main:app --reload --port 8000';
        toast.error('Backend server not running. Please start the Python backend on port 8000.');
      } else {
        errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error('Failed to execute cell');
      }
      
      setCells(prev => prev.map(c => 
        c.id === cellId ? { 
          ...c, 
          status: 'error', 
          error: errorMessage
        } : c
      ));
    } finally {
      setExecutingCellId(null);
    }
  };

  const explainCell = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code' || !cell.content.trim()) {
      toast.error('No code to explain');
      return;
    }

    try {
      const explanation = await aiProvider.explainCode({
        code: cell.content,
        language: 'python'
      });

      // Add explanation as markdown cell below
      const explanationCell: NotebookCell = {
        id: crypto.randomUUID(),
        type: 'markdown',
        content: `## Explanation\n\n${explanation.explanation}\n\n### Concepts Learned:\n${explanation.concepts.map(c => `- ${c}`).join('\n')}`,
        status: 'idle'
      };

      const index = cells.findIndex(c => c.id === cellId);
      setCells(prev => [
        ...prev.slice(0, index + 1),
        explanationCell,
        ...prev.slice(index + 1)
      ]);

      toast.success('Explanation generated');
    } catch (error) {
      toast.error('Failed to generate explanation');
    }
  };

  const renderOutput = (output: CellOutput, cell: NotebookCell) => {
    switch (output.type) {
      case 'text':
        return (
          <pre className="text-sm font-mono bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
            {output.data}
          </pre>
        );
      case 'html':
        return (
          <div 
            className="p-3 bg-white border border-gray-200 rounded"
            dangerouslySetInnerHTML={{ __html: output.data }}
          />
        );
      case 'image':
        return (
          <div className="p-3 bg-white border border-gray-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Plot Output</span>
              <button
                onClick={() => {
                  setShowExplainPlot({
                    plotData: output.data,
                    code: cell.content
                  });
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Explain Plot</span>
              </button>
            </div>
            <img 
              src={`data:${output.mimeType || 'image/png'};base64,${output.data}`}
              alt="Plot output"
              className="max-w-full"
            />
          </div>
        );
      case 'dataframe':
        return (
          <div className="p-3 bg-white border border-gray-200 rounded overflow-x-auto">
            <div 
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: output.data }}
            />
          </div>
        );
      case 'error':
        return (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <pre className="text-sm text-red-800 font-mono whitespace-pre-wrap">{output.data}</pre>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => addCell('code')}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Code Cell</span>
          </button>
          <button
            onClick={() => addCell('markdown')}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            <span>Add Markdown</span>
          </button>
        </div>
      </div>

      {/* Cells */}
      <div 
        ref={cellsContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 min-h-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {cells.map((cell, index) => (
          <div key={cell.id} data-cell-id={cell.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Cell Header */}
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {cell.type === 'code' && (
                  <>
                    {cell.executionCount !== undefined && (
                      <span className="text-xs font-mono text-gray-500">
                        In [{cell.executionCount}]:
                      </span>
                    )}
                    {getStatusIcon(cell.status)}
                  </>
                )}
                <span className="text-xs font-medium text-gray-600">
                  {cell.type === 'code' ? 'Code' : 'Markdown'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {cell.type === 'code' && (
                  <>
                    <button
                      onClick={() => explainCell(cell.id)}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Explain this code"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => executeCell(cell.id)}
                      disabled={executingCellId === cell.id}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                      title="Run cell"
                    >
                      {executingCellId === cell.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => addCell('code', cell.id)}
                  className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Add cell below"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCell(cell.id)}
                  className="p-1.5 text-gray-600 hover:bg-red-200 rounded transition-colors"
                  title="Delete cell"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cell Content */}
            <div className="bg-white">
              {cell.type === 'code' ? (
                <Editor
                  height="200px"
                  defaultLanguage="python"
                  value={cell.content}
                  onChange={(value) => updateCellContent(cell.id, value || '')}
                  theme="vs"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="p-4">
                  {/* Special rendering for question cells */}
                  {cell.metadata?.isQuestionCell && cell.metadata?.questions ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">💭</span>
                        <h2 className="text-lg font-semibold text-gray-900">Quick check-in!</h2>
                      </div>
                      <div className="space-y-2.5">
                        {(cell.metadata.questions as string[]).map((question, idx) => {
                          // Remove ** formatting from questions
                          const cleanQuestion = question.replace(/\*\*/g, '');
                          const hasAnswer = questionAnswers[cell.id]?.[idx]?.trim().length > 0;
                          return (
                            <div 
                              key={idx} 
                              className={`border-l-4 pl-3 py-2.5 rounded-r-md transition-all ${
                                hasAnswer 
                                  ? 'border-green-400 bg-green-50/50' 
                                  : 'border-blue-300 bg-blue-50/30'
                              }`}
                            >
                              <p className="text-gray-800 font-medium mb-2 text-sm leading-relaxed">
                                {cleanQuestion}
                              </p>
                              <input
                                type="text"
                                value={questionAnswers[cell.id]?.[idx] || ''}
                                onChange={(e) => {
                                  setQuestionAnswers(prev => ({
                                    ...prev,
                                    [cell.id]: {
                                      ...(prev[cell.id] || {}),
                                      [idx]: e.target.value
                                    }
                                  }));
                                }}
                                placeholder="Your quick answer..."
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${
                                  hasAnswer
                                    ? 'border-green-300 focus:ring-green-400 bg-white'
                                    : 'border-gray-200 focus:ring-blue-400 bg-white'
                                }`}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const nextInput = e.currentTarget.parentElement?.parentElement?.querySelector(`input[data-question-idx="${idx + 1}"]`) as HTMLInputElement;
                                    if (nextInput) {
                                      nextInput.focus();
                                    }
                                  }
                                }}
                                data-question-idx={idx}
                              />
                              {hasAnswer && (
                                <p className="text-xs text-green-600 mt-1.5 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Got it!
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-3">
                          Answer any question to unlock the code below 🥥
                        </p>
                        <button
                          onClick={() => handleQuestionSubmit(cell.id)}
                          disabled={!Object.keys(questionAnswers[cell.id] || {}).some(idx => 
                            questionAnswers[cell.id]?.[idx]?.trim().length > 0
                          )}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm hover:shadow-md"
                        >
                          🥥 Show me the code!
                        </button>
                      </div>
                    </div>
                  ) : cell.status === 'idle' ? (
                    // Edit mode for markdown
                    <textarea
                      value={cell.content}
                      onChange={(e) => updateCellContent(cell.id, e.target.value)}
                      className="w-full min-h-[100px] p-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="Markdown content..."
                    />
                  ) : (
                    // Render markdown (for explanations and other rendered markdown)
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {(() => {
                        const lines = cell.content.split('\n');
                        const elements: JSX.Element[] = [];
                        let inCodeBlock = false;
                        let codeBlockContent: string[] = [];
                        let codeBlockLanguage = '';
                        let lineIdx = 0;
                        
                        for (let i = 0; i < lines.length; i++) {
                          const line = lines[i];
                          const trimmedLine = line.trim();
                          
                          // Handle code blocks
                          if (trimmedLine.startsWith('```')) {
                            if (inCodeBlock) {
                              // End of code block
                              const codeContent = codeBlockContent.join('\n');
                              elements.push(
                                <div key={`code-${lineIdx}`} className="my-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                  <pre className="text-sm text-gray-100 font-mono whitespace-pre">
                                    <code>{codeContent}</code>
                                  </pre>
                                </div>
                              );
                              codeBlockContent = [];
                              inCodeBlock = false;
                              codeBlockLanguage = '';
                              lineIdx++;
                            } else {
                              // Start of code block
                              inCodeBlock = true;
                              codeBlockLanguage = trimmedLine.replace(/```/g, '').trim() || 'python';
                            }
                            continue;
                          }
                          
                          if (inCodeBlock) {
                            codeBlockContent.push(line);
                            continue;
                          }
                          
                          // Handle regular markdown
                          if (trimmedLine.startsWith('## ')) {
                            elements.push(
                              <h2 key={lineIdx} className="text-xl font-bold mt-4 mb-2 text-gray-900">
                                {trimmedLine.replace('## ', '')}
                              </h2>
                            );
                          } else if (trimmedLine.startsWith('### ')) {
                            elements.push(
                              <h3 key={lineIdx} className="text-lg font-semibold mt-3 mb-2 text-gray-800">
                                {trimmedLine.replace('### ', '')}
                              </h3>
                            );
                          } else if (trimmedLine.startsWith('- ')) {
                            elements.push(
                              <div key={lineIdx} className="ml-6 mb-1">
                                <span className="mr-2">•</span>
                                <span>{trimmedLine.replace('- ', '')}</span>
                              </div>
                            );
                          } else if (trimmedLine.match(/^\*\*Step \d+\*\*/i)) {
                            // Bold step header (e.g., **Step 1**)
                            const stepMatch = trimmedLine.match(/\*\*(Step \d+)\*\*/i);
                            if (stepMatch) {
                              elements.push(
                                <div key={lineIdx} className="mb-3 mt-4">
                                  <span className="font-semibold text-blue-700 text-base">{stepMatch[1]}</span>
                                </div>
                              );
                            }
                          } else if (trimmedLine.match(/^Step \d+:/i)) {
                            // Format step-by-step explanations
                            const stepMatch = trimmedLine.match(/^(Step \d+):\s*(.+)$/i);
                            if (stepMatch) {
                              elements.push(
                                <div key={lineIdx} className="mb-4 mt-3 pl-4 border-l-4 border-blue-200">
                                  <span className="font-semibold text-blue-700 text-base">{stepMatch[1]}</span>
                                  <span className="ml-2 text-gray-700 leading-relaxed">{stepMatch[2]}</span>
                                </div>
                              );
                            } else {
                              elements.push(
                                <p key={lineIdx} className="mb-2 leading-relaxed font-semibold text-gray-900">{trimmedLine}</p>
                              );
                            }
                          } else if (trimmedLine.match(/^\d+\.\s/)) {
                            // Numbered list items - handle bold text within
                            const listMatch = trimmedLine.match(/^\d+\.\s(.+)$/);
                            if (listMatch) {
                              const listContent = listMatch[1];
                              const parts = listContent.split(/(\*\*[^*]+\*\*)/g);
                              elements.push(
                                <div key={lineIdx} className="ml-6 mb-3">
                                  <span className="text-gray-700 leading-relaxed">
                                    {parts.map((part, partIdx) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={partIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                                      }
                                      return <span key={partIdx}>{part}</span>;
                                    })}
                                  </span>
                                </div>
                              );
                            } else {
                              elements.push(
                                <div key={lineIdx} className="ml-6 mb-2">
                                  <span className="text-gray-700 leading-relaxed">{trimmedLine}</span>
                                </div>
                              );
                            }
                          } else if (trimmedLine === '---') {
                            elements.push(
                              <hr key={lineIdx} className="my-4 border-gray-300" />
                            );
                          } else if (trimmedLine === '') {
                            elements.push(<br key={lineIdx} />);
                          } else {
                            // Handle bold text with **
                            const parts = line.split(/(\*\*[^*]+\*\*)/g);
                            elements.push(
                              <p key={lineIdx} className="mb-2 leading-relaxed text-gray-700">
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={partIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={partIdx}>{part}</span>;
                                })}
                              </p>
                            );
                          }
                          lineIdx++;
                        }
                        
                        // Handle unclosed code block
                        if (inCodeBlock && codeBlockContent.length > 0) {
                          const codeContent = codeBlockContent.join('\n');
                          elements.push(
                            <div key={`code-${lineIdx}`} className="my-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-sm text-gray-100 font-mono whitespace-pre">
                                <code>{codeContent}</code>
                              </pre>
                            </div>
                          );
                        }
                        
                        return elements;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cell Output */}
            {cell.output && cell.output.length > 0 && (
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 hover:bg-gray-100 px-4 py-2 flex items-center justify-between transition-colors">
                  <button
                    onClick={() => toggleOutput(cell.id)}
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <span className="text-xs font-medium text-gray-600">
                      Output {expandedOutputs.has(cell.id) ? '(expanded)' : '(collapsed)'}
                    </span>
                    {expandedOutputs.has(cell.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedOutputs.has(cell.id) && (
                    <button
                      onClick={(e) => toggleOutputDown(cell.id, e)}
                      className="ml-3 p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title={expandedDownOutputs.has(cell.id) ? "Collapse output height" : "Expand output height"}
                    >
                      {expandedDownOutputs.has(cell.id) ? (
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
                {expandedOutputs.has(cell.id) && (
                  <div 
                    className={`bg-gray-50 p-4 space-y-3 overflow-y-auto transition-all duration-300 ${
                      expandedDownOutputs.has(cell.id) 
                        ? 'max-h-[70vh]' 
                        : 'max-h-[400px]'
                    }`}
                  >
                    {cell.output.map((output, idx) => (
                      <div key={idx}>
                        {renderOutput(output, cell)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {cell.error && (
              <div className="border-t border-red-200 bg-red-50 p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <pre className="text-sm text-red-800 font-mono whitespace-pre-wrap">{cell.error}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={cellsEndRef} />
      </div>

      {/* Error Tutor Modal */}
      {showErrorTutor && (
        <ErrorTutor
          error={showErrorTutor.error}
          code={showErrorTutor.code}
          traceback={showErrorTutor.traceback}
          onClose={() => setShowErrorTutor(null)}
        />
      )}

      {/* Explain Plot Modal */}
      {showExplainPlot && (
        <ExplainPlotModal
          plotData={showExplainPlot.plotData}
          code={showExplainPlot.code}
          onClose={() => setShowExplainPlot(null)}
        />
      )}

      {/* Notebook Chat - Cursor-like chatbar */}
      <NotebookChat onInsertCode={handleInsertCode} />
    </div>
  );
};

export default Notebook;

