const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

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

    // Get available files from file storage
    const availableFiles = await getAvailableFiles();
    const filesContext = availableFiles.length > 0 
      ? `\n\nAVAILABLE FILES IN FILE STORAGE:\nThe following files are already uploaded and accessible in the working directory:\n${availableFiles.map(f => {
          const fileName = f.original_name || f.filename || f.name || String(f);
          const fileType = f.file_type || f.type || 'unknown';
          return `- ${fileName} (${fileType})`;
        }).join('\n')}\n\nIf the user asks about data analysis or visualization, you CAN reference these files and suggest using them with pd.read_csv(), pd.read_json(), etc. Files are accessible directly by their filename in the current working directory.`
      : '';

    // Create educational prompt based on user level and context
    const systemPrompt = `You are an expert coding teacher and mentor for Coco. Your role is to teach like a patient, thorough teacher who breaks down complex concepts into simple, digestible steps.

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
Current context: ${context || 'General coding assistance'}${filesContext}

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

// Helper function to get available files from Python backend
async function getAvailableFiles() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/files',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            resolve(parsed.files || []);
          } else {
            console.error('[Backend] Error fetching files: HTTP', res.statusCode);
            resolve([]);
          }
        } catch (error) {
          console.error('[Backend] Error parsing files response:', error);
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      console.error('[Backend] Error fetching files:', error.message);
      resolve([]);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      console.error('[Backend] Timeout fetching files');
      resolve([]);
    });

    req.end();
  });
}

// Code generation endpoint
router.post('/generate-code', async (req, res) => {
  try {
    const { description, type, language, complexity, context } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Get available files from file storage
    const availableFiles = await getAvailableFiles();
    const filesContext = availableFiles.length > 0 
      ? `\n\nAVAILABLE FILES IN FILE STORAGE:\nThe following files are already uploaded and accessible in the working directory:\n${availableFiles.map(f => {
          const fileName = f.original_name || f.filename || f.name || String(f);
          const fileType = f.file_type || f.type || 'unknown';
          return `- ${fileName} (${fileType})`;
        }).join('\n')}\n\nYou CAN use these files in your code with pd.read_csv(), pd.read_json(), etc. The files are in the current working directory and can be accessed directly by filename.`
      : '\n\nNOTE: No files are currently uploaded to file storage. Generate sample data instead of reading from files.';

    const systemPrompt = `You are an expert Python data science teacher for Coco. Generate complete, runnable ${type} code in ${language} with step-by-step, teacher-like explanations.

IMPORTANT RULES:
1. **FILE ACCESS**: ${availableFiles.length > 0 
      ? `The following files are AVAILABLE in file storage: ${availableFiles.map(f => f.original_name || f.filename || f.name || String(f)).join(', ')}. You CAN and SHOULD use these files if they match what the user needs. Use pd.read_csv(), pd.read_json(), etc. to load them. Files are accessible directly by their filename in the current working directory.`
      : 'No files are currently uploaded. Generate sample data instead of reading from files.'}
   
2. If no files are available or the user's request doesn't match available files, generate sample data using:
   - pandas: Create DataFrames from dictionaries or use pd.DataFrame()
   - seaborn: Use sns.load_dataset() for sample datasets (tips, iris, flights, etc.)
   - numpy: Generate random data with np.random
   - Manual data creation: Use dictionaries or lists

3. When the user asks for data analysis, visualizations, or data work, ALWAYS generate actual working code using libraries like pandas, matplotlib, seaborn, numpy.

4. **PRIORITIZE AVAILABLE FILES**: If files are available and match the user's request, use them instead of generating sample data.

5. **CRITICAL - CODE CLEANLINESS**: 
   - The "code" field must contain CLEAN, production-ready code WITHOUT teaching comments like "Step 1:", "Step 2:", "First we...", "Next we...", etc.
   - Only include minimal, essential comments (e.g., "# Import libraries" or "# Create DataFrame")
   - NO step-by-step teaching language in the code itself
   - All teaching explanations go ONLY in the "explanation" field

6. **CSV + VISUALIZATION RULE**: 
   - When user asks for CSV data (e.g., "give me a csv with fake covid data"), you MUST:
     a) Generate the CSV data and save it using data.to_csv()
     b) ALSO create at least one visualization (plot, chart, graph) of the data
     c) Include plt.show() to display the visualization
     d) The code should create BOTH the CSV file AND show a plot

TEACHING STYLE - Explain like a teacher (in explanation field ONLY):
- Break down the explanation into clear, numbered steps
- Start with an overview: "In this code, we're going to..."
- Explain each section step-by-step: "Step 1: First, we import...", "Step 2: Next, we create...", etc.
- Explain WHY we do each step, not just WHAT it does
- Use simple language and analogies when helpful
- Show the progression: how each step builds on the previous one
- DO NOT include "To summarize" or summary sections - just end after the steps

Requirements:
- Generate complete, runnable code that can be executed immediately WITHOUT external files
- Include all necessary imports (pandas, matplotlib, seaborn, numpy, etc.)
- For data analysis requests, ALWAYS generate sample data programmatically or use built-in datasets
- Keep code clean and professional - NO teaching comments in code
- Provide step-by-step educational explanation in the "explanation" field that teaches the concepts
- Include learning points and best practices
- Show the "why" behind implementation decisions
- Complexity level: ${complexity}
- ALWAYS include code in the response - never just explain without code

Context: ${context || 'No specific context provided'}${filesContext}

For data visualization requests, generate complete code including:
- Import statements
- Sample data generation (NOT file loading) or use sns.load_dataset()
- Plot creation with seaborn/matplotlib
- plt.show() or display commands

Example of CLEAN code (what to generate):
\`\`\`python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

dates = pd.date_range(start='2020-01-01', periods=100, freq='D')
data = pd.DataFrame({
    'date': dates,
    'cases': np.random.randint(100, 1000, 100).cumsum(),
    'deaths': np.random.randint(5, 50, 100).cumsum()
})

data.to_csv('covid_data.csv', index=False)

plt.figure(figsize=(12, 6))
plt.plot(data['date'], data['cases'], label='Cases', linewidth=2)
plt.plot(data['date'], data['deaths'], label='Deaths', linewidth=2)
plt.title('COVID-19 Cases and Deaths Over Time')
plt.xlabel('Date')
plt.ylabel('Count')
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
\`\`\`

Format your response as JSON with:
{
  "code": "CLEAN, runnable Python code WITHOUT teaching comments. Only minimal essential comments.",
  "explanation": "STEP-BY-STEP teacher-like explanation. Start with an overview, then break into numbered steps (Step 1, Step 2, etc.), explain each step in detail. Be conversational and educational. This is where ALL teaching content goes.",
  "learningPoints": ["point1", "point2", "point3"],
  "dependencies": ["pandas", "matplotlib", "seaborn"],
  "usage": "how to use this code",
  "nextSteps": "suggestions for further learning"
}

CRITICAL: 
- The "code" field must contain CLEAN, executable Python code WITHOUT step-by-step teaching comments
- The "explanation" field contains ALL the teaching content with numbered steps
- When CSV is requested, ALWAYS include visualization code with plt.show()`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${type} code for: ${description}` }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    let response = completion.choices[0].message.content;
    
    // First, try to extract JSON from markdown code blocks
    let jsonContent = response;
    
    // Check if response contains JSON in a code block
    const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)```/i);
    if (jsonBlockMatch) {
      jsonContent = jsonBlockMatch[1].trim();
    } else {
      // Strip markdown code blocks if present
      jsonContent = response.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    
    // Try to parse JSON response, fallback to text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonContent);
      
      // Ensure code field contains only the code, not the entire JSON or markdown
      if (parsedResponse.code && typeof parsedResponse.code === 'string') {
        // Remove any markdown code blocks from the code field
        let cleanCode = parsedResponse.code
          .replace(/^```python\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        
        // Remove any JSON code blocks that might be embedded
        cleanCode = cleanCode.replace(/```json\s*[\s\S]*?```/gi, '');
        cleanCode = cleanCode.replace(/```\s*[\s\S]*?```/g, '');
        
        // Remove any JSON object that might be in the code
        if (cleanCode.includes('"explanation"') || cleanCode.includes('"learningPoints"')) {
          // This looks like JSON, try to extract just the code part
          const codeMatch = cleanCode.match(/```python\s*([\s\S]*?)```/i);
          if (codeMatch) {
            cleanCode = codeMatch[1].trim();
          } else {
            // Try to find where the actual code starts (before any JSON)
            const codeStart = cleanCode.search(/(?:^|\n)(import |from |def |# |[a-zA-Z_])/);
            if (codeStart > 0) {
              cleanCode = cleanCode.substring(codeStart).trim();
            }
          }
        }
        
        parsedResponse.code = cleanCode;
      }
    } catch {
      // If parsing fails, check if the entire response is code
      if (response.includes('import ') || response.includes('def ') || response.includes('pd.')) {
        // Extract just the code, removing any JSON or markdown blocks
        let cleanCode = response
          .replace(/```python\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .replace(/```json\s*[\s\S]*?```/gi, '')
          .trim();
        
        parsedResponse = {
          code: cleanCode,
          explanation: "Generated code with educational context",
          learningPoints: ["Review the code structure", "Understand the implementation", "Practice with variations"],
          dependencies: [],
          usage: "Use this code as a starting point for your project",
          nextSteps: "Experiment with the code and try modifications"
        };
      } else {
        parsedResponse = {
          code: "",
          explanation: response,
          learningPoints: ["Review the code structure", "Understand the implementation", "Practice with variations"],
          dependencies: [],
          usage: "Use this code as a starting point for your project",
          nextSteps: "Experiment with the code and try modifications"
        };
      }
    }

    // Log what we're sending back
    console.log('[Backend] ========== SENDING CODE GENERATION RESPONSE ==========');
    console.log('[Backend] hasCode:', !!parsedResponse.code);
    console.log('[Backend] codeLength:', parsedResponse.code?.length || 0);
    console.log('[Backend] codePreview:', parsedResponse.code?.substring(0, 300) || 'EMPTY');
    console.log('[Backend] hasExplanation:', !!parsedResponse.explanation);
    console.log('[Backend] explanationLength:', parsedResponse.explanation?.length || 0);
    
    // CRITICAL: Ensure code is never empty if we have an explanation
    if (!parsedResponse.code || parsedResponse.code.trim().length < 10) {
      console.error('[Backend] ❌❌❌ CODE IS EMPTY OR TOO SHORT! ❌❌❌');
      console.error('[Backend] parsedResponse.code:', parsedResponse.code);
      console.error('[Backend] Original response from OpenAI:', response?.substring(0, 500));
      
      // Try to extract code from the original response if parsing failed
      if (response && response.length > 50) {
        // Look for Python code in the response
        const pythonCodeMatch = response.match(/```python\s*([\s\S]*?)```/i);
        if (pythonCodeMatch && pythonCodeMatch[1]) {
          parsedResponse.code = pythonCodeMatch[1].trim();
          console.log('[Backend] ✅ Extracted code from original response markdown block');
        } else {
          // Look for code without markdown
          const codeStart = response.search(/(?:^|\n)(import\s+(pandas|numpy|matplotlib|seaborn))/i);
          if (codeStart >= 0) {
            let codeChunk = response.substring(codeStart);
            // Find reasonable end
            const endMatch = codeChunk.match(/(plt\.show\(\)|data\.to_csv\([^)]+\))[\s\S]{0,200}/i);
            if (endMatch) {
              codeChunk = codeChunk.substring(0, codeChunk.indexOf(endMatch[0]) + endMatch[0].length);
            }
            if (codeChunk.length > 50) {
              parsedResponse.code = codeChunk.trim();
              console.log('[Backend] ✅ Extracted code from original response');
            }
          }
        }
      }
    }
    
    console.log('[Backend] FINAL codeLength:', parsedResponse.code?.length || 0);
    console.log('[Backend] ======================================================');
    
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

    const systemPrompt = `You are an expert project architect for Coco. Create a step-by-step project building plan with educational focus.

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

    // Get all available files from file storage (including other files besides the current CSV)
    const availableFiles = await getAvailableFiles();
    const otherFiles = availableFiles.filter(f => {
      const fName = f.original_name || f.filename || f.name || String(f);
      return fName !== fileName;
    });
    const otherFilesContext = otherFiles.length > 0
      ? `\n\nOTHER AVAILABLE FILES:\nYou also have access to these other files in the working directory: ${otherFiles.map(f => f.original_name || f.filename || f.name || String(f)).join(', ')}. You can use them in your analysis if relevant. Files are accessible directly by their filename.`
      : '';

    // Escape the CSV data for embedding in Python triple-quoted strings
    // Replace backslashes and triple quotes to avoid breaking the string
    const escapedCsvData = csvData
      .replace(/\\/g, '\\\\')  // Escape backslashes
      .replace(/"""/g, '\\"\\"\\"');  // Escape triple quotes
    const headers = csvHeaders || [];
    const sampleRows = csvPreview || [];

    // Include full CSV data in context, but limit size to avoid token limits
    // For very large files, include first 1000 lines + last 100 lines to show structure
    let csvContextData = csvData;
    const csvLines = csvData.split('\n');
    const maxLines = 2000; // Reasonable limit for context
    
    if (csvLines.length > maxLines) {
      // For large files, include header + first 1000 rows + last 100 rows
      const headerLine = csvLines[0];
      const firstRows = csvLines.slice(1, 1001).join('\n');
      const lastRows = csvLines.slice(-100).join('\n');
      csvContextData = `${headerLine}\n${firstRows}\n\n... (${csvLines.length - 1101} rows omitted) ...\n\n${lastRows}`;
    }

    const systemPrompt = `You are an expert Python data science teacher for Coco. Generate complete, runnable Python code to analyze and visualize data from a CSV file.

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
7. Use the FULL CSV data provided below to understand the data patterns, distributions, and relationships

CSV File Information:
- File name: ${fileName}
- Total rows: ${csvLines.length}
- Columns: ${headers.join(', ')}${otherFilesContext}

FULL CSV DATA (for complete context):
\`\`\`
${csvContextData}
\`\`\`

Sample preview (first few rows):
${JSON.stringify(sampleRows, null, 2)}

TEACHING STYLE - Explain like a teacher:
- Break down the explanation into clear, numbered steps
- Start with an overview: "In this code, we're going to..."
- Explain each section step-by-step: "Step 1: First, we save the CSV data...", "Step 2: Next, we load it...", etc.
- Explain WHY we do each step, not just WHAT it does
- Use simple language and analogies when helpful
- Show the progression: how each step builds on the previous one

Format your response as JSON with:
{
  "code": "the complete, runnable Python code that: 1) saves the CSV data to a file, 2) loads it with pd.read_csv(), and 3) creates visualizations. Include the CSV data as a multi-line string variable at the start.",
  "explanation": "STEP-BY-STEP teacher-like explanation. Start with an overview, then break into numbered steps (Step 1, Step 2, etc.), explain each step in detail. Be conversational and educational.",
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

The CSV file has these columns: ${headers.join(', ')} and contains ${csvLines.length} total rows.

IMPORTANT: The CSV file "${fileName}" is already uploaded and stored in the file storage system. Your code should:
1. Directly load the CSV file using pd.read_csv('${fileName}') - it's already in the working directory
2. Explore the data structure (use head(), info(), describe() to understand the data)
3. Create appropriate visualizations based on the FULL data patterns you see in the CSV content above
4. Provide insights about the data based on what you observe in the complete dataset

The file is accessible in the current working directory, so you can use pd.read_csv('${fileName}') directly.

You have been provided with the FULL CSV data content above - use this to understand:
- Data types and formats
- Value ranges and distributions
- Relationships between columns
- Patterns and trends in the data
- Appropriate visualization choices

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

    let response = completion.choices[0].message.content;
    
    // First, try to extract JSON from markdown code blocks
    let jsonContent = response;
    
    // Check if response contains JSON in a code block
    const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)```/i);
    if (jsonBlockMatch) {
      jsonContent = jsonBlockMatch[1].trim();
    } else {
      // Strip markdown code blocks if present
      jsonContent = response.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    
    // Try to parse JSON response, fallback to text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonContent);
      
      // Ensure code field contains only the code, not the entire JSON or markdown
      if (parsedResponse.code && typeof parsedResponse.code === 'string') {
        // Remove any markdown code blocks from the code field
        let cleanCode = parsedResponse.code
          .replace(/^```python\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        
        // Remove any JSON code blocks that might be embedded
        cleanCode = cleanCode.replace(/```json\s*[\s\S]*?```/gi, '');
        cleanCode = cleanCode.replace(/```\s*[\s\S]*?```/g, '');
        
        // Remove any JSON object that might be in the code
        if (cleanCode.includes('"explanation"') || cleanCode.includes('"learningPoints"')) {
          // This looks like JSON, try to extract just the code part
          const codeMatch = cleanCode.match(/```python\s*([\s\S]*?)```/i);
          if (codeMatch) {
            cleanCode = codeMatch[1].trim();
          } else {
            // Try to find where the actual code starts (before any JSON)
            const codeStart = cleanCode.search(/(?:^|\n)(import |from |def |# |[a-zA-Z_])/);
            if (codeStart > 0) {
              cleanCode = cleanCode.substring(codeStart).trim();
            }
          }
        }
        
        parsedResponse.code = cleanCode;
      }
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
    
    // Log what we're sending back
    console.log('[Backend] ========== CSV CODE GENERATION RESPONSE ==========');
    console.log('[Backend] hasCode:', !!parsedResponse.code);
    console.log('[Backend] codeLength:', parsedResponse.code?.length || 0);
    console.log('[Backend] codePreview:', parsedResponse.code?.substring(0, 300) || 'EMPTY');
    console.log('[Backend] =================================================');

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

    const systemPrompt = `Generate 2-3 MICRO questions (3-5 words MAX) that test understanding of THIS EXACT code.

CRITICAL RULES:
1. **3-5 WORDS MAX** - Shorter is better. Think: "What does X do?" (4 words), "Why use Y?" (3 words)
2. **REFERENCE ACTUAL CODE** - Use exact variable names, function names, or operations from the code
3. **TEST UNDERSTANDING** - Ask about what the code DOES, not theory
4. **NO FILLER WORDS** - Cut "in this code", "for this", "here" - just the question

FORMATS (pick one per question):
- "What does [exact_variable] do?" (4 words)
- "Why [exact_function]?" (2 words)
- "What if [remove/change X]?" (3 words)
- "Which line [does Y]?" (3 words)

EXAMPLES:
Code: \`data = pd.DataFrame({'x': [1,2,3]})\`
Good: "What does DataFrame do?" (4 words)
Bad: "What does the DataFrame function do in this code?" (9 words)

Code: \`plt.figure(figsize=(10, 6))\`
Good: "Why figsize?" (2 words)
Bad: "Why did we use figsize parameter in plt.figure?" (9 words)

Code: \`data.to_csv('file.csv')\`
Good: "What does to_csv do?" (4 words)
Bad: "What is the purpose of the to_csv method?" (8 words)

Look at the ACTUAL code provided. Find specific variables/functions. Ask about THOSE.

Respond with JSON: {"questions": ["q1", "q2", "q3"]} - each 3-5 words, referencing actual code elements.`;

    const userPrompt = `Code:
\`\`\`python
${code}
\`\`\`

Generate 2-3 MICRO questions (3-5 words each) about THIS code.

INSTRUCTIONS:
1. Scan the code for actual variable names, function calls, and operations
2. Pick 2-3 specific elements (e.g., "pd.DataFrame", "plt.show()", "data.to_csv()")
3. Ask ultra-short questions about those EXACT elements
4. Each question must be 3-5 words MAX

EXAMPLES FROM CODE:
- If code has "pd.DataFrame" → "What does DataFrame do?" (4 words)
- If code has "plt.figure(figsize=...)" → "Why figsize?" (2 words)  
- If code has "data.to_csv()" → "What does to_csv do?" (4 words)
- If code has "sns.histplot" → "Why histplot?" (2 words)

DO NOT:
- Ask generic questions like "What does this code do?"
- Use more than 5 words
- Ask about concepts not in the code
- Add filler words

DO:
- Reference exact code elements
- Keep it 3-5 words
- Make it test understanding of what's actually in the code

Return JSON: {"questions": ["q1", "q2", "q3"]}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 100,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(response);
      
      // Handle different possible JSON structures
      let questions = [];
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (parsed.question1 && parsed.question2) {
        questions = [parsed.question1, parsed.question2];
        if (parsed.question3) questions.push(parsed.question3);
      }
      
      // Validate and filter questions: must be 2-5 words and reference code
      const validatedQuestions = questions
        .filter(q => {
          if (!q || typeof q !== 'string') return false;
          const wordCount = q.trim().split(/\s+/).length;
          // Must be 2-5 words
          if (wordCount < 2 || wordCount > 5) return false;
          // Must not be generic (no "this code", "the code", etc.)
          const lowerQ = q.toLowerCase();
          if (lowerQ.includes('this code') || lowerQ.includes('the code') || lowerQ.includes('what does this')) {
            return false;
          }
          return true;
        })
        .slice(0, 3);
      
      if (validatedQuestions.length > 0) {
        return res.json({ questions: validatedQuestions });
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract from text
      const arrayMatch = response.match(/\["([^"]+)",\s*"([^"]+)"\]/);
      if (arrayMatch) {
        return res.json({ questions: [arrayMatch[1], arrayMatch[2]] });
      }
      
      // Try to extract questions from markdown list format
      const questionMatches = response.match(/\d+\.\s*"([^"]+)"/g);
      if (questionMatches && questionMatches.length >= 2) {
        const extractedQuestions = questionMatches.map(match => 
          match.replace(/\d+\.\s*"/, '').replace(/"$/, '')
        );
        return res.json({ questions: extractedQuestions.slice(0, 3) });
      }
      
      // Last resort: try to find any quoted strings (but filter for short questions 3-30 words)
      const quotedMatches = response.match(/"([^"]{3,50})"/g);
      if (quotedMatches && quotedMatches.length >= 2) {
        const extractedQuestions = quotedMatches
          .map(match => match.replace(/^"/, '').replace(/"$/, ''))
          .filter(q => {
            const wordCount = q.split(/\s+/).length;
            return wordCount >= 2 && wordCount <= 5; // 2-5 words only
          });
        if (extractedQuestions.length >= 2) {
          return res.json({ questions: extractedQuestions.slice(0, 3) });
        }
      }
    }

    // If we get here, LLM response was not parseable
    console.error('[Backend] Failed to parse LLM response for questions:', response?.substring(0, 200));
    res.status(500).json({ 
      error: 'Failed to generate dynamic questions',
      message: 'LLM response could not be parsed into questions',
      questions: [] // Return empty array instead of hardcoded questions
    });

  } catch (error) {
    console.error('[Backend] Question generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: error.message,
      questions: [] // Return empty array - frontend will handle gracefully
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
