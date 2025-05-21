'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number; // in milliseconds
  onClose?: () => void;
  isVisible: boolean;
}

/**
 * Toast component - Accessible notification component
 */
const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 5000,
  onClose,
  isVisible,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss toast after duration
  useEffect(() => {
    if (!isVisible || !duration) return;
    
    const timer = setTimeout(() => {
      setIsExiting(true);
      
      // Allow exit animation to complete before calling onClose
      const exitTimer = setTimeout(() => {
        if (onClose) onClose();
        setIsExiting(false);
      }, 300); // Match transition duration
      
      return () => clearTimeout(exitTimer);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  // Map toast types to icons and styles
  const toastConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success/10',
      borderColor: 'border-success',
      textColor: 'text-success',
      iconColor: 'text-success',
      role: 'status',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-error/10',
      borderColor: 'border-error',
      textColor: 'text-error',
      iconColor: 'text-error',
      role: 'alert',
    },
    info: {
      icon: Info,
      bgColor: 'bg-info/10',
      borderColor: 'border-info',
      textColor: 'text-info',
      iconColor: 'text-info',
      role: 'status',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      iconColor: 'text-warning',
      role: 'alert',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, role } = toastConfig[type];

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 max-w-md
        flex items-center gap-3 p-4 rounded-lg shadow-lg
        border-l-4 ${borderColor} ${bgColor}
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
        animate-slide-up
      `}
      role={role}
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
    >
      <Icon className={`icon-md ${iconColor}`} aria-hidden="true" />
      
      <div className="flex-1">
        <p className={`${textColor} font-medium`}>{message}</p>
      </div>
      
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onClose) onClose();
            setIsExiting(false);
          }, 300);
        }}
        className={`
          p-1 rounded-full hover:bg-black/10
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          transition-colors
        `}
        aria-label="Close notification"
      >
        <X className="icon-sm" aria-hidden="true" />
      </button>
    </div>
  );
};

export { Toast };
