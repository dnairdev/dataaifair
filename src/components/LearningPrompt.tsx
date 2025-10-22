import React, { useState } from 'react';
import { 
  X, 
  Lightbulb, 
  BookOpen, 
  Target, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap
} from 'lucide-react';
import { AISuggestion } from '../types';

interface LearningPromptProps {
  suggestion: AISuggestion;
  onClose: () => void;
}

const LearningPrompt: React.FC<LearningPromptProps> = ({ suggestion, onClose }) => {
  const [userResponse, setUserResponse] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'hint':
        return <Lightbulb className="w-6 h-6 text-yellow-500" />;
      case 'question':
        return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'explanation':
        return <AlertCircle className="w-6 h-6 text-green-500" />;
      case 'challenge':
        return <Target className="w-6 h-6 text-purple-500" />;
      default:
        return <Brain className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'hint':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'question':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'explanation':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'challenge':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
    }
  };

  const handleSubmit = () => {
    if (suggestion.requiresUserAction && userResponse.trim()) {
      setShowExplanation(true);
    } else {
      setIsCompleted(true);
    }
  };

  const getPromptContent = () => {
    switch (suggestion.type) {
      case 'hint':
        return {
          title: '💡 Learning Hint',
          description: 'Here\'s a helpful hint to guide your thinking:',
          actionText: 'Got it! Show me more',
          explanation: 'This hint helps you develop pattern recognition and problem-solving skills. The key is to understand the underlying concept, not just memorize the solution.'
        };
      case 'question':
        return {
          title: '🤔 Thought Question',
          description: 'Let\'s think about this together. Share your thoughts:',
          actionText: 'Submit my answer',
          explanation: 'Great thinking! This question helps you develop critical analysis skills and deeper understanding of the codebase.'
        };
      case 'explanation':
        return {
          title: '📚 Concept Explanation',
          description: 'Let me explain this concept in detail:',
          actionText: 'I understand',
          explanation: 'Understanding the "why" behind code decisions helps you become a better developer and make informed choices in your own projects.'
        };
      case 'challenge':
        return {
          title: '🎯 Learning Challenge',
          description: 'Ready for a challenge? Let\'s test your understanding:',
          actionText: 'Take the challenge',
          explanation: 'Challenges help you apply knowledge in real-world scenarios, building practical skills and confidence.'
        };
      default:
        return {
          title: '🧠 Learning Opportunity',
          description: 'Here\'s something interesting to explore:',
          actionText: 'Learn more',
          explanation: 'Continuous learning keeps your skills sharp and helps you stay current with best practices.'
        };
    }
  };

  const content = getPromptContent();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full border-2 ${getSuggestionColor(suggestion.type)}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getSuggestionIcon(suggestion.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {content.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suggestion.priority === 'high' ? 'High Priority' : 
                 suggestion.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
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

        <div className="p-6">
          {!isCompleted ? (
            <>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {content.description}
                </p>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {suggestion.content}
                  </p>
                </div>
              </div>

              {suggestion.requiresUserAction && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your response:
                  </label>
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Share your thoughts, questions, or analysis..."
                    className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              )}

              {showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Why this matters:
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        {content.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Zap className="w-4 h-4" />
                  <span>This helps build your critical thinking skills</span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    {content.actionText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Completion Screen */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Great job!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You've engaged with this learning opportunity and strengthened your understanding.
              </p>

              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4" />
                  <span>Critical thinking +1</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Codebase familiarity +1</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Continue Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPrompt;
