import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Restore email if remember-me was previously selected
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Handle remember-me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <h2>Login to Resume Optimizer</h2>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
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
              required
            />
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
              required
            />
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={handleRememberMe}
              disabled={loading}
            />
            <label htmlFor="rememberMe">Remember this email</label>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
