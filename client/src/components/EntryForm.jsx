import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessAnimation from './SuccessAnimation';

const MAX_MINUTES = 300;

function EntryForm() {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState(null);

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

      if (data.relativeStats) {
        setStats(data.relativeStats);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogAnother = () => {
    setSuccess(false);
    setStats(null);
    setName('');
    setMinutes('');
    setNameFilter('');
    setError(null);
  };

  if (success) {
    return (
      <div className="entry-form-container">
        <div className="form-card bottom-sheet">
          <SuccessAnimation
            stats={stats}
            onDashboard={() => navigate('/')}
            onLogAnother={handleLogAnother}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="entry-form-container">
      <div className="form-card bottom-sheet">
        {/* Drag indicator for mobile */}
        <div className="sheet-drag-indicator" />

        <h2>Log Your Walk</h2>
        <p className="form-subtitle">Record your walking minutes</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name-search">Your Name</label>
            <input
              type="text"
              id="name-search"
              placeholder="Search for your name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              disabled={loading}
              autoComplete="off"
              className="search-input"
            />
            <div className="name-list">
              {filteredNames.length === 0 ? (
                <div className="name-list-empty">
                  No names found. Try a different spelling.
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
                    <span className="name-text">{formatDisplayName(n)}</span>
                    {name === n && (
                      <span className="name-check">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="minutes">Minutes Walked</label>
            <div className="minutes-input-wrapper">
              <input
                type="number"
                id="minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                min="1"
                max={MAX_MINUTES}
                required
                disabled={loading}
                className="minutes-input"
              />
              <span className="minutes-suffix">min</span>
            </div>
            <span className="form-hint">Maximum {MAX_MINUTES} minutes per entry</span>
          </div>

          {error && <div className="message error">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading || !name || !minutes}
          >
            {loading ? (
              <span className="loading-spinner">Submitting...</span>
            ) : (
              'Submit Walk'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EntryForm;
