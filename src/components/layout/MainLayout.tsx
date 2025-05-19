'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { isAuthenticated } from '@/lib/auth/auth';
import { usePathname } from 'next/navigation';
import { useClientOnly } from '@/utils/clientUtils';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isMounted = useClientOnly();
  
  // Only check authentication on the client side
  const isAuth = isMounted ? isAuthenticated() : false;
  
  // Check if the current path is an auth page (login or register)
  const isAuthPage = pathname?.startsWith('/(auth)') || pathname === '/login' || pathname === '/register';
  
  // Don't show sidebar on auth pages or if user is not authenticated
  const showSidebar = !isAuthPage && isAuth;

  // Use a simpler, static layout during server-side rendering
  if (!isMounted) {
    return (
      <div className='bg-groceryease-background min-h-screen'>
        <main>
          <div className='p-4 sm:p-6 max-w-7xl mx-auto'>
            {children}
          </div>
        </main>
      </div>
    );
  }
  
  // Use the full dynamic layout on the client
  return (
    <div className='bg-groceryease-background min-h-screen'>
      {showSidebar && <Sidebar />}
      
      <main className={`transition-all duration-300 ${showSidebar ? 'md:ml-64' : ''}`}>
        <div className='p-4 sm:p-6 max-w-7xl mx-auto'>
          {children}
        </div>
      </main>
    </div>
  );
}
