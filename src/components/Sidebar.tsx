'use client';

import React from 'react';

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
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  isOpen,
  toggleSidebar,
  side = 'left',
  title,
}) => {
  const basePosition = side === 'left' ? 'left-0' : 'right-0';
  const opacityClass = isOpen ? 'opacity-100' : 'opacity-0';

  // Add overlay when sidebar is open
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${basePosition} w-[80%] max-w-[20rem] h-full bg-choco-sidebar transition-all duration-300 shadow-sidebar ${opacityClass} z-50 flex flex-col`}
        style={{ transform: `translateX(${isOpen ? '0' : side === 'left' ? '-100%' : '100%'})` }}
      >
        {title && (
          <div className="p-4 border-b border-choco-selected/30">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <SidebarContent>{children}</SidebarContent>
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
