// @ts-nocheck
import React from 'react';
import { 
  Brain, 
  Lightbulb, 
  Menu,
  Zap,
  BookOpen,
  Target
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Header: React.FC = () => {
  const { 
    userProgress, 
    toggleSidebar, 
    toggleLearningPanel,
    learningPanelOpen,
    resetOnboarding
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
    <header className="bg-white border-b border-gray-100 flex-shrink-0">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Purpose */}
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 flex items-center justify-center text-3xl">
                🥥
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                  Cocode
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5 font-normal">
                  Learn by building, not copying
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Primary Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (confirm('Reset onboarding to see the landing page again?')) {
                  resetOnboarding();
                  window.location.reload();
                }
              }}
              className="px-3 py-1.5 rounded-lg transition-all font-medium text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              title="Reset Onboarding (Shows Landing Page)"
            >
              🔄
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggleAbout'));
              }}
              className="px-4 py-2 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              title="About Cocode"
            >
              <span className="hidden sm:inline">About</span>
              <span className="sm:hidden"><BookOpen className="w-4 h-4" /></span>
            </button>
            <button
              onClick={toggleLearningPanel}
              className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                learningPanelOpen 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title="View Progress"
            >
              <span className="hidden sm:inline">Progress</span>
              <span className="sm:hidden"><Target className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
