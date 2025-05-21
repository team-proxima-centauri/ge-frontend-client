'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

/**
 * Avatar component that displays either an image or initials
 * Should be wrapped in ClientOnly for any dynamic content (like user name initials)
 */
const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'User avatar', 
  size = 'md',
  name
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };
  
  // Get initials from name
  const getInitials = () => {
    if (!name || name.trim() === '') return '?';
    
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-medium ${sizeClasses[size]}`}>
      {src ? (
        <div className="relative w-full h-full">
          <Image 
            src={src} 
            alt={alt} 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
};

export { Avatar };
