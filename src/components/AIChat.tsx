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
  Maximize2
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
}

const AIChat: React.FC = () => {
  const { addAISuggestion, userProgress } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI coding assistant. I can help you build projects while teaching you about the codebase. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Build a React component",
        "Create a full-stack application",
        "Learn about TypeScript",
        "Debug an issue"
      ]
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

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true);
    
    try {
      // Get context from current file or workspace
      const context = `Current workspace: DataAIFair IDE. User level: ${userProgress.criticalThinkingScore >= 80 ? 'advanced' : userProgress.criticalThinkingScore >= 50 ? 'intermediate' : 'beginner'}`;
      
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
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
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
      </div>
    </div>
  );
};

export default AIChat;
