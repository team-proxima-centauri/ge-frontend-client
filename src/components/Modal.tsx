'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FocusTrap } from './FocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOutsideClick?: boolean;
}

/**
 * Modal component - Accessible dialog component
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Size classes for modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Prevent scrolling of the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap isActive={isOpen} onEscapeKey={onClose}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
        onClick={handleBackdropClick}
        role="presentation"
        aria-hidden="true"
      >
        <div
          ref={modalRef}
          className={`
            bg-groceryease-surface rounded-lg shadow-xl 
            w-full ${sizeClasses[size]} 
            animate-slide-up
            relative overflow-hidden
            flex flex-col max-h-[90vh]
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-groceryease-border">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close modal"
            >
              <X className="icon-sm" aria-hidden="true" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export { Modal };
