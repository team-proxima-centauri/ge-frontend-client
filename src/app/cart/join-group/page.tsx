'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { joinGroupCart } from '@/lib/cart/cart'; // Assuming this function exists and is correctly typed
// Note: To use toast notifications, install the package with:
// npm install react-hot-toast

// Using Record type for an empty props interface
type JoinGroupCartPageProps = Record<string, never>;

const JoinGroupCartPage: React.FC<JoinGroupCartPageProps> = () => {
  const [groupCode, setGroupCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only alphanumeric characters and limit to 6 characters
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setGroupCode(sanitizedValue.toUpperCase());
    if (error) {
      setError(null); // Clear error when user types
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (groupCode.length !== 6) {
      setError('Please enter a valid 6-character group code.');
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to join a group cart.');
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const cart = await joinGroupCart(groupCode);

      if (cart && cart.id) {
        alert('Successfully joined group cart!');
        router.push(`/cart/group/${cart.group_code}`);
      } else {
        setError('Failed to join group cart. The code might be invalid or expired.');
        alert('Failed to join group cart.');
      }
    } catch (err: unknown) {
      console.error('Error joining group cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      // alert instead of toast until package is installed
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <p className='text-lg text-gray-700'>Loading authentication status...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the useEffect redirect, but it's a fallback.
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <p className='text-lg text-red-600'>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8'>
      <div className='bg-white shadow-2xl rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-md transform transition-all hover:scale-105 duration-300'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-800'>Join Group Cart</h1>
          <p className='text-gray-600 mt-2'>Enter the 6-character code to join an existing group cart.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='groupCode' className='block text-sm font-medium text-gray-700 mb-1'>
              Group Code
            </label>
            <input
              type='text'
              id='groupCode'
              name='groupCode'
              value={groupCode}
              onChange={handleInputChange}
              placeholder='ABCXYZ'
              maxLength={6}
              className='mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg tracking-widest text-center font-mono uppercase'
              aria-describedby='group-code-description'
              required
            />
            <p id='group-code-description' className='mt-2 text-xs text-gray-500'>
              The code is 6 characters long and case-insensitive.
            </p>
          </div>

          {error && (
            <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md' role='alert'>
              <p className='font-semibold'>Error</p>
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={isLoading || groupCode.length !== 6}
              className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out'
            >
              {isLoading ? (
                <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              ) : (
                'Join Cart'
              )}
            </button>
          </div>
        </form>

        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-600'>
            Don&apos;t have a code?{' '}
            <Link href='/cart/create-group' className='font-medium text-teal-600 hover:text-teal-500'>
              Create a new group cart
            </Link>
          </p>
        </div>

        <div className='mt-6 pt-6 border-t border-gray-200 text-center'>
           <Link href='/cart' className='text-sm text-gray-600 hover:text-gray-900 hover:underline'>
            &larr; Back to Your Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupCartPage;
