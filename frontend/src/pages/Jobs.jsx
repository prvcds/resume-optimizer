import { useState, useEffect } from 'react';
import axios from 'axios';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', company: '', description: '', url: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs');
      setJobs(res.data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/jobs', formData);
      setFormData({ title: '', company: '', description: '', url: '' });
      setShowForm(false);
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await axios.delete(`/api/jobs/${id}`);
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="content-header">
        <h1>Job Postings</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Job Posting'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Add New Job Posting</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="url">Job URL (optional)</label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                rows="10"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Paste the job description here..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Job Posting</button>
          </form>
        </div>
      )}

      <div className="items-grid">
        {jobs.length === 0 ? (
          <p className="no-items">No job postings yet. Add job postings you're interested in!</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="item-card">
              <h3>{job.title}</h3>
              <p className="item-company">{job.company}</p>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="item-link">
                  View Job Posting →
                </a>
              )}
              <p className="item-date">
                Added: {new Date(job.createdAt).toLocaleDateString()}
              </p>
              <div className="item-actions">
                <button onClick={() => handleDelete(job._id)} className="btn btn-danger">
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

export default Jobs;
