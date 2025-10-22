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
  settings: WorkspaceSettings;
  notifications: Notification[];
  
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
      settings: initialSettings,
      notifications: [],

      // File actions
      setActiveFile: (fileId: string) => {
        set({ activeFileId: fileId });
        // Update file as explored
        const { userProgress } = get();
        set({
          userProgress: {
            ...userProgress,
            totalFilesExplored: userProgress.totalFilesExplored + 1
          }
        });
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
        set(state => ({
          files: [...state.files, newFile],
          activeFileId: newFile.id
        }));
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
          
          return {
            learningSessions: updatedSessions,
            currentSession: null,
            userProgress: {
              ...userProgress,
              totalLearningSessions: userProgress.totalLearningSessions + 1,
              averageSessionScore: userProgress.totalLearningSessions > 0
                ? (userProgress.averageSessionScore * userProgress.totalLearningSessions + score) / (userProgress.totalLearningSessions + 1)
                : score
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
        set(state => ({
          activeExploration: null,
          explorations: state.explorations.map(exploration =>
            exploration.id === explorationId
              ? { ...exploration, completed: true, insights }
              : exploration
          )
        }));
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
        settings: state.settings
      })
    }
  )
);
