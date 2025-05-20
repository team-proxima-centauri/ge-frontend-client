'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

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
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-choco-greenbtn to-choco-greenbtn/70 flex items-center justify-center text-white font-medium ${sizeClasses[size]}`}>
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          layout="fill" 
          objectFit="cover"
          className="w-full h-full"
        />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
};

export { Avatar };
