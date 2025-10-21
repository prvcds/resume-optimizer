import { useState, useEffect } from 'react';
import axios from 'axios';
import ResumeForm from '../components/ResumeForm';
import ResumeModal from '../components/ResumeModal';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchResumes();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchResumes = async () => {
    try {
      const res = await axios.get('/api/resumes');
      setResumes(res.data.data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      showMessage('error', 'Failed to load resumes');
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
        // Update existing resume
        await axios.put(`/api/resumes/${editingId}`, formData);
        showMessage('success', 'Resume updated successfully!');
        setEditingId(null);
      } else {
        // Create new resume
        await axios.post('/api/resumes', formData);
        showMessage('success', 'Resume created successfully!');
      }
      setShowForm(false);
      await fetchResumes();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save resume';
      showMessage('error', errorMsg);
      console.error('Error saving resume:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (resume) => {
    setEditingId(resume._id);
    setSelectedResume(resume);
    setShowForm(true);
    setShowModal(false);
  };

  const handleViewClick = async (id) => {
    try {
      const res = await axios.get(`/api/resumes/${id}`);
      setSelectedResume(res.data.data);
      setShowModal(true);
    } catch (error) {
      showMessage('error', 'Failed to load resume');
      console.error('Error fetching resume:', error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`/api/resumes/${id}`);
      showMessage('success', 'Resume deleted successfully!');
      await fetchResumes();
      setShowModal(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete resume';
      showMessage('error', errorMsg);
      console.error('Error deleting resume:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedResume(null);
  };

  if (loading) return <div className="loading">Loading resumes...</div>;

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
          <h1>My Resumes</h1>
          <p className="subtitle">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setSelectedResume(null);
            setShowForm(!showForm);
          }} 
          className="btn btn-primary"
          disabled={submitting}
        >
          {showForm ? 'Cancel' : '+ Add Resume'}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Resume' : 'Add New Resume'}</h2>
          <ResumeForm 
            onSubmit={handleFormSubmit}
            initialData={editingId ? selectedResume : null}
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

      {/* Resumes List */}
      {!showForm && (
        <div className="items-grid">
          {resumes.length === 0 ? (
            <div className="no-items">
              <p>No resumes yet. Create your first resume to get started!</p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Create First Resume
              </button>
            </div>
          ) : (
            resumes.map((resume) => (
              <div key={resume._id} className="resume-card">
                <div className="resume-card-header">
                  <h3>{resume.title}</h3>
                </div>
                <div className="resume-card-body">
                  <p className="item-date">
                    Created: {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                  <p className="item-date">
                    Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="resume-card-actions">
                  <button 
                    onClick={() => handleViewClick(resume._id)}
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEditClick(resume)}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedResume(resume);
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

      {/* Resume Modal */}
      {showModal && (
        <ResumeModal 
          resume={selectedResume}
          onClose={() => setShowModal(false)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          isLoading={submitting}
        />
      )}
    </div>
  );
};

export default Resumes;
