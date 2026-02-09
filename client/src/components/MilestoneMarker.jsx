import React from 'react';

const milestoneLabels = {
  25: 'Quarter Way!',
  50: 'Halfway There!',
  75: 'Almost There!',
};

// Explicit colors for SVG compatibility
const COLORS = {
  accent: '#ff69b4',
  white: '#ffffff',
  grayLight: '#d1d5db',
  grayMedium: '#9ca3af',
  grayDark: '#6b7280',
};

function MilestoneMarker({ percentage, position, reached }) {
  const label = milestoneLabels[percentage] || `${percentage}%`;

  return (
    <g
      className={`milestone-marker ${reached ? 'reached' : 'inactive'}`}
      transform={`translate(${position.x}, ${position.y})`}
    >
      {/* Outer ring with pulse animation when reached */}
      {reached && (
        <circle
          className="milestone-pulse"
          r="22"
          fill="none"
          stroke={COLORS.accent}
          strokeWidth="2"
          opacity="0.5"
        />
      )}

      {/* Main marker circle */}
      <circle
        r="16"
        fill={reached ? COLORS.accent : COLORS.grayMedium}
        className="milestone-circle"
      />

      {/* Inner circle */}
      <circle
        r="12"
        fill={reached ? COLORS.white : COLORS.grayLight}
      />

      {/* Percentage text */}
      <text
        y="4"
        textAnchor="middle"
        fill={reached ? COLORS.accent : COLORS.grayDark}
        fontSize="10"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {percentage}%
      </text>

      {/* Label (only shown when reached) */}
      {reached && (
        <g className="milestone-label">
          <rect
            x="-45"
            y="-46"
            width="90"
            height="24"
            rx="12"
            fill={COLORS.accent}
            className="milestone-label-bg"
          />
          <text
            y="-30"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        </g>
      )}

      {/* Flag pole for visual indicator */}
      <line
        x1="0"
        y1="16"
        x2="0"
        y2="32"
        stroke={reached ? COLORS.accent : COLORS.grayMedium}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

export default MilestoneMarker;
