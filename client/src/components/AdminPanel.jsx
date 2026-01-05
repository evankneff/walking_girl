import React, { useState, useEffect } from 'react';

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  
  const [settings, setSettings] = useState({
    goal_minutes: '',
    start_location: '',
    end_location: '',
  });
  
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (token) {
      setAuthenticated(true);
      fetchData();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setAuthenticated(true);
      setPassword('');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const [settingsRes, usersRes, entriesRes] = await Promise.all([
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/entries', { headers }),
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setEntries(entriesData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      alert('Settings saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newUserName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add user');
      }

      setNewUserName('');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <div className="form-card">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  disabled={loading}
                />
              </div>
              {error && <div className="message error">{error}</div>}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem('admin_token');
            setToken(null);
            setAuthenticated(false);
          }}
        >
          Logout
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="admin-sections">
        <section className="admin-section">
          <h3>Settings</h3>
          <div className="form-group">
            <label>Goal Minutes</label>
            <input
              type="number"
              value={settings.goal_minutes}
              onChange={(e) => setSettings({ ...settings, goal_minutes: e.target.value })}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Start Location</label>
            <input
              type="text"
              value={settings.start_location}
              onChange={(e) => setSettings({ ...settings, start_location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Location</label>
            <input
              type="text"
              value={settings.end_location}
              onChange={(e) => setSettings({ ...settings, end_location: e.target.value })}
            />
          </div>
          <button onClick={handleSaveSettings} className="submit-button" disabled={loading}>
            Save Settings
          </button>
        </section>

        <section className="admin-section">
          <h3>Users</h3>
          <div className="add-user-form">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="New user name"
              onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
            />
            <button onClick={handleAddUser} className="submit-button" disabled={loading}>
              Add User
            </button>
          </div>
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className="user-item">
                <span>{user.name}</span>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="delete-button"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h3>Recent Entries</h3>
          <div className="entries-list">
            {entries.slice(0, 20).map((entry) => (
              <div key={entry.id} className="entry-item">
                <div className="entry-content">
                  <div>
                    <strong>{entry.user_name}</strong> - {entry.minutes} minutes
                  </div>
                  <div className="entry-date">
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="delete-button"
                  disabled={loading}
                  title="Delete entry"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;

