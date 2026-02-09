import React, { useState, useEffect, useMemo } from "react";

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("admin_token"));

  const [settings, setSettings] = useState({
    goal_minutes: "",
    start_location: "",
    end_location: "",
  });

  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const [entries, setEntries] = useState([]);

  // Activity log sorting
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // Per-kid view
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [userEntriesLoading, setUserEntriesLoading] = useState(false);

  // Delete-user confirmation
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const [activeTab, setActiveTab] = useState("management");

  useEffect(() => {
    if (token) {
      setAuthenticated(true);
      fetchData();
    }
  }, [token]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
      setAuthenticated(true);
      setPassword("");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [settingsRes, usersRes, entriesRes] = await Promise.all([
        fetch("/api/admin/settings", { headers: authHeaders }),
        fetch("/api/admin/users", { headers: authHeaders }),
        fetch("/api/admin/entries", { headers: authHeaders }),
      ]);

      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (entriesRes.ok) setEntries(await entriesRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to save settings");
      alert("Settings saved successfully!");
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
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ name: newUserName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add user");
      setNewUserName("");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user with cascade — requires typing name
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${deleteConfirmUser.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");

      setDeleteConfirmUser(null);
      setDeleteConfirmInput("");
      if (selectedUser && selectedUser.id === deleteConfirmUser.id) {
        setSelectedUser(null);
        setUserEntries([]);
      }
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/entries/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!response.ok) throw new Error("Failed to delete entry");
      fetchData();
      if (selectedUser) fetchUserEntries(selectedUser.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Per-kid view
  const fetchUserEntries = async (userName) => {
    setUserEntriesLoading(true);
    try {
      const res = await fetch(
        `/api/admin/entries?user_name=${encodeURIComponent(userName)}`,
        {
          headers: authHeaders,
        },
      );
      if (res.ok) setUserEntries(await res.json());
    } catch (err) {
      console.error("Error fetching user entries:", err);
    } finally {
      setUserEntriesLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchUserEntries(user.name);
  };

  // Sorted entries for activity log
  const sortedEntries = useMemo(() => {
    const sorted = [...entries];
    sorted.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "user_name") {
        aVal = a.user_name.toLowerCase();
        bVal = b.user_name.toLowerCase();
      } else if (sortField === "minutes") {
        aVal = a.minutes;
        bVal = b.minutes;
      } else {
        aVal = a.created_at;
        bVal = b.created_at;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [entries, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  // Per-kid totals
  const userTotalMinutes = userEntries.reduce((sum, e) => sum + e.minutes, 0);

  const leaderboardData = useMemo(() => {
    const stats = {};
    entries.forEach((e) => {
      if (!stats[e.user_name]) {
        stats[e.user_name] = { name: e.user_name, totalMinutes: 0, count: 0 };
      }
      stats[e.user_name].totalMinutes += e.minutes;
      stats[e.user_name].count += 1;
    });
    return Object.values(stats).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [entries]);

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
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
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
            localStorage.removeItem("admin_token");
            setToken(null);
            setAuthenticated(false);
          }}
        >
          Logout
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      {/* Delete user confirmation modal */}
      {deleteConfirmUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete {deleteConfirmUser.name}?</h3>
            <p className="modal-warning">
              This will permanently remove{" "}
              <strong>{deleteConfirmUser.name}</strong> and all their entries.
              This cannot be undone.
            </p>
            <div className="form-group">
              <label>Type "{deleteConfirmUser.name}" to confirm</label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={deleteConfirmUser.name}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button
                className="delete-button"
                disabled={
                  deleteConfirmInput !== deleteConfirmUser.name || loading
                }
                onClick={handleDeleteUser}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setDeleteConfirmUser(null);
                  setDeleteConfirmInput("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "management" ? "active" : ""}`}
          onClick={() => setActiveTab("management")}
        >
          Management
        </button>
        <button
          className={`tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
        <button
          className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Activity Log
        </button>
      </div>

      {activeTab === "management" && (
        <div className="admin-sections">
          {/* Settings */}
          <section className="admin-section">
            <h3>Settings</h3>
            <div className="form-group">
              <label>Goal Minutes</label>
              <input
                type="number"
                value={settings.goal_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, goal_minutes: e.target.value })
                }
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Start Location</label>
              <input
                type="text"
                value={settings.start_location}
                onChange={(e) =>
                  setSettings({ ...settings, start_location: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>End Location</label>
              <input
                type="text"
                value={settings.end_location}
                onChange={(e) =>
                  setSettings({ ...settings, end_location: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="submit-button"
              disabled={loading}
            >
              Save Settings
            </button>
          </section>

          {/* Users */}
          <section className="admin-section">
            <h3>Users ({users.length})</h3>
            <div className="add-user-form">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="New user name"
                maxLength={100}
                onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
              />
              <button
                onClick={handleAddUser}
                className="submit-button"
                disabled={loading}
              >
                Add
              </button>
            </div>
            <div className="users-list">
              {users.map((user) => (
                <div key={user.id} className="user-item">
                  <span
                    className="user-name-link"
                    onClick={() => handleSelectUser(user)}
                    title="View entries"
                  >
                    {user.name}
                  </span>
                  <button
                    onClick={() => setDeleteConfirmUser(user)}
                    className="delete-button"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <section className="admin-section">
          <h3>Leaderboard</h3>
          <div className="entries-table-wrap">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Total Minutes</th>
                  <th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user, index) => (
                  <tr key={user.name}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.totalMinutes}</td>
                    <td>{user.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Per-kid view */}
      {selectedUser && activeTab === "management" && (
        <section className="admin-section per-kid-section">
          <div className="per-kid-header">
            <h3>{selectedUser.name}'s Entries</h3>
            <button
              className="cancel-button"
              onClick={() => {
                setSelectedUser(null);
                setUserEntries([]);
              }}
            >
              Close
            </button>
          </div>
          <div className="per-kid-summary">
            <span>
              <strong>Total entries:</strong> {userEntries.length}
            </span>
            <span>
              <strong>Total minutes:</strong> {userTotalMinutes}
            </span>
          </div>
          {userEntriesLoading ? (
            <p className="loading-text">Loading...</p>
          ) : userEntries.length === 0 ? (
            <p className="empty-text">No entries for this user.</p>
          ) : (
            <div className="entries-table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>Minutes</th>
                    <th>Week</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.minutes}</td>
                      <td>{entry.week_start_date}</td>
                      <td>{new Date(entry.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="delete-button small"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Activity Log */}
      {activeTab === "activity" && (
        <section className="admin-section activity-log-section">
          <h3>Activity Log ({entries.length} entries)</h3>
          {entries.length === 0 ? (
            <p className="empty-text">No entries yet.</p>
          ) : (
            <div className="entries-table-wrap">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSort("user_name")}
                    >
                      Name{sortIndicator("user_name")}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("minutes")}
                    >
                      Minutes{sortIndicator("minutes")}
                    </th>
                    <th>Week</th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("created_at")}
                    >
                      Submitted{sortIndicator("created_at")}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.user_name}</td>
                      <td>{entry.minutes}</td>
                      <td>{entry.week_start_date}</td>
                      <td>{new Date(entry.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="delete-button small"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminPanel;
