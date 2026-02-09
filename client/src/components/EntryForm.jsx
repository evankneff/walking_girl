import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_MINUTES = 300;

function EntryForm() {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [lastEntry, setLastEntry] = useState(null);

  useEffect(() => {
    fetch('/api/users/names')
      .then(res => res.json())
      .then(data => setNames(data))
      .catch(() => setError('Failed to load names'));
  }, []);

  const formatDisplayName = (fullName) => {
    if (!fullName) return '';
    const tokens = fullName.trim().split(/\s+/);
    if (tokens.length === 1) {
      return tokens[0];
    }
    const first = tokens[0];
    const last = tokens[tokens.length - 1];
    const lastInitial = last.charAt(0).toUpperCase();
    return `${first} ${lastInitial}.`;
  };

  const filteredNames = names.filter((n) => {
    if (!nameFilter.trim()) return true;
    return n.toLowerCase().includes(nameFilter.trim().toLowerCase());
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const minutesInt = parseInt(minutes, 10);
      if (!name || Number.isNaN(minutesInt)) {
        throw new Error('Please select your name and enter minutes.');
      }

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, minutes: minutesInt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit entry');
      }

      setMessage(data.message || 'Entry submitted successfully!');
      if (data.relativeStats) {
        setStats(data.relativeStats);
      }

      setLastEntry({ name, minutes: String(minutesInt) });
      setName('');
      setMinutes('');
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
            <label htmlFor="name-search">Your Name</label>
            <input
              type="text"
              id="name-search"
              placeholder="Start typing your name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <div className="name-list">
              {filteredNames.length === 0 ? (
                <div className="name-list-empty">
                  No names match. Try a different spelling.
                </div>
              ) : (
                filteredNames.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`name-list-item${name === n ? ' selected' : ''}`}
                    onClick={() => setName(n)}
                    disabled={loading}
                  >
                    {formatDisplayName(n)}
                  </button>
                ))
              )}
            </div>
            {name && (
              <span className="form-hint">
                Selected: <strong>{formatDisplayName(name)}</strong>
              </span>
            )}
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
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate('/')}
                >
                  Bring me back to the dashboard
                </button>
                {lastEntry && (
                  <button
                    type="button"
                    className="secondary-button muted"
                    onClick={() => {
                      setName(lastEntry.name || '');
                      setMinutes(lastEntry.minutes || '');
                      setMessage(null);
                      setStats(null);
                      setError(null);
                    }}
                  >
                    I entered it wrong
                  </button>
                )}
              </div>
              {lastEntry && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#555' }}>
                  If anything still seems off, your leaders can help fix totals.
                </p>
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
