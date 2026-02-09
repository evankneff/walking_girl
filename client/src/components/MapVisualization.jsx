import React, { useState, useEffect } from "react";
import SaviorIcon from "./SaviorIcon";
import LandscapeBackground from "./LandscapeBackground";
import WalkingCharacters from "./WalkingCharacters";
import MilestoneMarker from "./MilestoneMarker";

function MapVisualization({ progress }) {
  const [pathAnimated, setPathAnimated] = useState(false);
  const progressPercentage = Math.min(progress.progressPercentage, 100);
  const position = progressPercentage / 100;

  // Path follows the mountain terrain - starts at base, winds up to peak
  // The path curves along the mountain slopes
  const startX = 200; // Center at base of mountain
  const startY = 700; // Bottom of mountain
  const endX = 200; // Peak of mountain
  const endY = 160; // Near the summit

  // Control points create a winding trail up the mountain
  // Path goes: start -> curve left -> curve right -> peak
  const controlX1 = 100; // First curve goes to left slope
  const controlY1 = 520;
  const controlX2 = 300; // Second curve goes to right slope
  const controlY2 = 300;

  const getPointOnPath = (t) => {
    const x =
      Math.pow(1 - t, 3) * startX +
      3 * Math.pow(1 - t, 2) * t * controlX1 +
      3 * (1 - t) * Math.pow(t, 2) * controlX2 +
      Math.pow(t, 3) * endX;
    const y =
      Math.pow(1 - t, 3) * startY +
      3 * Math.pow(1 - t, 2) * t * controlY1 +
      3 * (1 - t) * Math.pow(t, 2) * controlY2 +
      Math.pow(t, 3) * endY;
    return { x, y };
  };

  const charPosition = getPointOnPath(position);
  const milestone25 = getPointOnPath(0.25);
  const milestone50 = getPointOnPath(0.5);
  const milestone75 = getPointOnPath(0.75);

  useEffect(() => {
    const timer = setTimeout(() => setPathAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const pathLength = 1000;

  return (
    <div className="map-visualization map-vertical">
      <svg
        viewBox="0 0 400 800"
        className="map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Landscape Background with mountain */}
        <LandscapeBackground />

        {/* Trail/path on the mountain - background (unprogressed) */}
        <path
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          fill="none"
          stroke="rgba(139, 119, 101, 0.4)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="8 12"
          className="path-background"
        />

        {/* Trail/path - progress fill */}
        <path
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          fill="none"
          stroke="#8b6914"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={
            pathAnimated ? pathLength * (1 - position) : pathLength
          }
          className="path-progress"
        />

        {/* Milestone markers along the trail */}
        <MilestoneMarker
          percentage={25}
          position={milestone25}
          reached={progressPercentage >= 25}
        />
        <MilestoneMarker
          percentage={50}
          position={milestone50}
          reached={progressPercentage >= 50}
        />
        <MilestoneMarker
          percentage={75}
          position={milestone75}
          reached={progressPercentage >= 75}
        />

        {/* Start marker at mountain base */}
        <g
          transform={`translate(${startX}, ${startY})`}
          className="start-marker"
        >
          <circle r="18" fill="#667eea" opacity="0.25" />
          <circle r="14" fill="#667eea" />
          <circle r="10" fill="white" />
          <circle r="6" fill="#667eea" />
        </g>

        {/* Jesus at the mountain peak with divine glow */}
        <g transform={`translate(${endX}, ${endY})`} className="end-marker">
          {/* Divine glow behind Jesus */}
          <circle r="55" fill="#ffd700" opacity="0.12" className="goal-glow" />
          <circle r="40" fill="#fff9e6" opacity="0.25" />
          <circle r="28" fill="#fffef5" opacity="0.4" />
          <SaviorIcon size={70} x={-35} y={-35} />
        </g>

        {/* Walking characters on the trail */}
        <WalkingCharacters
          x={charPosition.x}
          y={charPosition.y}
          isMoving={progressPercentage < 100}
        />

        {/* Location labels */}
        <g className="location-labels">
          {/* Start label at base */}
          <rect
            x={startX - 50}
            y={startY + 25}
            width="100"
            height="24"
            rx="12"
            fill="rgba(255,255,255,0.92)"
            className="label-bg"
          />
          <text
            x={startX}
            y={startY + 42}
            textAnchor="middle"
            className="location-label"
            style={{ fontSize: "11px", fontWeight: 700, fill: "#4a5568" }}
          >
            {progress.startLocation}
          </text>

          {/* End label at peak */}
          <rect
            x={endX - 50}
            y={endY - 65}
            width="100"
            height="24"
            rx="12"
            fill="rgba(255,255,255,0.92)"
            className="label-bg"
          />
          <text
            x={endX}
            y={endY - 48}
            textAnchor="middle"
            className="location-label"
            style={{ fontSize: "11px", fontWeight: 700, fill: "#4a5568" }}
          >
            {progress.endLocation}
          </text>
        </g>
      </svg>

      {/* Progress bar */}
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
