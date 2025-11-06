import React, { useState } from 'react';
import { 
  Image as ImageIcon,
  X,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { aiProvider } from '../services/aiProvider';
import { toast } from 'react-hot-toast';

interface ExplainPlotModalProps {
  plotData: string; // Base64 encoded image
  code: string;
  onClose: () => void;
}

const ExplainPlotModal: React.FC<ExplainPlotModalProps> = ({ plotData, code, onClose }) => {
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const result = await aiProvider.explainPlot({
          plotData,
          code
        });
        setExplanation(result);
      } catch (err) {
        console.error('Failed to get plot explanation:', err);
        toast.error('Failed to generate plot explanation');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [plotData, code]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Explain My Plot</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                <span className="text-gray-600">Analyzing plot...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plot Image */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <img
                  src={`data:image/png;base64,${plotData}`}
                  alt="Plot to explain"
                  className="max-w-full mx-auto"
                />
              </div>

              {explanation && (
                <>
                  {/* Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">What This Plot Shows</h3>
                        <p className="text-sm text-blue-800 leading-relaxed">{explanation.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  {explanation.insights && explanation.insights.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-3">Key Insights</h3>
                      <ul className="space-y-2">
                        {explanation.insights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span className="text-sm text-purple-800">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {explanation.improvements && explanation.improvements.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3">Suggestions for Improvement</h3>
                      <ul className="space-y-2">
                        {explanation.improvements.map((improvement: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span className="text-sm text-green-800">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
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

export default ExplainPlotModal;



