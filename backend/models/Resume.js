const mongoose = require('mongoose');

// Constants for validation
const MAX_RESUME_SIZE = 50000; // 50 KB in characters
const MIN_RESUME_SIZE = 100; // Minimum 100 characters

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  },
  title: {
    type: String,
    required: [true, 'Please add a resume title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add resume content'],
    validate: {
      validator: function(v) {
        return v && v.length >= MIN_RESUME_SIZE && v.length <= MAX_RESUME_SIZE;
      },
      message: `Resume content must be between ${MIN_RESUME_SIZE} and ${MAX_RESUME_SIZE} characters`
    }
  },
  parsedData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      portfolio: String
    },
    summary: String,
    experience: [{
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      description: String,
      achievements: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: String,
      endDate: String,
      gpa: String
    }],
    skills: {
      technical: [String],
      soft: [String],
      languages: [String]
    },
    certifications: [{
      name: String,
      issuer: String,
      date: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String
    }]
  },
  fileUrl: String,
  fileName: String,
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
ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);
