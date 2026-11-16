import React from 'react';

interface FramerLogoProps {
  className?: string;
  size?: number;
}

export const FramerLogo: React.FC<FramerLogoProps> = ({ className = 'w-5 h-7 text-white', size }) => {
  return (
    <svg
      viewBox="0 0 16 24"
      fill="currentColor"
      className={className}
      style={size ? { width: size, height: (size * 24) / 16 } : undefined}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Framer logo"
    >
      <path d="M 16 0 L 16 8 L 8 8 L 0 0 Z M 0 8 L 8 8 L 16 16 L 8 16 L 8 24 L 0 16 Z" />
    </svg>
  );
};
