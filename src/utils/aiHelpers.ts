import { AISuggestion, CodebaseInsight } from '../types';

// Generate learning prompts based on current context
export const generateLearningPrompts = async (): Promise<AISuggestion[]> => {
  // Simulate AI-generated learning prompts
  const prompts: AISuggestion[] = [
    {
      type: 'question',
      content: 'What patterns do you notice in this codebase? How might you refactor for better maintainability?',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'medium',
      requiresUserAction: true,
      dismissed: false
    },
    {
      type: 'hint',
      content: 'Consider the single responsibility principle. Are there any functions doing too many things?',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'low',
      requiresUserAction: false,
      dismissed: false
    },
    {
      type: 'challenge',
      content: 'Can you identify potential performance bottlenecks in this code? How would you optimize them?',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'high',
      requiresUserAction: true,
      dismissed: false
    },
    {
      type: 'explanation',
      content: 'This code uses dependency injection. Understanding this pattern helps you write more testable and modular code.',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'medium',
      requiresUserAction: false,
      dismissed: false
    }
  ];

  return prompts;
};

// Analyze codebase for insights and learning opportunities
export const analyzeCodebase = async (): Promise<CodebaseInsight[]> => {
  const insights: CodebaseInsight[] = [
    {
      type: 'pattern',
      title: 'React Hooks Pattern Detected',
      description: 'This codebase uses React hooks extensively. Consider learning about custom hooks and their best practices.',
      files: ['src/components/App.tsx', 'src/components/CodeEditor.tsx'],
      severity: 'info',
      acknowledged: false
    },
    {
      type: 'architecture',
      title: 'State Management with Zustand',
      description: 'The app uses Zustand for state management. Understanding this pattern helps with scalable React applications.',
      files: ['src/store/useStore.ts'],
      severity: 'info',
      acknowledged: false
    },
    {
      type: 'performance',
      title: 'Potential Performance Optimization',
      description: 'Consider using React.memo for components that receive the same props frequently.',
      files: ['src/components/CodeEditor.tsx'],
      severity: 'warning',
      acknowledged: false
    },
    {
      type: 'security',
      title: 'Input Sanitization Needed',
      description: 'User inputs should be sanitized before processing to prevent XSS attacks.',
      files: ['src/components/CodeExplorationModal.tsx'],
      severity: 'error',
      acknowledged: false
    }
  ];

  return insights;
};

// Generate contextual learning suggestions based on current file
export const generateContextualSuggestions = (fileContent: string, language: string): AISuggestion[] => {
  const suggestions: AISuggestion[] = [];

  // Analyze file content for learning opportunities
  if (fileContent.includes('useState') || fileContent.includes('useEffect')) {
    suggestions.push({
      type: 'question',
      content: 'How do these React hooks work together? What are the dependencies and when do they re-run?',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'medium',
      requiresUserAction: true,
      dismissed: false
    });
  }

  if (fileContent.includes('async') || fileContent.includes('await')) {
    suggestions.push({
      type: 'explanation',
      content: 'This code uses async/await. Understanding asynchronous programming is crucial for modern JavaScript development.',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'low',
      requiresUserAction: false,
      dismissed: false
    });
  }

  if (fileContent.includes('try') && fileContent.includes('catch')) {
    suggestions.push({
      type: 'hint',
      content: 'Good error handling! Consider what specific errors you might want to catch and how to handle them gracefully.',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'low',
      requiresUserAction: false,
      dismissed: false
    });
  }

  if (fileContent.split('\n').length > 100) {
    suggestions.push({
      type: 'challenge',
      content: 'This file is getting quite long. How might you break it down into smaller, more focused components?',
      fileId: undefined,
      lineNumber: undefined,
      priority: 'high',
      requiresUserAction: true,
      dismissed: false
    });
  }

  return suggestions;
};

// Generate code exploration questions
export const generateExplorationQuestions = (fileContent: string, language: string) => {
  const questions = [
    'What is the main purpose of this code?',
    'What are the key functions or methods defined here?',
    'What external dependencies does this code have?',
    'Are there any potential issues or improvements you can identify?',
    'How would you test this code?'
  ];

  // Add language-specific questions
  if (language === 'typescript') {
    questions.push('What TypeScript features are being used here?');
    questions.push('Are there any type safety improvements you could make?');
  }

  if (language === 'javascript' || language === 'typescript') {
    questions.push('What design patterns are implemented in this code?');
    questions.push('How does this code handle side effects?');
  }

  return questions;
};

// Calculate learning progress based on user interactions
export const calculateLearningProgress = (
  filesExplored: number,
  sessionsCompleted: number,
  averageScore: number,
  timeSpent: number
) => {
  // Critical thinking score based on engagement and quality of responses
  const criticalThinkingScore = Math.min(100, 
    (sessionsCompleted * 10) + 
    (averageScore * 0.3) + 
    (filesExplored * 2)
  );

  // Codebase familiarity based on exploration and understanding
  const codebaseFamiliarityScore = Math.min(100,
    (filesExplored * 5) + 
    (sessionsCompleted * 8) + 
    (timeSpent / 60) // Convert minutes to score
  );

  return {
    criticalThinkingScore: Math.round(criticalThinkingScore),
    codebaseFamiliarityScore: Math.round(codebaseFamiliarityScore)
  };
};

// Generate achievement based on user progress
export const generateAchievements = (userProgress: any) => {
  const achievements = [];

  if (userProgress.totalFilesExplored >= 5) {
    achievements.push({
      id: 'explorer-5',
      title: 'Code Explorer',
      description: 'Explored 5+ files in the codebase',
      icon: '🔍',
      category: 'exploration' as const
    });
  }

  if (userProgress.totalLearningSessions >= 3) {
    achievements.push({
      id: 'learner-3',
      title: 'Dedicated Learner',
      description: 'Completed 3+ learning sessions',
      icon: '📚',
      category: 'learning' as const
    });
  }

  if (userProgress.criticalThinkingScore >= 80) {
    achievements.push({
      id: 'thinker-80',
      title: 'Critical Thinker',
      description: 'Achieved 80+ critical thinking score',
      icon: '🧠',
      category: 'problem-solving' as const
    });
  }

  if (userProgress.streak >= 7) {
    achievements.push({
      id: 'streak-7',
      title: 'Learning Streak',
      description: 'Maintained 7+ day learning streak',
      icon: '🔥',
      category: 'collaboration' as const
    });
  }

  return achievements;
};
