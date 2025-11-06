import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  BarChart3,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Eye,
  FileText,
  Download
} from 'lucide-react';
import { VariableSnapshot } from '../types/notebook';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

interface VariableInspectorProps {
  variables: VariableSnapshot[];
  onRefresh?: () => void;
  onExecuteCode?: (code: string) => Promise<void>;
}

const VariableInspector: React.FC<VariableInspectorProps> = ({ variables, onRefresh, onExecuteCode }) => {
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'variables' | 'plots' | 'dataframes'>('variables');

  const toggleVar = (name: string) => {
    setExpandedVars(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const dataframes = variables.filter(v => v.type === 'DataFrame' || v.type.includes('DataFrame'));
  const arrays = variables.filter(v => v.type === 'ndarray' || v.type.includes('array'));
  const otherVars = variables.filter(v => 
    !dataframes.includes(v) && !arrays.includes(v)
  );

  const getTypeIcon = (type: string) => {
    if (type.includes('DataFrame')) return <Table className="w-4 h-4 text-blue-600" />;
    if (type.includes('array')) return <BarChart3 className="w-4 h-4 text-green-600" />;
    return <Database className="w-4 h-4 text-gray-600" />;
  };

  const handleExportDataFrame = async (variable: VariableSnapshot) => {
    try {
      const filename = `${variable.name}_export.csv`;
      const exportCode = `# Export ${variable.name} to CSV
${variable.name}.to_csv('${filename}', index=False)
print(f"✅ Exported {${variable.name}.shape[0]} rows to ${filename}")
print(f"📁 File saved to: {filename}")
print(f"💡 You can download it from the File Storage panel")`;
      
      if (onExecuteCode) {
        await onExecuteCode(exportCode);
        toast.success(`Exporting "${variable.name}" to CSV...`);
      } else {
        toast.success(`To export "${variable.name}", run: ${variable.name}.to_csv('${filename}', index=False)`);
      }
    } catch (error: any) {
      toast.error(`Failed to export: ${error.message}`);
    }
  };

  const renderVariable = (variable: VariableSnapshot) => {
    const isExpanded = expandedVars.has(variable.name);
    const isDataFrame = variable.type.includes('DataFrame');
    
    return (
      <div key={variable.name} className="border-b border-gray-100">
        <div className="flex items-center justify-between group">
          <button
            onClick={() => toggleVar(variable.name)}
            className="flex-1 px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 min-w-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            {getTypeIcon(variable.type)}
            <span className="font-mono text-sm font-medium text-gray-900 truncate">
              {variable.name}
            </span>
            <span className="text-xs text-gray-500 ml-2">{variable.type}</span>
          </button>
          {isDataFrame && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExportDataFrame(variable);
              }}
              className="p-1.5 mr-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            {variable.shape && (
              <div className="text-xs text-gray-600">
                <span className="font-semibold">Shape:</span> {variable.shape}
              </div>
            )}
            {variable.summary && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-semibold">Summary:</span>
                <pre className="mt-1 whitespace-pre-wrap">{variable.summary}</pre>
              </div>
            )}
            {variable.preview && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-48 overflow-auto">
                <span className="font-semibold">Preview:</span>
                <pre className="mt-1 whitespace-pre-wrap font-mono">{variable.preview}</pre>
              </div>
            )}
            {variable.value && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-semibold">Value:</span>
                <pre className="mt-1 whitespace-pre-wrap font-mono">{variable.value}</pre>
              </div>
            )}
            {isDataFrame && (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleExportDataFrame(variable)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export to CSV</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Inspector</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Refresh variables"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              activeTab === 'variables'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Variables
          </button>
          <button
            onClick={() => setActiveTab('dataframes')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              activeTab === 'dataframes'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            DataFrames ({dataframes.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'variables' && (
          <div className="p-2">
            {variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No variables defined</p>
                <p className="text-xs mt-1">Run code to see variables here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {dataframes.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
                      DataFrames
                    </div>
                    {dataframes.map(renderVariable)}
                  </div>
                )}
                {arrays.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
                      Arrays
                    </div>
                    {arrays.map(renderVariable)}
                  </div>
                )}
                {otherVars.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
                      Other Variables
                    </div>
                    {otherVars.map(renderVariable)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dataframes' && (
          <div className="p-2">
            {dataframes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No DataFrames</p>
                <p className="text-xs mt-1">Create DataFrames to see them here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {dataframes.map(renderVariable)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariableInspector;



