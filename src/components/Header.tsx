import React from 'react';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Trophy, 
  Settings, 
  Menu,
  Zap,
  BookOpen
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Header: React.FC = () => {
  const { 
    userProgress, 
    toggleSidebar, 
    toggleLearningPanel,
    learningPanelOpen,
    sidebarOpen,
    settings,
    updateSettings
  } = useStore();

  const getCriticalThinkingLevel = (score: number) => {
    if (score >= 80) return { level: 'Expert', color: 'text-green-600', icon: Brain };
    if (score >= 60) return { level: 'Advanced', color: 'text-blue-600', icon: Target };
    if (score >= 40) return { level: 'Intermediate', color: 'text-yellow-600', icon: Lightbulb };
    return { level: 'Beginner', color: 'text-gray-600', icon: BookOpen };
  };

  const thinkingLevel = getCriticalThinkingLevel(userProgress.criticalThinkingScore);
  const ThinkingIcon = thinkingLevel.icon;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Menu and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              DataAIFair IDE
            </h1>
          </div>
        </div>

        {/* Center - Progress indicators */}
        <div className="flex items-center space-x-6">
          {/* Critical Thinking Score */}
          <div className="flex items-center space-x-2">
            <ThinkingIcon className={`w-5 h-5 ${thinkingLevel.color}`} />
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                {thinkingLevel.level}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {userProgress.criticalThinkingScore}/100
              </div>
            </div>
          </div>

          {/* Codebase Familiarity */}
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                Familiarity
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {userProgress.codebaseFamiliarityScore}%
              </div>
            </div>
          </div>

          {/* Learning Streak */}
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                Streak
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {userProgress.streak} days
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                Achievements
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {userProgress.achievements.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Learning Panel Toggle */}
          <button
            onClick={toggleLearningPanel}
            className={`p-2 rounded-lg transition-colors ${
              learningPanelOpen 
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Toggle Learning Panel"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* AI Assistance Level */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI:</span>
            <select
              value={settings.aiAssistanceLevel}
              onChange={(e) => updateSettings({ 
                aiAssistanceLevel: e.target.value as 'minimal' | 'moderate' | 'full' 
              })}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="minimal">Minimal</option>
              <option value="moderate">Moderate</option>
              <option value="full">Full</option>
            </select>
          </div>

          {/* Settings */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
