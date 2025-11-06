import React, { useState } from 'react';
import { 
  ChevronRight,
  ChevronDown,
  Database
} from 'lucide-react';
import { useStore } from '../store/useStore';
import FileManager from './FileManager';

const Sidebar: React.FC = () => {
  const { 
    sidebarOpen
  } = useStore();

  const [expandedSections, setExpandedSections] = useState({
    storage: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!sidebarOpen) return null;

  return (
    <div className="w-72 bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden">
      {/* File Storage Section */}
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <button
          onClick={() => toggleSection('storage')}
          className="flex items-center space-x-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-3"
        >
          {expandedSections.storage ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Database className="w-4 h-4" />
          <span>File Storage</span>
        </button>
        
        {expandedSections.storage && (
          <div className="flex-1 min-h-0">
            <FileManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
