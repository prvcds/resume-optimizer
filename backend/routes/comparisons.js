const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comparison = require('../models/Comparison');
const Resume = require('../models/Resume');
const JobPosting = require('../models/JobPosting');
const { performDetailedComparison } = require('../utils/gemini');
const { protect } = require('../middleware/auth');

// @route   GET /api/comparisons
// @desc    Get all comparisons for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const comparisons = await Comparison.find({ user: req.user.id })
      .populate('resume', 'title')
      .populate('jobPosting', 'title company')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: comparisons.length, data: comparisons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/comparisons/history
// @desc    Get comparison history summary + details for logged-in user
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const comparisons = await Comparison.find({ user: req.user.id })
      .populate('resume', 'title')
      .populate('jobPosting', 'title company')
      .sort({ createdAt: -1 });

    const total = comparisons.length;
    const averageMatchScore = total === 0 ? 0 : Math.round(comparisons.reduce((sum, c) => sum + (c.analysis?.matchScore || 0), 0) / total);

    const recent = comparisons.slice(0, 5).map(c => ({
      id: c._id,
      resumeTitle: c.resume?.title || 'N/A',
      jobTitle: c.jobPosting ? `${c.jobPosting.title} - ${c.jobPosting.company}` : 'N/A',
      matchScore: c.analysis?.matchScore || 0,
      createdAt: c.createdAt
    }));

    res.json({
      success: true,
      totalComparisons: total,
      averageMatchScore,
      recent,
      data: comparisons
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/comparisons/:id
// @desc    Get single comparison
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const comparison = await Comparison.findById(req.params.id)
      .populate('resume')
      .populate('jobPosting');

    if (!comparison) {
      return res.status(404).json({ success: false, message: 'Comparison not found' });
    }

    // Make sure user owns comparison
    if (comparison.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: comparison });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Validation middleware for comparison creation
const comparisonValidators = [
  body('resumeId')
    .notEmpty().withMessage('Resume ID is required')
    .isMongoId().withMessage('Invalid resume ID'),
  body('jobPostingId')
    .notEmpty().withMessage('Job posting ID is required')
    .isMongoId().withMessage('Invalid job posting ID')
];

// @route   POST /api/comparisons
// @desc    Create new comparison (analyze resume against job posting using Gemini AI)
// @access  Private
router.post('/', protect, comparisonValidators, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }

    const { resumeId, jobPostingId } = req.body;

    // Verify resume exists and belongs to user
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    // Verify job posting exists and belongs to user
    const jobPosting = await JobPosting.findById(jobPostingId);
    if (!jobPosting) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    if (jobPosting.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this job posting' });
    }

    // Perform Gemini AI analysis
    console.log('Starting detailed comparison analysis...');
    
    const analysisResult = await performDetailedComparison(
      resume.content,
      jobPosting.description
    );

    console.log('Analysis complete. Match score:', analysisResult.matchScore);

    // Create comparison record in database
    const comparison = await Comparison.create({
      user: req.user.id,
      resume: resumeId,
      jobPosting: jobPostingId,
      analysis: {
        matchScore: analysisResult.matchScore,
        skillsMatch: analysisResult.skillsMatch,
        experienceMatch: analysisResult.experienceMatch,
        educationMatch: analysisResult.educationMatch,
        keywordMatch: analysisResult.keywordMatch,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        recommendations: analysisResult.recommendations,
        optimizedSections: analysisResult.optimizedSections
      },
      geminiResponse: analysisResult
    });

    console.log('Comparison saved to database:', comparison._id);

    res.status(201).json({
      success: true,
      message: 'Comparison created successfully',
      data: comparison
    });
  } catch (error) {
    console.error('Comparison creation error:', error);
    
    // Handle specific error types
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'API rate limited. Please try again in a moment.'
      });
    }

    if (error.message.includes('API authentication')) {
      return res.status(401).json({
        success: false,
        message: 'API authentication failed. Please check configuration.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create comparison',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/comparisons/:id
// @desc    Delete comparison
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comparison = await Comparison.findById(req.params.id);

    if (!comparison) {
      return res.status(404).json({ success: false, message: 'Comparison not found' });
    }

    // Make sure user owns comparison
    if (comparison.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await comparison.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/comparisons/analyze/quick
// @desc    Quick comparison without saving to database (for testing or preview)
// @access  Public (no auth required for quick testing)
router.post('/analyze/quick', async (req, res) => {
  try {
    const { resumeContent, jobContent } = req.body;

    if (!resumeContent || typeof resumeContent !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'resumeContent is required and must be a string'
      });
    }

    if (!jobContent || typeof jobContent !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'jobContent is required and must be a string'
      });
    }

    console.log('Starting quick comparison analysis...');
    
    const analysis = await performDetailedComparison(resumeContent, jobContent);

    console.log('Quick analysis complete. Match score:', analysis.matchScore);

    res.json({
      success: true,
      message: 'Analysis completed',
      data: analysis
    });
  } catch (error) {
    console.error('Quick comparison error:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'API rate limited. Please try again in a moment.'
      });
    }

    if (error.message.includes('API authentication')) {
      return res.status(401).json({
        success: false,
        message: 'API authentication failed.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
