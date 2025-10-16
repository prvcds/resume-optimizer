const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a resume title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add resume content']
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
