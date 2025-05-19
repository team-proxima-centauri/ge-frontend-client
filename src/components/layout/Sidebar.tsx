'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth/auth';
import { useClientOnly } from '@/utils/clientUtils';

// Create a client-only sidebar wrapper to prevent hydration errors
export default function Sidebar() {
  const isMounted = useClientOnly();
  
  // Only render the actual sidebar content on the client
  if (!isMounted) {
    // Return a static, empty placeholder during SSR that won't cause hydration issues
    return null;
  }
  
  // Only render the real sidebar after client-side hydration
  return <SidebarContent />;
}

// The actual sidebar content - only rendered on the client
function SidebarContent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const user = getCurrentUser();
  const [activeGroupCartCode, setActiveGroupCartCode] = useState<string | null>(null);
  const [isLoadingGroupCode, setIsLoadingGroupCode] = useState<boolean>(true);

  useEffect(() => {
    const fetchActiveGroupCode = async () => {
      if (!user || !user.id) {
        setIsLoadingGroupCode(false);
        setActiveGroupCartCode(null);
        return;
      }

      setIsLoadingGroupCode(true);
      try {
        const token = localStorage.getItem('token'); // Assuming 'token' is the key

        if (!token) {
          console.warn('Auth token not found in localStorage.');
          setActiveGroupCartCode(null);
          setIsLoadingGroupCode(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/carts/my-active-group-code`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch active group code: ${response.status} ${errorText}`);
          setActiveGroupCartCode(null);
        } else {
          const result = await response.json();
          if (result.success && result.data) {
            setActiveGroupCartCode(result.data.groupCode);
          } else {
            console.warn('API call for group code successful but no groupCode in data or success false.', result);
            setActiveGroupCartCode(null);
          }
        }
      } catch (error) {
        console.error('Error fetching active group code:', error);
        setActiveGroupCartCode(null);
      } finally {
        setIsLoadingGroupCode(false);
      }
    };

    fetchActiveGroupCode();
  }, [user]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Products', path: '/products', icon: 'shopping' },
    { name: 'Cart', path: '/cart', icon: 'cart' },
    { name: 'Group Order', path: '/cart/create-group', icon: 'users' }, // Default path
    { name: 'Club Member', path: '/club-member', icon: 'star' },
    { name: 'About', path: '/about', icon: 'info' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className='md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md'
        onClick={toggleSidebar}
        aria-label='Toggle menu'
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-groceryease-text' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen bg-groceryease-card transition-transform duration-300 ease-in-out w-64 shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className='flex flex-col h-full p-4'>
          {/* User profile */}
          <div className='flex items-center mb-6 p-2 bg-peach-100 rounded-lg'>
            <div className='flex-shrink-0'>
              <div className='w-10 h-10 rounded-full bg-peach-300 flex items-center justify-center text-white font-medium'>
                {user?.name?.charAt(0) || 'G'}
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-groceryease-text'>
                {user?.name || 'Guest User'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 space-y-2'>
            {menuItems.map((item) => {
              let href = item.path;
              let isActive;

              if (item.name === 'Group Order') {
                if (isLoadingGroupCode) {
                  // While loading, can point to default or '#'. Using default to avoid dead link.
                  href = item.path; 
                } else if (activeGroupCartCode) {
                  href = `/cart/group/${activeGroupCartCode}`;
                } else {
                  href = item.path; // Default to create-group if no active code
                }

                // Determine active state for Group Order link
                if (activeGroupCartCode) {
                  isActive = pathname === `/cart/group/${activeGroupCartCode}`;
                } else {
                  isActive = pathname === item.path; // item.path is /cart/create-group
                }
              } else {
                isActive = pathname === item.path;
              }

              return (
                <Link
                  key={item.name} // Assuming item.name is unique and stable
                  href={href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-peach-200 text-groceryease-text'
                      : 'text-groceryease-textLight hover:bg-peach-100'
                  }`}
                  {...(item.name === 'Group Order' && isLoadingGroupCode && href === '#' ? { 'aria-disabled': true, onClick: (e: React.MouseEvent) => e.preventDefault() } : {})}
                >
                  <SidebarIcon name={item.icon} />
                  <span className='ml-3'>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className='pt-4 mt-auto border-t border-peach-200'>
            <button
              onClick={handleLogout}
              className='flex items-center w-full p-3 rounded-lg text-groceryease-textLight hover:bg-peach-100 transition-colors'
            >
              <SidebarIcon name='logout' />
              <span className='ml-3'>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Helper component for sidebar icons
function SidebarIcon({ name }: { name: string }) {
  switch (name) {
    case 'home':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
        </svg>
      );
    case 'shopping':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
        </svg>
      );
    case 'cart':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
        </svg>
      );
    case 'users':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
        </svg>
      );
    case 'star':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
        </svg>
      );
    case 'info':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      );
    case 'logout':
      return (
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
        </svg>
      );
    default:
      return null;
  }
}
