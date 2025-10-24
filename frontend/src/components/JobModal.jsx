import { useState } from 'react';

const JobModal = ({ job, onClose, onEdit, onDelete, isLoading }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!job) return null;

  const handleDelete = async () => {
    await onDelete(job._id);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{job.title}</h2>
            <p className="modal-subtitle">{job.company}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="job-metadata">
            <p>
              <strong>Posted:</strong> {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Unknown'}
            </p>
            <p>
              <strong>Saved:</strong> {new Date(job.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Updated:</strong> {new Date(job.updatedAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Length:</strong> {job.description.length.toLocaleString()} characters
            </p>
            {job.url && (
              <p>
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="external-link">
                  View Job Posting →
                </a>
              </p>
            )}
          </div>

          <div className="job-description-preview">
            <h3>Job Description</h3>
            <div className="job-text">
              {job.description.split('\n').map((line, idx) => (
                <p key={idx}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {!showDeleteConfirm ? (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => onEdit(job)}
                disabled={isLoading}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <p className="confirm-text">Are you sure you want to delete this job posting? This action cannot be undone.</p>
              <div className="confirm-buttons">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default JobModal;
