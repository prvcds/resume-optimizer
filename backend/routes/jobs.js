const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const JobPosting = require('../models/JobPosting');
const { protect } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all job postings for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const jobs = await JobPosting.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job posting
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Make sure user owns job posting
    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private
router.post('/', [protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const job = await JobPosting.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Make sure user owns job posting
    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    job = await JobPosting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: job });
  } catch (error) {
    console.error(error);
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

    // Make sure user owns job posting
    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await job.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
