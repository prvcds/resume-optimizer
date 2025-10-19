const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set. Please define it in backend/.env');
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Provide helpful hints for common Atlas SRV/DNS issues
    const msg = error?.message || '';
    console.error(`MongoDB connection error: ${msg}`);
    if (msg.includes('querySrv') || msg.includes('ENOTFOUND') || msg.includes('EREFUSED')) {
      console.error('\nTroubleshooting tips:');
      console.error('- If using MongoDB Atlas SRV string (mongodb+srv://):');
      console.error('  * Ensure your internet/DNS is working.');
      console.error('  * Verify the connection string is correct (copy from Atlas).');
      console.error('  * In Atlas, ensure Network Access includes your IP (Add IP 0.0.0.0/0 for testing).');
      console.error('  * Ensure your database user and password are correct.');
      console.error('- If behind a firewall/VPN/office network, try a different network.');
      console.error('- As a fallback for local dev, use MONGODB_URI=mongodb://localhost:27017/resume-optimizer');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
