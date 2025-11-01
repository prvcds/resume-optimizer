import { useState, useEffect } from 'react';
import axios from 'axios';

const ComparisonHistory = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalComparisons: 0, averageMatchScore: 0, recent: [] });
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.get('/api/comparisons/history');
      if (res.data && res.data.success) {
        setStats({ totalComparisons: res.data.totalComparisons, averageMatchScore: res.data.averageMatchScore, recent: res.data.recent });
        setList(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to load history');
      }
    } catch (err) {
      console.error('History fetch error', err);
      setError(err.response?.data?.message || err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const viewComparison = async (id) => {
    setError('');
    try {
      const res = await axios.get(`/api/comparisons/${id}`);
      if (res.data && res.data.success) {
        setSelected(res.data.data);
      } else {
        setError('Failed to load comparison');
      }
    } catch (err) {
      console.error('View error', err);
      setError(err.response?.data?.message || err.message || 'Failed to load comparison');
    }
  };

  const deleteComparison = async (id) => {
    if (!window.confirm('Delete this comparison?')) return;
    try {
      await axios.delete(`/api/comparisons/${id}`);
      fetchHistory();
      setSelected(null);
    } catch (err) {
      console.error('Delete error', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="page-container">
      <div className="content-header">
        <h1>Comparison History</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="history-summary">
        <div className="stat-card">
          <h3>Total Comparisons</h3>
          <p className="stat-value">{stats.totalComparisons}</p>
        </div>
        <div className="stat-card">
          <h3>Average Match</h3>
          <p className="stat-value">{stats.averageMatchScore}%</p>
        </div>
        <div className="stat-card">
          <h3>Recent Activity</h3>
          <ul>
            {stats.recent.map(r => (
              <li key={r.id}>{new Date(r.createdAt).toLocaleString()} — {r.resumeTitle} / {r.jobTitle} — {r.matchScore}%</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="history-list">
        <h2>All Comparisons</h2>
        {list.length === 0 && <p>No comparisons yet.</p>}
        <ul>
          {list.map(item => (
            <li key={item._id} className="history-row">
              <div>
                <strong>{item.resume?.title || 'Resume'}</strong>
                <div className="muted">{item.jobPosting?.title || 'Job'} — {item.jobPosting?.company || ''}</div>
              </div>
              <div className="history-meta">
                <span className="score">{item.analysis?.matchScore ?? 0}%</span>
                <span className="date">{new Date(item.createdAt).toLocaleString()}</span>
                <button className="btn btn-link" onClick={() => viewComparison(item._id)}>View</button>
                <button className="btn btn-danger" onClick={() => deleteComparison(item._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="comparison-detail card">
          <h3>Comparison Details</h3>
          <p><strong>Resume:</strong> {selected.resume?.title || 'N/A'}</p>
          <p><strong>Job:</strong> {selected.jobPosting?.title || 'N/A'} — {selected.jobPosting?.company || ''}</p>
          <p><strong>Match Score:</strong> {selected.analysis?.matchScore ?? 0}%</p>
          <h4>Recommendations</h4>
          <ul>
            {(selected.analysis?.recommendations || []).map((r, i) => (
              <li key={i}><strong>{r.category} ({r.priority})</strong>: {r.suggestion}</li>
            ))}
          </ul>
          <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ComparisonHistory;
