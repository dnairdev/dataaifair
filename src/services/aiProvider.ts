/**
 * AI Provider Interface
 * Swappable interface for AI explanations and assistance
 */

export interface ExplainCodeRequest {
  code: string;
  context?: string;
  language?: string;
}

export interface ExplainCodeResponse {
  explanation: string;
  concepts: string[];
  suggestions?: string[];
}

export interface ExplainPlotRequest {
  plotData: string; // Base64 encoded image or plot data
  code: string;
  description?: string;
}

export interface ExplainPlotResponse {
  explanation: string;
  insights: string[];
  improvements?: string[];
}

export interface ErrorTutorRequest {
  error: string;
  code: string;
  traceback?: string;
}

export interface ErrorTutorResponse {
  explanation: string;
  solution: string;
  commonMistakes?: string[];
  relatedConcepts?: string[];
}

export interface AIProvider {
  explainCode(request: ExplainCodeRequest): Promise<ExplainCodeResponse>;
  explainPlot(request: ExplainPlotRequest): Promise<ExplainPlotResponse>;
  errorTutor(request: ErrorTutorRequest): Promise<ErrorTutorResponse>;
}

/**
 * Mock AI Provider Implementation
 * Can be swapped with OpenAI or other providers later
 */
export class MockAIProvider implements AIProvider {
  async explainCode(request: ExplainCodeRequest): Promise<ExplainCodeResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const code = request.code.trim();
    const lines = code.split('\n');
    const codeLower = code.toLowerCase();
    
    // Analyze the code to provide specific explanations
    let explanation = '';
    const concepts: string[] = [];
    const suggestions: string[] = [];
    
    // Detect pandas usage
    if (codeLower.includes('pd.dataframe') || codeLower.includes('pandas') || codeLower.includes('import pandas')) {
      concepts.push('Pandas DataFrame');
      
      if (codeLower.includes('pd.dataframe(')) {
        explanation += `**DataFrame Creation**: This code creates a pandas DataFrame, which is a two-dimensional data structure similar to a spreadsheet or SQL table. `;
        explanation += `DataFrames are the heart of data analysis in Python - they let you work with tabular data efficiently.\n\n`;
        
        if (codeLower.includes('{') && codeLower.includes(':')) {
          explanation += `**Creating from Dictionary**: You're creating the DataFrame from a Python dictionary. `;
          explanation += `Here's how it works: each key in the dictionary becomes a column name, and the corresponding list becomes that column's data. `;
          
          // Try to extract column names
          const dictMatch = code.match(/\{[\s\S]*?\}/);
          if (dictMatch) {
            const dictContent = dictMatch[0];
            const columnMatches = dictContent.match(/'([^']+)'|"([^"]+)"/g);
            if (columnMatches && columnMatches.length > 0) {
              const columnNames = columnMatches.filter((_, i) => i % 2 === 0).map(c => c.replace(/['"]/g, ''));
              explanation += `In your code, you're creating columns: ${columnNames.join(', ')}. `;
            }
          }
          
          explanation += `This dictionary-to-DataFrame pattern is perfect for small datasets because you can see the entire structure at a glance. `;
          explanation += `For larger datasets, you'd typically load data from CSV files or databases.\n\n`;
        }
      }
      
      if (codeLower.includes('df[') || codeLower.includes('df.')) {
        explanation += `**DataFrame Operations**: You're working with DataFrame methods and indexing. `;
        explanation += `When you use \`df[...]\`, you're selecting columns, while \`df.method()\` calls DataFrame methods for operations like filtering, grouping, or transforming data.\n\n`;
        concepts.push('DataFrame Indexing');
      }
      
      if (codeLower.includes('print(df)') || (codeLower.includes('print(') && codeLower.includes('df'))) {
        explanation += `**Displaying Your Data**: The \`print(df)\` statement shows your DataFrame in a nicely formatted table. `;
        explanation += `Notice how pandas automatically:\n`;
        explanation += `- Aligns columns for readability\n`;
        explanation += `- Shows row numbers (indices) on the left\n`;
        explanation += `- Displays column names at the top\n`;
        explanation += `- Truncates output if you have many rows (you'll see "..." in the middle)\n\n`;
        explanation += `This formatted output makes it easy to see your data structure and verify that your DataFrame was created correctly.\n\n`;
      }
    }
    
    // Detect numpy usage
    if (codeLower.includes('np.') || codeLower.includes('numpy') || codeLower.includes('import numpy')) {
      concepts.push('NumPy Arrays');
      explanation += `**NumPy Operations**: You're using NumPy, which provides powerful array operations and mathematical functions. `;
      explanation += `NumPy arrays are more efficient than Python lists for numerical computations because they're implemented in C and optimized for speed.\n\n`;
    }
    
    // Detect matplotlib/plotting
    if (codeLower.includes('plt.') || codeLower.includes('matplotlib') || codeLower.includes('plot')) {
      concepts.push('Data Visualization');
      explanation += `**Plotting**: You're creating visualizations to understand your data. `;
      explanation += `Visualizations help you see patterns, trends, and relationships that might not be obvious from raw numbers.\n\n`;
    }
    
    // Detect dictionary usage (when not part of DataFrame creation)
    if (code.includes('{') && code.includes(':') && !codeLower.includes('dataframe') && !codeLower.includes('pd.dataframe')) {
      concepts.push('Python Dictionaries');
      explanation += `**Dictionary Usage**: You're using a Python dictionary, which stores key-value pairs. `;
      explanation += `Think of it like a real-world dictionary: you look up a word (the key) to find its definition (the value). `;
      explanation += `In your code, each key-value pair organizes related data - this makes dictionaries perfect for structured information.\n\n`;
      
      // Check if it's a data dictionary
      if (code.match(/\w+\s*=\s*\{/)) {
        explanation += `**Why Dictionaries for Data?**: Dictionaries are ideal for creating DataFrames because: `;
        explanation += `(1) Keys naturally become column names, `;
        explanation += `(2) Values (lists) become the data in those columns, `;
        explanation += `(3) The structure is human-readable and easy to modify.\n\n`;
      }
    }
    
    // Detect print statements
    if (codeLower.includes('print(')) {
      const printCount = (code.match(/print\(/g) || []).length;
      if (printCount > 1) {
        explanation += `**Multiple Print Statements**: You're using ${printCount} print statements to display different pieces of information. `;
        explanation += `This is a good debugging technique - you can see the intermediate results at each step of your code.\n\n`;
      }
      concepts.push('Output and Debugging');
    }
    
    // Detect variable assignment
    if (code.match(/\w+\s*=\s*/g)) {
      const assignments = code.match(/\w+\s*=\s*/g) || [];
      explanation += `**Variable Assignment**: You're creating ${assignments.length} variable${assignments.length > 1 ? 's' : ''} to store data. `;
      explanation += `Good variable names (like \`df\` for DataFrame or \`data\` for raw data) make your code self-documenting and easier to understand.\n\n`;
      concepts.push('Variable Naming');
    }
    
    // Detect imports
    if (codeLower.includes('import ')) {
      const imports = code.match(/import\s+(\w+)/g) || [];
      if (imports.length > 0) {
        explanation += `**Importing Libraries**: You're importing ${imports.length} librar${imports.length > 1 ? 'ies' : 'y'}. `;
        explanation += `Python's import system lets you use code written by others. `;
        explanation += `Libraries like pandas and numpy are the foundation of data science in Python - they provide pre-built, optimized functions for common tasks.\n\n`;
        concepts.push('Python Imports');
      }
    }
    
    // Detect comments
    if (code.includes('#') || code.includes('"""') || code.includes("'''")) {
      explanation += `**Comments**: Great! You've included comments in your code. `;
      explanation += `Comments help explain the "why" behind your code, not just the "what" - this is especially helpful when you revisit code later or share it with others.\n\n`;
    } else {
      suggestions.push('Consider adding comments to explain complex logic or important steps');
    }
    
    // Add line-by-line analysis for DataFrame creation pattern
    if (codeLower.includes('pd.dataframe') && codeLower.includes('print')) {
      explanation += `**Step-by-Step Breakdown**:\n\n`;
      
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        if (trimmed.includes('import pandas')) {
          explanation += `- **Line ${idx + 1} - Import**: This imports the pandas library, giving you access to powerful data manipulation tools. `;
          explanation += `The alias \`pd\` is a Python convention - it's shorter to type and everyone recognizes it.\n\n`;
        } else if (trimmed.includes('data = {') || (trimmed.includes('=') && trimmed.includes('{'))) {
          explanation += `- **Line ${idx + 1} - Dictionary Definition**: You're creating a dictionary called \`data\`. `;
          explanation += `Each key (like 'Name', 'Age') represents a column, and each value is a list of data for that column. `;
          explanation += `Notice how all lists must have the same length - this ensures each row has data for every column.\n\n`;
        } else if (trimmed.includes('df = pd.DataFrame')) {
          explanation += `- **Line ${idx + 1} - DataFrame Creation**: This line converts your dictionary into a DataFrame. `;
          explanation += `Think of \`pd.DataFrame()\` as a function that transforms structured data (your dictionary) into a table format. `;
          explanation += `The result is stored in the variable \`df\`, which now holds your tabular data.\n\n`;
        } else if (trimmed.includes('print(') && trimmed.includes('df')) {
          explanation += `- **Line ${idx + 1} - Display**: The \`print()\` function outputs your DataFrame to the console. `;
          explanation += `This lets you verify that your data was structured correctly and see what the DataFrame looks like.\n\n`;
        } else if (trimmed.includes('print(')) {
          const messageMatch = trimmed.match(/print\(["']([^"']+)["']\)/);
          if (messageMatch) {
            explanation += `- **Line ${idx + 1} - Message**: This prints a descriptive message. `;
            explanation += `Adding labels like "${messageMatch[1]}" helps you understand what output you're looking at, especially when running multiple cells.\n\n`;
          }
        }
      });
    }
    
    // Provide educational context for other code
    if (!explanation || explanation.length < 50) {
      explanation += `**Code Overview**: This ${lines.length}-line code block demonstrates Python programming concepts. `;
      explanation += `Let's break down what's happening:\n\n`;
      
      // Analyze each significant line
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.length > 5) {
          if (trimmed.includes('=') && !trimmed.includes('==')) {
            explanation += `- **Line ${idx + 1}**: Creates a variable and assigns a value to it. `;
            explanation += `This stores data that you can use later in your code.\n`;
          }
        }
      });
    }
    
    // Add educational suggestions - teacher-like guidance
    if (codeLower.includes('pd.dataframe')) {
      if (!codeLower.includes('df.head()') && !codeLower.includes('df.tail()')) {
        suggestions.push('💡 **Next Step**: Try `df.head()` to see the first 5 rows, or `df.tail()` for the last 5. This is essential for exploring large datasets!');
      }
      
      if (!codeLower.includes('df.info()')) {
        suggestions.push('📊 **Data Exploration**: Use `df.info()` to see data types, memory usage, and check for missing values - this is your first step in any data analysis');
      }
      
      if (!codeLower.includes('df.shape')) {
        suggestions.push('🔍 **Understanding Your Data**: Run `df.shape` to see how many rows and columns you have. This gives you a quick overview of your dataset size.');
      }
      
      if (!codeLower.includes('df.describe()')) {
        suggestions.push('📈 **Statistical Summary**: Try `df.describe()` to get summary statistics (mean, median, min, max) for numeric columns - very useful for understanding your data!');
      }
    }
    
    if (codeLower.includes('print(') && codeLower.includes('df')) {
      suggestions.push('💭 **Pro Tip**: Instead of just `print(df)`, try `print(df.to_string())` for more control, or `display(df)` in Jupyter for better formatting');
    }
    
    // Suggestions for error handling
    if (!codeLower.includes('except') && !codeLower.includes('try')) {
      if (codeLower.includes('pd.read_') || codeLower.includes('pd.') || codeLower.includes('df.')) {
        suggestions.push('🛡️ **Error Handling**: When working with files, wrap file operations in try-except blocks. This prevents your program from crashing if a file is missing!');
      }
    }
    
    // Suggestions for data quality
    if (codeLower.includes('pd.dataframe')) {
      suggestions.push('🎯 **Learning Goal**: Practice filtering data with `df[df[\'column\'] > value]` or selecting columns with `df[[\'col1\', \'col2\']]` - these are essential DataFrame operations!');
    }
    
    // Default concepts if none detected
    if (concepts.length === 0) {
      concepts.push('Python Basics', 'Code Structure');
    }
    
    // Add general suggestions
    if (!suggestions.includes('Add comments for clarity') && !code.includes('#')) {
      suggestions.push('Add comments to explain your thought process');
    }
    
    return {
      explanation: explanation.trim() || `This ${lines.length}-line code block demonstrates Python programming concepts. Review each line to understand how the code flows from top to bottom.`,
      concepts,
      suggestions: suggestions.length > 0 ? suggestions : ['Keep practicing - each line of code is a learning opportunity!']
    };
  }

  async explainPlot(request: ExplainPlotRequest): Promise<ExplainPlotResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      explanation: `This visualization shows data trends over time. The plot displays relationships between variables and can help identify patterns in the dataset.`,
      insights: [
        'The data shows a clear trend',
        'There are some outliers worth investigating',
        'The distribution appears normal'
      ],
      improvements: [
        'Add axis labels for clarity',
        'Consider using different colors for categories',
        'Add a title to describe what the plot shows'
      ]
    };
  }

  async errorTutor(request: ErrorTutorRequest): Promise<ErrorTutorResponse> {
    await new Promise(resolve => setTimeout(resolve, 700));

    const errorLower = request.error.toLowerCase();
    
    let explanation = 'This error occurred during code execution.';
    let solution = 'Review the error message and check your code logic.';
    let commonMistakes: string[] = [];
    let relatedConcepts: string[] = [];

    if (errorLower.includes('nameerror') || errorLower.includes('name')) {
      explanation = 'A NameError occurs when Python cannot find a variable or function name.';
      solution = 'Check that all variables are defined before use, and verify spelling.';
      commonMistakes = ['Typos in variable names', 'Using variables before assignment', 'Scope issues'];
      relatedConcepts = ['Variable scope', 'Python naming conventions'];
    } else if (errorLower.includes('typeerror') || errorLower.includes('type')) {
      explanation = 'A TypeError occurs when an operation is performed on an incompatible data type.';
      solution = 'Check the types of your variables and ensure they support the operation.';
      commonMistakes = ['Mixing strings and numbers', 'Calling non-callable objects', 'Wrong argument types'];
      relatedConcepts = ['Python data types', 'Type conversion'];
    } else if (errorLower.includes('attributeerror') || errorLower.includes('attribute')) {
      explanation = 'An AttributeError occurs when trying to access an attribute that does not exist.';
      solution = 'Verify the object has the attribute you are trying to access.';
      commonMistakes = ['Wrong method name', 'Object is None', 'Wrong object type'];
      relatedConcepts = ['Object attributes', 'Method calls'];
    } else if (errorLower.includes('indexerror') || errorLower.includes('index')) {
      explanation = 'An IndexError occurs when trying to access an index that does not exist.';
      solution = 'Check the length of your list/array before accessing indices.';
      commonMistakes = ['Accessing beyond list length', 'Negative index out of range', 'Empty list access'];
      relatedConcepts = ['List indexing', 'Array bounds'];
    }

    return {
      explanation,
      solution,
      commonMistakes,
      relatedConcepts
    };
  }
}

// Export singleton instance
export const aiProvider: AIProvider = new MockAIProvider();

// Factory function to swap providers
export function setAIProvider(provider: AIProvider) {
  // This would be used with a state management solution
  // For now, we'll use the singleton pattern
  Object.assign(aiProvider, provider);
}



