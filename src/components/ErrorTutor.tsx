import React from 'react';
import { 
  AlertCircle, 
  Lightbulb, 
  BookOpen,
  X,
  CheckCircle
} from 'lucide-react';
import { aiProvider } from '../services/aiProvider';

interface ErrorTutorProps {
  error: string;
  code: string;
  traceback?: string;
  onClose: () => void;
}

const ErrorTutor: React.FC<ErrorTutorProps> = ({ error, code, traceback, onClose }) => {
  const [explanation, setExplanation] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const result = await aiProvider.errorTutor({
          error,
          code,
          traceback
        });
        setExplanation(result);
      } catch (err) {
        console.error('Failed to get error explanation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [error, code, traceback]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="text-gray-600">Analyzing error...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Error Tutor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Display */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Error Message</h3>
                <pre className="text-sm text-red-800 font-mono whitespace-pre-wrap">{error}</pre>
                {traceback && (
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-red-700 cursor-pointer">
                      Show traceback
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 font-mono whitespace-pre-wrap bg-red-100 p-2 rounded">
                      {traceback}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>

          {explanation && (
            <>
              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">What Went Wrong?</h3>
                    <p className="text-sm text-blue-800 leading-relaxed">{explanation.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Solution */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">How to Fix It</h3>
                    <p className="text-sm text-green-800 leading-relaxed">{explanation.solution}</p>
                  </div>
                </div>
              </div>

              {/* Common Mistakes */}
              {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2">Common Mistakes</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                        {explanation.commonMistakes.map((mistake: string, idx: number) => (
                          <li key={idx}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Concepts */}
              {explanation.relatedConcepts && explanation.relatedConcepts.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 mb-2">Related Concepts</h3>
                      <div className="flex flex-wrap gap-2">
                        {explanation.relatedConcepts.map((concept: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorTutor;



