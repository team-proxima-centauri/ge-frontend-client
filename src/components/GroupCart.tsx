'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Users, Plus, Copy, Check } from 'lucide-react';
import { Divider } from '@/components/Divider';
import { CartItem, User } from '@/services/api';

interface GroupCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onCheckout: () => void;
  groupCode?: string;
  groupMembers?: User[];
  onCreateGroup?: () => void;
  onJoinGroup?: (code: string) => void;
  currentUser: User | null;
}

export const GroupCart: React.FC<GroupCartProps> = ({
  cartItems,
  onUpdateQuantity,
  onCheckout,
  groupCode,
  groupMembers = [],
  onCreateGroup,
  onJoinGroup,
  currentUser
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const copyCodeToClipboard = () => {
    if (groupCode) {
      navigator.clipboard.writeText(groupCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Group Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-800 rounded-full transition-all duration-300 hover:bg-pink-100 relative"
        aria-label="Toggle Group Cart"
      >
        <Users className="h-6 w-6" />
        {groupCode && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full ring-2 ring-white bg-pink-500 text-xs text-white text-center flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Group Cart Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-pink-100">
          <div className="flex justify-between items-center p-4 bg-pink-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Group Shopping
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-pink-100"
              aria-label="Close Group Cart"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <Divider />
          
          {!groupCode ? (
            // User is not in a group
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Join a group</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter group code"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                    maxLength={6}
                  />
                  <button
                    onClick={() => onJoinGroup && onJoinGroup(joinCode)}
                    disabled={joinCode.length < 6}
                    className="bg-pink-500 text-white p-2 rounded disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
              
              <Divider />
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Create a new group</h3>
                <button
                  onClick={onCreateGroup}
                  className="w-full flex items-center justify-center gap-2 bg-pink-100 text-pink-800 p-3 rounded-lg hover:bg-pink-200 transition-colors"
                >
                  <Plus size={18} />
                  <span>Create Group Cart</span>
                </button>
              </div>
            </div>
          ) : (
            // User is in a group
            <>
              <div className="p-4 bg-pink-50 border-b border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">Group Code:</h3>
                    <p className="text-2xl font-bold tracking-wider text-pink-800">{groupCode}</p>
                  </div>
                  <button
                    onClick={copyCodeToClipboard}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Copy code"
                  >
                    {codeCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Share this code with friends to shop together</p>
              </div>
              
              <div className="p-3 border-b border-pink-100">
                <h3 className="font-medium text-gray-700 mb-2">Group Members ({groupMembers.length}):</h3>
                <div className="max-h-24 overflow-y-auto">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center py-1">
                      <div className="w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center text-xs text-pink-800 mr-2">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-800">
                        {member.name}
                        {member.id === currentUser?.id && ' (You)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-center">The group cart is empty.</p>
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
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                            {item.added_by && (
                              <p className="text-xs text-pink-600">
                                Added by: {item.added_by === currentUser?.id ? 'You' : 
                                  groupMembers.find(m => m.id === item.added_by)?.name || 'Unknown'}
                              </p>
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
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="font-semibold text-gray-900">${totalAmount}</span>
                  </div>
                  <button 
                    onClick={() => {
                      onCheckout();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 px-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                  >
                    Checkout as Group
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
