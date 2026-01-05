import React, { useState, useEffect } from 'react';
import MapVisualization from './MapVisualization';

function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
    // Refresh every 30 seconds
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const hoursWalked = Math.floor(progress.totalMinutes / 60);
  const minutesWalked = progress.totalMinutes % 60;
  const hoursGoal = Math.floor(progress.goalMinutes / 60);
  const minutesGoal = progress.goalMinutes % 60;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Walking Progress</h1>
        <p className="subtitle">Walk with our Savior</p>
      </div>

      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-label">Total Time</div>
          <div className="stat-value">
            {hoursWalked}h {minutesWalked}m
          </div>
          <div className="stat-detail">
            {progress.totalMinutes} minutes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Goal</div>
          <div className="stat-value">
            {hoursGoal}h {minutesGoal}m
          </div>
          <div className="stat-detail">
            {progress.goalMinutes} minutes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Progress</div>
          <div className="stat-value">
            {progress.progressPercentage.toFixed(1)}%
          </div>
          <div className="stat-detail">
            {progress.totalEntries} entries
          </div>
        </div>
      </div>

      <MapVisualization progress={progress} />

      <div className="week-stats">
        <h3>This Week</h3>
        <p>
          Week of {new Date(progress.weekStartDate).toLocaleDateString()}:{' '}
          {Math.floor(progress.weekMinutes / 60)}h {progress.weekMinutes % 60}m
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

