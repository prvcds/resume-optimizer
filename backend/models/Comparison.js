const mongoose = require('mongoose');

const ComparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  analysis: {
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skillsMatch: {
      matched: [String],
      missing: [String],
      percentage: Number
    },
    experienceMatch: {
      score: Number,
      details: String
    },
    educationMatch: {
      score: Number,
      details: String
    },
    keywordMatch: {
      matched: [String],
      missing: [String],
      percentage: Number
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [{
      category: String, // 'skills', 'experience', 'formatting', 'keywords'
      priority: String, // 'high', 'medium', 'low'
      suggestion: String
    }],
    optimizedSections: {
      summary: String,
      experience: [String],
      skills: [String]
    }
  },
  geminiResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comparison', ComparisonSchema);
