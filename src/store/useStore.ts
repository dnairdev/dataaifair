import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CodeFile, 
  LearningSession, 
  CodebaseInsight, 
  UserProgress, 
  AIAssistant, 
  AISuggestion,
  CodeExploration,
  WorkspaceSettings,
  Notification
} from '../types';

interface AppState {
  // Files and workspace
  files: CodeFile[];
  activeFileId: string | null;
  workspacePath: string | null;
  
  // Learning and progress
  learningSessions: LearningSession[];
  currentSession: LearningSession | null;
  userProgress: UserProgress;
  codebaseInsights: CodebaseInsight[];
  
  // AI Assistant
  aiAssistant: AIAssistant;
  suggestions: AISuggestion[];
  activeProject: any | null;
  codeGenerationHistory: any[];
  
  // Code exploration
  activeExploration: CodeExploration | null;
  explorations: CodeExploration[];
  
  // UI State
  sidebarOpen: boolean;
  learningPanelOpen: boolean;
  projectBuilderOpen: boolean;
  settings: WorkspaceSettings;
  notifications: Notification[];
  
  // User onboarding
  userUseCase: string | null;
  hasCompletedOnboarding: boolean;
  
  // Notebook state
  notebookVariables: VariableSnapshot[];
  
  // Actions
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  createFile: (file: Omit<CodeFile, 'id' | 'lastModified'>) => void;
  deleteFile: (fileId: string) => void;
  
  startLearningSession: (session: Omit<LearningSession, 'id' | 'createdAt'>) => void;
  completeLearningSession: (sessionId: string, score: number) => void;
  
  addCodebaseInsight: (insight: Omit<CodebaseInsight, 'id' | 'discoveredAt'>) => void;
  acknowledgeInsight: (insightId: string) => void;
  
  addAISuggestion: (suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => void;
  dismissSuggestion: (suggestionId: string) => void;
  
  startCodeExploration: (fileId: string, startLine: number, endLine: number) => void;
  completeCodeExploration: (explorationId: string, insights: string[]) => void;
  
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  
  toggleSidebar: () => void;
  toggleLearningPanel: () => void;
  toggleProjectBuilder: () => void;
  setCustomProject: (project: any) => void;
  setUserUseCase: (useCase: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setNotebookVariables: (variables: VariableSnapshot[]) => void;
}

const initialUserProgress: UserProgress = {
  totalFilesExplored: 0,
  totalLearningSessions: 0,
  averageSessionScore: 0,
  codebaseFamiliarityScore: 0,
  criticalThinkingScore: 0,
  lastActiveDate: new Date(),
  streak: 0,
  achievements: []
};

const initialSettings: WorkspaceSettings = {
  aiAssistanceLevel: 'moderate',
  learningMode: true,
  explorationPrompts: true,
  codeReviewRequired: true,
  autoSave: true,
  theme: 'auto',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      activeFileId: null,
      workspacePath: null,
      learningSessions: [],
      currentSession: null,
      userProgress: initialUserProgress,
      codebaseInsights: [],
      aiAssistant: {
        mode: 'guided',
        suggestions: [],
        isActive: true,
        lastInteraction: new Date()
      },
      suggestions: [],
      activeProject: null,
      codeGenerationHistory: [],
      activeExploration: null,
      explorations: [],
      sidebarOpen: true,
      learningPanelOpen: false,
      projectBuilderOpen: false,
      settings: initialSettings,
      notifications: [],
      userUseCase: null,
      hasCompletedOnboarding: false,
      notebookVariables: [],

      // File actions
      setActiveFile: (fileId: string) => {
        const state = get();
        // Only update if it's a different file
        if (state.activeFileId === fileId) return;
        
        set({ activeFileId: fileId });
        
        // Update file as explored and increase codebase familiarity
        const { userProgress, files } = get();
        const file = files.find(f => f.id === fileId);
        
        // Only increment if this is a new file exploration
        if (file) {
          const newTotalFiles = userProgress.totalFilesExplored + 1;
          // Increase codebase familiarity when exploring files (small increment)
          const familiarityIncrease = 1;
          const newFamiliarity = Math.min(100, userProgress.codebaseFamiliarityScore + familiarityIncrease);
          
          set({
            userProgress: {
              ...userProgress,
              totalFilesExplored: newTotalFiles,
              codebaseFamiliarityScore: newFamiliarity
            }
          });
        }
      },

      updateFileContent: (fileId: string, content: string) => {
        set(state => ({
          files: state.files.map(file =>
            file.id === fileId
              ? { ...file, content, lastModified: new Date(), isDirty: true }
              : file
          )
        }));
      },

      createFile: (file) => {
        const newFile: CodeFile = {
          ...file,
          id: crypto.randomUUID(),
          lastModified: new Date()
        };
        set(state => {
          const { userProgress } = state;
          // Small progress increase for creating files
          const newFamiliarity = Math.min(100, userProgress.codebaseFamiliarityScore + 1);
          
          return {
            files: [...state.files, newFile],
            activeFileId: newFile.id,
            userProgress: {
              ...userProgress,
              codebaseFamiliarityScore: newFamiliarity
            }
          };
        });
      },

      deleteFile: (fileId: string) => {
        set(state => ({
          files: state.files.filter(file => file.id !== fileId),
          activeFileId: state.activeFileId === fileId ? null : state.activeFileId
        }));
      },

      // Learning session actions
      startLearningSession: (session) => {
        const newSession: LearningSession = {
          ...session,
          id: crypto.randomUUID(),
          createdAt: new Date()
        };
        set(state => ({
          learningSessions: [...state.learningSessions, newSession],
          currentSession: newSession
        }));
      },

      completeLearningSession: (sessionId: string, score: number) => {
        set(state => {
          const updatedSessions = state.learningSessions.map(session =>
            session.id === sessionId
              ? { ...session, completed: true, score, completedAt: new Date() }
              : session
          );
          
          const completedSession = updatedSessions.find(s => s.id === sessionId);
          const { userProgress } = state;
          
          const newTotalSessions = userProgress.totalLearningSessions + 1;
          const newAverageScore = userProgress.totalLearningSessions > 0
            ? (userProgress.averageSessionScore * userProgress.totalLearningSessions + score) / newTotalSessions
            : score;
          
          // Update critical thinking score (based on session completion and score)
          const criticalThinkingIncrease = Math.min(5, Math.floor(score / 20));
          const newCriticalThinking = Math.min(100, userProgress.criticalThinkingScore + criticalThinkingIncrease);
          
          // Update codebase familiarity (based on learning sessions)
          const familiarityIncrease = Math.min(3, Math.floor(score / 30));
          const newFamiliarity = Math.min(100, userProgress.codebaseFamiliarityScore + familiarityIncrease);
          
          // Update streak (check if last active was yesterday or today)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const lastActive = new Date(userProgress.lastActiveDate);
          lastActive.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          
          let newStreak = userProgress.streak;
          if (daysDiff === 0) {
            // Same day, keep streak
          } else if (daysDiff === 1) {
            // Consecutive day, increment streak
            newStreak = userProgress.streak + 1;
          } else {
            // Streak broken, reset to 1
            newStreak = 1;
          }
          
          return {
            learningSessions: updatedSessions,
            currentSession: null,
            userProgress: {
              ...userProgress,
              totalLearningSessions: newTotalSessions,
              averageSessionScore: newAverageScore,
              criticalThinkingScore: newCriticalThinking,
              codebaseFamiliarityScore: newFamiliarity,
              streak: newStreak,
              lastActiveDate: new Date()
            }
          };
        });
      },

      // Codebase insights
      addCodebaseInsight: (insight) => {
        const newInsight: CodebaseInsight = {
          ...insight,
          id: crypto.randomUUID(),
          discoveredAt: new Date()
        };
        set(state => ({
          codebaseInsights: [...state.codebaseInsights, newInsight]
        }));
      },

      acknowledgeInsight: (insightId: string) => {
        set(state => ({
          codebaseInsights: state.codebaseInsights.map(insight =>
            insight.id === insightId
              ? { ...insight, acknowledged: true }
              : insight
          )
        }));
      },

      // AI suggestions
      addAISuggestion: (suggestion) => {
        const newSuggestion: AISuggestion = {
          ...suggestion,
          id: crypto.randomUUID(),
          createdAt: new Date()
        };
        set(state => ({
          suggestions: [...state.suggestions, newSuggestion]
        }));
      },

      dismissSuggestion: (suggestionId: string) => {
        set(state => ({
          suggestions: state.suggestions.filter(s => s.id !== suggestionId)
        }));
      },

      // Code exploration
      startCodeExploration: (fileId: string, startLine: number, endLine: number) => {
        const newExploration: CodeExploration = {
          id: crypto.randomUUID(),
          fileId,
          startLine,
          endLine,
          focus: 'general',
          questions: [],
          completed: false,
          insights: []
        };
        set(state => ({
          activeExploration: newExploration,
          explorations: [...state.explorations, newExploration]
        }));
      },

      completeCodeExploration: (explorationId: string, insights: string[]) => {
        set(state => {
          const { userProgress } = state;
          
          // Increase critical thinking and codebase familiarity when completing exploration
          const criticalThinkingIncrease = Math.min(3, insights.length);
          const familiarityIncrease = Math.min(2, 1);
          
          return {
            activeExploration: null,
            explorations: state.explorations.map(exploration =>
              exploration.id === explorationId
                ? { ...exploration, completed: true, insights }
                : exploration
            ),
            userProgress: {
              ...userProgress,
              criticalThinkingScore: Math.min(100, userProgress.criticalThinkingScore + criticalThinkingIncrease),
              codebaseFamiliarityScore: Math.min(100, userProgress.codebaseFamiliarityScore + familiarityIncrease)
            }
          };
        });
      },

      // Settings and UI
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date()
        };
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },

      markNotificationRead: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        }));
      },

      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleLearningPanel: () => {
        set(state => ({ learningPanelOpen: !state.learningPanelOpen }));
      },

      toggleProjectBuilder: () => {
        set(state => ({ projectBuilderOpen: !state.projectBuilderOpen }));
      },

      setCustomProject: (project) => {
        set(state => ({ 
          activeProject: project,
          projectBuilderOpen: true 
        }));
      },

      setUserUseCase: (useCase: string) => {
        set({ userUseCase: useCase });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false, userUseCase: null });
      },

      setNotebookVariables: (variables) => {
        set({ notebookVariables: variables });
      }
    }),
    {
      name: 'dataaifair-ide-storage',
      partialize: (state) => ({
        files: state.files,
        learningSessions: state.learningSessions,
        userProgress: state.userProgress,
        codebaseInsights: state.codebaseInsights,
        explorations: state.explorations,
        settings: state.settings,
        userUseCase: state.userUseCase,
        hasCompletedOnboarding: state.hasCompletedOnboarding
      })
    }
  )
);
