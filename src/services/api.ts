const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // AI Chat
  async sendChatMessage(message: string, context?: string, userLevel: string = 'intermediate') {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context, userLevel }),
    });
  }

  // Code Generation
  async generateCode(description: string, type: string, language: string, complexity: string, context?: string) {
    return this.request('/ai/generate-code', {
      method: 'POST',
      body: JSON.stringify({ description, type, language, complexity, context }),
    });
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

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
