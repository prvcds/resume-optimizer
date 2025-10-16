import { useState, useEffect } from 'react';
import axios from 'axios';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get('/api/resumes');
      setResumes(res.data.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/resumes', formData);
      setFormData({ title: '', content: '' });
      setShowForm(false);
      fetchResumes();
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`/api/resumes/${id}`);
        fetchResumes();
      } catch (error) {
        console.error('Error deleting resume:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="content-header">
        <h1>My Resumes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Resume'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Add New Resume</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Resume Content</label>
              <textarea
                id="content"
                rows="10"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Paste your resume content here..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Resume</button>
          </form>
        </div>
      )}

      <div className="items-grid">
        {resumes.length === 0 ? (
          <p className="no-items">No resumes yet. Add your first resume to get started!</p>
        ) : (
          resumes.map((resume) => (
            <div key={resume._id} className="item-card">
              <h3>{resume.title}</h3>
              <p className="item-date">
                Created: {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              <div className="item-actions">
                <button onClick={() => handleDelete(resume._id)} className="btn btn-danger">
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

export default Resumes;
