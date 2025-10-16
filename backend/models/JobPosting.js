const mongoose = require('mongoose');

const JobPostingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add job description']
  },
  parsedData: {
    requiredSkills: [String],
    preferredSkills: [String],
    responsibilities: [String],
    qualifications: [String],
    experienceLevel: String,
    educationRequired: String,
    location: String,
    jobType: String, // Full-time, Part-time, Contract, etc.
    salary: {
      min: Number,
      max: Number,
      currency: String
    }
  },
  url: String,
  postedDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobPosting', JobPostingSchema);
