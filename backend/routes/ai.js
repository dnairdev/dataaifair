const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint for AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, context, userLevel = 'intermediate' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create educational prompt based on user level and context
    const systemPrompt = `You are an expert coding mentor and AI assistant for DataAIFair IDE. Your role is to help developers learn while coding, not just provide answers.

Key principles:
1. Always explain the "why" behind code decisions
2. Provide educational context, not just solutions
3. Encourage critical thinking and understanding
4. Adapt explanations to the user's skill level (${userLevel})
5. Focus on learning and skill development
6. Ask follow-up questions to deepen understanding

Current context: ${context || 'General coding assistance'}

Respond with:
- Clear explanations of concepts
- Code examples with detailed comments
- Learning points and best practices
- Questions to encourage deeper thinking
- Suggestions for further exploration`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
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

    const systemPrompt = `You are an expert code generator for DataAIFair IDE. Generate ${type} code in ${language} with educational explanations.

Requirements:
- Generate clean, production-ready code
- Include comprehensive comments explaining each part
- Provide educational context for every concept
- Include learning points and best practices
- Show the "why" behind implementation decisions
- Complexity level: ${complexity}

Context: ${context || 'No specific context provided'}

Format your response as JSON with:
{
  "code": "the generated code",
  "explanation": "detailed explanation of the code",
  "learningPoints": ["point1", "point2", "point3"],
  "dependencies": ["dep1", "dep2"],
  "usage": "how to use this code",
  "nextSteps": "suggestions for further learning"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
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
      model: "gpt-3.5-turbo-1106",
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
      model: "gpt-3.5-turbo-1106",
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
