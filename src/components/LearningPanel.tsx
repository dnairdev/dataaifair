import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  Trophy, 
  Clock, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Zap,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { LearningSession } from '../types';

const LearningPanel: React.FC = () => {
  const { 
    learningPanelOpen, 
    learningSessions, 
    currentSession,
    userProgress,
    startLearningSession,
    completeLearningSession,
    settings
  } = useStore();

  const [expandedSections, setExpandedSections] = useState({
    active: true,
    available: true,
    completed: false,
    achievements: true
  });

  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const startSession = (type: LearningSession['type']) => {
    const sessionTemplates = {
      exploration: {
        type: 'exploration' as const,
        title: 'Code Exploration Session',
        description: 'Explore and understand code patterns, dependencies, and architecture',
        difficulty: 'intermediate' as const,
        completed: false,
        timeSpent: 0
      },
      guided: {
        type: 'guided' as const,
        title: 'Guided Learning Session',
        description: 'Step-by-step learning with AI guidance and explanations',
        difficulty: 'beginner' as const,
        completed: false,
        timeSpent: 0
      },
      quiz: {
        type: 'quiz' as const,
        title: 'Knowledge Quiz',
        description: 'Test your understanding with interactive questions',
        difficulty: 'intermediate' as const,
        completed: false,
        timeSpent: 0
      },
      debugging: {
        type: 'debugging' as const,
        title: 'Debugging Challenge',
        description: 'Practice debugging skills with real-world scenarios',
        difficulty: 'advanced' as const,
        completed: false,
        timeSpent: 0
      }
    };

    startLearningSession(sessionTemplates[type]);
    setIsSessionActive(true);
    setSessionTime(0);
  };

  const completeCurrentSession = () => {
    if (currentSession) {
      const score = Math.floor(Math.random() * 40) + 60; // Simulated score
      completeLearningSession(currentSession.id, score);
      setIsSessionActive(false);
      setSessionTime(0);
    }
  };

  const getSessionIcon = (type: LearningSession['type']) => {
    switch (type) {
      case 'exploration':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'guided':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'quiz':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'debugging':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: LearningSession['difficulty']) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!learningPanelOpen) return null;

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Learning Center
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enhance your coding skills and stay connected to your codebase
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Current Session */}
        {currentSession && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Active Session
              </h3>
              <div className="flex items-center space-x-2">
                {isSessionActive ? (
                  <button
                    onClick={() => setIsSessionActive(false)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Pause className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSessionActive(true)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <button
                  onClick={completeCurrentSession}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {getSessionIcon(currentSession.type)}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentSession.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {currentSession.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {formatTime(sessionTime)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentSession.difficulty)}`}>
                  {currentSession.difficulty}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Available Sessions */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('available')}
            className="flex items-center space-x-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-3"
          >
            {expandedSections.available ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>Available Sessions</span>
          </button>

          {expandedSections.available && (
            <div className="space-y-2">
              {[
                { type: 'exploration', title: 'Code Exploration', desc: 'Deep dive into code structure' },
                { type: 'guided', title: 'Guided Learning', desc: 'Step-by-step tutorials' },
                { type: 'quiz', title: 'Knowledge Quiz', desc: 'Test your understanding' },
                { type: 'debugging', title: 'Debug Challenge', desc: 'Practice debugging skills' }
              ].map((session) => (
                <button
                  key={session.type}
                  onClick={() => startSession(session.type as LearningSession['type'])}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    {getSessionIcon(session.type as LearningSession['type'])}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {session.desc}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Your Progress
          </h3>

          <div className="space-y-3">
            {/* Critical Thinking Score */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Critical Thinking</span>
                </div>
                <span className="font-medium">{userProgress.criticalThinkingScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress.criticalThinkingScore}%` }}
                />
              </div>
            </div>

            {/* Codebase Familiarity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Codebase Familiarity</span>
                </div>
                <span className="font-medium">{userProgress.codebaseFamiliarityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress.codebaseFamiliarityScore}%` }}
                />
              </div>
            </div>

            {/* Learning Streak */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Learning Streak</span>
              </div>
              <span className="font-medium text-yellow-600">{userProgress.streak} days</span>
            </div>

            {/* Sessions Completed */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Sessions Completed</span>
              </div>
              <span className="font-medium">{userProgress.totalLearningSessions}</span>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        {userProgress.achievements.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('achievements')}
              className="flex items-center space-x-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-3"
            >
              {expandedSections.achievements ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Recent Achievements</span>
            </button>

            {expandedSections.achievements && (
              <div className="space-y-2">
                {userProgress.achievements.slice(0, 3).map(achievement => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <span className="text-lg">🏆</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPanel;
