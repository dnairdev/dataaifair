const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (in production, use a database)
let projects = [];
let projectSteps = {};

// Get all project templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'todo-app',
      name: 'Smart Todo App',
      description: 'Build a modern todo app with React, TypeScript, and advanced features',
      category: 'react',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      learningGoals: [
        'React hooks and state management',
        'TypeScript interfaces and types',
        'Component composition patterns',
        'Local storage integration',
        'Responsive design principles'
      ]
    },
    {
      id: 'weather-app',
      name: 'Weather Dashboard',
      description: 'Build a weather app with API integration and data visualization',
      category: 'react',
      difficulty: 'intermediate',
      estimatedTime: '3-4 hours',
      learningGoals: [
        'API integration and error handling',
        'Data visualization with charts',
        'Responsive design and mobile-first approach',
        'API caching and performance optimization',
        'Error handling and user feedback'
      ]
    },
    {
      id: 'ecommerce-store',
      name: 'E-commerce Store',
      description: 'Build a full-stack e-commerce application with modern features',
      category: 'fullstack',
      difficulty: 'advanced',
      estimatedTime: '8-10 hours',
      learningGoals: [
        'Full-stack development',
        'Database design and relationships',
        'Authentication and authorization',
        'Payment integration',
        'Performance optimization'
      ]
    }
  ];

  res.json({
    templates,
    timestamp: new Date().toISOString()
  });
});

// Start a new project
router.post('/start', (req, res) => {
  try {
    const { templateId, customDescription } = req.body;
    
    const projectId = uuidv4();
    const project = {
      id: projectId,
      templateId,
      customDescription,
      status: 'active',
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    projects.push(project);

    res.json({
      project,
      message: 'Project started successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Start project error:', error);
    res.status(500).json({ 
      error: 'Failed to start project',
      message: error.message 
    });
  }
});

// Get project details
router.get('/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      project,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      error: 'Failed to get project',
      message: error.message 
    });
  }
});

// Update project progress
router.put('/:projectId/progress', (req, res) => {
  try {
    const { projectId } = req.params;
    const { stepId, completed, userUnderstanding } = req.body;

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (completed) {
      if (!project.completedSteps.includes(stepId)) {
        project.completedSteps.push(stepId);
      }
      project.currentStep += 1;
    }

    project.lastActivity = new Date().toISOString();

    // Store user understanding
    if (userUnderstanding) {
      if (!project.userUnderstanding) {
        project.userUnderstanding = {};
      }
      project.userUnderstanding[stepId] = userUnderstanding;
    }

    res.json({
      project,
      message: 'Progress updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      error: 'Failed to update progress',
      message: error.message 
    });
  }
});

// Complete project
router.put('/:projectId/complete', (req, res) => {
  try {
    const { projectId } = req.params;
    const { finalInsights, userFeedback } = req.body;

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = 'completed';
    project.completedAt = new Date().toISOString();
    project.finalInsights = finalInsights;
    project.userFeedback = userFeedback;

    res.json({
      project,
      message: 'Project completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Complete project error:', error);
    res.status(500).json({ 
      error: 'Failed to complete project',
      message: error.message 
    });
  }
});

// Get user's projects
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userProjects = projects.filter(p => p.userId === userId);

    res.json({
      projects: userProjects,
      total: userProjects.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ 
      error: 'Failed to get user projects',
      message: error.message 
    });
  }
});

// Delete project
router.delete('/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects.splice(projectIndex, 1);

    res.json({
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      error: 'Failed to delete project',
      message: error.message 
    });
  }
});

module.exports = router;
