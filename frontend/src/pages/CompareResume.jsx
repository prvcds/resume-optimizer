import { useState, useEffect } from 'react';
import axios from 'axios';

const CompareResume = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [jobContent, setJobContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/api/resumes');
        setResumes(res.data.data || []);
      } catch (err) {
        console.error('Failed to load resumes', err);
      }
    };
    fetchResumes();
  }, []);

  const handleResumeChange = (e) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    const found = resumes.find(r => r._id === id);
    setResumeContent(found?.content || '');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setAnalysis(null);

    if (!resumeContent || resumeContent.length < 20) {
      setError('Please select a resume with content or paste resume text.');
      return;
    }
    if (!jobContent || jobContent.length < 20) {
      setError('Please paste a job description to analyze (min 20 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/comparisons/analyze/quick', {
        resumeContent,
        jobContent
      });

      if (res.data && res.data.success) {
        setAnalysis(res.data.data);
      } else {
        setError(res.data?.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error', err);
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-header">
        <h1>Compare Resume</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleAnalyze}>
          <div className="form-group">
            <label htmlFor="resumeSelect">Select Resume</label>
            <select id="resumeSelect" value={selectedResumeId} onChange={handleResumeChange}>
              <option value="">-- Choose a resume --</option>
              {resumes.map(r => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="jobContent">Job Description</label>
            <textarea
              id="jobContent"
              value={jobContent}
              onChange={(e) => setJobContent(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>

      {loading && <div className="loading">Gemini is analyzing — this can take a few seconds...</div>}

      {analysis && (
        <div className="analysis-results">
          <div className="match-panel">
            <div className="big-score">{analysis.matchScore ?? 0}%</div>
            <div className="match-meta">
              <h3>{analysis.matchLevel?.toUpperCase() || 'N/A'}</h3>
              <p>{analysis.summary}</p>
            </div>
          </div>

          <div className="recommendations">
            <h2>Recommendations</h2>
            {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
              <div className="cards-grid">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="card recommendation-card">
                    <div className="card-meta">
                      <strong>{rec.category}</strong>
                      <span className={`priority ${rec.priority}`}>{rec.priority}</span>
                    </div>
                    <p>{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recommendations returned.</p>
            )}
          </div>

          <div className="optimized-sections">
            <h2>Optimized Summary</h2>
            <div className="card">
              <p>{analysis.optimizedSections?.summary || 'No optimized summary provided.'}</p>
            </div>

            <h3>Suggested Skills</h3>
            <div className="skills-list">
              {(analysis.optimizedSections?.skills || []).map((s, i) => (
                <span key={i} className="skill-pill">{s}</span>
              ))}
            </div>

            <h3>Suggested Keywords</h3>
            <div className="keywords-list">
              {(analysis.optimizedSections?.keywords || []).map((k, i) => (
                <span key={i} className="keyword-pill">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareResume;
