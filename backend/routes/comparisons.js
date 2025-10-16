const express = require('express');
const router = express.Router();
const Comparison = require('../models/Comparison');
const Resume = require('../models/Resume');
const JobPosting = require('../models/JobPosting');
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

// @route   POST /api/comparisons
// @desc    Create new comparison (analyze resume against job posting)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { resumeId, jobPostingId } = req.body;

    // Verify resume exists and belongs to user
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify job posting exists and belongs to user
    const jobPosting = await JobPosting.findById(jobPostingId);
    if (!jobPosting || jobPosting.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // TODO: Implement Gemini AI analysis here (Week 2)
    // For now, create a placeholder comparison
    const comparison = await Comparison.create({
      user: req.user.id,
      resume: resumeId,
      jobPosting: jobPostingId,
      analysis: {
        matchScore: 0,
        skillsMatch: { matched: [], missing: [], percentage: 0 },
        experienceMatch: { score: 0, details: 'Analysis pending' },
        educationMatch: { score: 0, details: 'Analysis pending' },
        keywordMatch: { matched: [], missing: [], percentage: 0 },
        strengths: [],
        weaknesses: [],
        recommendations: []
      }
    });

    res.status(201).json({ success: true, data: comparison });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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

module.exports = router;
