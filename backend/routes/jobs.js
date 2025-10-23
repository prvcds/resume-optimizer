const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const JobPosting = require('../models/JobPosting');
const { protect } = require('../middleware/auth');

// Validation for job creation/update
const jobValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('company')
    .trim()
    .notEmpty().withMessage('Company is required')
    .isLength({ max: 100 }).withMessage('Company cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 100 }).withMessage('Job description must be at least 100 characters')
    .isLength({ max: 50000 }).withMessage('Job description cannot exceed 50,000 characters')
];

// @route   GET /api/jobs or /job/list
// @desc    Get all job postings for logged-in user
// @access  Private
const listJobs = async (req, res) => {
  try {
    const jobs = await JobPosting.find({ user: req.user.id })
      .select('title company createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: jobs.length, 
      data: jobs 
    });
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/', protect, listJobs);

// @route   GET /api/jobs/:id or /job/get/:id
// @desc    Get single job posting by ID
// @access  Private
const getSingleJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Verify user owns job posting
    if (job.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this job posting' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid job posting ID' });
    }
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/:id', protect, getSingleJob);

// @route   POST /api/jobs or /job/create
// @desc    Create new job posting
// @access  Private
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }

    const { title, company, description } = req.body;

    // Create job posting
    const job = await JobPosting.create({
      user: req.user.id,
      title: title.trim(),
      company: company.trim(),
      description: description.trim()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Job posting created successfully',
      data: job 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    
    // Handle validation errors from schema
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.post('/', protect, jobValidators, createJob);

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private
router.put('/:id', protect, jobValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }

    let job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Verify user owns job posting
    if (job.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job posting' });
    }

    // Update fields
    job.title = req.body.title.trim();
    job.company = req.body.company.trim();
    job.description = req.body.description.trim();
    job = await job.save();

    res.json({ 
      success: true, 
      message: 'Job posting updated successfully',
      data: job 
    });
  } catch (error) {
    console.error('Error updating job:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Verify user owns job posting
    if (job.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job posting' });
    }

    await JobPosting.deleteOne({ _id: req.params.id });

    res.json({ 
      success: true, 
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
