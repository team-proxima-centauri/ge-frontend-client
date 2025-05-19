'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getGroupCart, removeFromCart, updateCartItemQuantity, leaveGroupCart } from '@/lib/cart/cart';
import { useAuth } from '@/hooks/useAuth';

interface GroupCartPageProps {
  params: Promise<{
    code: string;
  }>;
}

interface CartItemProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  stock_quantity: number;
  image_url: string;
}

interface CartItem {
  id: string;
  product_id: string;
  cart_id: string;
  quantity: number;
  added_by: string;
  created_at: string;
  product: CartItemProduct;
  added_by_user?: {
    name: string;
  };
}

interface GroupCartMember {
  user_id: string;
  role: string;
  name: string;
}

interface GroupCart {
  id: string;
  owner_id: string;
  is_group: boolean;
  group_code: string;
  status: string;
  created_at: string;
  items: CartItem[];
  members: GroupCartMember[];
  total: number;
}

const GroupCartPage = ({ params }: GroupCartPageProps) => {
  const { code } = React.use(params);
  const [cart, setCart] = useState<GroupCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const fetchGroupCart = useCallback(async () => {
    if (!code) return; 
    try {
      setLoading(true);
      const groupCartData = await getGroupCart(code);
      const typedCart = groupCartData as unknown as GroupCart;
      setCart(typedCart);

      const quantities: { [key: string]: number } = {};
      if (typedCart.items) {
        typedCart.items.forEach(item => {
          quantities[item.id] = item.quantity;
        });
      }
      setItemQuantities(quantities);

      if (user && typedCart.owner_id === user.id) {
        setIsOwner(true);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching group cart:', err);
      setError('Failed to load group cart. Please check the code and try again.');
      setLoading(false);
    }
  }, [code, user]); 

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/cart/group/${code}`);
      return;
    }

    if (isAuthenticated && !authLoading) {
      fetchGroupCart();
    }
  }, [isAuthenticated, authLoading, code, router, fetchGroupCart]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return; 
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  };

  const handleUpdateQuantity = async (itemId: string) => {
    try {
      const newQuantity = itemQuantities[itemId];
      await updateCartItemQuantity(itemId, newQuantity);
      if (cart) {
        const updatedItems = cart.items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        const newTotal = updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        setCart({ ...cart, items: updatedItems, total: newTotal });
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      fetchGroupCart(); 
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      if (cart) {
        const updatedItems = cart.items.filter(item => item.id !== itemId);
        const newTotal = updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        setCart({ ...cart, items: updatedItems, total: newTotal });
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group cart?')) {
      try {
        await leaveGroupCart(code); 
        router.push('/cart');
      } catch (err) {
        console.error('Error leaving group cart:', err);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className='min-h-screen bg-groceryease-background flex justify-center items-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groceryease-accent'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-groceryease-background p-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow-md p-6 text-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-16 w-16 text-red-500 mx-auto mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <h2 className='text-2xl font-bold text-groceryease-text mb-2'>Error</h2>
            <p className='text-groceryease-textLight mb-6'>{error}</p>
            <Link href='/cart' className='inline-block bg-groceryease-button text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors'>
              Return to My Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className='min-h-screen bg-groceryease-background p-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow-md p-6 text-center'>
            <h2 className='text-2xl font-bold text-groceryease-text mb-2'>Group Cart Not Found</h2>
            <p className='text-groceryease-textLight mb-6'>The group cart you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Link href='/cart' className='inline-block bg-groceryease-button text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors'>
              Return to My Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-groceryease-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6 flex justify-between items-center'>
          <Link href='/cart' className='text-groceryease-accent hover:underline flex items-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            Back to My Cart
          </Link>
          <div className='flex items-center'>
            <span className='text-groceryease-textLight mr-2'>Group Code:</span>
            <span className='font-mono font-bold text-groceryease-accent'>{cart.group_code}</span>
          </div>
        </div>
        <h1 className='text-3xl font-bold text-groceryease-text font-heading mb-2'>Group Cart</h1>
        <p className='text-groceryease-textLight mb-8'>Shopping together with friends and family</p>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart items */}
          <div className='lg:col-span-2'>
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden'>
              <div className='p-6 border-b border-gray-200'>
                <h2 className='text-xl font-semibold text-groceryease-text'>Items ({cart.items.length})</h2>
              </div>
              {cart.items.length === 0 ? (
                <div className='p-6 text-center'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-16 w-16 text-gray-400 mx-auto mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                  </svg>
                  <h3 className='text-lg font-medium text-groceryease-text mb-2'>Your group cart is empty</h3>
                  <p className='text-groceryease-textLight mb-4'>Start adding products to your group cart</p>
                  <Link href='/products' className='inline-block bg-groceryease-button text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors'>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <ul className='divide-y divide-gray-200'>
                  {cart.items.map(item => (
                    <li key={item.id} className='p-4 sm:p-6 hover:bg-gray-50'>
                      <div className='flex flex-col sm:flex-row'>
                        <div className='flex-shrink-0 h-24 w-24 bg-gray-200 rounded-md overflow-hidden'>
                          {item.product.image_url ? (
                            <Image src={item.product.image_url} alt={item.product.name} width={96} height={96} className='h-full w-full object-cover' />
                          ) : (
                            <div className='h-full w-full flex items-center justify-center bg-gray-200'>
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className='flex-1 sm:ml-6 mt-4 sm:mt-0'>
                          <div className='flex justify-between'>
                            <div>
                              <h3 className='text-lg font-medium text-groceryease-text'>{item.product.name}</h3>
                              <p className='mt-1 text-sm text-groceryease-textLight'>{item.product.unit}</p>
                              {item.added_by_user && (
                                <p className='mt-1 text-xs text-groceryease-textLight'>Added by: {item.added_by_user.name}</p>
                              )}
                            </div>
                            <p className='text-lg font-medium text-groceryease-text'>${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <div className='mt-4 flex justify-between items-center'>
                            <div className='flex items-center border border-gray-300 rounded-md'>
                              <button type='button' className='p-2 text-groceryease-textLight hover:text-groceryease-text' onClick={() => handleQuantityChange(item.id, Math.max(1, itemQuantities[item.id] - 1))}>
                                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
                                </svg>
                              </button>
                              <input
                                type='number'
                                min='1'
                                value={itemQuantities[item.id] || 1} 
                                onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className='w-12 text-center border-0 focus:ring-0'
                              />
                              <button type='button' className='p-2 text-groceryease-textLight hover:text-groceryease-text' onClick={() => handleQuantityChange(item.id, (itemQuantities[item.id] || 0) + 1)}>
                                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                                </svg>
                              </button>
                            </div>
                            <div className='flex space-x-2'>
                              {itemQuantities[item.id] !== item.quantity && (
                                <button type='button' onClick={() => handleUpdateQuantity(item.id)} className='text-groceryease-accent hover:text-groceryease-text'>Update</button>
                              )}
                              <button type='button' onClick={() => handleRemoveItem(item.id)} className='text-red-500 hover:text-red-700'>Remove</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {/* Summary and Checkout */}
              {cart.items.length > 0 && (
                <div className='p-6 bg-gray-50'>
                  <div className='flex justify-between text-base font-medium text-groceryease-text'>
                    <p>Subtotal</p>
                    <p>${cart.total.toFixed(2)}</p>
                  </div>
                  <p className='mt-0.5 text-sm text-groceryease-textLight'>Shipping and taxes calculated at checkout.</p>
                  <div className='mt-6'>
                    <Link href='/checkout' className='w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-groceryease-button hover:bg-opacity-90'>
                      Checkout
                    </Link>
                  </div>
                  <div className='mt-6 flex justify-center text-sm text-center text-groceryease-textLight'>
                    <p>
                      or{' '}
                      <Link href='/products' className='text-groceryease-accent font-medium hover:text-groceryease-text'>
                        Continue Shopping<span aria-hidden='true'> &rarr;</span>
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Group members and info */}
          <div>
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden mb-6'>
              <div className='p-6 border-b border-gray-200'>
                <h2 className='text-xl font-semibold text-groceryease-text'>Group Members</h2>
              </div>
              <ul className='divide-y divide-gray-200'>
                {cart.members.map(member => (
                  <li key={member.user_id} className='p-4 flex justify-between items-center'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 rounded-full bg-groceryease-accent flex items-center justify-center text-white font-medium'>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm font-medium text-groceryease-text'>{member.name}</p>
                        <p className='text-xs text-groceryease-textLight capitalize'>{member.role}</p>
                      </div>
                    </div>
                    {member.user_id === cart.owner_id && (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>Owner</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className='p-4 bg-gray-50'>
                <button onClick={() => { navigator.clipboard.writeText(cart.group_code); alert('Group code copied to clipboard!'); }} className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-groceryease-text bg-white hover:bg-gray-50'>
                  Copy Invite Code
                </button>
              </div>
            </div>
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden'>
              <div className='p-6'>
                <h2 className='text-xl font-semibold text-groceryease-text mb-4'>Group Actions</h2>
                <div className='space-y-3'>
                  <Link href='/products' className='w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-groceryease-button hover:bg-opacity-90'>
                    Add More Products
                  </Link>
                  {!isOwner && (
                    <button onClick={handleLeaveGroup} className='w-full flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50'>
                      Leave Group Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCartPage;
