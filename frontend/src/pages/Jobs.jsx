import { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from '../components/JobForm';
import JobModal from '../components/JobModal';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Paste for comparison state
  const [showPasteSection, setShowPasteSection] = useState(false);
  const [pastedJob, setPastedJob] = useState({ title: '', company: '', description: '' });
  const [pasteTouched, setPasteTouched] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs');
      setJobs(res.data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showMessage('error', 'Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing job
        await axios.put(`/api/jobs/${editingId}`, formData);
        showMessage('success', 'Job posting updated successfully!');
        setEditingId(null);
      } else {
        // Create new job
        await axios.post('/api/jobs', formData);
        showMessage('success', 'Job posting created successfully!');
      }
      setShowForm(false);
      await fetchJobs();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save job posting';
      showMessage('error', errorMsg);
      console.error('Error saving job:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (job) => {
    setEditingId(job._id);
    setSelectedJob(job);
    setShowForm(true);
    setShowModal(false);
  };

  const handleViewClick = async (id) => {
    try {
      const res = await axios.get(`/api/jobs/${id}`);
      setSelectedJob(res.data.data);
      setShowModal(true);
    } catch (error) {
      showMessage('error', 'Failed to load job posting');
      console.error('Error fetching job:', error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`/api/jobs/${id}`);
      showMessage('success', 'Job posting deleted successfully!');
      await fetchJobs();
      setShowModal(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete job posting';
      showMessage('error', errorMsg);
      console.error('Error deleting job:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedJob(null);
  };

  const handlePasteChange = (e) => {
    const { name, value } = e.target;
    setPastedJob(prev => ({ ...prev, [name]: value }));
  };

  const handlePasteBlur = (name) => {
    setPasteTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleCompareNow = () => {
    if (!pastedJob.title.trim() || !pastedJob.company.trim() || !pastedJob.description.trim()) {
      showMessage('error', 'Please fill in all fields to compare');
      return;
    }
    
    if (pastedJob.description.trim().length < 100) {
      showMessage('error', 'Job description must be at least 100 characters');
      return;
    }

    // Store pasted job in session storage for comparison page
    sessionStorage.setItem('pastedJob', JSON.stringify(pastedJob));
    
    // Navigate to comparison page
    window.location.href = '/comparison';
  };

  const handleClearPaste = () => {
    setPastedJob({ title: '', company: '', description: '' });
    setPasteTouched({});
    setShowPasteSection(false);
  };

  if (loading) return <div className="loading">Loading job postings...</div>;

  return (
    <div className="page-container">
      {/* Messages */}
      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="content-header">
        <div>
          <h1>Job Postings</h1>
          <p className="subtitle">{jobs.length} job posting{jobs.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="header-buttons">
          <button 
            onClick={() => {
              setEditingId(null);
              setSelectedJob(null);
              setShowForm(!showForm);
            }} 
            className="btn btn-primary"
            disabled={submitting}
          >
            {showForm ? 'Cancel' : '+ Add Job Posting'}
          </button>
          <button 
            onClick={() => setShowPasteSection(!showPasteSection)}
            className="btn btn-secondary"
          >
            {showPasteSection ? 'Hide Paste' : 'Paste to Compare'}
          </button>
        </div>
      </div>

      {/* Paste for Comparison Section */}
      {showPasteSection && (
        <div className="compare-section">
          <h2>Paste Job Description for Comparison</h2>
          <p className="compare-hint">Paste a job description below to compare it with your saved resumes. This will NOT be saved.</p>
          
          <div className="compare-form">
            <div className="form-group">
              <label htmlFor="paste-title">Job Title</label>
              <input
                type="text"
                id="paste-title"
                name="title"
                value={pastedJob.title}
                onChange={handlePasteChange}
                onBlur={() => handlePasteBlur('title')}
                placeholder="e.g., Senior Software Engineer"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="paste-company">Company Name</label>
              <input
                type="text"
                id="paste-company"
                name="company"
                value={pastedJob.company}
                onChange={handlePasteChange}
                onBlur={() => handlePasteBlur('company')}
                placeholder="e.g., TechCorp Inc."
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="paste-description">
                Job Description
                <span className="char-count">{pastedJob.description.trim().length}/50,000</span>
              </label>
              <textarea
                id="paste-description"
                name="description"
                rows="12"
                value={pastedJob.description}
                onChange={handlePasteChange}
                onBlur={() => handlePasteBlur('description')}
                placeholder="Paste the full job description here..."
                disabled={submitting}
              />
              <span className="hint">
                Minimum 100 characters required for comparison.
              </span>
            </div>

            <div className="compare-buttons">
              <button 
                onClick={handleCompareNow}
                className="btn btn-primary"
                disabled={submitting}
              >
                Compare Now
              </button>
              <button 
                onClick={handleClearPaste}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Job Posting' : 'Add New Job Posting'}</h2>
          <JobForm 
            onSubmit={handleFormSubmit}
            initialData={editingId ? selectedJob : null}
            isLoading={submitting}
          />
          {!submitting && (
            <button 
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Jobs List */}
      {!showForm && (
        <div className="items-grid">
          {jobs.length === 0 ? (
            <div className="no-items">
              <p>No job postings yet. Add job postings you're interested in!</p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Create First Job Posting
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                </div>
                <div className="job-card-body">
                  <p className="item-date">
                    Created: {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  <p className="item-date">
                    Updated: {new Date(job.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="job-card-actions">
                  <button 
                    onClick={() => handleViewClick(job._id)}
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEditClick(job)}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setShowModal(true);
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Job Modal */}
      {showModal && (
        <JobModal 
          job={selectedJob}
          onClose={() => setShowModal(false)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          isLoading={submitting}
        />
      )}
    </div>
  );
};

export default Jobs;
