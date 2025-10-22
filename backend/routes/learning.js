const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (in production, use a database)
let learningSessions = [];
let userProgress = {};

// Start a learning session
router.post('/sessions/start', (req, res) => {
  try {
    const { type, title, description, difficulty, userId } = req.body;

    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      type,
      title,
      description,
      difficulty,
      userId,
      status: 'active',
      startedAt: new Date().toISOString(),
      currentQuestion: 0,
      score: 0,
      timeSpent: 0
    };

    learningSessions.push(session);

    res.json({
      session,
      message: 'Learning session started',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Start learning session error:', error);
    res.status(500).json({ 
      error: 'Failed to start learning session',
      message: error.message 
    });
  }
});

// Complete a learning session
router.put('/sessions/:sessionId/complete', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { score, insights, timeSpent } = req.body;

    const session = learningSessions.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Learning session not found' });
    }

    session.status = 'completed';
    session.score = score;
    session.insights = insights;
    session.timeSpent = timeSpent;
    session.completedAt = new Date().toISOString();

    // Update user progress
    const userId = session.userId;
    if (!userProgress[userId]) {
      userProgress[userId] = {
        totalSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        criticalThinkingScore: 0,
        codebaseFamiliarityScore: 0,
        achievements: []
      };
    }

    const progress = userProgress[userId];
    progress.totalSessions += 1;
    progress.averageScore = (progress.averageScore * (progress.totalSessions - 1) + score) / progress.totalSessions;
    progress.totalTimeSpent += timeSpent;
    progress.criticalThinkingScore = Math.min(100, progress.criticalThinkingScore + Math.floor(score / 10));
    progress.codebaseFamiliarityScore = Math.min(100, progress.codebaseFamiliarityScore + Math.floor(score / 15));

    res.json({
      session,
      progress: userProgress[userId],
      message: 'Learning session completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Complete learning session error:', error);
    res.status(500).json({ 
      error: 'Failed to complete learning session',
      message: error.message 
    });
  }
});

// Get user progress
router.get('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress[userId] || {
      totalSessions: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      criticalThinkingScore: 0,
      codebaseFamiliarityScore: 0,
      achievements: []
    };

    const userSessions = learningSessions.filter(s => s.userId === userId);
    const recentSessions = userSessions.slice(-5);

    res.json({
      progress,
      recentSessions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ 
      error: 'Failed to get user progress',
      message: error.message 
    });
  }
});

// Update user progress
router.put('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { criticalThinkingScore, codebaseFamiliarityScore, achievements } = req.body;

    if (!userProgress[userId]) {
      userProgress[userId] = {
        totalSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        criticalThinkingScore: 0,
        codebaseFamiliarityScore: 0,
        achievements: []
      };
    }

    const progress = userProgress[userId];
    
    if (criticalThinkingScore !== undefined) {
      progress.criticalThinkingScore = Math.min(100, Math.max(0, criticalThinkingScore));
    }
    
    if (codebaseFamiliarityScore !== undefined) {
      progress.codebaseFamiliarityScore = Math.min(100, Math.max(0, codebaseFamiliarityScore));
    }
    
    if (achievements) {
      progress.achievements = [...new Set([...progress.achievements, ...achievements])];
    }

    res.json({
      progress,
      message: 'Progress updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update user progress error:', error);
    res.status(500).json({ 
      error: 'Failed to update user progress',
      message: error.message 
    });
  }
});

// Get learning insights
router.post('/insights', (req, res) => {
  try {
    const { codeContent, fileType, userLevel } = req.body;

    // Generate learning insights based on code analysis
    const insights = generateLearningInsights(codeContent, fileType, userLevel);

    res.json({
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get learning insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate learning insights',
      message: error.message 
    });
  }
});

// Get achievement suggestions
router.get('/achievements/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress[userId] || {};

    const achievements = generateAchievementSuggestions(progress);

    res.json({
      achievements,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ 
      error: 'Failed to get achievements',
      message: error.message 
    });
  }
});

// Helper functions
function generateLearningInsights(codeContent, fileType, userLevel) {
  const insights = [];

  // Analyze code patterns
  if (codeContent.includes('useState') || codeContent.includes('useEffect')) {
    insights.push({
      type: 'pattern',
      title: 'React Hooks Detected',
      description: 'Your code uses React hooks. Consider learning about custom hooks and their best practices.',
      severity: 'info',
      learningPoints: ['Custom hooks', 'Hook composition', 'Performance optimization']
    });
  }

  if (codeContent.includes('interface') || codeContent.includes('type')) {
    insights.push({
      type: 'pattern',
      title: 'TypeScript Usage',
      description: 'Great use of TypeScript! Consider exploring advanced types and generics.',
      severity: 'info',
      learningPoints: ['Advanced TypeScript', 'Generic types', 'Type guards']
    });
  }

  if (codeContent.split('\n').length > 100) {
    insights.push({
      type: 'architecture',
      title: 'Large File Detected',
      description: 'This file is getting quite long. Consider breaking it into smaller, focused components.',
      severity: 'warning',
      learningPoints: ['Component composition', 'Separation of concerns', 'Code organization']
    });
  }

  if (codeContent.includes('async') && !codeContent.includes('try')) {
    insights.push({
      type: 'performance',
      title: 'Error Handling Opportunity',
      description: 'Consider adding error handling for async operations to improve user experience.',
      severity: 'warning',
      learningPoints: ['Error handling', 'User experience', 'Robust applications']
    });
  }

  return insights;
}

function generateAchievementSuggestions(progress) {
  const achievements = [];

  if (progress.totalSessions >= 3 && !progress.achievements.includes('dedicated-learner')) {
    achievements.push({
      id: 'dedicated-learner',
      title: 'Dedicated Learner',
      description: 'Complete 3+ learning sessions',
      icon: '📚',
      category: 'learning',
      unlocked: false
    });
  }

  if (progress.criticalThinkingScore >= 80 && !progress.achievements.includes('critical-thinker')) {
    achievements.push({
      id: 'critical-thinker',
      title: 'Critical Thinker',
      description: 'Achieve 80+ critical thinking score',
      icon: '🧠',
      category: 'problem-solving',
      unlocked: false
    });
  }

  if (progress.codebaseFamiliarityScore >= 70 && !progress.achievements.includes('codebase-expert')) {
    achievements.push({
      id: 'codebase-expert',
      title: 'Codebase Expert',
      description: 'Achieve 70+ codebase familiarity score',
      icon: '🎯',
      category: 'exploration',
      unlocked: false
    });
  }

  return achievements;
}

module.exports = router;
