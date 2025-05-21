'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CartItem } from '@/services/api';
import { formatPrice, calculateTotal } from '@/utils/priceUtils';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
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
  const cartRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key to close cart
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);
  
  // Focus trap for cart panel
  useEffect(() => {
    if (isOpen && cartRef.current) {
      // Focus the cart when it opens
      setTimeout(() => {
        const closeButton = cartRef.current?.querySelector('button[aria-label="Close Cart"]') as HTMLElement;
        if (closeButton) closeButton.focus();
      }, 100);
    }
  }, [isOpen]);

  const totalAmount = formatPrice(calculateTotal(cartItems));
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-primary-dark rounded-full transition-all duration-300 hover:bg-secondary-light relative focus-ring"
        aria-label={`${isOpen ? 'Close' : 'Open'} shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ''}`}
        aria-expanded={isOpen}
        aria-controls="shopping-cart-panel"
      >
        <ShoppingCart className="icon-md" aria-hidden="true" />
        {itemCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 block h-5 w-5 rounded-full ring-2 ring-white bg-primary text-xs text-white text-center flex items-center justify-center"
            aria-hidden="true"
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div 
          id="shopping-cart-panel"
          ref={cartRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-groceryease-bg rounded-lg shadow-lg z-50 overflow-hidden border border-groceryease-border"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-heading"
        >
          <div className="flex justify-between items-center p-4 bg-groceryease-bg border-b border-groceryease-border">
            <h2 id="cart-heading" className="text-lg font-semibold text-primary">
              {isGroup ? 'Group Cart' : 'Your Cart'}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-accent-ivory focus-ring"
              aria-label="Close Cart"
            >
              <X className="icon-sm" aria-hidden="true" />
            </button>
          </div>
          
          <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto"> 
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                <ShoppingCart className="icon-xl text-gray-300 mb-3" aria-hidden="true" />
                <p className="text-gray-500 text-center">Your cart is empty.</p>
                <p className="text-sm text-gray-400 text-center mt-1">Add some products to start shopping!</p>
              </div>
            ) : (
              <ul className="space-y-3" aria-label="Cart items list">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-2 border-b border-groceryease-border pb-3 animate-fade-in">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded mr-3 flex-shrink-0 overflow-hidden">
                        {item.image_url && (
                          <Image 
                            src={item.image_url} 
                            alt="" 
                            width={64} 
                            height={64} 
                            className="w-full h-full object-cover" 
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600" aria-label={`Price: ${formatPrice(item.price)} dollars`}>
                          ${formatPrice(item.price)}
                        </p>
                        {isGroup && item.added_by && (
                          <p className="text-xs text-primary">Added by: {item.added_by}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center" role="group" aria-label={`Quantity controls for ${item.name}`}>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))} 
                        className="px-2 py-1 border border-groceryease-border rounded-l hover:bg-secondary focus-ring"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="icon-xs" aria-hidden="true" />
                      </button>
                      <span 
                        className="px-3 py-1 border-t border-b border-groceryease-border bg-accent-ivory"
                        aria-label={`Current quantity: ${item.quantity}`}
                        aria-live="polite"
                      >
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                        className="px-2 py-1 border border-groceryease-border rounded-r hover:bg-secondary focus-ring"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="icon-xs" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="p-4 bg-secondary border-t border-groceryease-border animate-fade-in">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900" aria-live="polite" aria-atomic="true">
                  ${totalAmount}
                </span>
              </div>
              <button 
                onClick={() => {
                  onCheckout();
                  setIsOpen(false);
                }}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark focus-ring transition-all duration-300"
                aria-label={`Proceed to checkout with ${itemCount} items for $${totalAmount}`}
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
