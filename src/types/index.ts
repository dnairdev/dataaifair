export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
  lastModified: Date;
  isOpen: boolean;
  isDirty: boolean;
}

export interface LearningSession {
  id: string;
  type: 'exploration' | 'guided' | 'quiz' | 'debugging';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  score?: number;
  timeSpent: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CodebaseInsight {
  id: string;
  type: 'pattern' | 'dependency' | 'architecture' | 'performance' | 'security';
  title: string;
  description: string;
  files: string[];
  severity: 'info' | 'warning' | 'error';
  discoveredAt: Date;
  acknowledged: boolean;
}

export interface UserProgress {
  totalFilesExplored: number;
  totalLearningSessions: number;
  averageSessionScore: number;
  codebaseFamiliarityScore: number;
  criticalThinkingScore: number;
  lastActiveDate: Date;
  streak: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'exploration' | 'learning' | 'problem-solving' | 'collaboration';
}

export interface AIAssistant {
  mode: 'guided' | 'collaborative' | 'minimal';
  suggestions: AISuggestion[];
  isActive: boolean;
  lastInteraction: Date;
}

export interface AISuggestion {
  id: string;
  type: 'hint' | 'question' | 'explanation' | 'challenge';
  content: string;
  fileId?: string;
  lineNumber?: number;
  priority: 'low' | 'medium' | 'high';
  requiresUserAction: boolean;
  createdAt: Date;
  dismissed: boolean;
}

export interface CodeExploration {
  id: string;
  fileId: string;
  startLine: number;
  endLine: number;
  focus: string;
  questions: ExplorationQuestion[];
  completed: boolean;
  insights: string[];
}

export interface ExplorationQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'open-ended' | 'code-trace';
  options?: string[];
  correctAnswer?: string;
  userAnswer?: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WorkspaceSettings {
  aiAssistanceLevel: 'minimal' | 'moderate' | 'full';
  learningMode: boolean;
  explorationPrompts: boolean;
  codeReviewRequired: boolean;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
}

export interface Notification {
  id: string;
  type: 'learning' | 'achievement' | 'insight' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
