'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/services/api';

interface ProductCardProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleInternalAddToCart = () => {
    onAddToCart(quantity);
    setIsSelected(false);
    setQuantity(1);
  };

  // Format unit display
  const formatUnit = (unit: string) => {
    if (!unit) return '';
    return `per ${unit}`;
  };

  return (
    <div className="group relative">
      <div 
        className={`flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full ${isSelected ? 'ring-2 ring-choco-greenbtn z-20' : ''}`}
        onClick={() => !isSelected && setIsSelected(true)}
      >
        {/* Product Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100"> 
          {product.image_url ? (
            <Image 
              src={product.image_url} 
              alt={product.name} 
              width={300}
              height={300}
              style={{ objectFit: 'cover' }}
              className="w-full h-full transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className='text-sm text-gray-500'>No Image</span>
            </div>
          )}
          
          {/* Quick add button (visible on hover when not selected) */}
          {!isSelected && (
            <button 
              className="absolute bottom-2 right-2 bg-choco-greenbtn text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(1);
              }}
              aria-label="Quick add to cart"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col p-3 flex-grow">
          <h3 className="font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]" title={product.name}>
            {product.name}
          </h3>
          
          <div className="mt-1 flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{formatUnit(product.unit)}</p>
            </div>
            
            {!isSelected && (
              <button 
                className="text-choco-greenbtn hover:text-green-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelected(true);
                }}
                aria-label="Show options"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Expanded Selection Options */}
        {isSelected && (
          <div 
            className="p-3 pt-0 border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 mb-2">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors" 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="font-medium text-gray-800">{quantity}</span>
              
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setQuantity(prev => prev + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setIsSelected(false)}
              >
                Cancel
              </button>
              
              <button 
                className="flex-1 py-2 rounded-lg bg-choco-greenbtn text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                onClick={handleInternalAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ProductCard };
