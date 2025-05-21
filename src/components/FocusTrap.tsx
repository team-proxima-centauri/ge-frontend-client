'use client';

import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscapeKey?: () => void;
}

/**
 * FocusTrap component - Traps focus within a component when active
 * Useful for modals, dialogs, and other overlays
 */
const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  isActive,
  onEscapeKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the container
      if (containerRef.current) {
        // Find the first focusable element and focus it
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          // If no focusable elements, make the container itself focusable
          containerRef.current.tabIndex = -1;
          containerRef.current.focus();
        }
      }
    }

    return () => {
      // Restore focus when component unmounts or becomes inactive
      if (isActive && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && onEscapeKey) {
        onEscapeKey();
        return;
      }

      // Handle Tab key to trap focus
      if (event.key === 'Tab') {
        const focusableElements = containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // Shift + Tab on first element should go to last element
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } 
        // Tab on last element should go to first element
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscapeKey]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export { FocusTrap };
