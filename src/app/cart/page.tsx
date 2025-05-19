'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCart, updateCartItem, removeFromCart, Cart } from '@/lib/cart/cart';
import { useAuth } from '@/hooks/useAuth';

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        const cartData = await getCart();
        setCart(cartData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load your cart. Please try again later.');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, authLoading, router]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setProcessingItem(itemId);
      await updateCartItem(itemId, newQuantity);
      
      // Update local state
      if (cart && cart.items) {
        const updatedItems = cart.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        
        // Recalculate total
        const newTotal = updatedItems.reduce((sum, item) => {
          return sum + (parseFloat(item.price?.toString() || '0') * item.quantity);
        }, 0);
        
        setCart({
          ...cart,
          items: updatedItems,
          total: newTotal
        });
      }
      
      setProcessingItem(null);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setProcessingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setProcessingItem(itemId);
      await removeFromCart(itemId);
      
      // Update local state
      if (cart && cart.items) {
        const updatedItems = cart.items.filter(item => item.id !== itemId);
        
        // Recalculate total
        const newTotal = updatedItems.reduce((sum, item) => {
          return sum + (parseFloat(item.price?.toString() || '0') * item.quantity);
        }, 0);
        
        setCart({
          ...cart,
          items: updatedItems,
          total: newTotal
        });
      }
      
      setProcessingItem(null);
    } catch (err) {
      console.error('Error removing item:', err);
      setProcessingItem(null);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-groceryease-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groceryease-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-groceryease-background flex justify-center items-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-groceryease-button text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-groceryease-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-groceryease-text mb-8">Your Shopping Cart</h1>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-groceryease-card rounded-xl shadow-md p-8 text-center">
            <div className="mb-4">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-16 w-16 mx-auto text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-groceryease-text mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start adding some products to your cart!</p>
            <Link href="/products" className="bg-groceryease-button text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-groceryease-card rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-groceryease-text">Cart Items ({cart.items.length})</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 bg-white rounded-md overflow-hidden flex-shrink-0 mr-4 mb-4 sm:mb-0">
                        <Image
                          src={item.image_url || '/images/product-placeholder.svg'}
                          alt={item.name || 'Product'}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="p-2"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-groceryease-text">{item.name}</h3>
                        <p className="text-sm text-groceryease-textLight">
                          ₱{parseFloat(item.price?.toString() || '0').toFixed(2)} / {item.unit}
                        </p>
                        
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center">
                            <button 
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={processingItem === item.id || item.quantity <= 1}
                            >
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
                              </svg>
                            </button>
                            
                            <span className="mx-3 w-8 text-center">{item.quantity}</span>
                            
                            <button 
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={processingItem === item.id}
                            >
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Subtotal and Remove */}
                          <div className="mt-2 sm:mt-0 flex items-center">
                            <span className="font-medium text-groceryease-text mr-4">
                              ₱{(parseFloat(item.price?.toString() || '0') * item.quantity).toFixed(2)}
                            </span>
                            
                            <button 
                              className="text-red-500 hover:text-red-700 transition-colors"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={processingItem === item.id}
                            >
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-groceryease-card rounded-xl shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-groceryease-text mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-groceryease-textLight">Subtotal</span>
                    <span className="text-groceryease-text">₱{cart.total?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-groceryease-textLight">Delivery Fee</span>
                    <span className="text-groceryease-text">₱50.00</span> {/* Assuming a fixed delivery fee */}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-groceryease-text">Total</span>
                      <span className="text-groceryease-text">₱{(cart.total ? cart.total + 50 : 50).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="w-full bg-groceryease-button text-white py-3 rounded-lg mt-6 hover:bg-opacity-90 transition-colors"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                
                <div className="mt-4">
                  <Link href="/products" className="text-groceryease-accent hover:underline flex items-center justify-center">
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
                
                {/* Group Cart Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-groceryease-text mb-3">Group Shopping</h3>
                  <p className="text-sm text-groceryease-textLight mb-4">
                    Create a group cart to shop with friends and family, or join an existing group.
                  </p>
                  
                  <div className="space-y-3">
                    <Link 
                      href="/cart/create-group" 
                      className="block w-full text-center bg-peach-200 text-groceryease-text py-2 rounded-lg hover:bg-peach-300 transition-colors"
                    >
                      Create Group Cart
                    </Link>
                    
                    <Link 
                      href="/cart/join-group" 
                      className="block w-full text-center border border-groceryease-accent text-groceryease-accent py-2 rounded-lg hover:bg-peach-100 transition-colors"
                    >
                      Join Group Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
