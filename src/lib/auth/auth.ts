/**
 * Authentication service for the Groceryease grocery delivery app
 * Handles JWT authentication with localStorage persistence
 */

import { safeLocalStorage, isClient, safeRedirect } from '@/utils/clientUtils';

// API URL from environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with auth response
 */
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data: AuthResponse = await response.json();
    
    if (data.success && data.data) {
      // Store token in localStorage for persistence
      safeLocalStorage.set('token', data.data.token);
      
      // Store user data in localStorage
      safeLocalStorage.set('user', JSON.stringify(data.data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Failed to register. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Login a user
 * @param email User email
 * @param password User password
 * @returns Promise with auth response
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();
    
    if (data.success && data.data) {
      // Store token in localStorage for persistence
      safeLocalStorage.set('token', data.data.token);
      
      // Store user data in localStorage
      safeLocalStorage.set('user', JSON.stringify(data.data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Failed to login. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Logout a user
 */
export const logout = (): void => {
  // Remove token from localStorage
  safeLocalStorage.remove('token');
  
  // Remove user data from localStorage
  safeLocalStorage.remove('user');
  
  // Redirect to login page
  safeRedirect('/login');
};

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  if (!isClient()) {
    return null; // Return null during SSR
  }
  
  const userJson = safeLocalStorage.get('user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Get the authentication token
 * @returns Token string or null if not authenticated
 */
export const getToken = (): string | null => {
  if (!isClient()) {
    return null; // Return null during SSR
  }
  
  return safeLocalStorage.get('token');
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating authentication status
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Return false during SSR
  }
  
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    // Decode the JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token is expired, clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get user profile
 * @returns Promise with user data
 */
export const getProfile = async (): Promise<User | null> => {
  try {
    const token = getToken();
    
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: AuthResponse = await response.json();
    
    if (data.success && data.data) {
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

/**
 * Validate token
 * @returns Promise with boolean indicating token validity
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = getToken();
    
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${API_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data: AuthResponse = await response.json();
    
    if (data.success && data.data) {
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return true;
    }
    
    // Token is invalid, logout user
    logout();
    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    // Token validation failed, logout user
    logout();
    return false;
  }
};
