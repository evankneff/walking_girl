import React from 'react';

const SaviorIcon = ({ className, onClick, size = 50, style, ...props }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="-30 -30 60 60" 
      className={className} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      {...props}
    >
      <circle r="25" fill="#fff" stroke="#32cd32" strokeWidth="3" />
      <circle r="8" fill="#f4d03f" cx="0" cy="-8" />
      <path d="M -12 0 L -8 -5 L 8 -5 L 12 0 L 12 20 L -12 20 Z" fill="#4a90e2" />
      <line x1="-12" y1="5" x2="-20" y2="0" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" />
      <line x1="12" y1="5" x2="20" y2="0" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" />
      <circle r="12" fill="none" stroke="#ffd700" strokeWidth="2" cx="0" cy="-8" opacity="0.8" />
    </svg>
  );
};

export default SaviorIcon;
