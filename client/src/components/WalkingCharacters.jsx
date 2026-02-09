import React from "react";

function WalkingCharacters({ x, y, isMoving = true }) {
  return (
    <g
      className={`walking-characters ${isMoving ? "walking" : ""}`}
      transform={`translate(${x}, ${y})`}
    >
      {/* Ground shadow - wider to cover both characters */}
      <ellipse
        cx="0"
        cy="28"
        rx="50"
        ry="8"
        fill="rgba(0, 0, 0, 0.15)"
        className="character-shadow"
      />

      {/* Girl (left) - pink dress */}
      <g transform="translate(-28, 0)">
        <g className="character girl">
          {/* Hair (behind head) - brown */}
          <ellipse cx="0" cy="-16" rx="11" ry="9" fill="#8b4513" />
          <path
            d="M -10 -14 Q -12 -5 -10 5"
            stroke="#8b4513"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 10 -14 Q 12 -5 10 5"
            stroke="#8b4513"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Head */}
          <circle r="9" fill="#ffdbac" cx="0" cy="-15" />

          {/* Face features */}
          <circle r="1.5" fill="#333" cx="-3" cy="-16" />
          <circle r="1.5" fill="#333" cx="3" cy="-16" />
          <path
            d="M -2 -12 Q 0 -10 2 -12"
            stroke="#e8967a"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="-5"
            cy="-13"
            rx="2"
            ry="1"
            fill="#ffb5b5"
            opacity="0.5"
          />
          <ellipse cx="5" cy="-13" rx="2" ry="1" fill="#ffb5b5" opacity="0.5" />

          {/* Body/dress - PINK */}
          <path
            d="M -8 -5 L -6 0 L 6 0 L 8 -5 L 8 8 Q 10 15 5 16 L -5 16 Q -10 15 -8 8 Z"
            fill="#ff69b4"
          />
          <path
            d="M 0 2 L 0 14"
            stroke="#e055a0"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Arms */}
          <g className="arm arm-left">
            <line
              x1="-8"
              y1="0"
              x2="-14"
              y2="6"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <g className="arm arm-right">
            <line
              x1="8"
              y1="0"
              x2="14"
              y2="6"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Legs */}
          <g className="leg leg-left">
            <line
              x1="-3"
              y1="16"
              x2="-4"
              y2="25"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx="-4" cy="26.5" rx="4" ry="2" fill="#333" />
          </g>
          <g className="leg leg-right">
            <line
              x1="3"
              y1="16"
              x2="4"
              y2="25"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx="4" cy="26.5" rx="4" ry="2" fill="#333" />
          </g>
        </g>
      </g>

      {/* Boy (right) - blue shirt */}
      <g transform="translate(28, 0)">
        <g className="character boy">
          {/* Hair - dark brown */}
          <ellipse cx="0" cy="-19" rx="10" ry="6" fill="#5b3a1a" />
          <path d="M -8 -18 Q -6 -22 0 -22 Q 6 -22 8 -18" fill="#5b3a1a" />

          {/* Head */}
          <circle r="9" fill="#ffdbac" cx="0" cy="-15" />

          {/* Face features */}
          <circle r="1.5" fill="#333" cx="-3" cy="-16" />
          <circle r="1.5" fill="#333" cx="3" cy="-16" />
          <path
            d="M -2 -12 Q 0 -10 2 -12"
            stroke="#e8967a"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Body/shirt - BLUE */}
          <rect x="-8" y="-5" width="16" height="13" rx="2" fill="#667eea" />
          <path
            d="M -3 -5 L 0 -2 L 3 -5"
            stroke="#4a5fd8"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Shorts - gray */}
          <rect x="-7" y="8" width="14" height="8" rx="1" fill="#4a5568" />

          {/* Arms */}
          <g className="arm arm-left">
            <line
              x1="-8"
              y1="0"
              x2="-14"
              y2="6"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <g className="arm arm-right">
            <line
              x1="8"
              y1="0"
              x2="14"
              y2="6"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Legs */}
          <g className="leg leg-left">
            <line
              x1="-3"
              y1="16"
              x2="-4"
              y2="25"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx="-4" cy="26.5" rx="4" ry="2" fill="#333" />
          </g>
          <g className="leg leg-right">
            <line
              x1="3"
              y1="16"
              x2="4"
              y2="25"
              stroke="#ffdbac"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx="4" cy="26.5" rx="4" ry="2" fill="#333" />
          </g>
        </g>
      </g>
    </g>
  );
}

export default WalkingCharacters;
