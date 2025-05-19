'use client';

import { useState, useEffect } from 'react';

/**
 * Utility functions for client-side only code
 * These help prevent hydration errors when using browser APIs
 */

/**
 * Safely access localStorage with SSR support
 * @returns An object with get, set, and remove methods that safely access localStorage
 */
export const safeLocalStorage = {
  /**
   * Get an item from localStorage
   * @param key The key to get
   * @returns The value or null if not found or in SSR
   */
  get: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  },

  /**
   * Set an item in localStorage
   * @param key The key to set
   * @param value The value to set
   */
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(key, value);
  },

  /**
   * Remove an item from localStorage
   * @param key The key to remove
   */
  remove: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(key);
  }
};

/**
 * Check if code is running on the client
 * @returns true if running in browser, false if SSR
 */
export const isClient = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Safely redirect to a URL
 * @param url The URL to redirect to
 */
export const safeRedirect = (url: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.href = url;
};

/**
 * Hook to handle client-side only code
 * @returns true if component is mounted on client
 */
export const useClientOnly = (): boolean => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  return isMounted;
};
