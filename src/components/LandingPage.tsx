import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Code, 
  Building2,
  Heart,
  Rocket,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface UseCaseCategory {
  id: string;
  name: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  options: {
    id: string;
    label: string;
    emoji: string;
    description: string;
    recommendedProjects?: string[];
  }[];
}

const LandingPage: React.FC<{ onComplete: (useCase: string) => void }> = ({ onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const categories: UseCaseCategory[] = [
    {
      id: 'school',
      name: 'School & Education',
      emoji: '🎓',
      icon: GraduationCap,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      options: [
        {
          id: 'student-learning',
          label: 'Student Learning Programming',
          emoji: '📚',
          description: 'Learning to code for courses, assignments, and personal projects',
          recommendedProjects: ['todo-app', 'weather-app', 'rest-api']
        },
        {
          id: 'cs-major',
          label: 'Computer Science Student',
          emoji: '💻',
          description: 'Building projects for coursework and portfolio development',
          recommendedProjects: ['rest-api', 'database-app', 'auth-system']
        },
        {
          id: 'teacher',
          label: 'Educator / Teacher',
          emoji: '👨‍🏫',
          description: 'Teaching programming concepts and creating learning materials',
          recommendedProjects: ['todo-app', 'cli-tool', 'file-processor']
        }
      ]
    },
    {
      id: 'profession',
      name: 'Professional Development',
      emoji: '💼',
      icon: Briefcase,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      options: [
        {
          id: 'career-switch',
          label: 'Career Switch to Tech',
          emoji: '🔄',
          description: 'Transitioning into software development from another field',
          recommendedProjects: ['todo-app', 'rest-api', 'ecommerce']
        },
        {
          id: 'skill-upgrade',
          label: 'Upskilling / Skill Upgrade',
          emoji: '📈',
          description: 'Learning new technologies and frameworks for your current role',
          recommendedProjects: ['graphql-api', 'microservices', 'real-time-chat']
        },
        {
          id: 'portfolio',
          label: 'Building Portfolio',
          emoji: '🎨',
          description: 'Creating projects to showcase your skills to employers',
          recommendedProjects: ['ecommerce', 'data-visualization', 'analytics-platform']
        }
      ]
    },
    {
      id: 'industry',
      name: 'Industry & Business',
      emoji: '🏢',
      icon: Building2,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      options: [
        {
          id: 'startup',
          label: 'Startup / Entrepreneur',
          emoji: '🚀',
          description: 'Building products and MVPs for your business',
          recommendedProjects: ['ecommerce', 'rest-api', 'analytics-platform']
        },
        {
          id: 'enterprise',
          label: 'Enterprise Developer',
          emoji: '🏗️',
          description: 'Building scalable, production-ready applications',
          recommendedProjects: ['microservices', 'api-gateway', 'monitoring-tool']
        },
        {
          id: 'freelance',
          label: 'Freelance Developer',
          emoji: '💻',
          description: 'Creating client projects and building your services',
          recommendedProjects: ['ecommerce', 'rest-api', 'webhook-service']
        }
      ]
    },
    {
      id: 'hobby',
      name: 'Hobby & Personal',
      emoji: '❤️',
      icon: Heart,
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
      options: [
        {
          id: 'personal-project',
          label: 'Personal Project',
          emoji: '✨',
          description: 'Building something for fun or to solve a personal problem',
          recommendedProjects: ['todo-app', 'file-processor', 'cli-tool']
        },
        {
          id: 'open-source',
          label: 'Open Source Contributor',
          emoji: '🌐',
          description: 'Contributing to open source projects and building tools',
          recommendedProjects: ['testing-framework', 'code-generator', 'cli-tool']
        },
        {
          id: 'automation',
          label: 'Automation & Scripts',
          emoji: '⚙️',
          description: 'Creating tools and scripts to automate tasks',
          recommendedProjects: ['cli-tool', 'file-processor', 'devops-tool']
        }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Topics',
      emoji: '🚀',
      icon: Rocket,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      options: [
        {
          id: 'system-design',
          label: 'System Design & Architecture',
          emoji: '🏛️',
          description: 'Learning distributed systems and architectural patterns',
          recommendedProjects: ['microservices', 'api-gateway', 'task-queue']
        },
        {
          id: 'devops',
          label: 'DevOps & Infrastructure',
          emoji: '🔧',
          description: 'Building deployment and infrastructure automation tools',
          recommendedProjects: ['devops-tool', 'monitoring-tool', 'webhook-service']
        },
        {
          id: 'performance',
          label: 'Performance & Optimization',
          emoji: '⚡',
          description: 'Building high-performance applications and tools',
          recommendedProjects: ['cache-layer', 'search-engine', 'api-gateway']
        }
      ]
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedUseCase(null);
  };

  const handleUseCaseSelect = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
  };

  const handleContinue = () => {
    if (selectedUseCase) {
      onComplete(selectedUseCase);
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {!selectedCategory ? (
          // Category Selection
            <div className="text-center mb-12">
              {/* Single Logo */}
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-lg bg-black flex items-center justify-center">
                  <div className="text-4xl text-white">🥥</div>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What are you coding for?
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                We'll personalize your experience based on your goals and help you build projects that matter to you.
              </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 transition-all text-left hover:shadow-lg"
                  >
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.options.length} use cases
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Use Case Selection
          <div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedUseCase(null);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-sm font-medium">Back to categories</span>
            </button>

            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                {selectedCategoryData && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                      {React.createElement(selectedCategoryData.icon, { className: "w-5 h-5 text-white" })}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedCategoryData.name}
                    </h2>
                  </>
                )}
              </div>
              <p className="text-lg text-gray-600">
                Select your specific use case:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {selectedCategoryData?.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleUseCaseSelect(option.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    selectedUseCase === option.id
                      ? 'border-gray-900 bg-gray-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {option.label}
                    </h3>
                    {selectedUseCase === option.id && (
                      <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {selectedUseCase && (
              <div className="mt-12 p-8 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-gray-900" />
                  <span>Recommended for you</span>
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Based on your selection, we'll personalize your Cocode experience with relevant projects and learning paths.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={handleContinue}
                    className="px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-lg flex items-center space-x-2 shadow-lg"
                  >
                    <span>Continue to Cocode</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

