'use client';

import React, { useState, useEffect } from 'react';

type AnimationType = 'fade-in' | 'slide-up' | 'pulse' | 'spin' | 'none';

interface MotionWrapperProps {
  children: React.ReactNode;
  animation: AnimationType;
  duration?: 'fast' | 'medium' | 'slow';
  delay?: number; // in milliseconds
  className?: string;
  respectReducedMotion?: boolean;
}

/**
 * MotionWrapper component - Wraps children with standardized animations
 * Respects user's reduced motion preferences
 */
const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  animation = 'fade-in',
  duration = 'medium',
  delay = 0,
  className = '',
  respectReducedMotion = true,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Listen for changes to the prefers-reduced-motion media query
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Don't apply animation if user prefers reduced motion and we respect that preference
  const shouldAnimate = !(respectReducedMotion && prefersReducedMotion);
  
  // Map animation types to CSS classes
  const animationClass = shouldAnimate && animation !== 'none' 
    ? `animate-${animation}` 
    : '';
  
  // Map durations to CSS variables
  const durationClass = {
    fast: 'var(--transition-fast)',
    medium: 'var(--transition-medium)',
    slow: 'var(--transition-slow)',
  }[duration];
  
  // Apply animation styles only on client-side to avoid hydration issues
  const style = isClient && shouldAnimate ? {
    animationDuration: durationClass,
    animationDelay: delay ? `${delay}ms` : undefined,
  } : {};

  return (
    <div className={`${animationClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

export { MotionWrapper };
