import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name.trim(),
      formData.email.trim(),
      formData.password
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <h2>Create Your Account</h2>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
              className={validationErrors.name ? 'input-error' : ''}
            />
            {validationErrors.name && (
              <span className="field-error">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              className={validationErrors.email ? 'input-error' : ''}
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              className={validationErrors.password ? 'input-error' : ''}
            />
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
            <small className="hint">Minimum 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              className={validationErrors.confirmPassword ? 'input-error' : ''}
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
