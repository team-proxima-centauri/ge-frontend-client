'use client';

import React from 'react';

interface SkipLinkProps {
  targetId: string;
  text?: string;
}

/**
 * SkipLink component - Provides a way for keyboard users to skip navigation
 * and jump directly to main content
 */
const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  text = 'Skip to main content' 
}) => {
  return (
    <a 
      href={`#${targetId}`} 
      className="skip-link"
      onFocus={(e) => e.currentTarget.classList.add('focused')}
      onBlur={(e) => e.currentTarget.classList.remove('focused')}
    >
      {text}
    </a>
  );
};

export { SkipLink };
