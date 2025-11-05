import { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import LearningPanel from './components/LearningPanel';
import Header from './components/Header';
import AIProjectBuilder from './components/AIProjectBuilder';
import AIChat from './components/AIChat';
import About from './components/About';
import LandingPage from './components/LandingPage';
import { generateLearningPrompts, analyzeCodebase } from './utils/aiHelpers';

function App() {
  const { 
    settings, 
    addAISuggestion, 
    addCodebaseInsight,
    hasCompletedOnboarding,
    setUserUseCase,
    completeOnboarding
  } = useStore();
  const [showAbout, setShowAbout] = useState(false);

  // Initialize learning prompts and codebase analysis
  useEffect(() => {
    const initializeLearning = async () => {
      if (settings.learningMode && settings.explorationPrompts) {
        // Generate initial learning prompts
        const prompts = await generateLearningPrompts();
        prompts.forEach(prompt => addAISuggestion(prompt));
        
        // Analyze codebase for insights
        const insights = await analyzeCodebase();
        insights.forEach(insight => addCodebaseInsight(insight));
      }
    };

    initializeLearning();
  }, [settings.learningMode, settings.explorationPrompts, addAISuggestion, addCodebaseInsight]);

  // Listen for about page toggle
  useEffect(() => {
    const handleToggleAbout = () => {
      setShowAbout(prev => !prev);
    };
    window.addEventListener('toggleAbout', handleToggleAbout);
    return () => {
      window.removeEventListener('toggleAbout', handleToggleAbout);
    };
  }, []);

  const handleOnboardingComplete = (useCase: string) => {
    setUserUseCase(useCase);
    completeOnboarding();
  };

  // Show landing page if onboarding not completed
  if (!hasCompletedOnboarding) {
    return (
      <Router>
        <LandingPage onComplete={handleOnboardingComplete} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#111827',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
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
      </Router>
    );
  }

  if (showAbout) {
    return (
      <Router>
        <About />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
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
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 antialiased">
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <Header />
            
            <div className="flex-1 flex overflow-hidden">
              {/* Code Editor */}
              <main className="flex-1 overflow-hidden bg-white">
                <CodeEditor />
              </main>
              
              {/* Project Builder Panel */}
              <AIProjectBuilder />
              
              {/* Learning Panel */}
              <LearningPanel />
            </div>
          </div>
        </div>
        
        {/* AI Assistant */}
        <AIChat />
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#111827',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
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
