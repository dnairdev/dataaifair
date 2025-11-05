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

// Generate line-by-line code explanation
export const explainCode = async (fileContent: string, language: string, fileName: string): Promise<{ overview: string; lineByLine: Array<{ lineNumber: number; code: string; explanation: string }> }> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lines = fileContent.split('\n');
  const lineCount = lines.length;
  const wordCount = fileContent.split(/\s+/).length;
  
  const overview = `This file contains ${lineCount} lines of ${language} code (approximately ${wordCount} words).`;
  
  const lineByLine: Array<{ lineNumber: number; code: string; explanation: string }> = [];

  // Analyze each line
  let inMultiLineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const lineNumber = i + 1;
    let explanation = '';

    // Skip empty lines
    if (trimmedLine === '') {
      lineByLine.push({
        lineNumber,
        code: line,
        explanation: 'Empty line (whitespace for readability)'
      });
      continue;
    }

    // Handle multi-line comments
    if (trimmedLine.includes('/*')) {
      inMultiLineComment = true;
      explanation = 'Start of multi-line comment';
      if (trimmedLine.includes('*/')) {
        inMultiLineComment = false;
        explanation = 'Single-line comment block';
      }
    } else if (trimmedLine.includes('*/')) {
      inMultiLineComment = false;
      explanation = 'End of multi-line comment';
    } else if (inMultiLineComment) {
      explanation = 'Comment continuation';
    }

    // Handle single-line comments
    if (!inMultiLineComment && trimmedLine.startsWith('//')) {
      explanation = 'Single-line comment: ' + trimmedLine.substring(2).trim();
    }

    // Handle imports
    if (!explanation && (trimmedLine.startsWith('import ') || trimmedLine.startsWith('import{'))) {
      const importMatch = trimmedLine.match(/import\s+(?:(?:\{([^}]+)\})|(\w+)|(\*))\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        if (importMatch[1]) {
          explanation = `Import named exports: ${importMatch[1]} from ${importMatch[4]}`;
        } else if (importMatch[2]) {
          explanation = `Import default export: ${importMatch[2]} from ${importMatch[4]}`;
        } else if (importMatch[3]) {
          explanation = `Import all exports from ${importMatch[4]}`;
        }
      } else if (trimmedLine.includes('require(')) {
        const requireMatch = trimmedLine.match(/require\(['"]([^'"]+)['"]\)/);
        if (requireMatch) {
          explanation = `CommonJS require: loads module ${requireMatch[1]}`;
        }
      } else {
        explanation = 'Import statement';
      }
    }

    // Handle exports
    if (!explanation && trimmedLine.startsWith('export ')) {
      if (trimmedLine.includes('export default')) {
        const defaultMatch = trimmedLine.match(/export\s+default\s+(?:function|const|class)?\s*(\w+)?/);
        explanation = `Export default${defaultMatch && defaultMatch[1] ? `: ${defaultMatch[1]}` : ' export'}`;
      } else if (trimmedLine.includes('export const') || trimmedLine.includes('export function')) {
        const namedMatch = trimmedLine.match(/export\s+(?:const|function)\s+(\w+)/);
        explanation = `Named export: ${namedMatch && namedMatch[1] ? namedMatch[1] : 'function/constant'}`;
      } else {
        explanation = 'Export statement';
      }
    }

    // Handle React/TypeScript interfaces
    if (!explanation && trimmedLine.startsWith('interface ')) {
      const interfaceMatch = trimmedLine.match(/interface\s+(\w+)/);
      explanation = `TypeScript interface definition: ${interfaceMatch && interfaceMatch[1] ? interfaceMatch[1] : 'type'}`;
    }

    if (!explanation && trimmedLine.startsWith('type ') && trimmedLine.includes('=')) {
      const typeMatch = trimmedLine.match(/type\s+(\w+)/);
      explanation = `TypeScript type alias: ${typeMatch && typeMatch[1] ? typeMatch[1] : 'custom type'}`;
    }

    // Handle function declarations
    if (!explanation) {
      const functionMatch = trimmedLine.match(/(?:const|let|var|function|export\s+(?:default\s+)?(?:const|function)?)\s+(\w+)\s*(?:=|:)?\s*(?:\(|=>)/);
      if (functionMatch) {
        const fnName = functionMatch[1];
        if (trimmedLine.includes('=>')) {
          explanation = `Arrow function declaration: ${fnName}`;
        } else if (trimmedLine.includes('function')) {
          explanation = `Function declaration: ${fnName}`;
        } else {
          explanation = `Function/variable declaration: ${fnName}`;
        }
      }
    }

    // Handle React hooks
    if (!explanation) {
      if (trimmedLine.includes('useState')) {
        const stateMatch = trimmedLine.match(/useState\s*\([^)]*\)/);
        const initValue = trimmedLine.match(/useState\s*\(([^)]+)\)/)?.[1]?.trim();
        explanation = `React useState hook: manages component state${initValue ? `, initialized with ${initValue}` : ''}`;
      } else if (trimmedLine.includes('useEffect')) {
        const depsMatch = trimmedLine.match(/\[([^\]]*)\]/);
        explanation = `React useEffect hook: handles side effects${depsMatch ? `, dependencies: ${depsMatch[1] || 'none'}` : ''}`;
      } else if (trimmedLine.includes('useCallback')) {
        explanation = 'React useCallback hook: memoizes a callback function';
      } else if (trimmedLine.includes('useMemo')) {
        explanation = 'React useMemo hook: memoizes a computed value';
      } else if (trimmedLine.includes('useRef')) {
        explanation = 'React useRef hook: creates a mutable reference';
      }
    }

    // Handle return statements
    if (!explanation && trimmedLine.startsWith('return ')) {
      if (trimmedLine.includes('(') && trimmedLine.includes('<')) {
        explanation = 'Return JSX/React element';
      } else if (trimmedLine.includes('return')) {
        explanation = 'Return statement: exits function and returns value';
      }
    }

    // Handle conditional statements
    if (!explanation) {
      if (trimmedLine.startsWith('if (')) {
        const conditionMatch = trimmedLine.match(/if\s*\(([^)]+)\)/);
        explanation = `If statement: conditional execution${conditionMatch ? `, condition: ${conditionMatch[1].trim()}` : ''}`;
      } else if (trimmedLine.startsWith('else if')) {
        explanation = 'Else-if statement: alternative condition';
      } else if (trimmedLine.startsWith('else')) {
        explanation = 'Else statement: default case';
      } else if (trimmedLine.includes('?') && trimmedLine.includes(':')) {
        explanation = 'Ternary operator: inline conditional expression';
      }
    }

    // Handle loops
    if (!explanation) {
      if (trimmedLine.startsWith('for (')) {
        explanation = 'For loop: iterative execution';
      } else if (trimmedLine.startsWith('while (')) {
        explanation = 'While loop: conditional iteration';
      } else if (trimmedLine.includes('.map(')) {
        explanation = 'Array.map(): transforms each element to create new array';
      } else if (trimmedLine.includes('.forEach(')) {
        explanation = 'Array.forEach(): iterates over array elements';
      } else if (trimmedLine.includes('.filter(')) {
        explanation = 'Array.filter(): creates new array with filtered elements';
      }
    }

    // Handle try-catch
    if (!explanation) {
      if (trimmedLine.startsWith('try {')) {
        explanation = 'Try block: code that may throw errors';
      } else if (trimmedLine.startsWith('catch')) {
        explanation = 'Catch block: handles errors from try block';
      }
    }

    // Handle async/await
    if (!explanation) {
      if (trimmedLine.includes('async ')) {
        explanation = 'Async function declaration: returns a Promise';
      } else if (trimmedLine.includes('await ')) {
        const awaitMatch = trimmedLine.match(/await\s+(\w+)/);
        explanation = `Await expression: pauses execution until Promise resolves${awaitMatch ? `, waiting for ${awaitMatch[1]}` : ''}`;
      }
    }

    // Handle variable declarations
    if (!explanation) {
      if (trimmedLine.startsWith('const ')) {
        const constMatch = trimmedLine.match(/const\s+(\w+)/);
        explanation = `Constant declaration: ${constMatch && constMatch[1] ? constMatch[1] : 'variable'}`;
      } else if (trimmedLine.startsWith('let ')) {
        const letMatch = trimmedLine.match(/let\s+(\w+)/);
        explanation = `Variable declaration: ${letMatch && letMatch[1] ? letMatch[1] : 'variable'}`;
      } else if (trimmedLine.startsWith('var ')) {
        const varMatch = trimmedLine.match(/var\s+(\w+)/);
        explanation = `Variable declaration (var): ${varMatch && varMatch[1] ? varMatch[1] : 'variable'}`;
      }
    }

    // Handle JSX/HTML-like tags
    if (!explanation && trimmedLine.includes('<') && trimmedLine.includes('>')) {
      const tagMatch = trimmedLine.match(/<(\w+)/);
      if (tagMatch) {
        explanation = `JSX element: ${tagMatch[1]} tag`;
      } else {
        explanation = 'JSX/HTML-like syntax';
      }
    }

    // Handle class declarations
    if (!explanation && trimmedLine.startsWith('class ')) {
      const classMatch = trimmedLine.match(/class\s+(\w+)/);
      explanation = `Class declaration: ${classMatch && classMatch[1] ? classMatch[1] : 'class'}`;
    }

    // Default explanation for unhandled lines
    if (!explanation) {
      if (trimmedLine.includes('=')) {
        explanation = 'Assignment or expression';
      } else if (trimmedLine.endsWith(';')) {
        explanation = 'Statement execution';
      } else if (trimmedLine.endsWith('{')) {
        explanation = 'Opening block or object literal';
      } else if (trimmedLine.endsWith('}')) {
        explanation = 'Closing block or object literal';
      } else {
        explanation = 'Code line';
      }
    }

    lineByLine.push({
      lineNumber,
      code: line,
      explanation
    });
  }

  return { overview, lineByLine };
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
