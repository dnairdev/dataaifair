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
    
    // Start with an overview
    explanation += `## 📚 Let's Learn This Code Step-by-Step\n\n`;
    explanation += `In this code, we're going to break down each part and understand what it does and why it's important. Let's walk through it together!\n\n`;
    
    // Detect pandas usage
    if (codeLower.includes('pd.dataframe') || codeLower.includes('pandas') || codeLower.includes('import pandas')) {
      concepts.push('Pandas DataFrame');
      
      if (codeLower.includes('pd.dataframe(')) {
        explanation += `### Step 1: Understanding DataFrames\n\n`;
        explanation += `A pandas DataFrame is like a spreadsheet or a table in a database. It's a two-dimensional data structure that organizes data into rows and columns. `;
        explanation += `Think of it like an Excel sheet - you have columns (like "Name", "Age") and rows (each person's data). `;
        explanation += `DataFrames are the foundation of data analysis in Python because they make it easy to work with structured data.\n\n`;
        
        if (codeLower.includes('{') && codeLower.includes(':')) {
          explanation += `### Step 2: Creating a DataFrame from a Dictionary\n\n`;
          explanation += `In your code, you're creating the DataFrame from a Python dictionary. Here's how it works step-by-step:\n\n`;
          explanation += `1. **Dictionary Structure**: Each key in the dictionary becomes a column name (like "Name", "Age", "City")\n`;
          explanation += `2. **Column Data**: Each value (which is a list) becomes the data in that column\n`;
          explanation += `3. **Row Alignment**: Python automatically aligns the data - the first item in each list becomes row 1, the second item becomes row 2, and so on\n\n`;
          
          // Try to extract column names
          const dictMatch = code.match(/\{[\s\S]*?\}/);
          if (dictMatch) {
            const dictContent = dictMatch[0];
            const columnMatches = dictContent.match(/'([^']+)'|"([^"]+)"/g);
            if (columnMatches && columnMatches.length > 0) {
              const columnNames = columnMatches.filter((_, i) => i % 2 === 0).map(c => c.replace(/['"]/g, ''));
              explanation += `**In your specific code**, you're creating these columns: ${columnNames.join(', ')}. `;
              explanation += `Each column will contain the data from the corresponding list in your dictionary.\n\n`;
            }
          }
          
          explanation += `**Why use a dictionary?** This pattern is perfect for small datasets because:\n`;
          explanation += `- You can see the entire data structure at a glance\n`;
          explanation += `- It's easy to modify and experiment with\n`;
          explanation += `- It's human-readable and self-documenting\n\n`;
          explanation += `For larger datasets, you'd typically load data from CSV files or databases, but starting with a dictionary is a great way to learn!\n\n`;
        }
      }
      
      if (codeLower.includes('df[') || codeLower.includes('df.')) {
        explanation += `### Step 3: Working with DataFrame Data\n\n`;
        explanation += `Now that you have a DataFrame, you can access and manipulate the data. Here's how:\n\n`;
        explanation += `- **\`df[...]\`**: This is called "bracket notation" - it lets you select specific columns. For example, \`df['Name']\` gets just the Name column.\n`;
        explanation += `- **\`df.method()\`**: This calls DataFrame methods for operations like filtering, grouping, or transforming data. Methods like \`df.head()\`, \`df.describe()\`, or \`df.groupby()\` are powerful tools for data analysis.\n\n`;
        explanation += `**Think of it this way**: The DataFrame is like a toolbox, and these methods are the tools inside it. Each tool does a specific job with your data!\n\n`;
        concepts.push('DataFrame Indexing');
      }
      
      if (codeLower.includes('print(df)') || (codeLower.includes('print(') && codeLower.includes('df'))) {
        explanation += `### Step 4: Displaying Your Results\n\n`;
        explanation += `The \`print(df)\` statement shows your DataFrame in a beautifully formatted table. Let's see what pandas does automatically:\n\n`;
        explanation += `1. **Column Alignment**: Columns are neatly aligned for easy reading\n`;
        explanation += `2. **Row Numbers**: Indices (row numbers) appear on the left side - these help you identify specific rows\n`;
        explanation += `3. **Column Headers**: Column names are displayed at the top\n`;
        explanation += `4. **Smart Truncation**: If you have many rows, pandas shows "..." in the middle to keep the output manageable\n\n`;
        explanation += `**Why is this important?** Seeing your data formatted like this helps you:\n`;
        explanation += `- Verify that your DataFrame was created correctly\n`;
        explanation += `- Understand the structure of your data\n`;
        explanation += `- Spot any issues or unexpected values\n\n`;
        explanation += `It's like proofreading your work - you want to make sure everything looks right before you continue!\n\n`;
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
      explanation += `### Step-by-Step Line-by-Line Breakdown\n\n`;
      explanation += `Let's go through your code line by line to understand exactly what's happening:\n\n`;
      
      let stepNumber = 1;
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        if (trimmed.includes('import pandas')) {
          explanation += `**Step ${stepNumber++} - Line ${idx + 1}: Importing Libraries**\n\n`;
          explanation += `\`${trimmed}\`\n\n`;
          explanation += `This line imports the pandas library and gives it the nickname \`pd\`. Here's why this matters:\n`;
          explanation += `- **Import**: Python needs to know where to find the pandas code - this line tells Python "go get the pandas library"\n`;
          explanation += `- **Alias \`pd\`**: Instead of typing \`pandas.DataFrame()\` every time, we can just type \`pd.DataFrame()\`. It's shorter and it's what everyone in the Python community does - it's a convention!\n`;
          explanation += `- **Why pandas?**: Pandas gives us powerful tools for working with data - it's like having a super-powered Excel built into Python.\n\n`;
        } else if (trimmed.includes('data = {') || (trimmed.includes('=') && trimmed.includes('{'))) {
          explanation += `**Step ${stepNumber++} - Line ${idx + 1}: Creating the Data Dictionary**\n\n`;
          explanation += `\`${trimmed}\`\n\n`;
          explanation += `This line creates a dictionary that will become our DataFrame. Let's break it down:\n`;
          explanation += `- **Dictionary Structure**: Each key (like 'Name', 'Age') will become a column name in our DataFrame\n`;
          explanation += `- **List Values**: Each value is a list - these lists become the data in each column\n`;
          explanation += `- **Important Rule**: All lists must have the same length! If one list has 4 items and another has 3, Python will give you an error. This ensures each row has data for every column.\n`;
          explanation += `- **Think of it like this**: You're creating a blueprint for a table - the keys are the column headers, and the lists are the data that will fill those columns.\n\n`;
        } else if (trimmed.includes('df = pd.DataFrame')) {
          explanation += `**Step ${stepNumber++} - Line ${idx + 1}: Converting Dictionary to DataFrame**\n\n`;
          explanation += `\`${trimmed}\`\n\n`;
          explanation += `This is where the magic happens! This line transforms your dictionary into a DataFrame:\n`;
          explanation += `- **\`pd.DataFrame()\`**: This is a function (a special command) that takes your dictionary and converts it into a table format\n`;
          explanation += `- **The Transformation**: Think of it like taking a recipe (your dictionary) and actually cooking the meal (creating the DataFrame)\n`;
          explanation += `- **Storing the Result**: The \`=\` sign stores the result in a variable called \`df\`. Now \`df\` holds your complete DataFrame with all the data organized in rows and columns\n`;
          explanation += `- **Why \`df\`?**: It's short for "DataFrame" - another Python convention that makes code easier to read and write\n\n`;
        } else if (trimmed.includes('print(') && trimmed.includes('df')) {
          explanation += `**Step ${stepNumber++} - Line ${idx + 1}: Displaying the Results**\n\n`;
          explanation += `\`${trimmed}\`\n\n`;
          explanation += `This line shows you what your DataFrame looks like:\n`;
          explanation += `- **\`print()\`**: This function displays information on your screen - it's like showing your work\n`;
          explanation += `- **What You'll See**: Pandas automatically formats the output as a nice table with aligned columns, row numbers, and headers\n`;
          explanation += `- **Why This Matters**: Seeing your data helps you verify everything worked correctly - it's like checking your answer in math class!\n\n`;
        } else if (trimmed.includes('print(')) {
          const messageMatch = trimmed.match(/print\(["']([^"']+)["']\)/);
          if (messageMatch) {
            explanation += `**Bonus - Line ${idx + 1}: Adding a Label**\n\n`;
            explanation += `\`${trimmed}\`\n\n`;
            explanation += `This prints a message like "${messageMatch[1]}" before showing your data. This is a great practice because:\n`;
            explanation += `- It helps you understand what output you're looking at\n`;
            explanation += `- When you run multiple cells, labels help you keep track of which output is which\n`;
            explanation += `- It makes your code more readable and professional\n\n`;
          }
        }
      });
    }
    
    // Provide educational context for other code
    if (!explanation || explanation.length < 50) {
      explanation += `## 📚 Understanding This Code\n\n`;
      explanation += `This ${lines.length}-line code block demonstrates important Python programming concepts. Let's walk through it step by step:\n\n`;
      
      let stepNum = 1;
      // Analyze each significant line
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.length > 5) {
          if (trimmed.includes('=') && !trimmed.includes('==')) {
            explanation += `### Step ${stepNum++}: Line ${idx + 1}\n\n`;
            explanation += `\`${trimmed}\`\n\n`;
            explanation += `This line creates a variable and assigns a value to it. Here's what that means:\n`;
            explanation += `- **Variable**: Think of a variable like a labeled box where you store information\n`;
            explanation += `- **Assignment**: The \`=\` sign puts data into that box\n`;
            explanation += `- **Why This Matters**: Once data is stored in a variable, you can use it later in your code - you don't have to retype the data every time!\n\n`;
          }
        }
      });
    }
    
    // Add a summary section
    explanation += `## 🎓 Summary: What We Learned\n\n`;
    explanation += `Great job working through this code! Here's what we covered:\n\n`;
    if (concepts.length > 0) {
      explanation += `**Key Concepts**:\n`;
      concepts.forEach(concept => {
        explanation += `- ${concept}\n`;
      });
      explanation += `\n`;
    }
    explanation += `**Takeaways**:\n`;
    explanation += `- We learned how to structure data using dictionaries and DataFrames\n`;
    explanation += `- We saw how Python libraries like pandas make data analysis easier\n`;
    explanation += `- We practiced displaying and viewing our data\n\n`;
    explanation += `**Next Steps**: Try modifying the data in your dictionary and see how it changes the DataFrame. Experimentation is the best way to learn!\n\n`;
    
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
    const errorText = request.error;
    const tracebackText = request.traceback || '';
    
    let explanation = 'This error occurred during code execution.';
    let solution = 'Review the error message and check your code logic.';
    let commonMistakes: string[] = [];
    let relatedConcepts: string[] = [];

    // Handle matplotlib backend warnings
    if (errorLower.includes('figurecanvasagg') || errorLower.includes('non-interactive') || 
        (errorLower.includes('cannot be shown') && errorLower.includes('plt.show'))) {
      explanation = 'You\'re seeing this warning because matplotlib is trying to display a plot interactively, but the notebook environment uses a non-interactive backend (Agg). This is normal for web-based notebooks! The plot should still be saved and displayed automatically.';
      solution = 'The plot should already be displayed above. If you don\'t see it, make sure you\'re creating a plot before calling `plt.show()`. The system automatically captures plots when you call `plt.show()`. You can safely ignore this warning - it\'s just informing you that the backend is non-interactive, which is expected in this environment.';
      commonMistakes = [
        'Calling `plt.show()` without creating a plot first',
        'Trying to use interactive matplotlib features that require a GUI',
        'Forgetting that plots are automatically captured and displayed'
      ];
      relatedConcepts = ['Matplotlib backends', 'Non-interactive plotting', 'Plot display in notebooks'];
    } else if (errorLower.includes('nameerror') || errorLower.includes('name')) {
      explanation = 'A NameError occurs when Python cannot find a variable or function name. This means you\'re trying to use something that hasn\'t been defined yet.';
      solution = 'Check that all variables are defined before use, and verify spelling. Make sure you\'ve imported any libraries you need (like `import pandas as pd`).';
      commonMistakes = ['Typos in variable names', 'Using variables before assignment', 'Scope issues', 'Missing import statements'];
      relatedConcepts = ['Variable scope', 'Python naming conventions', 'Import statements'];
    } else if (errorLower.includes('typeerror') || errorLower.includes('type')) {
      explanation = 'A TypeError occurs when an operation is performed on an incompatible data type. Python is strict about types - you can\'t do things like add a string to a number without converting first.';
      solution = 'Check the types of your variables using `type(variable_name)` and ensure they support the operation you\'re trying to perform. You may need to convert types using functions like `int()`, `str()`, or `float()`.';
      commonMistakes = ['Mixing strings and numbers', 'Calling non-callable objects', 'Wrong argument types', 'Forgetting to convert types'];
      relatedConcepts = ['Python data types', 'Type conversion', 'Type checking'];
    } else if (errorLower.includes('attributeerror') || errorLower.includes('attribute')) {
      explanation = 'An AttributeError occurs when trying to access an attribute or method that does not exist on an object. This usually means the object doesn\'t have the method you\'re trying to call.';
      solution = 'Verify the object has the attribute you are trying to access. Check the documentation for the correct method name, or use `dir(object)` to see what attributes are available.';
      commonMistakes = ['Wrong method name (e.g., `df.head()` vs `df.heads()`)', 'Object is None', 'Wrong object type', 'Method doesn\'t exist for this version'];
      relatedConcepts = ['Object attributes', 'Method calls', 'Object-oriented programming'];
    } else if (errorLower.includes('indexerror') || errorLower.includes('index')) {
      explanation = 'An IndexError occurs when trying to access an index that does not exist. This happens when you try to access position N in a list/array, but the list only has positions 0 through N-1.';
      solution = 'Check the length of your list/array before accessing indices using `len(your_list)`. Remember: Python uses 0-based indexing, so the first element is at index 0, not 1.';
      commonMistakes = ['Accessing beyond list length', 'Negative index out of range', 'Empty list access', 'Confusing 0-based vs 1-based indexing'];
      relatedConcepts = ['List indexing', 'Array bounds', 'Zero-based indexing'];
    } else if (errorLower.includes('importerror') || errorLower.includes('modulenotfounderror') || errorLower.includes('no module named')) {
      explanation = 'An ImportError or ModuleNotFoundError means Python cannot find the module you\'re trying to import. This usually means the package isn\'t installed.';
      solution = 'Install the missing package using `pip install package_name`. For example, if you see "No module named pandas", run `pip install pandas` in your terminal.';
      commonMistakes = ['Package not installed', 'Typo in import statement', 'Wrong package name', 'Virtual environment not activated'];
      relatedConcepts = ['Package installation', 'pip', 'Python imports', 'Virtual environments'];
    } else if (errorLower.includes('keyerror') || errorLower.includes('key')) {
      explanation = 'A KeyError occurs when trying to access a dictionary key that doesn\'t exist. Unlike lists, dictionaries don\'t have numeric indices - you must use the exact key name.';
      solution = 'Check that the key exists in the dictionary using `"key" in dictionary` or use `dictionary.get("key", default_value)` to provide a default if the key is missing.';
      commonMistakes = ['Typo in key name', 'Key doesn\'t exist', 'Case sensitivity issues', 'Wrong dictionary variable'];
      relatedConcepts = ['Dictionaries', 'Key-value pairs', 'Dictionary methods'];
    } else if (errorLower.includes('filenotfounderror') || errorLower.includes('no such file') || errorLower.includes('file not found')) {
      explanation = 'A FileNotFoundError occurs when Python tries to open a file that doesn\'t exist in the current directory. This is common when code references files that haven\'t been created or uploaded yet.';
      solution = 'Instead of reading from a file, you can:\n1. Generate sample data programmatically using pandas: `pd.DataFrame({...})`\n2. Use built-in sample datasets: `sns.load_dataset("tips")` or `sns.load_dataset("iris")`\n3. Create data manually using dictionaries or lists\n4. If you need real data, make sure the file exists in the same directory as your code';
      commonMistakes = [
        'Trying to read a CSV file that doesn\'t exist',
        'Using the wrong file path',
        'Not checking if the file exists first',
        'Forgetting to generate sample data for examples'
      ];
      relatedConcepts = ['File I/O', 'Data generation', 'Sample datasets', 'Error handling'];
    } else if (errorLower.includes('valueerror') && (errorLower.includes('all arrays must be of the same length') || errorLower.includes('arrays must be of the same length'))) {
      explanation = `## 📚 Understanding the ValueError: Array Length Mismatch

**What happened?**

You're trying to create a pandas DataFrame from a dictionary, but the lists in your dictionary have different lengths. Think of it like trying to build a table where one column has 31 rows, another has 30 rows, and another has 29 rows - it just doesn't work! Every column in a DataFrame must have exactly the same number of rows.

**Why does this happen?**

When you create a DataFrame from a dictionary:
- Each key becomes a column name
- Each value (list) becomes the data in that column
- **All lists MUST have the same length** - this is a fundamental rule of DataFrames

**Common causes:**
1. Counting errors when creating lists manually
2. Using pd.date_range() which might create a different number of dates than expected
3. Forgetting that months have different numbers of days (January = 31, February = 28/29, etc.)
4. Accidentally adding or removing items from one list but not the others`;
      solution = `## 🔧 How to Fix This - Step by Step

**Step 1: Count the items in each list**

Check how many items are in each of your lists:
\`\`\`python
# Count items in each list
print(f"Date: {len(pd.date_range(start='2022-01-01', end='2022-01-31'))} items")
print(f"NewCases: {len([320, 410, ...])} items")  # Replace with your actual list
print(f"NewDeaths: {len([10, 15, ...])} items")   # Replace with your actual list
\`\`\`

**Step 2: Make all lists the same length**

You have two options:

**Option A: Fix the date range** (if you have 30 data points)
\`\`\`python
# Use periods=30 instead of end date to get exactly 30 dates
'Date': pd.date_range(start='2022-01-01', periods=30, freq='D')
\`\`\`

**Option B: Add missing data points** (if you need 31 days)
\`\`\`python
# Add one more value to NewCases and NewDeaths lists
'NewCases': [320, 410, ..., 120, 110],  # Add one more number
'NewDeaths': [10, 15, ..., 23, 25]      # Add one more number
\`\`\`

**Step 3: Verify the fix**

After fixing, verify all lists have the same length:
\`\`\`python
data = {...}  # Your fixed dictionary
lengths = {key: len(value) for key, value in data.items()}
print(lengths)  # All values should be the same!
\`\`\`

**Quick Fix for Your Code:**

Since January has 31 days but your lists have 30 items, use:
\`\`\`python
data = {
    'Date': pd.date_range(start='2022-01-01', periods=30, freq='D'),  # Changed to periods=30
    'NewCases': [320, 410, 380, ..., 120],  # Your 30 values
    'NewDeaths': [10, 15, 12, ..., 23]      # Your 30 values
}
\`\`\``;
      commonMistakes = [
        'Forgetting that months have different numbers of days',
        'Using end date instead of periods parameter in pd.date_range()',
        'Manually counting items incorrectly',
        'Adding/removing items from one list but not others',
        'Not checking list lengths before creating DataFrame'
      ];
      relatedConcepts = ['DataFrame creation', 'Data alignment', 'pd.date_range()', 'List length matching', 'Data validation'];
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






