import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MapVisualization from "./MapVisualization";
import StatPill from "./StatPill";

function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/progress");
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
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
  const timeDisplay = `${hoursWalked}h ${minutesWalked}m`;
  const goalDisplay = `${hoursGoal}h ${minutesGoal}m`;

  return (
    <div className="dashboard-container dashboard-hero">
      {/* Hero Map Visualization - the main feature */}
      <div className="hero-map-wrapper">
        <MapVisualization progress={progress} />

        {/* Floating stat pills overlay */}
        <div className="stat-pills-overlay">
          <StatPill type="time" value={timeDisplay} label="walked" />
          <StatPill
            type="progress"
            value={`${progress.progressPercentage.toFixed(0)}%`}
            label="complete"
          />
          {(progress.streakDays > 0 || progress.streakWeeks > 0) && (
            <div className="streak-pills">
              {progress.streakDays > 0 && (
                <StatPill
                  type="dayStreak"
                  value={progress.streakDays}
                  label="day streak"
                />
              )}
              {progress.streakWeeks > 0 && (
                <StatPill
                  type="weekStreak"
                  value={progress.streakWeeks}
                  label="week streak"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable details toggle */}
      <button
        className="details-toggle"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
      >
        <span>{showDetails ? "Hide Details" : "Show Details"}</span>
        {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Detailed stats - collapsible on mobile */}
      <div className={`stats-details ${showDetails ? "expanded" : ""}`}>
        <div className="progress-stats">
          <div className="stat-card">
            <div className="stat-label">Total Time</div>
            <div className="stat-value">{timeDisplay}</div>
            <div className="stat-detail">{progress.totalMinutes} minutes</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Goal</div>
            <div className="stat-value">{goalDisplay}</div>
            <div className="stat-detail">{progress.goalMinutes} minutes</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Progress</div>
            <div className="stat-value">
              {progress.progressPercentage.toFixed(1)}%
            </div>
            <div className="stat-detail">{progress.totalEntries} entries</div>
          </div>

          <div className="stat-card day-streak-card">
            <div className="stat-label">Day Streak</div>
            <div className="stat-value">{progress.streakDays || 0}</div>
            <div className="stat-detail">Consecutive Days</div>
          </div>

          <div className="stat-card week-streak-card">
            <div className="stat-label">Week Streak</div>
            <div className="stat-value">{progress.streakWeeks || 0}</div>
            <div className="stat-detail">Consecutive Weeks</div>
          </div>
        </div>

        <div className="week-stats">
          <h3>This Week</h3>
          <p>
            Week of {new Date(progress.weekStartDate).toLocaleDateString()}:{" "}
            <strong>
              {Math.floor(progress.weekMinutes / 60)}h{" "}
              {progress.weekMinutes % 60}m
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
