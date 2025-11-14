// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  Lightbulb, 
  CheckCircle, 
  ArrowRight,
  Brain,
  BookOpen,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExplorationQuestion } from '../types';

interface CodeExplorationModalProps {
  fileId: string;
  onClose: () => void;
}

const CodeExplorationModal: React.FC<CodeExplorationModalProps> = ({ fileId, onClose }) => {
  const { files, completeCodeExploration, activeExploration } = useStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const file = files.find(f => f.id === fileId);
  const questions: ExplorationQuestion[] = [
    {
      id: '1',
      question: 'What is the main purpose of this code?',
      type: 'open-ended',
      explanation: 'Understanding the primary goal helps you grasp the overall architecture and design decisions.',
      difficulty: 'easy'
    },
    {
      id: '2',
      question: 'Which functions or methods are defined in this file?',
      type: 'open-ended',
      explanation: 'Identifying functions helps you understand the code structure and responsibilities.',
      difficulty: 'easy'
    },
    {
      id: '3',
      question: 'What external dependencies does this code have?',
      type: 'open-ended',
      explanation: 'Dependencies show how this code integrates with the broader system.',
      difficulty: 'medium'
    },
    {
      id: '4',
      question: 'Are there any potential issues or improvements you can identify?',
      type: 'open-ended',
      explanation: 'Critical thinking about code quality helps develop better coding practices.',
      difficulty: 'hard'
    },
    {
      id: '5',
      question: 'How would you test this code?',
      type: 'open-ended',
      explanation: 'Thinking about testing strategies improves code reliability and maintainability.',
      difficulty: 'medium'
    }
  ];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete exploration
      const generatedInsights = generateInsights();
      setInsights(generatedInsights);
      setIsCompleted(true);
      if (activeExploration) {
        completeCodeExploration(activeExploration.id, generatedInsights);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const generateInsights = (): string[] => {
    const insights = [
      'You\'ve analyzed the code structure and identified key components',
      'Understanding dependencies helps you see the bigger picture',
      'Critical thinking about improvements develops better coding practices',
      'Testing strategies ensure code reliability and maintainability'
    ];
    return insights;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'hard':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'hard':
        return <Brain className="w-4 h-4 text-red-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!file) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Code Exploration
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {file.name} • Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Code Preview */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Code Preview
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {file.language}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
              <pre>{file.content}</pre>
            </div>
          </div>

          {/* Question Panel */}
          <div className="w-1/2 p-6 flex flex-col">
            {!isCompleted ? (
              <>
                {/* Question */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    {getDifficultyIcon(currentQuestion.difficulty)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-3">
                    <textarea
                      value={userAnswers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Share your thoughts and analysis..."
                      className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Why this matters:
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          {currentQuestion.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>

                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Completion Screen */
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Exploration Complete!
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Great job analyzing the code. Here are your key insights:
                </p>

                <div className="w-full space-y-3 mb-6">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close Exploration
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExplorationModal;
