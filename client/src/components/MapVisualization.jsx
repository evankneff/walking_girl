import React from 'react';

function MapVisualization({ progress }) {
  const progressPercentage = Math.min(progress.progressPercentage, 100);
  
  // Calculate position along the path (0 to 1)
  const position = progressPercentage / 100;
  
  // Path coordinates for SVG (curved path)
  const startX = 50;
  const startY = 300;
  const endX = 950;
  const endY = 300;
  const controlX1 = 300;
  const controlY1 = 100;
  const controlX2 = 700;
  const controlY2 = 500;
  
  // Calculate character position on the path
  const getPointOnPath = (t) => {
    // Cubic bezier curve calculation
    const x = Math.pow(1 - t, 3) * startX +
              3 * Math.pow(1 - t, 2) * t * controlX1 +
              3 * (1 - t) * Math.pow(t, 2) * controlX2 +
              Math.pow(t, 3) * endX;
    
    const y = Math.pow(1 - t, 3) * startY +
              3 * Math.pow(1 - t, 2) * t * controlY1 +
              3 * (1 - t) * Math.pow(t, 2) * controlY2 +
              Math.pow(t, 3) * endY;
    
    return { x, y };
  };
  
  const charPosition = getPointOnPath(position);
  
  return (
    <div className="map-visualization">
      <svg viewBox="0 0 1000 600" className="map-svg">
        {/* Background */}
        <rect width="1000" height="600" fill="#f0f8ff" />
        
        {/* Path line (already traveled) */}
        <path
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          fill="none"
          stroke="#87ceeb"
          strokeWidth="8"
          strokeDasharray="10 5"
          opacity="0.3"
        />
        
        {/* Path line (current progress) */}
        <path
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          fill="none"
          stroke="#4a90e2"
          strokeWidth="8"
          strokeDasharray={`${2000 * position} 2000`}
        />
        
        {/* Start location marker */}
        <g transform={`translate(${startX}, ${startY})`}>
          <circle r="15" fill="#4a90e2" />
          <circle r="12" fill="#fff" />
          <circle r="8" fill="#4a90e2" />
        </g>
        
        {/* End location marker - Jesus */}
        <g transform={`translate(${endX}, ${endY})`}>
          {/* Jesus figure - simple respectful representation */}
          <circle r="25" fill="#fff" stroke="#32cd32" strokeWidth="3" />
          {/* Head */}
          <circle r="8" fill="#f4d03f" cx="0" cy="-8" />
          {/* Body (robe) */}
          <path d="M -12 0 L -8 -5 L 8 -5 L 12 0 L 12 20 L -12 20 Z" fill="#4a90e2" />
          {/* Arms outstretched */}
          <line x1="-12" y1="5" x2="-20" y2="0" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="5" x2="20" y2="0" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" />
          {/* Halo */}
          <circle r="12" fill="none" stroke="#ffd700" strokeWidth="2" cx="0" cy="-8" opacity="0.8" />
        </g>
        
        {/* Character (walking girl) */}
        <g 
          className="character"
          transform={`translate(${charPosition.x}, ${charPosition.y})`}
          style={{
            transition: 'transform 0.5s ease-out',
          }}
        >
          {/* Girl figure */}
          {/* Head */}
          <circle r="10" fill="#ffdbac" cx="0" cy="-15" />
          {/* Hair */}
          <ellipse cx="0" cy="-18" rx="12" ry="8" fill="#8b4513" />
          {/* Body (dress) */}
          <path d="M -8 -5 L -6 0 L 6 0 L 8 -5 L 8 15 L -8 15 Z" fill="#ff69b4" />
          {/* Arms */}
          <line x1="-8" y1="2" x2="-15" y2="5" stroke="#ffdbac" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="2" x2="15" y2="5" stroke="#ffdbac" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <line x1="-3" y1="15" x2="-3" y2="25" stroke="#ffdbac" strokeWidth="3" strokeLinecap="round" />
          <line x1="3" y1="15" x2="3" y2="25" stroke="#ffdbac" strokeWidth="3" strokeLinecap="round" />
          {/* Feet */}
          <ellipse cx="-3" cy="27" rx="4" ry="2" fill="#333" />
          <ellipse cx="3" cy="27" rx="4" ry="2" fill="#333" />
        </g>
        
        {/* Location labels */}
        <text x={startX} y={startY + 40} textAnchor="middle" className="location-label">
          {progress.startLocation}
        </text>
        <text x={endX} y={endY + 40} textAnchor="middle" className="location-label">
          {progress.endLocation}
        </text>
      </svg>
      
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-text">
          {progressPercentage.toFixed(1)}% Complete
        </div>
      </div>
    </div>
  );
}

export default MapVisualization;

