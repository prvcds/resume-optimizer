/**
 * Testing Routes for Gemini API
 * Provides endpoints to test and verify Gemini integration
 * These routes should be removed or restricted in production
 */

const express = require('express');
const router = express.Router();
const { 
  callGemini, 
  analyzeResume, 
  analyzeJob, 
  compareResumeToJob,
  generateImprovementSuggestions
} = require('../utils/gemini');

/**
 * Test endpoint: Simple Gemini API call
 * POST /api/test/gemini/simple
 */
router.post('/simple', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required and must be a string'
      });
    }

    const response = await callGemini(prompt);

    res.json({
      success: true,
      prompt,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test simple endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test endpoint: Analyze resume
 * POST /api/test/gemini/analyze-resume
 */
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeContent } = req.body;

    if (!resumeContent || typeof resumeContent !== 'string') {
      return res.status(400).json({
        error: 'resumeContent is required and must be a string'
      });
    }

    const analysis = await analyzeResume(resumeContent);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analyze resume endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test endpoint: Analyze job
 * POST /api/test/gemini/analyze-job
 */
router.post('/analyze-job', async (req, res) => {
  try {
    const { jobContent } = req.body;

    if (!jobContent || typeof jobContent !== 'string') {
      return res.status(400).json({
        error: 'jobContent is required and must be a string'
      });
    }

    const analysis = await analyzeJob(jobContent);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analyze job endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test endpoint: Compare resume to job
 * POST /api/test/gemini/compare
 */
router.post('/compare', async (req, res) => {
  try {
    const { resumeContent, jobContent } = req.body;

    if (!resumeContent || typeof resumeContent !== 'string') {
      return res.status(400).json({
        error: 'resumeContent is required and must be a string'
      });
    }

    if (!jobContent || typeof jobContent !== 'string') {
      return res.status(400).json({
        error: 'jobContent is required and must be a string'
      });
    }

    const comparison = await compareResumeToJob(resumeContent, jobContent);

    res.json({
      success: true,
      comparison,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compare endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test endpoint: Generate improvement suggestions
 * POST /api/test/gemini/suggestions
 */
router.post('/suggestions', async (req, res) => {
  try {
    const { resumeContent, jobContent } = req.body;

    if (!resumeContent || typeof resumeContent !== 'string') {
      return res.status(400).json({
        error: 'resumeContent is required and must be a string'
      });
    }

    const suggestions = await generateImprovementSuggestions(
      resumeContent,
      jobContent || null
    );

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Suggestions endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health check endpoint
 * GET /api/test/gemini/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Gemini API integration is active',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
