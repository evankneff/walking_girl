import React from "react";

function LandscapeBackground() {
  return (
    <g className="landscape-background">
      <defs>
        {/* Sky gradient */}
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="60%" stopColor="#b8e0f0" />
          <stop offset="100%" stopColor="#c8e8c8" />
        </linearGradient>

        {/* Mountain gradient - darker at base, lighter/snow at peak */}
        <linearGradient id="mountainMain" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5a8a5a" />
          <stop offset="40%" stopColor="#7ab87a" />
          <stop offset="70%" stopColor="#9ed89e" />
          <stop offset="85%" stopColor="#c8e8c8" />
          <stop offset="95%" stopColor="#f0f8f0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Background mountain gradients */}
        <linearGradient id="mountainBgLeft" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#6b9b6b" />
          <stop offset="100%" stopColor="#a8d8a8" />
        </linearGradient>
        <linearGradient id="mountainBgRight" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5a8a5a" />
          <stop offset="100%" stopColor="#98c898" />
        </linearGradient>

        {/* Ground/grass gradient */}
        <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7ab87a" />
          <stop offset="100%" stopColor="#5a9a5a" />
        </linearGradient>

        {/* Divine glow at peak */}
        <radialGradient id="divineGlow" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="#fffef0" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#fff9e0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff9e0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="800" fill="url(#skyGradient)" />

      {/* Divine light rays at peak */}
      <ellipse cx="200" cy="80" rx="150" ry="100" fill="url(#divineGlow)" />

      {/* Clouds in sky */}
      <g className="clouds" opacity="0.8">
        <ellipse cx="60" cy="80" rx="35" ry="15" fill="white" />
        <ellipse cx="85" cy="75" rx="28" ry="12" fill="white" />
        <ellipse cx="40" cy="85" rx="25" ry="11" fill="white" />

        <ellipse cx="340" cy="100" rx="40" ry="18" fill="white" />
        <ellipse cx="365" cy="95" rx="30" ry="14" fill="white" />
        <ellipse cx="315" cy="105" rx="28" ry="12" fill="white" />

        <ellipse cx="320" cy="200" rx="30" ry="12" fill="white" />
        <ellipse cx="80" cy="180" rx="25" ry="10" fill="white" />
      </g>

      {/* Background mountain - left */}
      <path
        d="M 0 400
           L 0 800
           L 120 800
           L 120 450
           Q 80 350 40 400
           Q 0 360 0 400
           Z"
        fill="url(#mountainBgLeft)"
        opacity="0.5"
      />

      {/* Background mountain - right */}
      <path
        d="M 400 350
           L 400 800
           L 280 800
           L 280 420
           Q 320 320 360 380
           Q 400 320 400 350
           Z"
        fill="url(#mountainBgRight)"
        opacity="0.45"
      />

      {/* Main central mountain - the path follows this */}
      <path
        d="M 200 100
           Q 120 180 100 280
           Q 80 380 60 480
           Q 40 580 0 680
           L 0 800
           L 400 800
           L 400 680
           Q 360 580 340 480
           Q 320 380 300 280
           Q 280 180 200 100
           Z"
        fill="url(#mountainMain)"
      />

      {/* Snow cap detail on peak */}
      <path
        d="M 200 100
           Q 170 130 160 160
           Q 180 150 200 155
           Q 220 150 240 160
           Q 230 130 200 100
           Z"
        fill="white"
        opacity="0.8"
      />

      {/* Rocky outcrops / texture on mountain */}
      <g opacity="0.3">
        <ellipse cx="150" cy="300" rx="20" ry="8" fill="#5a7a5a" />
        <ellipse cx="260" cy="350" rx="25" ry="10" fill="#5a7a5a" />
        <ellipse cx="120" cy="450" rx="18" ry="7" fill="#4a6a4a" />
        <ellipse cx="280" cy="500" rx="22" ry="9" fill="#4a6a4a" />
        <ellipse cx="100" cy="580" rx="20" ry="8" fill="#4a6a4a" />
        <ellipse cx="300" cy="620" rx="24" ry="10" fill="#4a6a4a" />
      </g>

      {/* Trees on the mountain slopes */}
      <g className="trees">
        {/* Left side trees */}
        <g transform="translate(70, 520)" opacity="0.9">
          <rect x="-3" y="0" width="6" height="12" fill="#5a3a1a" />
          <ellipse cx="0" cy="-6" rx="12" ry="16" fill="#2d5a2d" />
        </g>
        <g transform="translate(50, 600)" opacity="0.85">
          <rect x="-4" y="0" width="8" height="15" fill="#4a2a0a" />
          <ellipse cx="0" cy="-8" rx="14" ry="18" fill="#3d6a3d" />
        </g>
        <g transform="translate(85, 680)" opacity="0.9">
          <rect x="-3" y="0" width="6" height="12" fill="#5a3a1a" />
          <ellipse cx="0" cy="-6" rx="11" ry="14" fill="#2d5a2d" />
        </g>

        {/* Right side trees */}
        <g transform="translate(330, 540)" opacity="0.9">
          <rect x="-3" y="0" width="6" height="12" fill="#5a3a1a" />
          <ellipse cx="0" cy="-6" rx="12" ry="16" fill="#2d5a2d" />
        </g>
        <g transform="translate(350, 630)" opacity="0.85">
          <rect x="-4" y="0" width="8" height="15" fill="#4a2a0a" />
          <ellipse cx="0" cy="-8" rx="14" ry="18" fill="#3d6a3d" />
        </g>
        <g transform="translate(315, 700)" opacity="0.9">
          <rect x="-3" y="0" width="6" height="12" fill="#5a3a1a" />
          <ellipse cx="0" cy="-6" rx="11" ry="14" fill="#2d5a2d" />
        </g>
      </g>

      {/* Grass tufts at base */}
      <g opacity="0.6">
        {[40, 90, 140, 200, 260, 310, 360].map((x, i) => (
          <g key={i} transform={`translate(${x}, 760)`}>
            <path d="M 0 0 Q -2 -8 0 -12 Q 2 -8 0 0" fill="#4a8a4a" />
            <path d="M 4 0 Q 6 -10 4 -15 Q 2 -10 4 0" fill="#5a9a5a" />
            <path d="M -4 0 Q -6 -6 -4 -10 Q -2 -6 -4 0" fill="#3a7a3a" />
          </g>
        ))}
      </g>
    </g>
  );
}

export default LandscapeBackground;
