import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalComparisons: 0, averageMatchScore: 0, recent: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/comparisons/history');
        if (res.data && res.data.success) {
          setStats({ totalComparisons: res.data.totalComparisons, averageMatchScore: res.data.averageMatchScore, recent: res.data.recent });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="dashboard">
        <h1>Welcome, {user?.name}!</h1>
        <p className="subtitle">Your Resume Optimization Dashboard</p>
        
        <div className="dashboard-grid">
          <Link to="/resumes" className="dashboard-card">
            <h3>📄 My Resumes</h3>
            <p>Upload and manage your resumes</p>
          </Link>
          
          <Link to="/jobs" className="dashboard-card">
            <h3>💼 Job Postings</h3>
            <p>Save job postings you're interested in</p>
          </Link>
          
          <Link to="/comparisons" className="dashboard-card">
            <h3>📊 Comparisons</h3>
            <p>Analyze your resumes against job postings</p>
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Comparisons</h3>
            <p className="stat-value">{stats.totalComparisons}</p>
          </div>
          <div className="stat-card">
            <h3>Average Match</h3>
            <p className="stat-value">{stats.averageMatchScore}%</p>
          </div>
          <div className="stat-card">
            <h3>Recent</h3>
            <ul>
              {stats.recent.map(r => (
                <li key={r.id}>{new Date(r.createdAt).toLocaleDateString()} — {r.resumeTitle} / {r.jobTitle} — {r.matchScore}%</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="getting-started">
          <h2>Getting Started</h2>
          <ol>
            <li>Upload your resume in the <Link to="/resumes">Resumes</Link> section</li>
            <li>Add job postings you're interested in from the <Link to="/jobs">Jobs</Link> section</li>
            <li>Create comparisons to get AI-powered optimization suggestions</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
