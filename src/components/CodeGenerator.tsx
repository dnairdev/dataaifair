import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Play, 
  Pause, 
  RotateCcw,
  Lightbulb,
  Target,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  FileText,
  Settings,
  Wand2
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface CodeGenerationStep {
  id: string;
  title: string;
  description: string;
  code: string;
  explanation: string;
  learningPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dependencies?: string[];
  imports?: string[];
}

interface CodeGenerationRequest {
  id: string;
  description: string;
  type: 'component' | 'function' | 'hook' | 'utility' | 'full-feature';
  language: 'typescript' | 'javascript' | 'react' | 'node';
  complexity: 'simple' | 'medium' | 'complex';
  steps: CodeGenerationStep[];
  currentStep: number;
  isGenerating: boolean;
  userUnderstanding: string[];
}

const CodeGenerator: React.FC = () => {
  const { addAISuggestion, addNotification, createFile, updateFileContent } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<CodeGenerationRequest | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const generateCodeRequest = async (description: string, type: string, complexity: string) => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const steps = generateStepsForRequest(description, type, complexity);
    
    const request: CodeGenerationRequest = {
      id: crypto.randomUUID(),
      description,
      type: type as any,
      language: 'typescript',
      complexity: complexity as any,
      steps,
      currentStep: 0,
      isGenerating: false,
      userUnderstanding: []
    };

    setCurrentRequest(request);
    setIsGenerating(false);
    
    addNotification({
      type: 'learning',
      title: 'Code Generation Started!',
      message: `I'm building ${description} while teaching you the concepts.`,
      read: false
    });
  };

  const generateStepsForRequest = (description: string, type: string, complexity: string): CodeGenerationStep[] => {
    if (type === 'component' && description.toLowerCase().includes('button')) {
      return [
        {
          id: '1',
          title: 'Define TypeScript Interface',
          description: 'Create the props interface for type safety',
          code: `interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}`,
          explanation: 'TypeScript interfaces define the shape of our component props. This ensures type safety and provides excellent developer experience with autocomplete.',
          learningPoints: [
            'Interfaces define object structures',
            'Optional properties use the ? operator',
            'Union types allow multiple possible values',
            'React.ReactNode accepts any renderable content'
          ],
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: 'Create the Component Function',
          description: 'Build the main component with proper typing',
          code: `const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};`,
          explanation: 'We use destructuring with default values for clean prop handling. The component uses conditional classes and renders different content based on the loading state.',
          learningPoints: [
            'Destructuring with default values',
            'Conditional rendering with ternary operators',
            'Template literals for dynamic classes',
            'Loading states improve user experience'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '3',
          title: 'Add Export and Usage Example',
          description: 'Export the component and show how to use it',
          code: `export default Button;

// Usage examples:
// <Button onClick={() => console.log('clicked')}>Click me</Button>
// <Button variant="secondary" size="lg">Large Button</Button>
// <Button disabled>Disabled Button</Button>
// <Button loading>Loading Button</Button>`,
          explanation: 'Exporting makes the component reusable. The usage examples show different ways to use the component with various props.',
          learningPoints: [
            'Default exports for single components',
            'Prop combinations create flexible APIs',
            'Documentation through examples',
            'Reusable component design'
          ],
          difficulty: 'beginner'
        }
      ];
    }

    if (type === 'hook' && description.toLowerCase().includes('counter')) {
      return [
        {
          id: '1',
          title: 'Create Custom Hook Structure',
          description: 'Set up the basic hook with state management',
          code: `import { useState, useCallback } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
  isAtMin: boolean;
  isAtMax: boolean;
}`,
          explanation: 'Custom hooks encapsulate logic and make it reusable. We define both the options interface and the return type for full type safety.',
          learningPoints: [
            'Custom hooks start with "use"',
            'Interfaces define hook contracts',
            'useCallback prevents unnecessary re-renders',
            'Type safety in custom hooks'
          ],
          difficulty: 'intermediate'
        },
        {
          id: '2',
          title: 'Implement Hook Logic',
          description: 'Add the actual counter logic with bounds checking',
          code: `export const useCounter = (options: UseCounterOptions = {}): UseCounterReturn => {
  const {
    initialValue = 0,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    step = 1
  } = options;

  const [count, setCountState] = useState(initialValue);

  const increment = useCallback(() => {
    setCountState(prev => {
      const newValue = prev + step;
      return newValue <= max ? newValue : prev;
    });
  }, [step, max]);

  const decrement = useCallback(() => {
    setCountState(prev => {
      const newValue = prev - step;
      return newValue >= min ? newValue : prev;
    });
  }, [step, min]);

  const reset = useCallback(() => {
    setCountState(initialValue);
  }, [initialValue]);

  const setCount = useCallback((value: number) => {
    if (value >= min && value <= max) {
      setCountState(value);
    }
  }, [min, max]);

  const isAtMin = count <= min;
  const isAtMax = count >= max;

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
    isAtMin,
    isAtMax
  };
};`,
          explanation: 'The hook uses useCallback to memoize functions and prevent unnecessary re-renders. We implement bounds checking and provide utility properties.',
          learningPoints: [
            'useCallback optimizes performance',
            'Bounds checking prevents invalid states',
            'Memoized functions prevent re-renders',
            'Utility properties enhance usability'
          ],
          difficulty: 'intermediate'
        }
      ];
    }

    // Default steps for other types
    return [
      {
        id: '1',
        title: 'Basic Structure',
        description: 'Set up the basic code structure',
        code: `// Basic structure for ${description}`,
        explanation: 'This is the foundation of your code.',
        learningPoints: ['Basic concepts'],
        difficulty: 'beginner'
      }
    ];
  };

  const completeStep = () => {
    if (!currentRequest) return;

    const currentStep = currentRequest.steps[currentRequest.currentStep];
    
    // Add learning points
    addAISuggestion({
      type: 'explanation',
      content: `Great! You've completed: ${currentStep.title}. ${currentStep.explanation}`,
      priority: 'medium',
      requiresUserAction: false,
      dismissed: false
    });

    // Move to next step or complete
    if (currentRequest.currentStep < currentRequest.steps.length - 1) {
      setCurrentRequest(prev => prev ? {
        ...prev,
        currentStep: prev.currentStep + 1
      } : null);
    } else {
      // Generation complete
      addNotification({
        type: 'achievement',
        title: 'Code Generation Complete!',
        message: `You've successfully built ${currentRequest.description} and learned valuable concepts!`,
        read: false
      });
      setCurrentRequest(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'advanced':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          <Code className="w-5 h-5" />
          <span className="font-medium">Code Generator</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Code className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Code Generator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate code while learning the concepts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 p-6">
          {!currentRequest ? (
            /* Request Form */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  What would you like to build?
                </h3>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe what you want to build (e.g., 'A reusable button component with loading states')"
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="component">React Component</option>
                    <option value="hook">Custom Hook</option>
                    <option value="function">Utility Function</option>
                    <option value="full-feature">Full Feature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="react">React</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Complexity
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => generateCodeRequest(userInput, 'component', 'medium')}
                  disabled={!userInput.trim() || isGenerating}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Current Generation */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentRequest.description}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentRequest.currentStep + 1} of {currentRequest.steps.length}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(currentRequest.steps[currentRequest.currentStep].difficulty)}`}>
                    {currentRequest.steps[currentRequest.currentStep].difficulty}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {currentRequest.steps[currentRequest.currentStep].title}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {currentRequest.steps[currentRequest.currentStep].description}
                </p>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto mb-4">
                  <pre>{currentRequest.steps[currentRequest.currentStep].code}</pre>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Why this matters:
                      </h5>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {currentRequest.steps[currentRequest.currentStep].explanation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Key Learning Points:
                  </h5>
                  <ul className="space-y-1">
                    {currentRequest.steps[currentRequest.currentStep].learningPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Brain className="w-4 h-4" />
                    <span>Building your understanding</span>
                  </div>
                  <button
                    onClick={completeStep}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Complete Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
