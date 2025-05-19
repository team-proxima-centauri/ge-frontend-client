'use client';

import { useState, useEffect } from 'react';
import { getToken, logout } from '@/lib/auth/auth';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Decode the JWT to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          logout();
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        setUser(payload);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return {
    isAuthenticated,
    loading,
    user,
    logout: handleLogout
  };
};
