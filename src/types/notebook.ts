/**
 * Notebook Types for Jupyter-style IDE
 */

export type CellType = 'code' | 'markdown';

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface CellOutput {
  type: 'text' | 'html' | 'image' | 'dataframe' | 'error';
  data: string; // Base64 for images, HTML string for HTML, text for text
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface VariableSnapshot {
  name: string;
  type: string;
  value: string; // String representation
  shape?: string; // For arrays/dataframes: e.g., "(100, 5)"
  summary?: string; // For dataframes: summary stats
  preview?: string; // First few rows for dataframes
}

export interface NotebookCell {
  id: string;
  type: CellType;
  content: string;
  executionCount?: number;
  status: ExecutionStatus;
  output?: CellOutput[];
  error?: string;
  executionTime?: number;
  variablesBefore?: VariableSnapshot[];
  variablesAfter?: VariableSnapshot[];
  metadata?: Record<string, any>; // For storing questions, etc.
}

export interface Notebook {
  id: string;
  name: string;
  cells: NotebookCell[];
  createdAt: Date;
  updatedAt: Date;
  kernelId?: string; // Session identifier for Python kernel
}

export interface ExecutionRequest {
  code: string;
  cellId: string;
  sessionId?: string;
}

export interface ExecutionResponse {
  success: boolean;
  stdout?: string;
  stderr?: string;
  output?: CellOutput[];
  error?: string;
  executionTime?: number;
  variables?: VariableSnapshot[];
  plots?: string[]; // Base64 encoded images
}

export interface VariableInspector {
  variables: VariableSnapshot[];
  lastUpdated: Date;
}



