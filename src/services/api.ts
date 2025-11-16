// Both backends are on the same Railway URL
// Extract base URL from VITE_API_URL or use VITE_API_BASE_URL, fallback to localhost
const getBaseUrl = () => {
  const env = (import.meta as any).env;
  if (env?.VITE_API_BASE_URL) return env.VITE_API_BASE_URL;
  if (env?.VITE_API_URL) {
    const url = env.VITE_API_URL;
    return url.replace('/api', '');
  }
  return 'http://localhost:8000';
};

const BASE_URL = getBaseUrl();
const API_BASE_URL = `${BASE_URL}/api`;
const AI_API_BASE_URL = (import.meta as any).env?.VITE_AI_API_URL || `${BASE_URL}/api`;

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`[API] Making request to: ${url}`, { method: options.method || 'GET', body: config.body });
      const response = await fetch(url, config);
      
      console.log(`[API] Response status: ${response.status} ${response.statusText}`, { url, ok: response.ok });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response body:`, errorText);
        // Create error with status code for better error handling
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('[API] Request failed:', {
        error,
        url,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  // AI Chat - uses Node.js backend
  async sendChatMessage(message: string, context?: string, userLevel: string = 'intermediate') {
    const url = `${AI_API_BASE_URL}/ai/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, userLevel }),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  // Code Generation - uses Node.js backend
  async generateCode(description: string, type: string, language: string, complexity: string, context?: string) {
    const url = `${AI_API_BASE_URL}/ai/generate-code`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, type, language, complexity, context }),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async generateCodeFromCSV(description: string, fileName: string, csvData: string, csvHeaders: string[], csvPreview: any[], context?: string) {
    const url = `${AI_API_BASE_URL}/ai/generate-code-from-csv`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        description, 
        fileName, 
        csvData, 
        csvHeaders,
        csvPreview,
        context 
      }),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  // Generate guiding questions - uses Node.js backend
  async generateQuestions(code: string, explanation: string, userMessage: string) {
    const url = `${AI_API_BASE_URL}/ai/generate-questions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, explanation, userMessage }),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.questions || [];
  }

  // Project Building
  async buildProject(projectType: string, description: string, userLevel: string = 'intermediate') {
    return this.request('/ai/build-project', {
      method: 'POST',
      body: JSON.stringify({ projectType, description, userLevel }),
    });
  }

  // Learning Suggestions
  async getLearningSuggestions(codeContent: string, fileType: string, userProgress: any) {
    return this.request('/ai/learning-suggestions', {
      method: 'POST',
      body: JSON.stringify({ codeContent, fileType, userProgress }),
    });
  }

  // Project Management
  async getProjectTemplates() {
    return this.request('/projects/templates');
  }

  async startProject(templateId: string, customDescription?: string) {
    return this.request('/projects/start', {
      method: 'POST',
      body: JSON.stringify({ templateId, customDescription }),
    });
  }

  async getProject(projectId: string) {
    return this.request(`/projects/${projectId}`);
  }

  async updateProjectProgress(projectId: string, stepId: string, completed: boolean, userUnderstanding?: string) {
    return this.request(`/projects/${projectId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ stepId, completed, userUnderstanding }),
    });
  }

  async completeProject(projectId: string, finalInsights: string[], userFeedback?: string) {
    return this.request(`/projects/${projectId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ finalInsights, userFeedback }),
    });
  }

  // Learning Management
  async startLearningSession(type: string, title: string, description: string, difficulty: string, userId: string) {
    return this.request('/learning/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ type, title, description, difficulty, userId }),
    });
  }

  async completeLearningSession(sessionId: string, score: number, insights: string[], timeSpent: number) {
    return this.request(`/learning/sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ score, insights, timeSpent }),
    });
  }

  async getUserProgress(userId: string) {
    return this.request(`/learning/progress/${userId}`);
  }

  async updateUserProgress(userId: string, criticalThinkingScore?: number, codebaseFamiliarityScore?: number, achievements?: string[]) {
    return this.request(`/learning/progress/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ criticalThinkingScore, codebaseFamiliarityScore, achievements }),
    });
  }

  async getLearningInsights(codeContent: string, fileType: string, userLevel: string) {
    return this.request('/learning/insights', {
      method: 'POST',
      body: JSON.stringify({ codeContent, fileType, userLevel }),
    });
  }

  async getAchievements(userId: string) {
    return this.request(`/learning/achievements/${userId}`);
  }

  // Notebook Execution
  async executeCode(code: string, cellId: string, sessionId?: string) {
    return this.request('/execute', {
      method: 'POST',
      body: JSON.stringify({ code, cellId, sessionId }),
    });
  }

  async getVariables(sessionId: string) {
    return this.request(`/variables/${sessionId}`);
  }

  // File Storage
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async listFiles() {
    return this.request<{ files: any[] }>('/files');
  }

  async downloadFile(filename: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/files/${encodeURIComponent(filename)}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.blob();
  }

  async deleteFile(filename: string) {
    return this.request(`/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
  }

  async exportCSV(filename: string, headers: string[], rows: any[]) {
    return this.request('/files/export-csv', {
      method: 'POST',
      body: JSON.stringify({ filename, headers, rows }),
    });
  }

  async getStoragePath() {
    return this.request<{ storage_path: string }>('/files/storage-path');
  }

  async restartKernel(sessionId: string) {
    return this.request(`/sessions/${sessionId}/restart`, {
      method: 'POST',
    });
  }

  async shutdownKernel(sessionId: string) {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
