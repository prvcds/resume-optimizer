import { useState } from 'react';

const ResumeModal = ({ resume, onClose, onEdit, onDelete, isLoading }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!resume) return null;

  const handleDelete = async () => {
    await onDelete(resume._id);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-header">
          <h2>{resume.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="resume-metadata">
            <p>
              <strong>Created:</strong> {new Date(resume.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Updated:</strong> {new Date(resume.updatedAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Length:</strong> {resume.content.length.toLocaleString()} characters
            </p>
          </div>

          <div className="resume-content-preview">
            <h3>Resume Content</h3>
            <div className="resume-text">
              {resume.content.split('\n').map((line, idx) => (
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
                onClick={() => onEdit(resume)}
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
              <p className="confirm-text">Are you sure you want to delete this resume? This action cannot be undone.</p>
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

export default ResumeModal;
