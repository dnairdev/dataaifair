// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  BookOpen,
  Target,
  Brain,
  Zap,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  ArrowRight,
  GripVertical
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  codeBlock?: string;
  learningPoints?: string[];
  projectPlan?: {
    name: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
      code?: string;
      explanation: string;
    }>;
  };
}

const AIChat: React.FC = () => {
  const { addAISuggestion, userProgress, setCustomProject, toggleProjectBuilder, userUseCase } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [width, setWidth] = useState(384); // w-96 = 384px
  const [height, setHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'width' | 'height' | 'both' | null>(null);
  
  // Get personalized greeting based on use case
  const getPersonalizedGreeting = () => {
    const useCaseMessages: Record<string, { content: string; suggestions: string[] }> = {
      'student-learning': {
        content: "Hi! I'm your AI coding assistant. Since you're learning programming, I'll help you build projects step-by-step with detailed explanations. What would you like to create today?",
        suggestions: [
          "Build a todo app",
          "Create a weather dashboard",
          "Make a simple game",
          "Build my own project idea"
        ]
      },
      'cs-major': {
        content: "Hi! I'm your AI coding assistant. As a CS student, I can help you build portfolio-worthy projects with best practices. What would you like to create?",
        suggestions: [
          "Build a REST API",
          "Create a database application",
          "Build an authentication system",
          "Create my own project"
        ]
      },
      'career-switch': {
        content: "Hi! I'm your AI coding assistant. I'll help you build projects that showcase your skills for your career transition. What would you like to build?",
        suggestions: [
          "Build a portfolio project",
          "Create an e-commerce site",
          "Build a REST API",
          "Create my own project"
        ]
      },
      'startup': {
        content: "Hi! I'm your AI coding assistant. I'll help you build MVPs and products for your startup. What would you like to create?",
        suggestions: [
          "Build an e-commerce platform",
          "Create an analytics dashboard",
          "Build a REST API",
          "Create my own product"
        ]
      },
      'enterprise': {
        content: "Hi! I'm your AI coding assistant. I'll help you build scalable, production-ready applications. What would you like to create?",
        suggestions: [
          "Build a microservices architecture",
          "Create an API gateway",
          "Build a monitoring tool",
          "Create my own project"
        ]
      }
    };
    
    const defaultMessage = {
      content: "Hi! I'm your AI coding assistant. I can teach you how to build ANY product you want! Just describe what you'd like to create, and I'll create a personalized step-by-step learning plan for you. What would you like to build today?",
      suggestions: [
        "I want to build a social media app",
        "Create an e-commerce website",
        "Build a task management tool",
        "Make a music player app",
        "Create my own product idea"
      ]
    };
    
    return useCaseMessages[userUseCase || ''] || defaultMessage;
  };
  
  const personalizedGreeting = getPersonalizedGreeting();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: personalizedGreeting.content,
      timestamp: new Date(),
      suggestions: personalizedGreeting.suggestions
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateProjectPlan = async (description: string): Promise<ChatMessage> => {
    setIsTyping(true);
    
    try {
      const userLevel = userProgress.criticalThinkingScore >= 80 ? 'advanced' : userProgress.criticalThinkingScore >= 50 ? 'intermediate' : 'beginner';
      
      // Try to use API to generate project plan
      const response = await apiService.buildProject({
        projectType: 'custom',
        description: description,
        userLevel: userLevel
      });

      setIsTyping(false);
      
      return {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `Perfect! I've created a personalized learning plan for your project. Here's what we'll build step-by-step:\n\n**${response.projectName || 'Your Custom Project'}**\n\n${response.description || description}\n\n**Estimated Time:** ${response.estimatedTime || 'Varies'}\n**Difficulty:** ${response.difficulty || userLevel}\n\nWould you like me to start guiding you through the steps?`,
        timestamp: new Date(),
        suggestions: [
          "Yes, let's start building!",
          "Show me the first step",
          "Explain the technologies",
          "What will I learn?"
        ],
        learningPoints: response.learningGoals || [],
        projectPlan: {
          name: response.projectName || 'Custom Project',
          description: response.description || description,
          steps: response.steps?.map((step: any, index: number) => ({
            title: step.title || `Step ${index + 1}`,
            description: step.description || '',
            code: step.code || '',
            explanation: step.explanation || ''
          })) || []
        }
      };
    } catch (error) {
      console.error('Project plan generation error:', error);
      setIsTyping(false);
      
      // Fallback: Generate a simple plan locally
      return generateLocalProjectPlan(description);
    }
  };

  const generateLocalProjectPlan = (description: string): ChatMessage => {
    const lowerDesc = description.toLowerCase();
    let projectName = 'Your Custom Project';
    let steps = [];
    let technologies = [];

    // Detect project type and generate appropriate steps
    if (lowerDesc.includes('todo') || lowerDesc.includes('task')) {
      projectName = 'Task Management App';
      technologies = ['React', 'TypeScript', 'Local Storage'];
      steps = [
        {
          title: 'Set up project structure',
          description: 'Initialize React app with TypeScript',
          code: 'npm create vite@latest my-app -- --template react-ts',
          explanation: 'We start with a modern React setup using Vite for fast development'
        },
        {
          title: 'Create task data model',
          description: 'Define TypeScript interfaces for tasks',
          code: 'interface Task { id: string; text: string; completed: boolean; }',
          explanation: 'TypeScript interfaces ensure type safety throughout our app'
        },
        {
          title: 'Build task list component',
          description: 'Create component to display tasks',
          explanation: 'React components are reusable UI building blocks'
        },
        {
          title: 'Add task creation',
          description: 'Implement form to add new tasks',
          explanation: 'Forms handle user input and state management'
        },
        {
          title: 'Implement task completion',
          description: 'Add functionality to mark tasks as done',
          explanation: 'State updates trigger React re-renders'
        },
        {
          title: 'Add persistence',
          description: 'Save tasks to local storage',
          explanation: 'Local storage keeps data between sessions'
        }
      ];
    } else if (lowerDesc.includes('social') || lowerDesc.includes('chat')) {
      projectName = 'Social Media App';
      technologies = ['React', 'TypeScript', 'API Integration'];
      steps = [
        { title: 'Set up authentication', description: 'User login and registration', explanation: 'Security is crucial for user data' },
        { title: 'Create post feed', description: 'Display user posts', explanation: 'Lists render dynamic data' },
        { title: 'Add post creation', description: 'Let users create posts', explanation: 'Forms submit data to backend' },
        { title: 'Implement likes and comments', description: 'Social interactions', explanation: 'State management for user actions' },
        { title: 'Add user profiles', description: 'User profile pages', explanation: 'Routing for different pages' }
      ];
    } else if (lowerDesc.includes('ecommerce') || lowerDesc.includes('shop') || lowerDesc.includes('store')) {
      projectName = 'E-commerce Store';
      technologies = ['React', 'TypeScript', 'State Management'];
      steps = [
        { title: 'Set up product catalog', description: 'Display products', explanation: 'Data fetching and display' },
        { title: 'Create shopping cart', description: 'Add items to cart', explanation: 'State management for cart' },
        { title: 'Implement checkout', description: 'Payment flow', explanation: 'Form handling and validation' },
        { title: 'Add user accounts', description: 'Login and registration', explanation: 'Authentication and sessions' }
      ];
    } else {
      // Generic project plan
      steps = [
        {
          title: 'Plan your project',
          description: 'Break down features and requirements',
          explanation: 'Good planning makes coding easier'
        },
        {
          title: 'Set up development environment',
          description: 'Install tools and create project',
          explanation: 'Proper setup saves time later'
        },
        {
          title: 'Build core features',
          description: 'Implement main functionality',
          explanation: 'Start with MVP, then enhance'
        },
        {
          title: 'Add styling and polish',
          description: 'Make it look great',
          explanation: 'UI/UX matters for user experience'
        },
        {
          title: 'Test and refine',
          description: 'Fix bugs and improve',
          explanation: 'Iteration leads to better products'
        }
      ];
    }

    return {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `I've created a learning plan for **${projectName}**! Here's what we'll build together:\n\n**Technologies:** ${technologies.join(', ') || 'Modern web technologies'}\n\nThis will be a step-by-step journey where you'll learn by building. Each step includes explanations of why we're doing things and what you're learning.\n\nReady to start?`,
      timestamp: new Date(),
      suggestions: [
        "Let's start building!",
        "Show me the first step",
        "What will I learn?",
        "Change the plan"
      ],
      learningPoints: [
        'Step-by-step learning builds understanding',
        'Building projects teaches practical skills',
        'Each step builds on previous knowledge'
      ],
      projectPlan: {
        name: projectName,
        description: description,
        steps: steps
      }
    };
  };

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true);
    
    // Check if user wants to build something
    const lowerInput = userMessage.toLowerCase();
    const buildKeywords = ['build', 'create', 'make', 'develop', 'i want', 'i\'d like', 'help me build'];
    const wantsToBuild = buildKeywords.some(keyword => lowerInput.includes(keyword));
    
    if (wantsToBuild && (lowerInput.includes('yes') || lowerInput.includes('generate') || lowerInput.includes('plan') || !lowerInput.includes('?'))) {
      setIsTyping(false);
      return await generateProjectPlan(userMessage);
    }
    
    try {
      // Get context from current file or workspace
      const context = `Current workspace: Cocode. User level: ${userProgress.criticalThinkingScore >= 80 ? 'advanced' : userProgress.criticalThinkingScore >= 50 ? 'intermediate' : 'beginner'}`;
      
      const response = await apiService.sendChatMessage(userMessage, context, 'intermediate');
      setIsTyping(false);

      return {
        id: response.id,
        type: 'ai',
        content: response.response,
        timestamp: new Date(response.timestamp),
        suggestions: response.suggestions,
        learningPoints: response.learningPoints
      };
    } catch (error) {
      console.error('AI Chat error:', error);
      setIsTyping(false);
      
      // Fallback to local response
      const responses = generateContextualResponse(userMessage);
      return {
        id: crypto.randomUUID(),
        type: 'ai',
        content: responses.content,
        timestamp: new Date(),
        suggestions: responses.suggestions,
        codeBlock: responses.codeBlock,
        learningPoints: responses.learningPoints
      };
    }
  };

  const generateContextualResponse = (input: string) => {
    const lowerInput = input.toLowerCase();

    // Detect if user wants to build something
    const buildKeywords = ['build', 'create', 'make', 'develop', 'design', 'product', 'app', 'website', 'tool', 'application'];
    const wantsToBuild = buildKeywords.some(keyword => lowerInput.includes(keyword));
    
    if (wantsToBuild && (lowerInput.includes('i want') || lowerInput.includes('i\'d like') || lowerInput.includes('help me'))) {
      return {
        content: `Great! I'd love to help you build that! Let me create a personalized learning plan for you. 

To get started, I'll need a bit more information:
1. What specific features do you want?
2. What technologies are you interested in using?
3. What's your experience level?

Or, I can create a comprehensive step-by-step plan right now based on what you described. Would you like me to generate a full project plan with detailed steps?`,
        suggestions: [
          "Yes, create a full project plan",
          "Tell me what technologies to use",
          "What features should I include?",
          "Start with a simple version"
        ],
        learningPoints: [
          "Planning is crucial before coding",
          "Breaking projects into steps makes learning easier",
          "Start simple, then add features incrementally"
        ]
      };
    }

    // React/Component responses
    if (lowerInput.includes('react') || lowerInput.includes('component')) {
      return {
        content: "Great choice! Let's build a React component together. I'll guide you through the process while explaining the concepts.",
        suggestions: [
          "Create a functional component",
          "Add TypeScript interfaces",
          "Implement state management",
          "Add event handlers"
        ],
        codeBlock: `// Example: Building a Button component
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`px-4 py-2 rounded-lg transition-colors \${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      } \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
    >
      {children}
    </button>
  );
};`,
        learningPoints: [
          "TypeScript interfaces define component props",
          "React.FC is a type for functional components",
          "Destructuring with default values",
          "Conditional styling with template literals"
        ]
      };
    }

    // TypeScript responses
    if (lowerInput.includes('typescript') || lowerInput.includes('type')) {
      return {
        content: "TypeScript is excellent for building maintainable applications! Let me show you some key concepts.",
        suggestions: [
          "Define interfaces",
          "Create type unions",
          "Use generics",
          "Implement type guards"
        ],
        codeBlock: `// TypeScript interfaces and types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

// Generic function with constraints
function processData<T extends { id: string }>(items: T[]): T[] {
  return items.filter(item => item.id !== '');
}`,
        learningPoints: [
          "Interfaces define object shapes",
          "Union types allow multiple values",
          "Generics make code reusable",
          "Type constraints ensure type safety"
        ]
      };
    }

    // Project structure responses
    if (lowerInput.includes('project') || lowerInput.includes('structure')) {
      return {
        content: "Let's plan your project structure! A well-organized codebase is crucial for maintainability.",
        suggestions: [
          "Set up folder structure",
          "Configure build tools",
          "Add linting and formatting",
          "Set up testing"
        ],
        codeBlock: `// Recommended project structure
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── context/            # React context providers
├── services/           # API and external services
└── styles/             # Global styles and themes`,
        learningPoints: [
          "Separation of concerns",
          "Reusable component architecture",
          "Custom hooks for logic sharing",
          "Type definitions organization"
        ]
      };
    }

    // Default response
    return {
      content: "I'd love to help you with that! Could you tell me more about what you're trying to build or learn?",
      suggestions: [
        "Explain the problem you're solving",
        "What technologies are you using?",
        "What's your experience level?",
        "Show me some existing code"
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Generate AI response
    const aiResponse = await generateAIResponse(inputValue);
    setMessages(prev => [...prev, aiResponse]);

    // Add learning suggestion
    if (aiResponse.learningPoints) {
      addAISuggestion({
        type: 'explanation',
        content: `Key learning points: ${aiResponse.learningPoints.join(', ')}`,
        priority: 'medium',
        requiresUserAction: true,
        dismissed: false
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const getMessageIcon = (type: 'user' | 'ai') => {
    return type === 'user' ? (
      <User className="w-5 h-5 text-blue-500" />
    ) : (
      <Bot className="w-5 h-5 text-primary-500" />
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMouseDown = (e: React.MouseEvent, direction: 'width' | 'height' | 'both') => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeDirection || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      if (resizeDirection === 'width' || resizeDirection === 'both') {
        const newWidth = e.clientX - rect.left;
        const minWidth = 320;
        const maxWidth = window.innerWidth - rect.left - 16; // 16px for padding
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
        }
      }

      if (resizeDirection === 'height' || resizeDirection === 'both') {
        const newHeight = e.clientY - rect.top;
        const minHeight = 200;
        const maxHeight = window.innerHeight - rect.top - 16; // 16px for padding
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = resizeDirection === 'both' ? 'nwse-resize' : 
                                   resizeDirection === 'width' ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resizeDirection]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors hover:shadow-xl"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="font-medium text-sm">AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed bottom-4 left-4 z-50 ai-chat-container ${
        isMinimized ? 'w-80 h-16' : ''
      } ${isResizing ? 'select-none' : 'transition-all duration-300'}`}
      style={!isMinimized ? { width: `${width}px`, height: `${height}px` } : {}}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              AI Assistant
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-100 dark:bg-blue-900/20' 
                      : 'bg-primary-100 dark:bg-primary-900/20'
                  }`}>
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {message.codeBlock && (
                        <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                          <pre>{message.codeBlock}</pre>
                        </div>
                      )}
                      
                      {message.projectPlan && (
                        <div className="mt-3 bg-primary-50 dark:bg-primary-950/20 rounded-lg p-3 border border-primary-200 dark:border-primary-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs font-semibold text-primary-900 dark:text-primary-100">
                              Project Plan: {message.projectPlan.name}
                            </span>
                          </div>
                          <p className="text-xs text-primary-800 dark:text-primary-200 mb-3">
                            {message.projectPlan.description}
                          </p>
                          <div className="space-y-2">
                            {message.projectPlan.steps.slice(0, 3).map((step, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-medium text-primary-900 dark:text-primary-100">
                                    {step.title}
                                  </div>
                                  <div className="text-xs text-primary-700 dark:text-primary-300">
                                    {step.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {message.projectPlan.steps.length > 3 && (
                              <div className="text-xs text-primary-600 dark:text-primary-400 italic">
                                + {message.projectPlan.steps.length - 3} more steps...
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              // Convert project plan to AIProjectBuilder format
                              const projectTemplate = {
                                id: `custom-${crypto.randomUUID()}`,
                                name: message.projectPlan.name,
                                description: message.projectPlan.description,
                                category: 'react' as const,
                                difficulty: 'intermediate' as const,
                                estimatedTime: 'Varies',
                                icon: '🚀',
                                color: 'from-primary-500 to-primary-700',
                                featured: false,
                                learningGoals: message.learningPoints || [],
                                steps: message.projectPlan.steps.map((step, index) => ({
                                  id: `step-${index + 1}`,
                                  title: step.title,
                                  description: step.description,
                                  type: (index === 0 ? 'setup' : 
                                         step.title.toLowerCase().includes('component') ? 'component' :
                                         step.title.toLowerCase().includes('style') ? 'styling' :
                                         step.title.toLowerCase().includes('test') ? 'testing' :
                                         'logic') as 'setup' | 'component' | 'logic' | 'styling' | 'testing' | 'optimization',
                                  code: step.code || '',
                                  explanation: step.explanation,
                                  learningPoints: [step.explanation],
                                  difficulty: 'intermediate' as const,
                                  completed: false
                                }))
                              };

                              // Set the custom project and open project builder
                              setCustomProject(projectTemplate);
                              
                              // Show notification
                              addAISuggestion({
                                type: 'explanation',
                                content: `Starting "${message.projectPlan.name}"! I'll guide you through ${message.projectPlan.steps.length} steps. Check the Projects panel!`,
                                priority: 'high',
                                requiresUserAction: false,
                                dismissed: false
                              });
                            }}
                            className="mt-3 w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Start Building This Project</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      {message.learningPoints && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center space-x-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                            <Brain className="w-3 h-3" />
                            <span>Learning Points:</span>
                          </div>
                          <ul className="space-y-1">
                            {message.learningPoints.map((point, index) => (
                              <li key={index} className="text-xs flex items-start space-x-1">
                                <Target className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages[messages.length - 1]?.suggestions && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Quick suggestions:
                </div>
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask me anything about coding..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Resize Handles */}
        {!isMinimized && (
          <>
            {/* Bottom-right corner resize */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'both')}
              className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize hover:bg-primary-300 dark:hover:bg-primary-700 rounded-tl-lg transition-colors group"
              title="Drag to resize"
            >
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 opacity-50 group-hover:opacity-100">
                <div className="w-full h-px bg-gray-600 dark:bg-gray-300 mb-0.5"></div>
                <div className="w-full h-px bg-gray-600 dark:bg-gray-300 mb-0.5"></div>
                <div className="w-full h-px bg-gray-600 dark:bg-gray-300"></div>
              </div>
            </div>
            
            {/* Right edge resize */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'width')}
              className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors"
              title="Drag to resize width"
            />
            
            {/* Bottom edge resize */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'height')}
              className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors"
              title="Drag to resize height"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;
