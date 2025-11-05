import React from 'react';
import { 
  Brain, 
  Target, 
  BookOpen,
  Lightbulb,
  Zap,
  Shield,
  Code,
  ArrowLeft,
  Users,
  Sparkles
} from 'lucide-react';
const About: React.FC = () => {

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('toggleAbout'));
                }}
                className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 flex items-center justify-center text-3xl">
                  🥥
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">About Cocode</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center text-9xl">
            🥥
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learn by Building, Not Copying
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Cocode is an AI-assisted IDE designed to teach you programming while you build real projects. 
            We believe in understanding the "why" behind code, not just the "what."
          </p>
        </div>

        {/* The Problem */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">The Problem We Solve</h3>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border border-red-200 dark:border-red-900 mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Traditional AI coding assistants have a critical flaw: they make developers dependent on AI, 
              causing <strong className="text-gray-900 dark:text-white">skill atrophy</strong> and <strong className="text-gray-900 dark:text-white">codebase disconnection</strong>.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Critical Thinking Atrophy</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When AI writes code for you, you lose the ability to think through problems independently. 
                  You become a code copier, not a problem solver.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Codebase Disconnection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When AI debugs and writes code you don't understand, you become less familiar with your own codebase. 
                  You can't maintain what you didn't build.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Solution */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Lightbulb className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Solution</h3>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-primary-50 dark:bg-primary-950/20 rounded-xl border border-primary-200 dark:border-primary-900">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-600 rounded-lg flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Learning-Focused AI Assistance
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Cocode provides hints, questions, and explanations—not complete solutions. You learn by doing, 
                    not by copying. Every step includes educational context so you understand the "why" behind the code.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary-50 dark:bg-primary-950/20 rounded-xl border border-primary-200 dark:border-primary-900">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-600 rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Build Any Product You Want
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Describe what you want to build, and Cocode creates a personalized step-by-step learning plan. 
                    You'll build real projects while learning concepts, patterns, and best practices.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary-50 dark:bg-primary-950/20 rounded-xl border border-primary-200 dark:border-primary-900">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-600 rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Track Your Growth
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Monitor your critical thinking skills, codebase familiarity, and learning progress. 
                    Cocode helps you become a better developer, not just a faster code copier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Key Features</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <Code className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Line-by-Line Code Explanation</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Understand every line of code with automated explanations that break down concepts, patterns, and best practices.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Step-by-Step Project Building</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build any product you can imagine with guided tutorials that teach you concepts as you code.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Critical Thinking Development</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Strengthen your problem-solving skills through interactive questions and guided exploration.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Codebase Familiarity</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stay connected to your codebase by understanding what you build, not just what you copy.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/20 dark:to-primary-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-900">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              To empower developers to become better problem solvers and critical thinkers. 
              We believe that understanding code is more valuable than copying it, and that 
              building projects is the best way to learn programming. Cocode is not just an IDE—it's 
              a learning platform that grows with you.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ready to start learning by building?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggleAbout'));
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
            >
              Start Building
            </button>
            <button
              onClick={() => {
                const chatButton = document.querySelector('[aria-label="Open AI Assistant"]') as HTMLElement;
                chatButton?.click();
              }}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Ask the AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

