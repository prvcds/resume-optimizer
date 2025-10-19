import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * PrivateRoute - Protects routes that require authentication
 * If user is authenticated, renders children
 * If still loading, shows loading state
 * If not authenticated, redirects to login (preserving intended destination)
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but preserve the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
