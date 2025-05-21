'use client';

import React, { useEffect, useRef } from 'react';

// Props for SidebarContent
interface SidebarContentProps {
  children: React.ReactNode;
}

// Reusable scrollable content area
const SidebarContent: React.FC<SidebarContentProps> = ({ children }) => {
  return <div className="p-4 h-full overflow-y-auto">{children}</div>;
};

// Props for Sidebar
interface SidebarProps {
  children?: React.ReactNode;
  isOpen: boolean;
  toggleSidebar: () => void;
  side?: 'left' | 'right';
  title?: string;
  'aria-label'?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  isOpen,
  toggleSidebar,
  side = 'left',
  title,
  'aria-label': ariaLabel,
}) => {
  const basePosition = side === 'left' ? 'left-0' : 'right-0';
  const opacityClass = isOpen ? 'opacity-100' : 'opacity-0';
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Focus the sidebar when it opens
      sidebarRef.current.focus();
      
      // Trap focus inside the sidebar when it's open
      const focusableElements = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // Handle tab key navigation
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        };
        
        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
      }
    }
  }, [isOpen]);

  // Add overlay when sidebar is open
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 animate-fade-in"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 ${basePosition} w-[80%] max-w-[20rem] h-full bg-secondary transition-all duration-300 shadow-md ${opacityClass} z-50 flex flex-col`}
        style={{ transform: `translateX(${isOpen ? '0' : side === 'left' ? '-100%' : '100%'})` }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || (side === 'left' ? 'Navigation sidebar' : 'Filter sidebar')}
        tabIndex={-1}
      >
        {title && (
          <div className="p-4 border-b border-groceryease-border">
            <h2 className="text-xl font-semibold" id="sidebar-title">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto" aria-labelledby={title ? 'sidebar-title' : undefined}>
          <SidebarContent>{children}</SidebarContent>
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
