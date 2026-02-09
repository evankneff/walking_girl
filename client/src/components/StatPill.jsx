import React from 'react';
import { Clock, Target, TrendingUp, Flame, Zap } from 'lucide-react';

const iconMap = {
  time: Clock,
  goal: Target,
  progress: TrendingUp,
  weekStreak: Flame,
  dayStreak: Zap,
};

function StatPill({ type, value, label, className = '' }) {
  const Icon = iconMap[type] || Clock;

  // Determine variant class based on type
  const variantClass = type === 'weekStreak' ? 'week-streak' :
                       type === 'dayStreak' ? 'day-streak' : '';

  return (
    <div className={`stat-pill ${variantClass} ${className}`}>
      <Icon size={16} className="stat-pill-icon" />
      <span className="stat-pill-value">{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  );
}

export default StatPill;
