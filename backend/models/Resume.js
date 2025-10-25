const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Resume must be associated with a user']
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the resume'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add resume content'],
    minlength: [100, 'Resume must be at least 100 characters'],
    maxlength: [50000, 'Resume cannot exceed 50,000 characters']
  },
  parsedData: {
    summary: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      field: String,
      school: String
    }],
    certifications: [String],
    yearsOfExperience: Number,
    topSkills: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);
