import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import LearningPanel from './components/LearningPanel';
import Header from './components/Header';
import NotificationCenter from './components/NotificationCenter';
import { generateLearningPrompts, analyzeCodebase } from './utils/aiHelpers';

function App() {
  const { 
    settings, 
    addAISuggestion, 
    addCodebaseInsight,
    addNotification,
    learningMode,
    explorationPrompts
  } = useStore();

  // Initialize learning prompts and codebase analysis
  useEffect(() => {
    const initializeLearning = async () => {
      if (learningMode && explorationPrompts) {
        // Generate initial learning prompts
        const prompts = await generateLearningPrompts();
        prompts.forEach(prompt => addAISuggestion(prompt));
        
        // Analyze codebase for insights
        const insights = await analyzeCodebase();
        insights.forEach(insight => addCodebaseInsight(insight));
        
        addNotification({
          type: 'learning',
          title: 'Welcome to DataAIFair IDE!',
          message: 'Your learning journey begins now. Explore the codebase and engage with the AI assistant to build your skills.',
          read: false
        });
      }
    };

    initializeLearning();
  }, [learningMode, explorationPrompts, addAISuggestion, addCodebaseInsight, addNotification]);

  return (
    <Router>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${
        settings.theme === 'dark' ? 'dark' : settings.theme === 'light' ? '' : 'dark'
      }`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <Header />
            
            <div className="flex-1 flex">
              {/* Code Editor */}
              <main className="flex-1">
                <CodeEditor />
              </main>
              
              {/* Learning Panel */}
              <LearningPanel />
            </div>
          </div>
        </div>
        
        {/* Notification Center */}
        <NotificationCenter />
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
