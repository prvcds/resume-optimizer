const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');

// Validation for resume creation/update
const resumeValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Resume content is required')
    .isLength({ min: 100 }).withMessage('Resume must be at least 100 characters')
    .isLength({ max: 50000 }).withMessage('Resume cannot exceed 50,000 characters')
];

// @route   GET /api/resumes or /resume/list
// @desc    Get all resumes for logged-in user
// @access  Private
const listResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: resumes.length, 
      data: resumes 
    });
  } catch (error) {
    console.error('Error listing resumes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/', protect, listResumes);

// @route   GET /api/resumes/:id or /resume/get/:id
// @desc    Get single resume by ID
// @access  Private
const getSingleResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid resume ID' });
    }
    console.error('Error fetching resume:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/:id', protect, getSingleResume);

// @route   POST /api/resumes or /resume/create
// @desc    Create new resume
// @access  Private
const createResume = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }

    const { title, content } = req.body;

    // Create resume
    const resume = await Resume.create({
      user: req.user.id,
      title: title.trim(),
      content: content.trim()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Resume created successfully',
      data: resume 
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    
    // Handle validation errors from schema
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.post('/', protect, resumeValidators, createResume);

// @route   PUT /api/resumes/:id
// @desc    Update resume
// @access  Private
router.put('/:id', protect, resumeValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }

    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this resume' });
    }

    // Update fields
    resume.title = req.body.title.trim();
    resume.content = req.body.content.trim();
    resume = await resume.save();

    res.json({ 
      success: true, 
      message: 'Resume updated successfully',
      data: resume 
    });
  } catch (error) {
    console.error('Error updating resume:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resume' });
    }

    await Resume.deleteOne({ _id: req.params.id });

    res.json({ 
      success: true, 
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
