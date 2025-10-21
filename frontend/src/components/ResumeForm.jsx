import { useState, useEffect } from 'react';

const ResumeForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || ''
      });
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'title') {
      if (!value || value.trim().length === 0) {
        newErrors.title = 'Title is required';
      } else if (value.trim().length > 100) {
        newErrors.title = `Title cannot exceed 100 characters (${value.trim().length}/100)`;
      } else {
        delete newErrors.title;
      }
    }

    if (name === 'content') {
      if (!value || value.trim().length === 0) {
        newErrors.content = 'Resume content is required';
      } else if (value.trim().length < 100) {
        newErrors.content = `Resume must be at least 100 characters (${value.trim().length}/100)`;
      } else if (value.trim().length > 50000) {
        newErrors.content = `Resume cannot exceed 50,000 characters (${value.trim().length}/50000)`;
      } else {
        delete newErrors.content;
      }
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate in real-time if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    validateField('title', formData.title);
    validateField('content', formData.content);

    // Mark all fields as touched
    setTouched({ title: true, content: true });

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Call parent submit handler
    await onSubmit({
      title: formData.title.trim(),
      content: formData.content.trim()
    });

    // Reset form
    if (!initialData) {
      setFormData({ title: '', content: '' });
      setTouched({});
      setErrors({});
    }
  };

  const titleLength = formData.title.trim().length;
  const contentLength = formData.content.trim().length;
  const contentPercent = ((contentLength / 50000) * 100).toFixed(1);

  return (
    <form onSubmit={handleSubmit} className="resume-form">
      <div className="form-group">
        <label htmlFor="title">
          Resume Title
          <span className="char-count">{titleLength}/100</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., Senior Software Engineer"
          className={touched.title && errors.title ? 'input-error' : ''}
          disabled={isLoading}
        />
        {touched.title && errors.title && (
          <span className="field-error" role="alert">{errors.title}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="content">
          Resume Content
          <span className="char-count">{contentLength}/50,000</span>
        </label>
        <textarea
          id="content"
          name="content"
          rows="15"
          value={formData.content}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Paste your full resume content here. Include name, contact info, summary, experience, education, skills, etc."
          className={touched.content && errors.content ? 'input-error' : ''}
          disabled={isLoading}
        />
        {touched.content && errors.content && (
          <span className="field-error" role="alert">{errors.content}</span>
        )}
        <div className="char-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${Math.min(contentPercent, 100)}%` }}
          ></div>
        </div>
        <span className="hint">
          Minimum 100 characters required. Maximum 50,000 characters allowed.
        </span>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={isLoading || Object.keys(errors).length > 0}
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Resume' : 'Save Resume'}
      </button>
    </form>
  );
};

export default ResumeForm;
