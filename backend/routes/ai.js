const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use GPT-4o (latest model) or fallback to GPT-4 Turbo
// You can override this with OPENAI_MODEL environment variable
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Chat endpoint for AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, context, userLevel = 'intermediate' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create educational prompt based on user level and context
    const systemPrompt = `You are an expert coding teacher and mentor for DataAIFair IDE. Your role is to teach like a patient, thorough teacher who breaks down complex concepts into simple, digestible steps.

TEACHING STYLE - Be like a great teacher:
1. **Step-by-step explanations**: Break down every concept into numbered steps (Step 1, Step 2, etc.)
2. **Start with the basics**: Always explain what each part does before moving to the next
3. **Use analogies**: Compare programming concepts to real-world examples when helpful
4. **Show the "why"**: Explain not just what the code does, but WHY we write it this way
5. **Build incrementally**: Start simple, then add complexity step by step
6. **Check understanding**: Ask questions to ensure the student is following along
7. **Be encouraging**: Use positive, supportive language like "Great question!" or "Let's break this down together"
8. **Use clear structure**: Organize explanations with headers, bullet points, and clear sections

EXPLANATION FORMAT:
- Start with a brief overview of what we're learning
- Break down the code/concept into numbered steps
- Explain each step in detail before moving to the next
- Use examples and analogies to clarify
- Summarize key takeaways at the end
- Suggest practice exercises or next steps

User skill level: ${userLevel}
Current context: ${context || 'General coding assistance'}

Remember: Teach like you're explaining to a student sitting next to you, not like you're writing documentation. Be conversational, clear, and thorough.`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Extract learning points and suggestions
    const learningPoints = extractLearningPoints(response);
    const suggestions = generateSuggestions(message, response);

    res.json({
      id: uuidv4(),
      response,
      learningPoints,
      suggestions,
      timestamp: new Date().toISOString(),
      userLevel
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      message: error.message 
    });
  }
});

// Code generation endpoint
router.post('/generate-code', async (req, res) => {
  try {
    const { description, type, language, complexity, context } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const systemPrompt = `You are an expert Python data science teacher for DataAIFair IDE. Generate complete, runnable ${type} code in ${language} with step-by-step, teacher-like explanations.

IMPORTANT RULES:
1. NEVER reference external files (CSV, JSON, etc.) that don't exist. Instead, generate sample data using:
   - pandas: Create DataFrames from dictionaries or use pd.DataFrame()
   - seaborn: Use sns.load_dataset() for sample datasets (tips, iris, flights, etc.)
   - numpy: Generate random data with np.random
   - Manual data creation: Use dictionaries or lists

2. When the user asks for data analysis, visualizations, or data work, ALWAYS generate actual working code using libraries like pandas, matplotlib, seaborn, numpy.

3. For any dataset requests (covid, sales, etc.), create sample data programmatically - DO NOT use pd.read_csv() unless the file is guaranteed to exist.

TEACHING STYLE - Explain like a teacher:
- Break down the explanation into clear, numbered steps
- Start with an overview: "In this code, we're going to..."
- Explain each section step-by-step: "Step 1: First, we import...", "Step 2: Next, we create...", etc.
- Explain WHY we do each step, not just WHAT it does
- Use simple language and analogies when helpful
- Show the progression: how each step builds on the previous one
- End with a summary: "To summarize, we've learned..."

Requirements:
- Generate complete, runnable code that can be executed immediately WITHOUT external files
- Include all necessary imports (pandas, matplotlib, seaborn, numpy, etc.)
- For data analysis requests, ALWAYS generate sample data programmatically or use built-in datasets
- Include comprehensive comments in the code explaining each part
- Provide step-by-step educational explanation that teaches the concepts
- Include learning points and best practices
- Show the "why" behind implementation decisions
- Complexity level: ${complexity}
- ALWAYS include code in the response - never just explain without code

Context: ${context || 'No specific context provided'}

For data visualization requests, generate complete code including:
- Import statements
- Sample data generation (NOT file loading) or use sns.load_dataset()
- Plot creation with seaborn/matplotlib
- plt.show() or display commands

Example of good data generation:
\`\`\`python
# Generate sample data for COVID visualization
dates = pd.date_range(start='2020-01-01', periods=100, freq='D')
data = pd.DataFrame({
    'date': dates,
    'cases': np.random.randint(100, 1000, 100).cumsum(),
    'deaths': np.random.randint(5, 50, 100).cumsum()
})
\`\`\`

Format your response as JSON with:
{
  "code": "the complete, runnable generated code with inline comments",
  "explanation": "STEP-BY-STEP teacher-like explanation. Start with an overview, then break into numbered steps (Step 1, Step 2, etc.), explain each step in detail, and end with a summary. Be conversational and educational.",
  "learningPoints": ["point1", "point2", "point3"],
  "dependencies": ["pandas", "matplotlib", "seaborn"],
  "usage": "how to use this code",
  "nextSteps": "suggestions for further learning"
}

CRITICAL: 
- The "code" field must contain actual, complete Python code that can be executed WITHOUT external files
- The "explanation" field must be a step-by-step, teacher-like explanation with numbered steps`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${type} code for: ${description}` }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response, fallback to text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      parsedResponse = {
        code: response,
        explanation: "Generated code with educational context",
        learningPoints: ["Review the code structure", "Understand the implementation", "Practice with variations"],
        dependencies: [],
        usage: "Use this code as a starting point for your project",
        nextSteps: "Experiment with the code and try modifications"
      };
    }

    res.json({
      id: uuidv4(),
      ...parsedResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code',
      message: error.message 
    });
  }
});

// Project building endpoint
router.post('/build-project', async (req, res) => {
  try {
    const { projectType, description, userLevel = 'intermediate' } = req.body;

    if (!projectType || !description) {
      return res.status(400).json({ error: 'Project type and description are required' });
    }

    const systemPrompt = `You are an expert project architect for DataAIFair IDE. Create a step-by-step project building plan with educational focus.

Project: ${projectType} - ${description}
User Level: ${userLevel}

Create a comprehensive project plan that teaches while building. Each step should:
1. Have clear educational objectives
2. Include code examples with explanations
3. Teach important concepts
4. Build upon previous steps
5. Encourage understanding, not just copying

Format as JSON with:
{
  "projectName": "Project Name",
  "description": "Project description",
  "estimatedTime": "X hours",
  "difficulty": "beginner|intermediate|advanced",
  "steps": [
    {
      "id": "step1",
      "title": "Step Title",
      "description": "What this step accomplishes",
      "type": "setup|component|logic|styling|testing",
      "code": "code example",
      "explanation": "why this matters",
      "learningPoints": ["point1", "point2"],
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "learningGoals": ["goal1", "goal2", "goal3"],
  "technologies": ["tech1", "tech2", "tech3"]
}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a project plan for: ${description}` }
      ],
      max_tokens: 3000,
      temperature: 0.4,
    });

    const response = completion.choices[0].message.content;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      // Fallback project structure
      parsedResponse = {
        projectName: description,
        description: `A ${projectType} project to learn modern development practices`,
        estimatedTime: "2-3 hours",
        difficulty: userLevel,
        steps: [
          {
            id: "setup",
            title: "Project Setup",
            description: "Initialize the project with necessary dependencies",
            type: "setup",
            code: "# Project setup code",
            explanation: "Setting up the foundation for your project",
            learningPoints: ["Project structure", "Dependency management"],
            difficulty: "beginner"
          }
        ],
        learningGoals: ["Learn modern development practices", "Understand project structure"],
        technologies: ["React", "TypeScript", "Modern tooling"]
      };
    }

    res.json({
      id: uuidv4(),
      ...parsedResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Project building error:', error);
    res.status(500).json({ 
      error: 'Failed to build project plan',
      message: error.message 
    });
  }
});

// Code generation from CSV endpoint
router.post('/generate-code-from-csv', async (req, res) => {
  try {
    const { description, fileName, csvData, csvHeaders, csvPreview, context } = req.body;

    if (!description || !csvData) {
      return res.status(400).json({ error: 'Description and CSV data are required' });
    }

    // Escape the CSV data for embedding in Python triple-quoted strings
    // Replace backslashes and triple quotes to avoid breaking the string
    const escapedCsvData = csvData
      .replace(/\\/g, '\\\\')  // Escape backslashes
      .replace(/"""/g, '\\"\\"\\"');  // Escape triple quotes
    const headers = csvHeaders || [];
    const sampleRows = csvPreview || [];

    const systemPrompt = `You are an expert Python data science teacher for DataAIFair IDE. Generate complete, runnable Python code to analyze and visualize data from a CSV file.

IMPORTANT RULES:
1. The user has uploaded a CSV file named "${fileName}" with the following columns: ${headers.join(', ')}
2. The CSV file is already stored in the file storage system and is accessible in the current working directory
3. You can directly use pd.read_csv('${fileName}') - the file is already available in the working directory
4. Generate code that:
   - Loads the CSV file directly using pd.read_csv('${fileName}')
   - Explores the data (head(), info(), describe())
   - Creates appropriate visualizations based on the data structure
   - Uses matplotlib/seaborn for plotting
   - Includes plt.show() to display plots
5. Make the code educational with step-by-step comments
6. Choose appropriate visualization types based on the data (line plots for time series, bar charts for categories, scatter plots for relationships, etc.)

CSV File Information:
- File name: ${fileName}
- Columns: ${headers.join(', ')}
- Sample data (first few rows):
${JSON.stringify(sampleRows, null, 2)}

TEACHING STYLE - Explain like a teacher:
- Break down the explanation into clear, numbered steps
- Start with an overview: "In this code, we're going to..."
- Explain each section step-by-step: "Step 1: First, we save the CSV data...", "Step 2: Next, we load it...", etc.
- Explain WHY we do each step, not just WHAT it does
- Use simple language and analogies when helpful
- Show the progression: how each step builds on the previous one
- End with a summary: "To summarize, we've learned..."

Format your response as JSON with:
{
  "code": "the complete, runnable Python code that: 1) saves the CSV data to a file, 2) loads it with pd.read_csv(), and 3) creates visualizations. Include the CSV data as a multi-line string variable at the start.",
  "explanation": "STEP-BY-STEP teacher-like explanation. Start with an overview, then break into numbered steps (Step 1, Step 2, etc.), explain each step in detail, and end with a summary. Be conversational and educational.",
  "learningPoints": ["point1", "point2", "point3"],
  "dependencies": ["pandas", "matplotlib", "seaborn"],
  "usage": "how to use this code",
  "nextSteps": "suggestions for further learning"
}

CRITICAL: 
- The "code" field should directly use pd.read_csv('${fileName}') - the file is already in the working directory
- DO NOT create the CSV file from a string - it's already stored and accessible
- The "explanation" field must be a step-by-step, teacher-like explanation with numbered steps`;

    const userPrompt = `Generate Python code to ${description} using the CSV file "${fileName}".

The CSV file has these columns: ${headers.join(', ')}.

IMPORTANT: The CSV file "${fileName}" is already uploaded and stored in the file storage system. Your code should:
1. Directly load the CSV file using pd.read_csv('${fileName}') - it's already in the working directory
2. Explore the data structure
3. Create appropriate visualizations
4. Provide insights about the data

The file is accessible in the current working directory, so you can use pd.read_csv('${fileName}') directly.

Make it educational and step-by-step.`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2500,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response, fallback to text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      parsedResponse = {
        code: response,
        explanation: "Generated code to analyze and visualize the CSV data",
        learningPoints: ["CSV file loading", "Data exploration", "Data visualization"],
        dependencies: ["pandas", "matplotlib", "seaborn"],
        usage: "Run this code to analyze your CSV file",
        nextSteps: "Try modifying the visualizations or adding more analysis"
      };
    }

    // Note: CSV file is already stored in file storage, so code can use pd.read_csv() directly
    // No need to prepend CSV data - the file is accessible in the working directory

    res.json({
      id: uuidv4(),
      ...parsedResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('CSV code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code from CSV',
      message: error.message 
    });
  }
});

// Generate guiding questions endpoint
router.post('/generate-questions', async (req, res) => {
  try {
    const { code, explanation, userMessage } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const systemPrompt = `You are an expert coding educator and codebase analyst. Generate 2 specific, educational questions that help students understand how this code fits into the larger codebase and data science ecosystem.

The questions should:
1. Focus on codebase understanding - how this code relates to the project structure, dependencies, and patterns
2. Be specific to THIS exact code and the libraries/frameworks it uses
3. Test understanding of how this code would interact with other parts of a data science project
4. Encourage critical thinking about codebase architecture and design decisions
5. Reference specific libraries, patterns, or concepts that are part of the data science stack (pandas, matplotlib, seaborn, numpy, etc.)
6. Ask about the "why" behind architecture choices, not just "what" the code does
7. Help students understand how this code fits into a larger data analysis workflow

Examples of good codebase-focused questions:
- "Why do we import pandas at the top of the file, and how does this relate to the module system in Python?"
- "How would this DataFrame creation pattern scale if you had real-world data from a CSV file instead of a dictionary?"
- "What other parts of a data analysis project would typically come before creating this visualization?"
- "How does matplotlib's backend system work, and why does this affect how we display plots in this environment?"

Respond with a JSON object with a "questions" array containing exactly 2 questions. Format: {"questions": ["question1", "question2"]}`;

    const userPrompt = `Code:
\`\`\`python
${code}
\`\`\`

Explanation: ${explanation || 'No explanation provided'}

User's request: ${userMessage || 'No context provided'}

Codebase Context:
This is a DataAIFair IDE - a Jupyter-style notebook environment for data science learning. The project structure includes:
- Backend: FastAPI server (main.py) handling code execution via Jupyter kernels
- Frontend: React/TypeScript notebook interface with Monaco editor
- Kernel Manager: Manages Python kernels, captures output, plots, and variables
- Key libraries used: pandas, numpy, matplotlib, seaborn, plotly
- The system uses Jupyter kernels (via jupyter_client) to execute Python code
- Plots are captured and displayed via IPython.display system
- Variables are tracked through the kernel's execution state

Generate 2 specific questions about how this code fits into THIS codebase and data science ecosystem. Focus on:
- How this code interacts with the kernel execution system
- Why certain library choices were made (pandas vs numpy, seaborn vs matplotlib)
- How this code would fit into a larger data analysis workflow
- Architecture decisions: why plots need special handling, how variables are tracked
- Project organization: how this notebook code relates to backend execution
- Data science best practices: when to use each library, workflow patterns

Make questions specific to THIS code and THIS codebase structure. Ask about:
- The "why" behind library choices and patterns
- How this code would scale in a real project
- Integration points with the execution system
- Architecture and design decisions

Return as JSON: {"questions": ["question1", "question2"]}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(response);
      
      // Handle different possible JSON structures
      if (Array.isArray(parsed)) {
        return res.json({ questions: parsed.slice(0, 2) });
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        return res.json({ questions: parsed.questions.slice(0, 2) });
      } else if (parsed.question1 && parsed.question2) {
        return res.json({ questions: [parsed.question1, parsed.question2] });
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract from text
      const arrayMatch = response.match(/\["([^"]+)",\s*"([^"]+)"\]/);
      if (arrayMatch) {
        return res.json({ questions: [arrayMatch[1], arrayMatch[2]] });
      }
    }

    // Fallback: return generic questions
    res.json({
      questions: [
        "Can you explain what this code does in your own words?",
        "What would happen if you modified one part of this code?"
      ]
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: error.message,
      questions: [
        "Can you explain what this code does in your own words?",
        "What would happen if you modified one part of this code?"
      ]
    });
  }
});

// Learning suggestions endpoint
router.post('/learning-suggestions', async (req, res) => {
  try {
    const { codeContent, fileType, userProgress } = req.body;

    const systemPrompt = `You are an expert code reviewer and learning mentor. Analyze the provided code and suggest learning opportunities.

Code Type: ${fileType}
User Progress: ${JSON.stringify(userProgress)}

Provide educational suggestions that:
1. Identify learning opportunities in the code
2. Suggest improvements and best practices
3. Explain concepts that could be better understood
4. Recommend next steps for skill development
5. Focus on understanding, not just fixing

Format as JSON with:
{
  "suggestions": [
    {
      "type": "hint|question|explanation|challenge",
      "content": "suggestion text",
      "priority": "low|medium|high",
      "learningPoints": ["point1", "point2"],
      "requiresUserAction": true|false
    }
  ],
  "insights": [
    {
      "type": "pattern|dependency|architecture|performance|security",
      "title": "Insight Title",
      "description": "What this insight means",
      "severity": "info|warning|error"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this code for learning opportunities:\n\n${codeContent}` }
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const response = completion.choices[0].message.content;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      parsedResponse = {
        suggestions: [
          {
            type: "hint",
            content: "Consider adding TypeScript interfaces for better type safety",
            priority: "medium",
            learningPoints: ["TypeScript interfaces", "Type safety"],
            requiresUserAction: true
          }
        ],
        insights: []
      };
    }

    res.json({
      id: uuidv4(),
      ...parsedResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Learning suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate learning suggestions',
      message: error.message 
    });
  }
});

// Helper functions
function extractLearningPoints(text) {
  const points = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('•') || line.includes('-') || line.includes('*')) {
      points.push(line.replace(/^[•\-*]\s*/, '').trim());
    }
  }
  
  return points.slice(0, 5); // Limit to 5 points
}

function generateSuggestions(userMessage, aiResponse) {
  const suggestions = [];
  
  if (userMessage.toLowerCase().includes('react')) {
    suggestions.push('How do I add state management?', 'What are React hooks?', 'How do I handle events?');
  }
  
  if (userMessage.toLowerCase().includes('typescript')) {
    suggestions.push('Explain TypeScript interfaces', 'What are generics?', 'How do I handle types?');
  }
  
  if (userMessage.toLowerCase().includes('component')) {
    suggestions.push('How do I create reusable components?', 'What is component composition?', 'How do I handle props?');
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Mock response generator for when API is unavailable
function generateMockChatResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('react')) {
    return {
      content: "Great question about React! React is a powerful library for building user interfaces. Let me explain the key concepts:\n\n**Components**: The building blocks of React apps. Think of them as reusable pieces of UI.\n\n**JSX**: A syntax extension that lets you write HTML-like code in JavaScript.\n\n**State**: Data that can change over time, managed with useState hook.\n\n**Props**: Data passed from parent to child components.\n\n**Hooks**: Functions that let you use state and other React features in functional components.\n\nTry building a simple component to practice these concepts!",
      learningPoints: [
        "Components are the foundation of React",
        "JSX combines HTML and JavaScript",
        "State management is crucial for dynamic apps",
        "Props enable component communication"
      ],
      suggestions: [
        "How do I create my first component?",
        "What's the difference between state and props?",
        "How do I handle user interactions?"
      ]
    };
  }
  
  if (lowerMessage.includes('typescript')) {
    return {
      content: "TypeScript is JavaScript with type safety! It helps catch errors before runtime and makes your code more maintainable.\n\n**Key Benefits**:\n- Type safety prevents bugs\n- Better IDE support with autocomplete\n- Self-documenting code\n- Easier refactoring\n\n**Basic Types**:\n- string, number, boolean\n- Arrays: string[], number[]\n- Objects with interfaces\n- Union types: string | number\n\nStart with simple types and gradually add more complex ones!",
      learningPoints: [
        "TypeScript adds type safety to JavaScript",
        "Interfaces define object shapes",
        "Union types allow multiple possibilities",
        "Type annotations help catch errors early"
      ],
      suggestions: [
        "How do I define interfaces?",
        "What are generics in TypeScript?",
        "How do I handle optional properties?"
      ]
    };
  }
  
  // Default response
  return {
    content: "I'd love to help you learn! Could you tell me more about what specific technology or concept you're working with? I can provide detailed explanations and learning resources.\n\nSome popular topics I can help with:\n- React and component development\n- TypeScript and type safety\n- JavaScript fundamentals\n- CSS and styling\n- Testing strategies\n- Performance optimization\n\nWhat would you like to explore?",
    learningPoints: [
      "Learning is a continuous process",
      "Practice with real projects",
      "Understand the fundamentals first",
      "Don't be afraid to experiment"
    ],
    suggestions: [
      "Tell me about React components",
      "Explain TypeScript basics",
      "How do I start a new project?",
      "What are best practices for coding?"
    ]
  };
}

module.exports = router;
