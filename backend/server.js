const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const jobRoutes = require('./routes/jobs');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // convenience alias for testing tools like Postman/Bruno

app.use('/api/resumes', resumeRoutes);
app.use('/resume', resumeRoutes); // convenience alias: /resume/create, /resume/list, /resume/get/:id

app.use('/api/jobs', jobRoutes);
app.use('/job', jobRoutes); // convenience alias: /job/create, /job/list, /job/get/:id

app.use('/api/comparisons', require('./routes/comparisons'));

// Gemini API test routes (remove in production)
app.use('/api/test/gemini', require('./routes/gemini-test'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Resume Optimizer API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
