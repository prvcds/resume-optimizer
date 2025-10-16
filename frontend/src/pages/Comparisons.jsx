import { useState, useEffect } from 'react';
import axios from 'axios';

const Comparisons = () => {
  const [comparisons, setComparisons] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ resumeId: '', jobPostingId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [comparisonsRes, resumesRes, jobsRes] = await Promise.all([
        axios.get('/api/comparisons'),
        axios.get('/api/resumes'),
        axios.get('/api/jobs')
      ]);
      setComparisons(comparisonsRes.data.data);
      setResumes(resumesRes.data.data);
      setJobs(jobsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/comparisons', formData);
      setFormData({ resumeId: '', jobPostingId: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating comparison:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this comparison?')) {
      try {
        await axios.delete(`/api/comparisons/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting comparison:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="content-header">
        <h1>Resume Comparisons</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
          disabled={resumes.length === 0 || jobs.length === 0}
        >
          {showForm ? 'Cancel' : 'New Comparison'}
        </button>
      </div>

      {(resumes.length === 0 || jobs.length === 0) && (
        <div className="info-message">
          You need at least one resume and one job posting to create a comparison.
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>Create New Comparison</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resumeId">Select Resume</label>
              <select
                id="resumeId"
                value={formData.resumeId}
                onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}
                required
              >
                <option value="">-- Choose a resume --</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="jobPostingId">Select Job Posting</label>
              <select
                id="jobPostingId"
                value={formData.jobPostingId}
                onChange={(e) => setFormData({ ...formData, jobPostingId: e.target.value })}
                required
              >
                <option value="">-- Choose a job posting --</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} - {job.company}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Analyze</button>
          </form>
        </div>
      )}

      <div className="items-grid">
        {comparisons.length === 0 ? (
          <p className="no-items">
            No comparisons yet. Create your first comparison to get AI-powered optimization suggestions!
          </p>
        ) : (
          comparisons.map((comparison) => (
            <div key={comparison._id} className="item-card comparison-card">
              <h3>Resume: {comparison.resume?.title || 'N/A'}</h3>
              <p className="item-company">
                Job: {comparison.jobPosting?.title || 'N/A'} at {comparison.jobPosting?.company || 'N/A'}
              </p>
              <div className="match-score">
                <span className="score-label">Match Score:</span>
                <span className="score-value">{comparison.analysis?.matchScore || 0}%</span>
              </div>
              <p className="item-date">
                Analyzed: {new Date(comparison.createdAt).toLocaleDateString()}
              </p>
              <div className="item-actions">
                <button onClick={() => handleDelete(comparison._id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comparisons;
