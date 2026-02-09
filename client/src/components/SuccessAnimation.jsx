import React from 'react';
import { Check, TrendingUp, Target } from 'lucide-react';

function SuccessAnimation({ stats, onDashboard, onLogAnother }) {
  return (
    <div className="success-animation">
      {/* Animated checkmark */}
      <div className="success-icon">
        <div className="success-circle">
          <Check size={32} strokeWidth={3} />
        </div>
      </div>

      <h3 className="success-title">Great Job!</h3>
      <p className="success-subtitle">Your walking time has been logged</p>

      {/* Stats summary */}
      {stats && (
        <div className="success-stats">
          <div className="success-stat">
            <TrendingUp size={20} />
            <div className="success-stat-content">
              <span className="success-stat-value">{stats.userTotalMinutes}</span>
              <span className="success-stat-label">total minutes walked</span>
            </div>
          </div>
          <div className="success-stat">
            <Target size={20} />
            <div className="success-stat-content">
              <span className="success-stat-value">{stats.contributionPercent}%</span>
              <span className="success-stat-label">contributed to goal</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="success-actions">
        <button className="success-btn primary" onClick={onDashboard}>
          View Progress
        </button>
        <button className="success-btn secondary" onClick={onLogAnother}>
          Log Another Walk
        </button>
      </div>
    </div>
  );
}

export default SuccessAnimation;
