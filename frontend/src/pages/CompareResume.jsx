import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const HIGHLIGHT_CLASS = {
  matched: 'hl-good',
  suggested: 'hl-suggest',
  missing: 'hl-missing'
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const CompareResume = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [jobContent, setJobContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

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
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem('comparisonHistory');
      setHistory(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.error('Failed to load history', err);
      setHistory([]);
    }
  };

  const saveHistoryLocal = (item) => {
    try {
      const next = [item, ...history].slice(0, 50); // keep recent 50
      localStorage.setItem('comparisonHistory', JSON.stringify(next));
      setHistory(next);
    } catch (err) {
      console.error('Failed to save history', err);
    }
  };

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

  // Build HTML with highlights for matched skills/keywords
  const highlightedResumeHtml = useMemo(() => {
    if (!analysis || !resumeContent) return '';

    const matched = (analysis.skillsMatch?.matched || []).concat(analysis.keywordMatch?.matched || []);
    const suggested = analysis.optimizedSections?.skills || analysis.optimizedSections?.keywords || [];
    // unique and clean
    const matchedSet = Array.from(new Set(matched.filter(Boolean).map(s => s.trim()).slice(0, 200)));
    const suggestedSet = Array.from(new Set((suggested || []).filter(Boolean).map(s => s.trim())));

    let html = resumeContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');

    // highlight matched
    matchedSet.sort((a,b) => b.length - a.length).forEach(token => {
      try {
        const re = new RegExp('\\b(' + escapeRegex(token) + ')\\b', 'ig');
        html = html.replace(re, `<span class="${HIGHLIGHT_CLASS.matched}">$1</span>`);
      } catch (e) {}
    });

    // highlight suggested (but don't overwrite matched)
    suggestedSet.sort((a,b) => b.length - a.length).forEach(token => {
      try {
        const re = new RegExp('\\b(' + escapeRegex(token) + ')\\b', 'ig');
        html = html.replace(re, `<span class="${HIGHLIGHT_CLASS.suggest}">$1</span>`);
      } catch (e) {}
    });

    return html;
  }, [analysis, resumeContent]);

  const groupedRecommendations = useMemo(() => {
    if (!analysis) return {};
    const out = {};
    (analysis.recommendations || []).forEach(r => {
      const cat = r.category || 'other';
      if (!out[cat]) out[cat] = [];
      out[cat].push(r);
    });
    return out;
  }, [analysis]);

  const priorityClass = (priority) => {
    if (!priority) return 'priority-medium';
    if (priority === 'high') return 'priority-high';
    if (priority === 'low') return 'priority-low';
    return 'priority-medium';
  };

  const downloadImprovedResume = () => {
    if (!analysis) return;
    const parts = [];
    if (analysis.optimizedSections?.summary) {
      parts.push(analysis.optimizedSections.summary);
      parts.push('\n');
    }
    if (Array.isArray(analysis.optimizedSections?.skills)) {
      parts.push('Skills: ' + analysis.optimizedSections.skills.join(', '));
      parts.push('\n\n');
    }
    parts.push(resumeContent || '');

    const text = parts.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = `improved_resume_${Date.now()}.txt`;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveLocal = () => {
    if (!analysis) return;
    const item = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      resumeId: selectedResumeId || null,
      resumeContent,
      jobContent,
      analysis
    };
    saveHistoryLocal(item);
  };

  const handleViewHistory = (item) => {
    setResumeContent(item.resumeContent || '');
    setJobContent(item.jobContent || '');
    setAnalysis(item.analysis || null);
  };

  const handleDeleteHistory = (id) => {
    const next = history.filter(h => h.id !== id);
    localStorage.setItem('comparisonHistory', JSON.stringify(next));
    setHistory(next);
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
              rows={8}
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
        <div className="analysis-results enhanced">
          <div className="top-row">
            <div className="match-panel">
              <div className="big-score">{analysis.matchScore ?? 0}%</div>
              <div className="match-meta">
                <h3>{analysis.matchLevel?.toUpperCase() || 'N/A'}</h3>
                <p>{analysis.summary}</p>
              </div>
            </div>
            <div className="actions-panel">
              <button className="btn btn-secondary" onClick={downloadImprovedResume}>Download as Text</button>
              <button className="btn btn-primary" onClick={handleSaveLocal}>Save to History</button>
            </div>
          </div>

          <div className="side-by-side">
            <div className="left-column">
              <h4>Original Resume</h4>
              <div className="resume-block" dangerouslySetInnerHTML={{ __html: highlightedResumeHtml || (resumeContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>')) }} />
            </div>

            <div className="right-column">
              <h4>Suggestions & Highlights</h4>

              <div className="grouped-recommendations">
                {Object.keys(groupedRecommendations).length === 0 && <p>No recommendations available.</p>}
                {Object.entries(groupedRecommendations).map(([cat, recs]) => (
                  <div key={cat} className="rec-group">
                    <h5>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h5>
                    <ul>
                      {recs.map((r, i) => (
                        <li key={i} className={`rec-item ${priorityClass(r.priority)}`}>
                          <strong className="rec-cat">{r.priority?.toUpperCase() || 'MED'}</strong>
                          <span className="rec-text">{r.suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="optimized-block">
                <h5>Optimized Summary</h5>
                <div className="card">
                  <p>{analysis.optimizedSections?.summary || 'No optimized summary provided.'}</p>
                </div>

                <h5>Suggested Skills</h5>
                <div className="skills-list">
                  {(analysis.optimizedSections?.skills || []).map((s, i) => (
                    <span key={i} className="skill-pill {s}">{s}</span>
                  ))}
                </div>

                <h5>Missing Keywords / Skills</h5>
                <div className="missing-list">
                  {(analysis.skillsMatch?.missing || analysis.keywordMatch?.missing || []).map((m, i) => (
                    <span key={i} className="missing-pill">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="history-panel">
            <h4>Saved Comparisons</h4>
            {history.length === 0 && <p>No saved history yet.</p>}
            <ul className="history-list">
              {history.map(h => (
                <li key={h.id} className="history-item">
                  <div className="history-meta">
                    <strong>{new Date(h.createdAt).toLocaleString()}</strong>
                    <span>{h.resumeId ? ' (Saved from resume)' : ''}</span>
                  </div>
                  <div className="history-actions">
                    <button className="btn btn-link" onClick={() => handleViewHistory(h)}>View</button>
                    <button className="btn btn-link" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h.analysis || {})); }}>Copy JSON</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteHistory(h.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareResume;
