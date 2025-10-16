import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="page-container">
      <div className="hero">
        <h1>Resume Optimizer</h1>
        <p className="hero-subtitle">
          Optimize your resume for any job posting using AI-powered analysis
        </p>
        <div className="hero-features">
          <div className="feature">
            <h3>📝 Smart Analysis</h3>
            <p>AI-powered resume analysis using Google Gemini</p>
          </div>
          <div className="feature">
            <h3>🎯 Perfect Match</h3>
            <p>Compare your resume against job postings</p>
          </div>
          <div className="feature">
            <h3>💡 Get Recommendations</h3>
            <p>Receive actionable suggestions to improve your resume</p>
          </div>
        </div>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
