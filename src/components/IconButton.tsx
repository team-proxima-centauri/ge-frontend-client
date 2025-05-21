'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}

/**
 * IconButton component - Standardized accessible icon button
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  // Map size to CSS classes
  const sizeClasses = {
    xs: 'icon-xs p-1',
    sm: 'icon-sm p-1.5',
    md: 'icon-md p-2',
    lg: 'icon-lg p-2.5',
    xl: 'icon-xl p-3',
  };

  // Map variant to CSS classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-primary hover:bg-secondary-variant',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-secondary/50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full flex items-center justify-center
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      aria-label={label}
    >
      <Icon className={`icon-${size}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
};

export { IconButton };
