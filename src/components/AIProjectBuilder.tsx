import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Lightbulb,
  Target,
  CheckCircle,
  ArrowRight,
  Code,
  FileText,
  Settings,
  Brain,
  Zap,
  Search,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  type: 'setup' | 'component' | 'logic' | 'styling' | 'testing' | 'optimization';
  code: string;
  explanation: string;
  learningPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  userUnderstanding?: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'react' | 'nextjs' | 'vue' | 'node' | 'fullstack' | 'mobile';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: ProjectStep[];
  learningGoals: string[];
  icon: string;
  color: string;
  featured?: boolean;
}

const AIProjectBuilder: React.FC = () => {
  const { addAISuggestion, addNotification, projectBuilderOpen, activeProject } = useStore();
  const [currentProject, setCurrentProject] = useState<ProjectTemplate | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Load custom project from store when it's set
  useEffect(() => {
    if (activeProject && activeProject.id && activeProject.id.startsWith('custom-')) {
      setCurrentProject(activeProject as ProjectTemplate);
      setCurrentStepIndex(0);
    }
  }, [activeProject]);

  const projectTemplates: ProjectTemplate[] = [
    // Beginner Projects
    {
      id: 'todo-app',
      name: 'Smart Todo App',
      description: 'Build a modern todo app with React, TypeScript, and advanced features like drag-and-drop, filtering, and local storage persistence.',
      category: 'react',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      icon: '✅',
      color: 'from-blue-500 to-blue-700',
      featured: true,
      learningGoals: [
        'React hooks and state management',
        'TypeScript interfaces and types',
        'Component composition patterns',
        'Local storage integration',
        'Responsive design principles'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Project Setup',
          description: 'Initialize the React project with TypeScript and essential dependencies',
          type: 'setup',
          code: `npm create vite@latest smart-todo-app -- --template react-ts
cd smart-todo-app
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`,
          explanation: 'We start by creating a new Vite project with React and TypeScript. Vite provides fast development and building. We also install Lucide React for icons and Tailwind CSS for styling.',
          learningPoints: [
            'Vite is a modern build tool that\'s faster than Create React App',
            'TypeScript adds type safety to JavaScript',
            'npm is the package manager for Node.js packages',
            'Tailwind CSS provides utility-first styling'
          ],
          difficulty: 'beginner',
          completed: false
        },
        {
          id: 'types',
          title: 'Define TypeScript Interfaces',
          description: 'Create type definitions for our todo items and app state',
          type: 'logic',
          code: `// src/types/todo.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}`,
          explanation: 'TypeScript interfaces help us define the shape of our data. This makes our code more maintainable and catches errors at compile time.',
          learningPoints: [
            'Interfaces define the structure of objects',
            'TypeScript helps catch errors before runtime',
            'Union types allow multiple possible values'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'weather-app',
      name: 'Weather Dashboard',
      description: 'Build a weather app with API integration, data visualization, and real-time updates using React and TypeScript.',
      category: 'react',
      difficulty: 'intermediate',
      estimatedTime: '3-4 hours',
      icon: '🌤️',
      color: 'from-cyan-500 to-blue-600',
      featured: true,
      learningGoals: [
        'API integration and error handling',
        'Data visualization with charts and graphs',
        'Responsive design and mobile-first approach',
        'API caching and performance optimization'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Project Setup',
          description: 'Initialize the project and install dependencies',
          type: 'setup',
          code: `npm create vite@latest weather-dashboard -- --template react-ts
cd weather-dashboard
npm install axios recharts`,
          explanation: 'We set up a React TypeScript project with Vite and install axios for API calls and recharts for data visualization.',
          learningPoints: [
            'Vite for fast development',
            'Axios for HTTP requests',
            'Recharts for data visualization',
            'TypeScript for type safety'
          ],
          difficulty: 'beginner',
          completed: false
        }
      ]
    },
    
    // Intermediate Projects
    {
      id: 'cli-tool',
      name: 'CLI Developer Tool',
      description: 'Build a command-line tool for developers with argument parsing, configuration management, and file operations.',
      category: 'node',
      difficulty: 'intermediate',
      estimatedTime: '3-4 hours',
      icon: '⚡',
      color: 'from-green-500 to-emerald-600',
      featured: true,
      learningGoals: [
        'Node.js CLI development',
        'Command-line argument parsing',
        'File system operations',
        'Package distribution and installation'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Initialize CLI Project',
          description: 'Set up a Node.js CLI project with TypeScript and CLI framework',
          type: 'setup',
          code: `mkdir my-cli-tool && cd my-cli-tool
npm init -y
npm install commander inquirer chalk
npm install -D typescript @types/node ts-node
npx tsc --init`,
          explanation: 'CLI tools are essential for developers. We use Commander.js for argument parsing and Inquirer for interactive prompts.',
          learningPoints: [
            'CLI tools automate repetitive tasks',
            'Commander.js simplifies argument parsing',
            'Inquirer provides interactive prompts',
            'Chalk adds colored terminal output'
          ],
          difficulty: 'intermediate',
          completed: false
        },
        {
          id: 'commands',
          title: 'Implement Commands',
          description: 'Create command handlers and subcommands',
          type: 'logic',
          code: `// src/commands/index.ts
import { Command } from 'commander';

export function setupCommands(program: Command) {
  program
    .command('init')
    .description('Initialize a new project')
    .action(() => {
      console.log('Initializing project...');
    });
  
  program
    .command('build')
    .description('Build the project')
    .option('-o, --output <dir>', 'output directory')
    .action((options) => {
      console.log('Building...', options);
    });
}`,
          explanation: 'Commands structure user interactions. Each command has a description and can accept options.',
          learningPoints: [
            'Commands organize CLI functionality',
            'Options provide flexibility',
            'Actions execute command logic'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'rest-api',
      name: 'REST API Server',
      description: 'Build a RESTful API with Express.js, authentication, database integration, and API documentation.',
      category: 'node',
      difficulty: 'intermediate',
      estimatedTime: '4-5 hours',
      icon: '🔌',
      color: 'from-indigo-500 to-purple-600',
      featured: true,
      learningGoals: [
        'RESTful API design principles',
        'Express.js middleware and routing',
        'Authentication and authorization',
        'Database integration and ORM usage',
        'API documentation with Swagger'
      ],
      steps: [
        {
          id: 'setup',
          title: 'API Server Setup',
          description: 'Initialize Express server with TypeScript and essential middleware',
          type: 'setup',
          code: `mkdir rest-api && cd rest-api
npm init -y
npm install express cors helmet morgan dotenv
npm install -D typescript @types/express @types/cors @types/node ts-node nodemon
npx tsc --init`,
          explanation: 'Express is the most popular Node.js web framework. We add security middleware (helmet), CORS, and logging.',
          learningPoints: [
            'Express.js is a minimal web framework',
            'Middleware processes requests',
            'Security headers protect against common attacks',
            'CORS enables cross-origin requests'
          ],
          difficulty: 'intermediate',
          completed: false
        },
        {
          id: 'routes',
          title: 'Create API Routes',
          description: 'Implement RESTful routes with proper HTTP methods',
          type: 'logic',
          code: `// src/routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // GET /api/users - List all users
  res.json({ users: [] });
});

router.post('/', async (req, res) => {
  // POST /api/users - Create user
  res.status(201).json({ message: 'User created' });
});

router.get('/:id', async (req, res) => {
  // GET /api/users/:id - Get user by ID
  res.json({ user: { id: req.params.id } });
});`,
          explanation: 'REST APIs use HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove).',
          learningPoints: [
            'REST follows HTTP semantics',
            'Routes map URLs to handlers',
            'HTTP methods define operations',
            'Status codes indicate results'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'database-app',
      name: 'Database Application',
      description: 'Build a database-driven application with PostgreSQL, Prisma ORM, and data relationships.',
      category: 'node',
      difficulty: 'intermediate',
      estimatedTime: '4-5 hours',
      icon: '🗄️',
      color: 'from-teal-500 to-cyan-600',
      learningGoals: [
        'Database design and schema',
        'ORM concepts and Prisma',
        'Relationships (one-to-many, many-to-many)',
        'Migrations and version control',
        'Query optimization'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Database Setup',
          description: 'Set up PostgreSQL and Prisma ORM',
          type: 'setup',
          code: `npm install @prisma/client
npm install -D prisma
npx prisma init`,
          explanation: 'Prisma is a modern ORM that provides type safety and an intuitive API for database operations.',
          learningPoints: [
            'ORMs abstract database operations',
            'Prisma generates type-safe clients',
            'Migrations manage schema changes',
            'Database design affects performance'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'auth-system',
      name: 'Authentication System',
      description: 'Implement secure authentication with JWT tokens, password hashing, refresh tokens, and session management.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '5-6 hours',
      icon: '🔐',
      color: 'from-red-500 to-orange-600',
      featured: true,
      learningGoals: [
        'JWT token structure and usage',
        'Password hashing with bcrypt',
        'Refresh token rotation',
        'Session management',
        'Security best practices'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Auth Setup',
          description: 'Install authentication dependencies',
          type: 'setup',
          code: `npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs`,
          explanation: 'JWT (JSON Web Tokens) are stateless authentication tokens. Bcrypt securely hashes passwords.',
          learningPoints: [
            'JWTs are stateless and scalable',
            'Bcrypt prevents rainbow table attacks',
            'Tokens can include user claims',
            'Refresh tokens extend sessions securely'
          ],
          difficulty: 'advanced',
          completed: false
        },
        {
          id: 'hash',
          title: 'Password Hashing',
          description: 'Implement secure password hashing',
          type: 'logic',
          code: `import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}`,
          explanation: 'Never store plain text passwords. Bcrypt uses a salt to make each hash unique.',
          learningPoints: [
            'Hashing is one-way encryption',
            'Salting prevents rainbow table attacks',
            'Work factor controls hashing cost',
            'Comparison must use bcrypt.compare'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    
    // Advanced Projects
    {
      id: 'ecommerce',
      name: 'E-commerce Store',
      description: 'Create a full-featured e-commerce store with shopping cart, product filtering, payment integration, and order management.',
      category: 'fullstack',
      difficulty: 'advanced',
      estimatedTime: '8-10 hours',
      icon: '🛒',
      color: 'from-purple-500 to-pink-600',
      featured: true,
      learningGoals: [
        'Next.js App Router and Server Components',
        'State management with Zustand',
        'Payment integration (Stripe)',
        'Product catalog and filtering',
        'Order processing workflow'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Next.js Project Setup',
          description: 'Initialize Next.js with TypeScript and required dependencies',
          type: 'setup',
          code: `npx create-next-app@latest ecommerce-store --typescript --tailwind --app
cd ecommerce-store
npm install zustand stripe`,
          explanation: 'We set up a Next.js project with the App Router, TypeScript, and Tailwind CSS.',
          learningPoints: [
            'Next.js App Router for modern React',
            'Server Components for better performance',
            'TypeScript for type safety'
          ],
          difficulty: 'beginner',
          completed: false
        }
      ]
    },
    {
      id: 'real-time-chat',
      name: 'Real-time Chat Application',
      description: 'Build a real-time chat app with WebSockets, message persistence, user presence, and typing indicators.',
      category: 'fullstack',
      difficulty: 'advanced',
      estimatedTime: '6-8 hours',
      icon: '💬',
      color: 'from-blue-500 to-indigo-600',
      learningGoals: [
        'WebSocket connections and Socket.io',
        'Real-time bidirectional communication',
        'Message persistence and history',
        'User presence and typing indicators',
        'Room management and scaling'
      ],
      steps: [
        {
          id: 'setup',
          title: 'WebSocket Server Setup',
          description: 'Set up Socket.io server for real-time communication',
          type: 'setup',
          code: `npm install socket.io express cors
npm install -D typescript @types/express`,
          explanation: 'WebSockets enable real-time communication. Socket.io provides a robust implementation with fallbacks.',
          learningPoints: [
            'WebSockets enable bidirectional communication',
            'Socket.io adds features like rooms and namespaces',
            'Real-time apps need connection management',
            'Scaling requires Redis or similar'
          ],
          difficulty: 'advanced',
          completed: false
        },
        {
          id: 'events',
          title: 'Handle Socket Events',
          description: 'Implement message sending, receiving, and user events',
          type: 'logic',
          code: `// Server
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });
  
  socket.on('send-message', (data) => {
    socket.to(data.roomId).emit('new-message', data);
  });
});`,
          explanation: 'Socket events handle real-time actions. Rooms organize users into channels.',
          learningPoints: [
            'Events are named actions',
            'Rooms group connected clients',
            'Broadcasting sends to multiple clients',
            'Error handling is crucial for stability'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'devops-tool',
      name: 'DevOps Automation Tool',
      description: 'Create a tool for automating deployments, monitoring, and infrastructure management with CI/CD pipelines.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '6-8 hours',
      icon: '🚀',
      color: 'from-orange-500 to-red-600',
      learningGoals: [
        'CI/CD pipeline concepts',
        'Docker containerization',
        'GitHub Actions or similar',
        'Infrastructure as Code',
        'Monitoring and logging'
      ],
      steps: [
        {
          id: 'setup',
          title: 'DevOps Tool Setup',
          description: 'Initialize project with deployment automation',
          type: 'setup',
          code: `npm install commander inquirer axios
npm install -D @types/node typescript`,
          explanation: 'DevOps tools automate repetitive infrastructure tasks. We\'ll build a tool that integrates with common DevOps services.',
          learningPoints: [
            'Automation reduces manual errors',
            'CI/CD pipelines test and deploy automatically',
            'Infrastructure as Code is version-controlled',
            'Monitoring ensures system health'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'data-visualization',
      name: 'Data Visualization Dashboard',
      description: 'Build a dashboard for visualizing data with charts, graphs, filters, and real-time updates.',
      category: 'react',
      difficulty: 'advanced',
      estimatedTime: '5-6 hours',
      icon: '📊',
      color: 'from-pink-500 to-rose-600',
      learningGoals: [
        'Data visualization libraries (D3, Recharts)',
        'Chart types and when to use them',
        'Data filtering and aggregation',
        'Real-time data updates',
        'Performance optimization for large datasets'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Dashboard Setup',
          description: 'Initialize project with visualization libraries',
          type: 'setup',
          code: `npm create vite@latest data-dashboard -- --template react-ts
cd data-dashboard
npm install recharts d3 date-fns`,
          explanation: 'Data visualization helps understand complex data. Recharts provides React chart components.',
          learningPoints: [
            'Choose charts based on data type',
            'D3.js offers fine-grained control',
            'Performance matters with large datasets',
            'Accessibility is important for dashboards'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'testing-framework',
      name: 'Testing Framework Utility',
      description: 'Create a custom testing utility or framework for automated testing, mocking, and test reporting.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '5-6 hours',
      icon: '🧪',
      color: 'from-emerald-500 to-green-600',
      learningGoals: [
        'Test framework architecture',
        'Mocking and stubbing techniques',
        'Test runners and reporters',
        'Assertion libraries',
        'Code coverage analysis'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Testing Framework Setup',
          description: 'Initialize testing utility project',
          type: 'setup',
          code: `mkdir test-framework && cd test-framework
npm init -y
npm install chalk glob
npm install -D typescript @types/node`,
          explanation: 'Testing frameworks provide structure for writing and running tests. Understanding their internals improves your testing skills.',
          learningPoints: [
            'Test frameworks organize test suites',
            'Mocking isolates units under test',
            'Reporters format test results',
            'Coverage shows what\'s tested'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      description: 'Build an API gateway that routes requests, handles authentication, rate limiting, and request/response transformation.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '7-9 hours',
      icon: '🌐',
      color: 'from-violet-500 to-purple-600',
      learningGoals: [
        'Microservices architecture',
        'API routing and load balancing',
        'Rate limiting and throttling',
        'Request/response transformation',
        'Service discovery patterns'
      ],
      steps: [
        {
          id: 'setup',
          title: 'API Gateway Setup',
          description: 'Initialize gateway with routing and middleware',
          type: 'setup',
          code: `npm install express http-proxy-middleware express-rate-limit
npm install -D typescript @types/express`,
          explanation: 'API gateways act as a single entry point for multiple services. They handle cross-cutting concerns like auth and rate limiting.',
          learningPoints: [
            'Gateways centralize common concerns',
            'Proxy middleware forwards requests',
            'Rate limiting prevents abuse',
            'Service discovery finds backends'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'file-processor',
      name: 'File Processing Tool',
      description: 'Build a tool for processing files (CSV, JSON, XML) with transformations, validation, and batch operations.',
      category: 'node',
      difficulty: 'intermediate',
      estimatedTime: '3-4 hours',
      icon: '📁',
      color: 'from-slate-500 to-gray-600',
      learningGoals: [
        'File I/O operations',
        'Stream processing for large files',
        'Data transformation pipelines',
        'Error handling and validation',
        'Memory management'
      ],
      steps: [
        {
          id: 'setup',
          title: 'File Processor Setup',
          description: 'Initialize project with file processing libraries',
          type: 'setup',
          code: `npm install csv-parser json2csv xml2js
npm install -D typescript @types/node`,
          explanation: 'File processing is common in development. Streams handle large files efficiently.',
          learningPoints: [
            'Streams process data incrementally',
            'Different formats need different parsers',
            'Validation ensures data quality',
            'Error handling prevents crashes'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'monitoring-tool',
      name: 'Application Monitoring Tool',
      description: 'Create a monitoring tool that tracks application metrics, logs, errors, and performance data.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '6-7 hours',
      icon: '📈',
      color: 'from-amber-500 to-yellow-600',
      learningGoals: [
        'Metrics collection and aggregation',
        'Log parsing and analysis',
        'Error tracking and alerting',
        'Performance monitoring',
        'Dashboard creation'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Monitoring Setup',
          description: 'Initialize monitoring tool with metrics collection',
          type: 'setup',
          code: `npm install prom-client winston
npm install -D typescript @types/node`,
          explanation: 'Monitoring tools help understand application behavior. Prometheus format is standard for metrics.',
          learningPoints: [
            'Metrics track application health',
            'Logs provide debugging information',
            'Alerting notifies on issues',
            'Dashboards visualize metrics'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'code-generator',
      name: 'Code Generator Tool',
      description: 'Build a tool that generates code from templates, scaffolds projects, and creates boilerplate code.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '5-6 hours',
      icon: '⚙️',
      color: 'from-sky-500 to-blue-600',
      learningGoals: [
        'Template engines and code generation',
        'AST manipulation',
        'Project scaffolding',
        'Code transformation',
        'Developer tooling'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Code Generator Setup',
          description: 'Initialize generator with template engine',
          type: 'setup',
          code: `npm install handlebars inquirer fs-extra
npm install -D typescript @types/node`,
          explanation: 'Code generators automate repetitive coding tasks. Templates define the structure.',
          learningPoints: [
            'Templates define code structure',
            'AST manipulation transforms code',
            'Scaffolding creates project structure',
            'Generators save developer time'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'task-queue',
      name: 'Task Queue System',
      description: 'Build a background job processing system with queues, workers, retries, and job scheduling.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '6-8 hours',
      icon: '🔄',
      color: 'from-rose-500 to-pink-600',
      learningGoals: [
        'Queue concepts and patterns',
        'Worker processes and job execution',
        'Retry strategies and error handling',
        'Job scheduling and prioritization',
        'Scalability and concurrency'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Task Queue Setup',
          description: 'Initialize queue system with Redis or in-memory queue',
          type: 'setup',
          code: `npm install bullmq ioredis
npm install -D typescript @types/node`,
          explanation: 'Task queues process work asynchronously. BullMQ provides a robust queue implementation.',
          learningPoints: [
            'Queues decouple producers and consumers',
            'Workers process jobs in parallel',
            'Retries handle transient failures',
            'Priority queues process important jobs first'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'graphql-api',
      name: 'GraphQL API Server',
      description: 'Build a GraphQL API with type definitions, resolvers, queries, mutations, and subscriptions.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '5-6 hours',
      icon: '🔷',
      color: 'from-indigo-500 to-blue-600',
      learningGoals: [
        'GraphQL schema design',
        'Resolvers and data fetching',
        'Queries, mutations, and subscriptions',
        'N+1 query problem and DataLoader',
        'API versioning and evolution'
      ],
      steps: [
        {
          id: 'setup',
          title: 'GraphQL Setup',
          description: 'Initialize GraphQL server with Apollo or GraphQL.js',
          type: 'setup',
          code: `npm install apollo-server graphql
npm install -D typescript @types/node`,
          explanation: 'GraphQL provides a flexible API. Clients request exactly what they need.',
          learningPoints: [
            'GraphQL is query language for APIs',
            'Schema defines available data',
            'Resolvers fetch data',
            'Single endpoint simplifies clients'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'microservices',
      name: 'Microservices Architecture',
      description: 'Build a microservices system with service discovery, inter-service communication, and distributed tracing.',
      category: 'fullstack',
      difficulty: 'advanced',
      estimatedTime: '10-12 hours',
      icon: '🔗',
      color: 'from-cyan-500 to-teal-600',
      learningGoals: [
        'Microservices architecture patterns',
        'Service communication (REST, gRPC)',
        'Service discovery and registry',
        'Distributed tracing',
        'Fault tolerance and resilience'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Microservices Setup',
          description: 'Initialize multiple services with inter-service communication',
          type: 'setup',
          code: `# Create service directories
mkdir user-service product-service order-service
# Each service has its own package.json and dependencies`,
          explanation: 'Microservices break applications into independent services. Each service owns its data.',
          learningPoints: [
            'Services are independently deployable',
            'Communication happens via APIs',
            'Service discovery finds services',
            'Tracing follows requests across services'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'webhook-service',
      name: 'Webhook Service',
      description: 'Build a webhook service that receives, validates, queues, and processes webhook events from external services.',
      category: 'node',
      difficulty: 'intermediate',
      estimatedTime: '4-5 hours',
      icon: '🪝',
      color: 'from-lime-500 to-green-600',
      learningGoals: [
        'Webhook architecture and patterns',
        'Event validation and security',
        'Idempotency and retries',
        'Webhook delivery and reliability',
        'Event processing pipelines'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Webhook Service Setup',
          description: 'Initialize webhook receiver with validation',
          type: 'setup',
          code: `npm install express crypto
npm install -D typescript @types/express`,
          explanation: 'Webhooks enable event-driven integrations. Services notify your app of events.',
          learningPoints: [
            'Webhooks are HTTP callbacks',
            'Signatures verify authenticity',
            'Idempotency prevents duplicate processing',
            'Queues handle high volume'
          ],
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      id: 'cache-layer',
      name: 'Caching Layer',
      description: 'Build a caching system with Redis, cache invalidation strategies, and cache warming.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '4-5 hours',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-600',
      learningGoals: [
        'Caching strategies (LRU, TTL)',
        'Cache invalidation patterns',
        'Redis operations and data structures',
        'Cache warming and preloading',
        'Performance optimization'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Cache Setup',
          description: 'Initialize Redis cache with connection pooling',
          type: 'setup',
          code: `npm install ioredis
npm install -D typescript @types/node`,
          explanation: 'Caching reduces database load and improves response times. Redis is an in-memory data store.',
          learningPoints: [
            'Caches store frequently accessed data',
            'TTL controls cache expiration',
            'Invalidation updates stale data',
            'Redis is fast and versatile'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'search-engine',
      name: 'Search Engine',
      description: 'Build a search engine with indexing, full-text search, ranking algorithms, and autocomplete.',
      category: 'node',
      difficulty: 'advanced',
      estimatedTime: '7-9 hours',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-600',
      learningGoals: [
        'Inverted index data structure',
        'Full-text search algorithms',
        'Ranking and relevance scoring',
        'Autocomplete and suggestions',
        'Search optimization'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Search Engine Setup',
          description: 'Initialize search with indexing library',
          type: 'setup',
          code: `npm install flexsearch
npm install -D typescript @types/node`,
          explanation: 'Search engines index documents for fast retrieval. Inverted indexes map terms to documents.',
          learningPoints: [
            'Indexing enables fast search',
            'Inverted indexes map terms to docs',
            'Ranking determines relevance',
            'Autocomplete improves UX'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      id: 'analytics-platform',
      name: 'Analytics Platform',
      description: 'Build an analytics platform that tracks events, aggregates data, and provides insights and dashboards.',
      category: 'fullstack',
      difficulty: 'advanced',
      estimatedTime: '8-10 hours',
      icon: '📊',
      color: 'from-violet-500 to-purple-600',
      learningGoals: [
        'Event tracking and collection',
        'Data aggregation and processing',
        'Time-series data storage',
        'Analytics queries and reporting',
        'Real-time dashboards'
      ],
      steps: [
        {
          id: 'setup',
          title: 'Analytics Setup',
          description: 'Initialize analytics with event tracking',
          type: 'setup',
          code: `npm install express postgresql
npm install -D typescript @types/express`,
          explanation: 'Analytics platforms track user behavior. Events are collected and aggregated for insights.',
          learningPoints: [
            'Events track user actions',
            'Aggregation summarizes data',
            'Time-series DBs handle temporal data',
            'Dashboards visualize metrics'
          ],
          difficulty: 'advanced',
          completed: false
        }
      ]
    }
  ];

  const filteredTemplates = projectTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', 'react', 'nextjs', 'vue', 'node', 'fullstack', 'mobile', 'devops', 'tools'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const startProject = (template: ProjectTemplate) => {
    setCurrentProject(template);
    setCurrentStepIndex(0);
    
    addNotification({
      type: 'learning',
      title: 'Project Started!',
      message: `You're now building ${template.name}. Let's learn as we code!`,
      read: false
    });
  };

  const completeStep = () => {
    if (!currentProject) return;

    const currentStep = currentProject.steps[currentStepIndex];
    
    // Mark step as completed
    const updatedSteps = [...currentProject.steps];
    updatedSteps[currentStepIndex] = { ...currentStep, completed: true };
    setCurrentProject({ ...currentProject, steps: updatedSteps });
    
    // Add learning points
    addAISuggestion({
      type: 'explanation',
      content: `Great job completing: ${currentStep.title}. ${currentStep.explanation}`,
      priority: 'medium',
      requiresUserAction: false,
      dismissed: false
    });

    // Move to next step or complete project
    if (currentStepIndex < currentProject.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      addNotification({
        type: 'achievement',
        title: 'Project Complete!',
        message: `Congratulations! You've built ${currentProject.name} and learned valuable skills.`,
        read: false
      });
    }
  };

  const getStepIcon = (type: ProjectStep['type']) => {
    switch (type) {
      case 'setup':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'component':
        return <Code className="w-4 h-4 text-green-500" />;
      case 'logic':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'styling':
        return <Wand2 className="w-4 h-4 text-pink-500" />;
      case 'testing':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'optimization':
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'advanced':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  if (!projectBuilderOpen) return null;

  return (
    <div className="w-[600px] bg-white border-l border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-gray-900" />
          </div>
            <div>
            <h2 className="text-lg font-semibold text-gray-900">
                AI Project Builder
              </h2>
            <p className="text-xs text-gray-500">
              Step-by-step project tutorials
              </p>
            </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!currentProject ? (
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                ))}
              </select>
        </div>

            {/* Projects List */}
            <div className="space-y-3">
              {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => startProject(template)}
                  className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-xl flex-shrink-0`}>
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedTime}</span>
                    </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Target className="w-3 h-3" />
                          <span>{template.steps.length} steps</span>
                  </div>
              </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No projects found</p>
            </div>
          )}
            </div>
          </div>
        ) : (
          /* Current Project View */
          <div className="flex h-full">
              {/* Steps Sidebar */}
            <div className="w-48 border-r border-gray-100 dark:border-gray-900 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => {
                  setCurrentProject(null);
                  setCurrentStepIndex(0);
                }}
                className="flex items-center space-x-2 w-full mb-4 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Steps</h3>
                <div className="space-y-2">
                  {currentProject.steps.map((step, index) => (
                    <div
                      key={step.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        index === currentStepIndex
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 shadow-sm'
                          : step.completed
                        ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    onClick={() => setCurrentStepIndex(index)}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {getStepIcon(step.type)}
                      {step.completed && <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />}
                      </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{step.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{index + 1}/{currentProject.steps.length}</div>
                    </div>
                  ))}
                </div>
              </div>

            {/* Step Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {currentProject.steps[currentStepIndex] ? (
                <div>
                      <div className="flex items-center space-x-2 mb-4">
                        {getStepIcon(currentProject.steps[currentStepIndex].type)}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {currentProject.steps[currentStepIndex].title}
                        </h3>
                      </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                        {currentProject.steps[currentStepIndex].description}
                      </p>

                      {/* Code Block */}
                  <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono">{currentProject.steps[currentStepIndex].code}</pre>
                      </div>

                      {/* Explanation */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-900">
                        <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Why this matters</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {currentProject.steps[currentStepIndex].explanation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Learning Points */}
                      <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Learning Points</h4>
                        <ul className="space-y-2">
                          {currentProject.steps[currentStepIndex].learningPoints.map((point, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                              <Target className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                  {/* User Input */}
                      <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      What did you learn?
                        </label>
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Share your understanding..."
                      className="w-full h-24 p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none text-sm"
                        />
                    </div>

                    {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Step {currentStepIndex + 1} of {currentProject.steps.length}
                      </div>
                        <button
                      onClick={completeStep}
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                        >
                      <span>{currentStepIndex === currentProject.steps.length - 1 ? 'Complete' : 'Next Step'}</span>
                      <ArrowRight className="w-4 h-4" />
                        </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Project Complete!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You've completed all steps</p>
                        <button
                      onClick={() => {
                        setCurrentProject(null);
                        setCurrentStepIndex(0);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Start New Project
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AIProjectBuilder;
