import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/progress/history')
      .then(res => res.json())
      .then(data => {
        // Format dates for display
        const formattedData = data.map(item => ({
          ...item,
          formattedDate: new Date(item.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setHistory(formattedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load history');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Weekly History</h1>
        <p className="subtitle">Group progress over time</p>
      </div>

      <div style={{ height: '400px', width: '100%', marginTop: '2rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="formattedDate" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="totalMinutes" stroke="#667eea" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="week-stats" style={{ marginTop: '2rem' }}>
          <h3>Total Weeks Tracked</h3>
          <p>{history.length} weeks</p>
      </div>
    </div>
  );
}

export default HistoryPage;
