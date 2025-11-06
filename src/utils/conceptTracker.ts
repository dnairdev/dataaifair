/**
 * Concept Tracker for Data Science Learning
 * Tracks which Python/data science concepts users have learned
 */

export interface Concept {
  id: string;
  name: string;
  category: 'pandas' | 'numpy' | 'matplotlib' | 'seaborn' | 'plotly' | 'python' | 'general';
  description: string;
  learnedAt?: Date;
  examples?: string[];
}

export interface ConceptTracker {
  concepts: Concept[];
  addConcept: (concept: Concept) => void;
  hasLearned: (conceptName: string) => boolean;
  getConceptsByCategory: (category: Concept['category']) => Concept[];
}

const commonConcepts: Concept[] = [
  { id: '1', name: 'DataFrame Creation', category: 'pandas', description: 'Creating pandas DataFrames' },
  { id: '2', name: 'DataFrame Operations', category: 'pandas', description: 'Filtering, grouping, and transforming DataFrames' },
  { id: '3', name: 'Array Operations', category: 'numpy', description: 'Working with numpy arrays' },
  { id: '4', name: 'Plotting Basics', category: 'matplotlib', description: 'Creating basic plots with matplotlib' },
  { id: '5', name: 'Statistical Visualization', category: 'seaborn', description: 'Using seaborn for statistical plots' },
  { id: '6', name: 'Interactive Plots', category: 'plotly', description: 'Creating interactive visualizations' },
];

export function detectConceptsFromCode(code: string): Concept[] {
  const detected: Concept[] = [];
  const codeLower = code.toLowerCase();

  // Pandas concepts
  if (codeLower.includes('pd.dataframe') || codeLower.includes('pandas.dataframe')) {
    detected.push({ ...commonConcepts[0], learnedAt: new Date() });
  }
  if (codeLower.includes('df[') || codeLower.includes('.groupby') || codeLower.includes('.filter')) {
    detected.push({ ...commonConcepts[1], learnedAt: new Date() });
  }

  // NumPy concepts
  if (codeLower.includes('np.array') || codeLower.includes('numpy.array')) {
    detected.push({ ...commonConcepts[2], learnedAt: new Date() });
  }

  // Matplotlib concepts
  if (codeLower.includes('plt.plot') || codeLower.includes('plt.scatter') || codeLower.includes('plt.bar')) {
    detected.push({ ...commonConcepts[3], learnedAt: new Date() });
  }

  // Seaborn concepts
  if (codeLower.includes('sns.') || codeLower.includes('seaborn.')) {
    detected.push({ ...commonConcepts[4], learnedAt: new Date() });
  }

  // Plotly concepts
  if (codeLower.includes('px.') || codeLower.includes('plotly')) {
    detected.push({ ...commonConcepts[5], learnedAt: new Date() });
  }

  return detected;
}

export function getConceptSummary(concepts: Concept[]): string {
  const byCategory = concepts.reduce((acc, concept) => {
    if (!acc[concept.category]) acc[concept.category] = [];
    acc[concept.category].push(concept.name);
    return acc;
  }, {} as Record<string, string[]>);

  return Object.entries(byCategory)
    .map(([category, names]) => `${category}: ${names.join(', ')}`)
    .join('\n');
}



