import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  MessageSquare,
  Code,
  BookOpen,
  HelpCircle,
  X,
  ChevronLeft,
  Upload,
  FileText
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import { ExecutionResponse } from '../types/notebook';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  codeBlock?: string;
  language?: string;
  explanation?: string;
  questions?: string[];
  insertToNotebook?: boolean;
  csvFilename?: string; // CSV filename if code creates a CSV file
}

interface NotebookChatProps {
  onInsertCode?: (code: string, explanation?: string, questions?: string[]) => void;
}

const NotebookChat: React.FC<NotebookChatProps> = ({ onInsertCode }) => {
  const { notebookVariables } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [uploadedCsv, setUploadedCsv] = useState<{ name: string; data: string; preview: any[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'system',
        content: "Hi! I'm your coding assistant. I can help you write code, explain concepts, and guide your learning. Try asking me to:\n\n• Generate code for data analysis\n• Explain how pandas DataFrames work\n• Create visualizations\n• Ask questions to test your understanding",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const extractCodeBlock = (text: string): { code: string; language: string; remaining: string } | null => {
    // Match ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match) {
      return {
        code: match[2].trim(),
        language: match[1] || 'python',
        remaining: text.replace(codeBlockRegex, '').trim()
      };
    }
    return null;
  };

  // Detect CSV creation in code and extract filename
  const detectCSVCreation = (code: string): string | null => {
    // Match patterns like: data.to_csv('filename.csv'), df.to_csv("file.csv"), etc.
    // Also handle: .to_csv('file.csv', index=False) with optional parameters
    const csvPatterns = [
      /\.to_csv\s*\(\s*['"]([^'"]+\.csv)['"]/g,  // .to_csv('file.csv') or .to_csv('file.csv', index=False)
      /\.to_csv\s*\(\s*["']([^"']+\.csv)["']/g,  // .to_csv("file.csv") or .to_csv("file.csv", index=False)
    ];
    
    for (const pattern of csvPatterns) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          return match[1];
        }
      }
    }
    
    return null;
  };

  const parseCSV = (csvText: string): { headers: string[]; rows: any[]; preview: any[] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [], preview: [] };
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      return row;
    });
    
    return {
      headers,
      rows,
      preview: rows.slice(0, 5) // First 5 rows for preview
    };
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      // Upload file to backend storage
      await apiService.uploadFile(file);
      
      // Read file for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const parsed = parseCSV(csvText);
        
        setUploadedCsv({
          name: file.name,
          data: csvText,
          preview: parsed.preview
        });
        
        // Auto-generate visualization request
        const message = `Create data visualizations for this CSV file: ${file.name}`;
        setInputValue(message);
        toast.success(`CSV file "${file.name}" uploaded and ready! ${parsed.rows.length} rows detected.`);
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast.error(`Failed to upload file: ${error.message}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Parse code into logical sections based on common patterns
  const parseCodeIntoSections = (code: string): string[] => {
    const lines = code.split('\n');
    const sections: string[] = [];
    let currentSection: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section boundaries
      if (line.startsWith('import ') || line.startsWith('from ')) {
        if (currentSection.length > 0 && !currentSection[0].trim().startsWith('import') && !currentSection[0].trim().startsWith('from')) {
          sections.push(currentSection.join('\n'));
          currentSection = [];
        }
        currentSection.push(lines[i]);
      } else if (line.startsWith('plt.') || line.startsWith('sns.') || line.includes('.plot') || line.includes('.bar') || line.includes('.show()')) {
        // Plotting section
        if (currentSection.length > 0 && !currentSection.some(l => l.includes('plt.') || l.includes('sns.'))) {
          sections.push(currentSection.join('\n'));
          currentSection = [];
        }
        currentSection.push(lines[i]);
      } else if (line.startsWith('data =') || line.startsWith('df =') || line.includes('pd.DataFrame') || line.includes('to_csv')) {
        // Data creation/manipulation
        if (currentSection.length > 0 && !currentSection.some(l => l.includes('DataFrame') || l.includes('to_csv'))) {
          sections.push(currentSection.join('\n'));
          currentSection = [];
        }
        currentSection.push(lines[i]);
      } else {
        currentSection.push(lines[i]);
      }
    }
    
    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'));
    }
    
    return sections;
  };

  // Format explanation to be teacher-friendly with code snippets for each step
  const formatTeacherExplanation = (explanation: string, code: string, learningPoints: string[] = [], nextSteps: string = ''): string => {
    // Normalize newlines and clean up the text
    let formatted = explanation
      .replace(/\\n/g, '\n')  // Convert escaped \n to actual newlines
      .replace(/\r\n/g, '\n') // Normalize Windows line endings
      .replace(/\r/g, '\n')   // Normalize Mac line endings
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();
    
    // Ensure proper spacing after step numbers (e.g., "Step 1:First" -> "Step 1: First")
    formatted = formatted.replace(/(Step \d+):([A-Z])/gi, '$1: $2');
    
    // Parse code into sections
    const codeSections = parseCodeIntoSections(code);
    
    // Extract steps from explanation
    const stepRegex = /(Step \d+):\s*([^]*?)(?=Step \d+:|$)/gi;
    const steps: Array<{ stepNum: string; text: string }> = [];
    let match;
    
    // Find all steps
    while ((match = stepRegex.exec(formatted)) !== null) {
      steps.push({
        stepNum: match[1],
        text: match[2].trim()
      });
    }
    
    // If we found steps, format them with code snippets
    if (steps.length > 0 && codeSections.length > 0) {
      let newFormatted = '';
      
      // Add overview if present (text before first step)
      const overviewMatch = formatted.match(/^([^]*?)(?=Step \d+:)/i);
      if (overviewMatch) {
        newFormatted += overviewMatch[1].trim() + '\n\n';
      }
      
      // Format each step with corresponding code
      steps.forEach((step, idx) => {
        newFormatted += `**${step.stepNum}**\n\n${step.text}\n\n`;
        
        // Match code section to step (simple heuristic)
        if (idx < codeSections.length) {
          const codeSnippet = codeSections[idx].trim();
          if (codeSnippet) {
            newFormatted += `\`\`\`python\n${codeSnippet}\n\`\`\`\n\n`;
          }
        }
      });
      
      formatted = newFormatted;
    } else {
      // Fallback: just ensure proper spacing
      // No summary section needed
    }
    
    // Add learning points section if available
    if (learningPoints && learningPoints.length > 0) {
      formatted += '\n\n### 📚 Key Learning Points\n\n';
      learningPoints.forEach((point, idx) => {
        formatted += `${idx + 1}. ${point}\n`;
      });
    }
    
    // Add next steps section if available
    if (nextSteps && nextSteps.trim()) {
      formatted += `\n\n### 🚀 Next Steps\n\n${nextSteps}`;
    }
    
    return formatted;
  };

  const generateTeachingResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true);
    
    try {
      // Get context from notebook variables and codebase structure
      let context = notebookVariables.length > 0 
        ? `Current notebook variables: ${notebookVariables.map(v => v.name).join(', ')}. This is a data science notebook environment using pandas, matplotlib, seaborn, and numpy.`
        : 'User is starting fresh in the notebook. This is a data science notebook environment using pandas, matplotlib, seaborn, and numpy.';
      
      // Add CSV context if file is uploaded
      if (uploadedCsv) {
        const csvInfo = `User has uploaded a CSV file named "${uploadedCsv.name}" with ${uploadedCsv.preview.length} preview rows. CSV data is available for analysis.`;
        context += ` ${csvInfo}`;
      }
      
      // Detect if user wants code generation (vs explanation)
      const lowerMessage = userMessage.toLowerCase();
      const wantsCode = lowerMessage.includes('create') || 
                       lowerMessage.includes('generate') || 
                       lowerMessage.includes('make') || 
                       lowerMessage.includes('build') ||
                       lowerMessage.includes('do ') ||
                       lowerMessage.includes('analyze') ||
                       lowerMessage.includes('plot') ||
                       lowerMessage.includes('visualization') ||
                       (lowerMessage.includes('data') && (lowerMessage.includes('analysis') || lowerMessage.includes('visualization')));
      
      // Always try to use OpenAI API first - don't fall back to mock
      if (wantsCode) {
        // Generate actual code using backend API
        console.log('[NotebookChat] Generating code for:', userMessage);
        
        // If CSV is uploaded, use the CSV-specific endpoint
        let codeResponse;
        if (uploadedCsv) {
          const parsed = parseCSV(uploadedCsv.data);
          // File is already uploaded to storage, so generate code that uses it
          codeResponse = await apiService.generateCodeFromCSV(
            userMessage,
            uploadedCsv.name,
            uploadedCsv.data,
            parsed.headers,
            parsed.preview,
            context
          );
        } else {
          codeResponse = await apiService.generateCode(
            userMessage,
            'data_analysis',
            'python',
            'intermediate',
            context
          );
        }
        
        console.log('[NotebookChat] ========== CODE GENERATION RESPONSE ==========');
        console.log('[NotebookChat] Full codeResponse:', JSON.stringify(codeResponse, null, 2));
        console.log('[NotebookChat] codeResponse.code type:', typeof codeResponse.code);
        console.log('[NotebookChat] codeResponse.code length:', codeResponse.code?.length || 0);
        console.log('[NotebookChat] codeResponse.code preview:', codeResponse.code?.substring(0, 500) || 'EMPTY');
        
        // Extract code from response (could be in code field or in markdown code blocks)
        let generatedCode = codeResponse.code || '';
        let explanation = codeResponse.explanation || '';
        let learningPoints = codeResponse.learningPoints || [];
        let nextSteps = codeResponse.nextSteps || '';
        
        // CRITICAL: Convert escaped newlines to actual newlines in code
        if (generatedCode && typeof generatedCode === 'string') {
          generatedCode = generatedCode.replace(/\\n/g, '\n');
        }
        
        console.log('[NotebookChat] Initial extracted - code length:', generatedCode.length, 'explanation length:', explanation.length);
        
        // If code is empty, try to extract from the entire response object
        if (!generatedCode && typeof codeResponse === 'object') {
          // Check if code is nested somewhere
          const responseString = JSON.stringify(codeResponse);
          const codeMatch = responseString.match(/"code"\s*:\s*"([^"]+)"/);
          if (codeMatch && codeMatch[1]) {
            generatedCode = codeMatch[1].replace(/\\n/g, '\n');
            console.log('[NotebookChat] Extracted code from nested response');
          }
        }
        
        // If the code field contains JSON (entire response), extract just the code
        if (generatedCode && typeof generatedCode === 'string' && generatedCode.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(generatedCode);
            if (parsed.code) {
              generatedCode = parsed.code;
            }
            if (parsed.explanation && !explanation) {
              explanation = parsed.explanation;
            }
            if (parsed.learningPoints && Array.isArray(parsed.learningPoints) && parsed.learningPoints.length > 0) {
              learningPoints = parsed.learningPoints;
            }
            if (parsed.nextSteps && !nextSteps) {
              nextSteps = parsed.nextSteps;
            }
          } catch (e) {
            // Not valid JSON, continue with original code
            console.log('[NotebookChat] Code field is not JSON, using as-is');
          }
        }
        
        // Clean up code - be more conservative, preserve code even if it has some artifacts
        if (generatedCode) {
          console.log('[NotebookChat] Starting code cleanup, original length:', generatedCode.length);
          
          // First, try to extract Python code from markdown blocks if present
          const pythonBlockMatch = generatedCode.match(/```python\s*([\s\S]*?)```/i);
          if (pythonBlockMatch) {
            generatedCode = pythonBlockMatch[1].trim();
            console.log('[NotebookChat] ✅ Extracted code from Python markdown block, length:', generatedCode.length);
          } else {
            // Remove markdown wrappers but keep the code
            const beforeClean = generatedCode;
            generatedCode = generatedCode
              .replace(/^```python\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();
            if (beforeClean !== generatedCode) {
              console.log('[NotebookChat] Removed markdown wrappers, length:', generatedCode.length);
            }
          }
          
          // Remove JSON code blocks that might be embedded
          const beforeJsonClean = generatedCode;
          generatedCode = generatedCode.replace(/```json\s*[\s\S]*?```/gi, '');
          if (beforeJsonClean !== generatedCode) {
            console.log('[NotebookChat] Removed JSON blocks, length:', generatedCode.length);
          }
          
          // If code contains JSON object (entire response), extract just the Python part
          if (generatedCode.includes('"explanation"') || generatedCode.includes('"learningPoints"')) {
            console.log('[NotebookChat] Code contains JSON, extracting Python part...');
            // Find where Python code starts (import statements, etc.)
            const codeStart = generatedCode.search(/(?:^|\n)(import |from |def |# |[a-zA-Z_][a-zA-Z0-9_]*\s*=)/);
            if (codeStart >= 0) {
              let codePart = generatedCode.substring(codeStart);
              // Remove any trailing JSON
              const jsonStart = codePart.search(/\n\s*```json|\n\s*\{[\s\S]*"explanation"/);
              if (jsonStart > 0) {
                codePart = codePart.substring(0, jsonStart);
              }
              generatedCode = codePart.trim();
              console.log('[NotebookChat] ✅ Extracted Python code from mixed content, length:', generatedCode.length);
            } else {
              console.warn('[NotebookChat] ⚠️ Could not find Python code start in mixed content');
            }
          }
          
          // Final cleanup - remove trailing JSON artifacts
          const beforeFinalClean = generatedCode;
          generatedCode = generatedCode
            .replace(/\n\s*```json[\s\S]*$/i, '')
            .replace(/\n\s*\{[\s\S]*"explanation"[\s\S]*\}/g, '')
            .trim();
          if (beforeFinalClean !== generatedCode) {
            console.log('[NotebookChat] Final cleanup removed artifacts, length:', generatedCode.length);
          }
          
          // If code is still empty or too short after cleaning, use original
          if (!generatedCode || generatedCode.length < 10) {
            console.warn('[NotebookChat] ⚠️ Code became too short after cleaning, trying fallback');
            // Try original codeResponse.code if available
            if (codeResponse.code && codeResponse.code.length > 10) {
              generatedCode = codeResponse.code;
              // Just remove obvious JSON blocks
              generatedCode = generatedCode.replace(/```json\s*[\s\S]*?```/gi, '').trim();
              console.log('[NotebookChat] Using original codeResponse.code, length:', generatedCode.length);
            }
          }
        } else {
          console.error('[NotebookChat] ❌ generatedCode is empty or falsy!');
        }
        
        console.log('[NotebookChat] ========== FINAL CODE EXTRACTION ==========');
        console.log('[NotebookChat] Final generatedCode length:', generatedCode?.length || 0);
        console.log('[NotebookChat] Final generatedCode preview:', generatedCode?.substring(0, 300) || 'EMPTY');
        console.log('[NotebookChat] ===========================================');
        
        // If explanation is a JSON string, try to parse it
        if (typeof explanation === 'string' && explanation.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(explanation);
            // Extract explanation text from parsed JSON
            if (parsed.explanation) {
              explanation = parsed.explanation;
            }
            // Extract learning points if not already set
            if (parsed.learningPoints && Array.isArray(parsed.learningPoints) && parsed.learningPoints.length > 0 && !learningPoints.length) {
              learningPoints = parsed.learningPoints;
            }
            // Extract next steps if not already set
            if (parsed.nextSteps && !nextSteps) {
              nextSteps = parsed.nextSteps;
            }
          } catch (e) {
            // Not valid JSON, continue with original explanation
            console.log('[NotebookChat] Explanation is not JSON, using as-is');
          }
        }
        
        // Format explanation to be more teacher-friendly with code snippets
        if (explanation && generatedCode) {
          explanation = formatTeacherExplanation(explanation, generatedCode, learningPoints, nextSteps);
        } else if (explanation) {
          // Fallback if no code available
          let formatted = explanation
            .replace(/\\n/g, '\n')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          formatted = formatted.replace(/(Step \d+):([A-Z])/gi, '$1: $2');
          
          if (learningPoints && learningPoints.length > 0) {
            formatted += '\n\n### 📚 Key Learning Points\n\n';
            learningPoints.forEach((point: string, idx: number) => {
              formatted += `${idx + 1}. ${point}\n`;
            });
          }
          
          if (nextSteps && nextSteps.trim()) {
            formatted += `\n\n### 🚀 Next Steps\n\n${nextSteps}`;
          }
          
          explanation = formatted;
        }
        
        // If code is in markdown format, extract it
        if (generatedCode.includes('```')) {
          const extracted = extractCodeBlock(generatedCode);
          if (extracted) {
            generatedCode = extracted.code;
            explanation = extracted.remaining || explanation;
          }
        }
        
        // If no code found but response has content, try to extract from explanation
        if (!generatedCode && explanation.includes('```')) {
          const extracted = extractCodeBlock(explanation);
          if (extracted) {
            generatedCode = extracted.code;
            explanation = extracted.remaining || explanation;
          }
        }
        
        // If still no code, check if the entire response is code
        if (!generatedCode && codeResponse.code) {
          generatedCode = codeResponse.code;
          console.log('[NotebookChat] Using codeResponse.code as fallback, length:', generatedCode.length);
        }
        
        // CRITICAL: If we still don't have code but we have an explanation that describes code,
        // try to extract code from the explanation or use the raw response
        if (!generatedCode || generatedCode.trim().length < 10) {
          console.warn('[NotebookChat] ⚠️ Still no code after all extraction attempts!');
          console.warn('[NotebookChat] Trying to extract from explanation or raw response...');
          
          // Try to find code in the explanation
          if (explanation) {
            const codeInExplanation = extractCodeBlock(explanation);
            if (codeInExplanation?.code && codeInExplanation.code.length > 10) {
              generatedCode = codeInExplanation.code;
              console.log('[NotebookChat] ✅ Found code in explanation!');
            }
          }
          
          // Last resort: check if the entire codeResponse object has code somewhere
          if (!generatedCode || generatedCode.trim().length < 10) {
            const fullResponseStr = JSON.stringify(codeResponse);
            // Look for Python code patterns in the entire response
            const pythonCodeMatch = fullResponseStr.match(/(import\s+(pandas|numpy|matplotlib|seaborn)[\s\S]{50,})/i);
            if (pythonCodeMatch) {
              // Try to extract a reasonable chunk
              const startIdx = fullResponseStr.indexOf(pythonCodeMatch[1]);
              let codeChunk = fullResponseStr.substring(startIdx, startIdx + 2000);
              // Find where it ends (look for closing braces or end of string)
              const endMatch = codeChunk.match(/(plt\.show\(\)|data\.to_csv\([^)]+\))[\s\S]{0,100}/i);
              if (endMatch) {
                codeChunk = codeChunk.substring(0, codeChunk.indexOf(endMatch[0]) + endMatch[0].length);
              }
              // Clean up escaped characters
              codeChunk = codeChunk.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
              if (codeChunk.length > 50) {
                generatedCode = codeChunk;
                console.log('[NotebookChat] ✅ Extracted code from full response string!');
              }
            }
          }
        }
        
        // Final check: if we STILL don't have code, but we have explanation describing code,
        // create a minimal template based on the explanation
        if ((!generatedCode || generatedCode.trim().length < 10) && explanation) {
          console.warn('[NotebookChat] ⚠️ Creating minimal code template from explanation');
          // Create basic template based on what the explanation mentions
          let templateCode = '';
          if (explanation.toLowerCase().includes('pandas') || explanation.toLowerCase().includes('dataframe')) {
            templateCode += 'import pandas as pd\n';
          }
          if (explanation.toLowerCase().includes('numpy') || explanation.toLowerCase().includes('random')) {
            templateCode += 'import numpy as np\n';
          }
          if (explanation.toLowerCase().includes('matplotlib') || explanation.toLowerCase().includes('plot')) {
            templateCode += 'import matplotlib.pyplot as plt\n';
          }
          if (explanation.toLowerCase().includes('seaborn')) {
            templateCode += 'import seaborn as sns\n';
          }
          templateCode += '\n# Your code here\n';
          
          if (templateCode.length > 20) {
            generatedCode = templateCode;
            console.log('[NotebookChat] Created template code');
          }
        }
        
        console.log('[NotebookChat] ========== FINAL CHECK BEFORE INSERTION ==========');
        console.log('[NotebookChat] generatedCode final length:', generatedCode?.length || 0);
        console.log('[NotebookChat] generatedCode final preview:', generatedCode?.substring(0, 200) || 'EMPTY');
        console.log('[NotebookChat] onInsertCode exists:', !!onInsertCode);
        console.log('[NotebookChat] =================================================');
        
        // CRITICAL: Fix newlines in string literals
        // Problem: When JSON contains "print('\\nText')", JavaScript parses it as "print('\nText')" with an actual newline
        // This breaks Python syntax. We need to convert actual newlines INSIDE string literals back to \n
        if (generatedCode && typeof generatedCode === 'string') {
          let result = '';
          let i = 0;
          let inString = false;
          let stringChar = '';
          let inTripleQuote = false;
          let tripleQuoteChar = '';
          
          const isEscaped = (idx: number): boolean => {
            // Count consecutive backslashes before this position
            let backslashCount = 0;
            let pos = idx - 1;
            while (pos >= 0 && generatedCode[pos] === '\\') {
              backslashCount++;
              pos--;
            }
            // If odd number of backslashes, the character is escaped
            return backslashCount % 2 === 1;
          };
          
          while (i < generatedCode.length) {
            const char = generatedCode[i];
            const nextChar = i + 1 < generatedCode.length ? generatedCode[i + 1] : '';
            const nextNextChar = i + 2 < generatedCode.length ? generatedCode[i + 2] : '';
            
            // Check for triple quotes
            if (!inString && (char === '"' || char === "'") && char === nextChar && char === nextNextChar) {
              inString = true;
              inTripleQuote = true;
              tripleQuoteChar = char;
              result += char + nextChar + nextNextChar;
              i += 3;
              continue;
            }
            
            // Check for end of triple quote
            if (inTripleQuote && char === tripleQuoteChar && nextChar === tripleQuoteChar && nextNextChar === tripleQuoteChar) {
              inString = false;
              inTripleQuote = false;
              tripleQuoteChar = '';
              result += char + nextChar + nextNextChar;
              i += 3;
              continue;
            }
            
            // Check for single/double quote (entering string)
            if (!inString && (char === '"' || char === "'") && !isEscaped(i)) {
              inString = true;
              stringChar = char;
              result += char;
              i++;
              continue;
            }
            
            // Check for end of single/double quote string
            if (inString && !inTripleQuote && char === stringChar && !isEscaped(i)) {
              inString = false;
              stringChar = '';
              result += char;
              i++;
              continue;
            }
            
            // Inside string literal: convert actual newlines back to \n
            if (inString) {
              if (char === '\n') {
                result += '\\n';
              } else if (char === '\r') {
                // Handle \r\n or just \r
                if (nextChar === '\n') {
                  result += '\\n';
                  i++; // Skip the \n
                } else {
                  result += '\\n';
                }
              } else if (char === '\t') {
                result += '\\t';
              } else if (char === '\\') {
                // Handle escaped characters inside strings - preserve them
                if (nextChar === 'n') {
                  result += '\\n';
                  i++; // Skip the 'n'
                } else if (nextChar === 't') {
                  result += '\\t';
                  i++; // Skip the 't'
                } else if (nextChar === 'r') {
                  result += '\\r';
                  i++; // Skip the 'r'
                } else if (nextChar === stringChar || nextChar === '\\') {
                  // Escaped quote or backslash
                  result += char + nextChar;
                  i++; // Skip the next char
                } else {
                  result += char;
                }
              } else {
                result += char;
              }
            } else {
              // Outside string: convert \n to actual newlines (if it's a literal backslash-n)
              if (char === '\\' && nextChar === 'n') {
                result += '\n';
                i++; // Skip the 'n'
              } else if (char === '\\' && nextChar === 't') {
                result += '\t';
                i++; // Skip the 't'
              } else if (char === '\\' && nextChar === 'r') {
                result += '\r';
                i++; // Skip the 'r'
              } else {
                result += char;
              }
            }
            
            i++;
          }
          
          generatedCode = result;
        }
        
        // Automatically insert code into notebook if we have code
        // Be more lenient - insert if we have any code at all
        const codeToInsert = generatedCode?.trim() || '';
        if (codeToInsert.length > 5 && onInsertCode) {
          console.log('[NotebookChat] ✅✅✅ INSERTING CODE INTO NOTEBOOK ✅✅✅');
          console.log('[NotebookChat] Code length:', codeToInsert.length);
          console.log('[NotebookChat] Code preview:', codeToInsert.substring(0, 200));
          console.log('[NotebookChat] Code contains newlines:', codeToInsert.includes('\n'));
          // Small delay to ensure UI is ready
          setTimeout(async () => {
            try {
              console.log('[NotebookChat] About to call onInsertCode with:', {
                codeLength: codeToInsert.length,
                explanationLength: explanation?.length || 0,
                codeHasNewlines: codeToInsert.includes('\n')
              });
              // Generate questions before inserting
              let questions: string[] = [];
              if (codeToInsert) {
                try {
                  questions = await generateGuidingQuestions(codeToInsert, explanation || '', userMessage);
                } catch (error) {
                  console.error('Error generating questions:', error);
                }
              }
              onInsertCode(codeToInsert, explanation, questions.length > 0 ? questions : undefined);
              console.log('[NotebookChat] ✅✅✅ Code insertion called successfully ✅✅✅');
            } catch (error) {
              console.error('[NotebookChat] ❌❌❌ Error calling onInsertCode:', error);
            }
          }, 100);
        } else {
          console.error('[NotebookChat] ❌❌❌ NOT INSERTING CODE - FAILED CHECKS ❌❌❌');
          console.error('[NotebookChat] Details:', {
            codeLength: codeToInsert.length,
            codePreview: codeToInsert.substring(0, 100),
            hasOnInsertCode: !!onInsertCode,
            codeResponseHasCode: !!codeResponse.code,
            codeResponseCodeLength: codeResponse.code?.length || 0
          });
        }
          
          // Generate specific questions about the generated code using LLM
          let questions: string[] = [];
          if (generatedCode) {
            try {
              questions = await generateGuidingQuestions(generatedCode, explanation, userMessage);
            } catch (error) {
              console.error('Error generating questions:', error);
              // Will use empty array if questions fail
            }
          }
          
          // Detect CSV creation in the code
          const csvFilename = generatedCode ? detectCSVCreation(generatedCode) : null;
          
          setIsTyping(false);
          
          return {
            id: crypto.randomUUID(),
            type: 'ai',
            content: explanation || '✅ I\'ve generated code and automatically inserted it into your notebook! You can now run it.',
            timestamp: new Date(),
            codeBlock: generatedCode || undefined,
            language: 'python',
            explanation: explanation,
            questions: questions.length > 0 ? questions : undefined,
            insertToNotebook: !!generatedCode,
            csvFilename: csvFilename || undefined
          };
      }
      
      // Use chat endpoint for explanations and general questions
      console.log('[NotebookChat] Sending chat message:', userMessage);
      const chatResponse = await apiService.sendChatMessage(userMessage, context, 'intermediate');
      
      console.log('[NotebookChat] Chat response:', chatResponse);
      
      // Extract code blocks from chat response
      const responseText = chatResponse.response || '';
      const codeBlock = extractCodeBlock(responseText);
      const textWithoutCode = codeBlock 
        ? responseText.replace(/```[\s\S]*?```/g, '').trim()
        : responseText;
      
      // Automatically insert code into notebook if we have code
      if (codeBlock?.code && onInsertCode) {
        setTimeout(async () => {
          // Generate questions before inserting
          let questions: string[] = [];
          if (codeBlock.code) {
            try {
              questions = await generateGuidingQuestions(codeBlock.code, textWithoutCode, userMessage);
            } catch (error) {
              console.error('Error generating questions:', error);
            }
          }
          onInsertCode(codeBlock.code, textWithoutCode, questions.length > 0 ? questions : undefined);
        }, 100);
      }
      
      // Generate specific questions about the code using LLM
      let questions: string[] = [];
      if (codeBlock?.code) {
        try {
          questions = await generateGuidingQuestions(codeBlock.code, textWithoutCode, userMessage);
        } catch (error) {
          console.error('Error generating questions:', error);
          // Will use empty array if questions fail
        }
      }
      
      // Detect CSV creation in the code
      const csvFilename = codeBlock?.code ? detectCSVCreation(codeBlock.code) : null;
      
      setIsTyping(false);
      
      return {
        id: chatResponse.id || crypto.randomUUID(),
        type: 'ai',
        content: codeBlock?.code 
          ? `✅ I've automatically inserted the code into your notebook!\n\n${textWithoutCode}`
          : textWithoutCode,
        timestamp: new Date(chatResponse.timestamp),
        codeBlock: codeBlock?.code,
        language: codeBlock?.language || 'python',
        explanation: textWithoutCode,
        questions: questions.length > 0 ? questions : undefined,
        insertToNotebook: !!codeBlock,
        csvFilename: csvFilename || undefined
      };
    } catch (error: any) {
      console.error('[NotebookChat] Error generating response:', error);
      setIsTyping(false);
      
      // Show helpful error message
      const errorMessage = error?.message || 'Unknown error';
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('NetworkError') ||
                            errorMessage.includes('fetch');
      
      return {
        id: crypto.randomUUID(),
        type: 'ai',
        content: isNetworkError 
          ? `❌ **Connection Error**: Could not connect to the AI backend.\n\nPlease make sure:\n1. The Node.js backend is running on port 3001\n2. Your OpenAI API key is set in the backend .env file\n3. Run: \`cd backend && node server.js\`\n\nError: ${errorMessage}`
          : `❌ **Error**: ${errorMessage}\n\nPlease check your OpenAI API key configuration in the backend.`,
        timestamp: new Date()
      };
    }
  };

  const generateGuidingQuestions = async (code: string, explanation: string, userMessage: string): Promise<string[]> => {
    try {
      // Analyze the code to provide codebase context
      const codeAnalysis = analyzeCodeForContext(code);
      
      // Always use LLM to generate dynamic questions - no hardcoded fallbacks
      console.log('[NotebookChat] Generating dynamic questions via LLM...', { codeLength: code.length });
      const questions = await apiService.generateQuestions(code, explanation || '', `${userMessage}\n\nCodebase context: ${codeAnalysis}`);
      
      if (!questions || questions.length === 0) {
        console.warn('[NotebookChat] LLM returned empty questions, retrying...');
        // Retry once if we get empty results
        const retryQuestions = await apiService.generateQuestions(code, explanation || '', userMessage);
        if (retryQuestions && retryQuestions.length > 0) {
          return retryQuestions;
        }
        throw new Error('LLM returned empty questions after retry');
      }
      
      console.log('[NotebookChat] Generated dynamic questions:', questions);
      return questions;
    } catch (error) {
      console.error('[NotebookChat] Error generating questions via LLM:', error);
      // Instead of hardcoded fallback, throw error so caller knows questions failed
      // This ensures we always use LLM-generated questions
      throw new Error(`Failed to generate dynamic questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const analyzeCodeForContext = (code: string): string => {
    const codeLower = code.toLowerCase();
    const context: string[] = [];
    
    // Analyze imports and dependencies
    if (codeLower.includes('import pandas') || codeLower.includes('import pd')) {
      context.push('Uses pandas library for data manipulation');
    }
    if (codeLower.includes('import matplotlib') || codeLower.includes('import plt')) {
      context.push('Uses matplotlib for plotting - this codebase uses Agg backend for non-interactive plots');
    }
    if (codeLower.includes('import seaborn') || codeLower.includes('import sns')) {
      context.push('Uses seaborn for statistical visualizations built on matplotlib');
    }
    if (codeLower.includes('import numpy') || codeLower.includes('import np')) {
      context.push('Uses numpy for numerical computations');
    }
    
    // Analyze code patterns
    if (codeLower.includes('pd.dataframe') || codeLower.includes('pd.read_')) {
      context.push('Creates/manipulates DataFrames - this executes in a Jupyter kernel that tracks variables');
    }
    if (codeLower.includes('plt.show()') || codeLower.includes('plt.savefig')) {
      context.push('Generates plots - this codebase automatically captures plots via IPython.display system');
    }
    if (codeLower.includes('sns.') && codeLower.includes('load_dataset')) {
      context.push('Uses seaborn sample datasets - good for learning without external data files');
    }
    
    return context.join('. ') || 'Python data science code';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Generate AI response with teaching features
    const aiResponse = await generateTeachingResponse(currentInput);
    setMessages(prev => [...prev, aiResponse]);

    // Set current question if available
    if (aiResponse.questions && aiResponse.questions.length > 0) {
      setCurrentQuestion(aiResponse.questions[0]);
    }
  };

  const handleInsertCode = (code: string, explanation?: string, questions?: string[]) => {
    if (onInsertCode) {
      onInsertCode(code, explanation, questions);
    }
    
    // Add confirmation message
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'system',
      content: '✅ Code inserted into notebook! You can now run it.',
      timestamp: new Date()
    }]);
  };

  const handleAnswerQuestion = (question: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [question]: answer }));
    
    // Provide feedback
    const feedback = generateQuestionFeedback(question, answer);
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'ai',
      content: feedback,
      timestamp: new Date()
    }]);
    
    // Move to next question
    const currentIndex = messages.findIndex(m => m.questions?.includes(question));
    if (currentIndex >= 0) {
      const msg = messages[currentIndex];
      if (msg.questions) {
        const questionIndex = msg.questions.indexOf(question);
        if (questionIndex < msg.questions.length - 1) {
          setCurrentQuestion(msg.questions[questionIndex + 1]);
        } else {
          setCurrentQuestion(null);
        }
      }
    }
  };

  const generateQuestionFeedback = (question: string, answer: string): string => {
    const lowerAnswer = answer.toLowerCase();
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('dataframe')) {
      if (lowerAnswer.includes('table') || lowerAnswer.includes('spreadsheet') || lowerAnswer.includes('rows') || lowerAnswer.includes('columns')) {
        return "Great answer! You understand that DataFrames are structured data like tables. You're ready to work with them! 🎉";
      } else {
        return "Good start! Think of a DataFrame as a table with rows and columns - similar to an Excel spreadsheet. Want to try creating one?";
      }
    }
    
    if (lowerQuestion.includes('visualization') || lowerQuestion.includes('plot')) {
      if (lowerAnswer.includes('pattern') || lowerAnswer.includes('trend') || lowerAnswer.includes('relationship') || lowerAnswer.includes('see')) {
        return "Excellent! You understand that visualizations help us see patterns and relationships in data. Perfect for data analysis! 📊";
      } else {
        return "Visualizations help us see patterns, trends, and relationships that might be hidden in raw numbers. Try creating a plot to see this in action!";
      }
    }
    
    return "Thanks for your answer! Keep exploring and practicing - you're learning! 💪";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Export CSV to file storage
  const handleExportCSV = async (code: string, csvFilename: string) => {
    try {
      toast.loading('Executing code and exporting CSV...', { id: 'export-csv' });
      
      // First, execute the code to create the CSV file
      const sessionId = 'default'; // Use default session
      const cellId = crypto.randomUUID();
      
      const executionResult = await apiService.executeCode(code, cellId, sessionId) as ExecutionResponse;
      
      if (!executionResult.success) {
        toast.error('Failed to execute code. Please check for errors.', { id: 'export-csv' });
        return;
      }
      
      // Now read the CSV file content from the storage directory
      // We'll execute Python code to read the file
      const readFileCode = `
import os
import json

# Read the CSV file
csv_filename = r"${csvFilename}"
if os.path.exists(csv_filename):
    with open(csv_filename, 'r', encoding='utf-8') as f:
        csv_content = f.read()
    print(json.dumps({"success": True, "content": csv_content}))
else:
    print(json.dumps({"success": False, "error": f"File {csv_filename} not found"}))
`;
      
      const readResult = await apiService.executeCode(readFileCode, crypto.randomUUID(), sessionId) as ExecutionResponse;
      
      if (!readResult.success || !readResult.stdout) {
        toast.error('Failed to read CSV file. Make sure the code executed successfully.', { id: 'export-csv' });
        return;
      }
      
      // Parse the JSON output
      try {
        const fileData = JSON.parse(readResult.stdout.trim());
        if (!fileData.success || !fileData.content) {
          toast.error(fileData.error || 'Failed to read CSV file content.', { id: 'export-csv' });
          return;
        }
        
        // Create a File object from the CSV content
        const csvBlob = new Blob([fileData.content], { type: 'text/csv' });
        const csvFile = new File([csvBlob], csvFilename, { type: 'text/csv' });
        
        // Upload to file storage
        await apiService.uploadFile(csvFile);
        
        toast.success(`CSV file "${csvFilename}" exported to file storage!`, { id: 'export-csv' });
        
        // Trigger file list refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('fileStorageUpdated'));
        
      } catch (parseError) {
        console.error('Error parsing file content:', parseError);
        toast.error('Failed to parse CSV file content.', { id: 'export-csv' });
      }
      
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      toast.error(`Failed to export CSV: ${error.message}`, { id: 'export-csv' });
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gray-900 text-white px-3 py-6 rounded-l-lg shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2 group"
          aria-label="Open AI Chat"
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 text-white">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🥥</span>
              <span className="font-semibold">Coco</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <span className="text-lg">🥥</span>
                  )}
                </div>

                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Code Block */}
                    {message.codeBlock && (
                      <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{message.codeBlock}</pre>
                        <div className="mt-2 flex flex-col gap-2">
                          <button
                            onClick={() => handleInsertCode(message.codeBlock!, message.explanation, message.questions)}
                            className="w-full px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-2"
                          >
                            <Code className="w-3 h-3" />
                            Insert into Notebook
                          </button>
                          {message.csvFilename && (
                            <button
                              onClick={() => handleExportCSV(message.codeBlock!, message.csvFilename!)}
                              className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-2"
                            >
                              <Upload className="w-3 h-3" />
                              Export CSV to File Storage
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Guiding Questions */}
                    {message.questions && message.questions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-4 h-4 text-primary-600" />
                          <span className="text-xs font-semibold text-gray-700">Check Your Understanding:</span>
                        </div>
                        {message.questions.map((question, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="text-xs text-gray-700 mb-1">{question}</p>
                            {!userAnswers[question] ? (
                              <input
                                type="text"
                                placeholder="Your answer..."
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAnswerQuestion(question, e.currentTarget.value);
                                  }
                                }}
                              />
                            ) : (
                              <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                                ✓ Your answer: {userAnswers[question]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explanation Badge */}
                    {message.explanation && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary-600">
                        <BookOpen className="w-3 h-3" />
                        <span>Educational explanation</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <span className="text-lg">🥥</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {/* CSV Upload Zone */}
            {uploadedCsv ? (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{uploadedCsv.name}</p>
                    <p className="text-xs text-green-700">{uploadedCsv.preview.length} rows loaded</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUploadedCsv(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="ml-2 p-1 hover:bg-green-100 rounded transition-colors"
                  aria-label="Remove CSV file"
                >
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>
            ) : (
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mb-3 p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Drop CSV file here or <span className="text-primary-600 font-medium">click to upload</span>
                  </span>
                  <span className="text-xs text-gray-500">Generate visualizations from your data</span>
                </label>
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={uploadedCsv ? `Ask me to visualize ${uploadedCsv.name}...` : "Ask me anything about coding..."}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setInputValue("Create a pandas DataFrame with sample data")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                📊 DataFrame Example
              </button>
              <button
                onClick={() => setInputValue("Create a scatter plot with seaborn")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                📈 Plot Example
              </button>
              <button
                onClick={() => setInputValue("Explain how pandas works")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                💡 Explain Concept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotebookChat;

