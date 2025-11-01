import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Jobs from './pages/Jobs';
import Comparisons from './pages/Comparisons';
import CompareResume from './pages/CompareResume';
import ComparisonHistory from './pages/ComparisonHistory';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/resumes" element={
                <PrivateRoute>
                  <Resumes />
                </PrivateRoute>
              } />
              <Route path="/jobs" element={
                <PrivateRoute>
                  <Jobs />
                </PrivateRoute>
              } />
              <Route path="/comparisons" element={
                <PrivateRoute>
                  <Comparisons />
                </PrivateRoute>
              } />
              <Route path="/compare" element={
                <PrivateRoute>
                  <CompareResume />
                </PrivateRoute>
              } />
              <Route path="/history" element={
                <PrivateRoute>
                  <ComparisonHistory />
                </PrivateRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
