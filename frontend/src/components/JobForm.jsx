import { useState, useEffect } from 'react';

const JobForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({ title: '', company: '', description: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        description: initialData.description || ''
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
        newErrors.title = 'Job title is required';
      } else if (value.trim().length > 100) {
        newErrors.title = `Title cannot exceed 100 characters (${value.trim().length}/100)`;
      } else {
        delete newErrors.title;
      }
    }

    if (name === 'company') {
      if (!value || value.trim().length === 0) {
        newErrors.company = 'Company name is required';
      } else if (value.trim().length > 100) {
        newErrors.company = `Company cannot exceed 100 characters (${value.trim().length}/100)`;
      } else {
        delete newErrors.company;
      }
    }

    if (name === 'description') {
      if (!value || value.trim().length === 0) {
        newErrors.description = 'Job description is required';
      } else if (value.trim().length < 100) {
        newErrors.description = `Job description must be at least 100 characters (${value.trim().length}/100)`;
      } else if (value.trim().length > 50000) {
        newErrors.description = `Job description cannot exceed 50,000 characters (${value.trim().length}/50000)`;
      } else {
        delete newErrors.description;
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
    validateField('company', formData.company);
    validateField('description', formData.description);

    // Mark all fields as touched
    setTouched({ title: true, company: true, description: true });

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Call parent submit handler
    await onSubmit({
      title: formData.title.trim(),
      company: formData.company.trim(),
      description: formData.description.trim()
    });

    // Reset form
    if (!initialData) {
      setFormData({ title: '', company: '', description: '' });
      setTouched({});
      setErrors({});
    }
  };

  const titleLength = formData.title.trim().length;
  const companyLength = formData.company.trim().length;
  const descriptionLength = formData.description.trim().length;
  const descriptionPercent = ((descriptionLength / 50000) * 100).toFixed(1);

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <div className="form-group">
        <label htmlFor="title">
          Job Title
          <span className="char-count">{titleLength}/100</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., Senior Full Stack Engineer"
          className={touched.title && errors.title ? 'input-error' : ''}
          disabled={isLoading}
        />
        {touched.title && errors.title && (
          <span className="field-error" role="alert">{errors.title}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="company">
          Company Name
          <span className="char-count">{companyLength}/100</span>
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., TechCorp Inc."
          className={touched.company && errors.company ? 'input-error' : ''}
          disabled={isLoading}
        />
        {touched.company && errors.company && (
          <span className="field-error" role="alert">{errors.company}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Job Description
          <span className="char-count">{descriptionLength}/50,000</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows="15"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Paste the full job description here. Include responsibilities, requirements, qualifications, salary range, etc."
          className={touched.description && errors.description ? 'input-error' : ''}
          disabled={isLoading}
        />
        {touched.description && errors.description && (
          <span className="field-error" role="alert">{errors.description}</span>
        )}
        <div className="char-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${Math.min(descriptionPercent, 100)}%` }}
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
        {isLoading ? 'Saving...' : initialData ? 'Update Job Posting' : 'Save Job Posting'}
      </button>
    </form>
  );
};

export default JobForm;
