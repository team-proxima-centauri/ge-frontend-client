'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createGroupCart } from '@/lib/cart/cart';
import { useAuth } from '@/hooks/useAuth';

const CreateGroupCartPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/cart/create-group');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCreateGroupCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cart = await createGroupCart();
      
      if (cart.group_code) {
        setGroupCode(cart.group_code);
      }
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error creating group cart:', err);
      setError('Failed to create group cart. Please try again.');
      setLoading(false);
    }
  };

  const handleViewGroupCart = () => {
    router.push(`/cart/group/${groupCode}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-groceryease-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groceryease-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-groceryease-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/cart" className="text-groceryease-accent hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cart
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-groceryease-text font-heading mb-8">Create Group Cart</h1>
        
        <div className="bg-groceryease-card rounded-xl shadow-md p-8 max-w-md mx-auto">
          {success && groupCode ? (
            <div className="text-center">
              <div className="mb-4 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-groceryease-text mb-4">Group Cart Created!</h2>
              <p className="text-groceryease-textLight mb-2">Share this code with friends and family:</p>
              
              <div className="bg-peach-100 p-4 rounded-lg mb-6">
                <p className="text-2xl font-bold text-groceryease-accent tracking-wider">{groupCode}</p>
              </div>
              
              <p className="text-sm text-groceryease-textLight mb-6">
                They can use this code to join your group cart and shop together.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleViewGroupCart}
                  className="w-full bg-groceryease-button text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  View Group Cart
                </button>
                
                <Link 
                  href="/products" 
                  className="block w-full text-center border border-groceryease-accent text-groceryease-accent py-2 rounded-lg hover:bg-peach-100 transition-colors"
                >
                  Add Products
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-groceryease-textLight mb-6">
                Create a group cart to shop together with friends and family. Everyone can add items to the same cart.
              </p>
              
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              <button 
                onClick={handleCreateGroupCart}
                disabled={loading}
                className={`w-full bg-groceryease-button text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Group Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupCartPage;
