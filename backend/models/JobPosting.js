const mongoose = require('mongoose');

// Constants for validation
const MAX_DESCRIPTION_SIZE = 50000; // 50 KB in characters
const MIN_DESCRIPTION_SIZE = 100; // Minimum 100 characters

const JobPostingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add job description'],
    validate: {
      validator: function(v) {
        return v && v.length >= MIN_DESCRIPTION_SIZE && v.length <= MAX_DESCRIPTION_SIZE;
      },
      message: `Job description must be between ${MIN_DESCRIPTION_SIZE} and ${MAX_DESCRIPTION_SIZE} characters`
    }
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
JobPostingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('JobPosting', JobPostingSchema);
