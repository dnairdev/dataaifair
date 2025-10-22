import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw,
  Lightbulb,
  Target,
  CheckCircle,
  ArrowRight,
  Code,
  FileText,
  Settings,
  Brain,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  type: 'setup' | 'component' | 'logic' | 'styling' | 'testing' | 'optimization';
  code: string;
  explanation: string;
  learningPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  userUnderstanding?: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'react' | 'nextjs' | 'vue' | 'node' | 'fullstack';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: ProjectStep[];
  learningGoals: string[];
}

const AIProjectBuilder: React.FC = () => {
  const { addAISuggestion, addNotification, userProgress } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectTemplate | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const projectTemplates: ProjectTemplate[] = [
    {
      id: 'todo-app',
      name: 'Smart Todo App',
      description: 'Build a modern todo app with React, TypeScript, and advanced features',
      category: 'react',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      learningGoals: [
        'React hooks and state management',
        'TypeScript interfaces and types',
        'Component composition patterns',
        'Local storage integration',
        'Responsive design principles'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Project Setup',
          description: 'Initialize the React project with TypeScript and essential dependencies',
          type: 'setup',
          code: `npm create vite@latest smart-todo-app -- --template react-ts
cd smart-todo-app
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`,
          explanation: 'We start by creating a new Vite project with React and TypeScript. Vite provides fast development and building. We also install Lucide React for icons and Tailwind CSS for styling.',
          learningPoints: [
            'Vite is a modern build tool that\'s faster than Create React App',
            'TypeScript adds type safety to JavaScript',
            'npm is the package manager for Node.js packages',
            'Tailwind CSS provides utility-first styling'
          ],
          difficulty: 'beginner',
          completed: false
        },
        {
          id: 'types',
          title: 'Define TypeScript Interfaces',
          description: 'Create type definitions for our todo items and app state',
          type: 'logic',
          code: `// src/types/todo.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchTerm: string;
}

export type TodoAction = 
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_FILTER'; payload: TodoState['filter'] }
  | { type: 'SET_SEARCH'; payload: string };`,
          explanation: 'TypeScript interfaces help us define the shape of our data. This makes our code more maintainable and catches errors at compile time. We define the Todo interface with all necessary properties and the TodoState for managing our app state.',
          learningPoints: [
            'Interfaces define the structure of objects',
            'TypeScript helps catch errors before runtime',
            'Union types allow multiple possible values',
            'Generic types make code reusable'
          ],
          difficulty: 'intermediate',
          completed: false
        },
        {
          id: 'context',
          title: 'Create React Context',
          description: 'Set up context for global state management',
          type: 'logic',
          code: `// src/context/TodoContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Todo, TodoState, TodoAction } from '../types/todo';

const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
} | null>(null);

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      const newTodo: Todo = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return { ...state, todos: [...state.todos, newTodo] };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    
    default:
      return state;
  }
};

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    searchTerm: ''
  });

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};`,
          explanation: 'React Context allows us to share state across components without prop drilling. We use useReducer for complex state logic and create a custom hook for easy access. This pattern is more scalable than useState for complex applications.',
          learningPoints: [
            'Context provides global state without prop drilling',
            'useReducer is better than useState for complex state logic',
            'Custom hooks encapsulate logic and make it reusable',
            'Error boundaries help catch and handle errors gracefully'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'weather-app',
      name: 'Weather Dashboard',
      description: 'Build a weather app with API integration and data visualization',
      category: 'react',
      difficulty: 'intermediate',
      estimatedTime: '3-4 hours',
      learningGoals: [
        'API integration and error handling',
        'Data visualization with charts and graphs',
        'Responsive design and mobile-first approach',
        'API caching and performance optimization',
        'Error handling and user feedback'
      ],
      steps: []
    }
  ];

  const startProject = (template: ProjectTemplate) => {
    setCurrentProject(template);
    setCurrentStepIndex(0);
    setIsBuilding(true);
    setIsOpen(true);
    
    addNotification({
      type: 'learning',
      title: 'Project Started!',
      message: `You're now building ${template.name}. Let's learn as we code!`,
      read: false
    });
  };

  const completeStep = () => {
    if (!currentProject) return;

    const currentStep = currentProject.steps[currentStepIndex];
    
    // Add learning points to user progress
    addAISuggestion({
      type: 'explanation',
      content: `Great job completing: ${currentStep.title}. ${currentStep.explanation}`,
      priority: 'medium',
      requiresUserAction: false,
      dismissed: false
    });

    // Move to next step or complete project
    if (currentStepIndex < currentProject.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Project completed
      setIsBuilding(false);
      addNotification({
        type: 'achievement',
        title: 'Project Complete!',
        message: `Congratulations! You've built ${currentProject.name} and learned valuable skills.`,
        read: false
      });
    }
  };

  const getStepIcon = (type: ProjectStep['type']) => {
    switch (type) {
      case 'setup':
        return <Settings className="w-5 h-5 text-blue-500" />;
      case 'component':
        return <Code className="w-5 h-5 text-green-500" />;
      case 'logic':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'styling':
        return <Wand2 className="w-5 h-5 text-pink-500" />;
      case 'testing':
        return <CheckCircle className="w-5 h-5 text-yellow-500" />;
      case 'optimization':
        return <Zap className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
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
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        >
          <Wand2 className="w-5 h-5" />
          <span className="font-medium">AI Project Builder</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Wand2 className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Project Builder
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build projects while learning every step of the way
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

        <div className="flex-1 flex overflow-hidden">
          {/* Project Templates */}
          {!currentProject && (
            <div className="w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose a Project to Build
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => startProject(template)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="w-5 h-5 text-primary-600" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {template.estimatedTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Project */}
          {currentProject && (
            <div className="flex-1 flex">
              {/* Steps Sidebar */}
              <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {currentProject.name}
                </h3>
                <div className="space-y-2">
                  {currentProject.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        index === currentStepIndex
                          ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                          : step.completed
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {getStepIcon(step.type)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {step.title}
                        </span>
                        {step.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(step.difficulty)}`}>
                          {step.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {index + 1}/{currentProject.steps.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Step */}
              <div className="flex-1 p-6 flex flex-col">
                {currentProject.steps[currentStepIndex] && (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-4">
                        {getStepIcon(currentProject.steps[currentStepIndex].type)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {currentProject.steps[currentStepIndex].title}
                        </h3>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {currentProject.steps[currentStepIndex].description}
                      </p>

                      {/* Code Block */}
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto mb-6">
                        <pre>{currentProject.steps[currentStepIndex].code}</pre>
                      </div>

                      {/* Explanation */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                              Why this matters:
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {currentProject.steps[currentStepIndex].explanation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Learning Points */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Key Learning Points:
                        </h4>
                        <ul className="space-y-2">
                          {currentProject.steps[currentStepIndex].learningPoints.map((point, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                              <Target className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* User Understanding Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          What did you learn from this step?
                        </label>
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Share your understanding and any questions..."
                          className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Brain className="w-4 h-4" />
                        <span>Building your understanding</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {showExplanation ? 'Hide' : 'Show'} Deep Dive
                        </button>
                        <button
                          onClick={completeStep}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                        >
                          <span>Complete Step</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProjectBuilder;
