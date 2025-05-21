'use client';

import React, { useState } from 'react';
import { CartItem } from '@/services/api';
import { formatPrice, calculateTotal } from '@/utils/priceUtils';
import { ShoppingCart } from 'lucide-react';
import { Divider } from '@/components/Divider';
import Image from 'next/image';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onCheckout: () => void;
  isGroup?: boolean;
}

export const Cart: React.FC<CartProps> = ({
  cartItems,
  onUpdateQuantity,
  onCheckout,
  isGroup = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalAmount = formatPrice(calculateTotal(cartItems));
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-800 rounded-full transition-all duration-300 hover:bg-pink-100 relative"
        aria-label="Toggle Cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full ring-2 ring-white bg-pink-500 text-xs text-white text-center flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-pink-100">
          <div className="flex justify-between items-center p-4 bg-pink-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {isGroup ? 'Group Cart' : 'My Cart'}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-pink-100"
              aria-label="Close Cart"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <Divider />
          
          <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto"> 
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">Your cart is empty.</p>
                <p className="text-sm text-gray-400 text-center mt-1">Add some products to start shopping!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-2 border-b border-pink-100 pb-3">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded mr-3 flex-shrink-0 overflow-hidden">
                        {item.image_url && (
                          <Image 
                            src={item.image_url} 
                            alt={item.name} 
                            width={64} 
                            height={64} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">${formatPrice(item.price)}</p>
                        {isGroup && item.added_by && (
                          <p className="text-xs text-pink-600">Added by: {item.added_by}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))} 
                        className="px-2 py-1 border border-gray-300 rounded-l hover:bg-pink-50"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-t border-b border-gray-300 bg-white">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                        className="px-2 py-1 border border-gray-300 rounded-r hover:bg-pink-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="p-4 bg-pink-50 border-t border-pink-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">${totalAmount}</span>
              </div>
              <button 
                onClick={() => {
                  onCheckout();
                  setIsOpen(false);
                }}
                className="w-full py-3 px-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
