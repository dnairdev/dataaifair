import React from 'react';
import { 
  Brain, 
  Target, 
  BookOpen,
  Lightbulb,
  Zap,
  Code,
  ArrowLeft,
  Users,
  Sparkles
} from 'lucide-react';
const About: React.FC = () => {

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b-2 border-black dark:border-white sticky top-0 z-10">
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
            Your Specialized Data Science Teaching Assistant
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Cocode is a specialized teaching assistant for data science tasks that teaches while improving efficiency. 
            Learn data science concepts step-by-step as you build real projects, with AI guidance that explains the "why" behind every line of code.
          </p>
        </div>

        {/* What Cocode Does */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-black dark:bg-white rounded-lg">
              <Brain className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What Cocode Does</h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-black dark:border-white mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Cocode is a <strong className="text-black dark:text-white">specialized teaching assistant for data science tasks</strong> that combines 
              powerful AI assistance with educational guidance. Unlike generic coding assistants, Cocode is designed specifically 
              for data science workflows, helping you learn pandas, matplotlib, seaborn, numpy, and more while you work.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white dark:bg-black rounded-lg border-2 border-black dark:border-white">
                <h4 className="font-semibold text-black dark:text-white mb-2">Teaches While You Work</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every code generation comes with step-by-step explanations that break down data science concepts, 
                  helping you understand not just what the code does, but why it works.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-black rounded-lg border-2 border-black dark:border-white">
                <h4 className="font-semibold text-black dark:text-white mb-2">Improves Efficiency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate data visualizations, analyze datasets, and create data pipelines faster while learning. 
                  Cocode helps you work smarter, not harder, by automating repetitive tasks and providing intelligent suggestions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-black dark:bg-white rounded-lg">
              <Lightbulb className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Key Features</h3>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-black dark:bg-white rounded-lg flex-shrink-0">
                  <Brain className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Teacher-Like Explanations
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Get step-by-step, teacher-like explanations for every code generation. Cocode breaks down data science 
                    concepts into digestible steps, explaining the "why" behind pandas operations, matplotlib visualizations, 
                    and data analysis techniques.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-black dark:bg-white rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Data Science Specialized
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Built specifically for data science workflows. Generate code for data analysis, visualizations, 
                    statistical modeling, and more. Upload CSV files, create plots, analyze datasets—all with 
                    intelligent code generation that understands data science best practices.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-black dark:bg-white rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Efficiency & Learning Combined
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Work faster while learning more. Cocode generates complete, runnable code for your data science tasks 
                    while teaching you the concepts. No more switching between tutorials and your IDE—learn and build simultaneously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Science Capabilities */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-black dark:bg-white rounded-lg">
              <Sparkles className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Data Science Capabilities</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-center space-x-3 mb-3">
                <Code className="w-5 h-5 text-black dark:text-white" />
                <h4 className="font-semibold text-black dark:text-white">Interactive Notebook</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Jupyter-style notebook environment with code cells, output display, and variable inspection. 
                Run Python code, visualize data, and see results instantly.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-center space-x-3 mb-3">
                <BookOpen className="w-5 h-5 text-black dark:text-white" />
                <h4 className="font-semibold text-black dark:text-white">CSV File Management</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload CSV files, generate data visualizations automatically, and export DataFrames. 
                All files are managed in a centralized storage system.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-center space-x-3 mb-3">
                <Brain className="w-5 h-5 text-black dark:text-white" />
                <h4 className="font-semibold text-black dark:text-white">AI-Powered Code Generation</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chat with the AI assistant to generate data analysis code, create visualizations, 
                and get explanations. Code is automatically inserted into your notebook.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-black rounded-xl border-2 border-black dark:border-white">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-black dark:text-white" />
                <h4 className="font-semibold text-black dark:text-white">Guiding Questions</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test your understanding with AI-generated questions about the codebase and data science concepts. 
                Learn actively, not passively.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-black dark:bg-white rounded-2xl p-8 border-2 border-black dark:border-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white dark:text-black mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-gray-200 dark:text-gray-800 leading-relaxed max-w-3xl mx-auto">
              To be the specialized teaching assistant for data science that helps you learn while you work. 
              Cocode combines the efficiency of AI-powered code generation with the depth of educational guidance, 
              making data science accessible and understandable. We believe that the best way to learn data science 
              is by doing—and Cocode makes that process faster, smarter, and more educational.
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
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium border-2 border-black dark:border-white"
            >
              Start Building
            </button>
            <button
              onClick={() => {
                const chatButton = document.querySelector('[aria-label="Open AI Assistant"]') as HTMLElement;
                chatButton?.click();
              }}
              className="px-6 py-3 bg-white dark:bg-black text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors font-medium border-2 border-black dark:border-white"
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

