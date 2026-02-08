import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_MINUTES = 300;

function EntryForm() {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/users/names')
      .then(res => res.json())
      .then(data => setNames(data))
      .catch(() => setError('Failed to load names'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, minutes: parseInt(minutes) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit entry');
      }

      setMessage(data.message || 'Entry submitted successfully!');
      if (data.relativeStats) {
        setStats(data.relativeStats);
      }

      setName('');
      setMinutes('');

      // Auto-redirect
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entry-form-container">
      <div className="form-card">
        <h2>Enter Walking Time</h2>
        <p className="form-subtitle">Record your walking minutes for this week</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <select
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select your name</option>
              {names.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="minutes">Minutes Walked</label>
            <input
              type="number"
              id="minutes"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Enter minutes"
              min="1"
              max={MAX_MINUTES}
              required
              disabled={loading}
            />
            <span className="form-hint">Max {MAX_MINUTES} minutes per entry</span>
          </div>

          {message && (
            <div className="message success">
              {message}
              {stats && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <p>You've walked <strong>{stats.userTotalMinutes}</strong> minutes total!</p>
                  <p>You've contributed <strong>{stats.contributionPercent}%</strong> to the goal!</p>
                </div>
              )}
            </div>
          )}
          {error && <div className="message error">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EntryForm;
