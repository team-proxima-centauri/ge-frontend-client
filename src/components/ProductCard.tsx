'use client';

import { useState, useRef } from 'react';
import { ShoppingCart, Plus, Info } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/services/api';

interface ProductCardProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isSelected, setIsSelected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);


  // Format unit display
  const formatUnit = (unit: string) => {
    if (!unit) return '';
    return `per ${unit}`;
  };
  
  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsSelected(!isSelected);
    } else if (e.key === 'Escape' && isSelected) {
      setIsSelected(false);
    }
  };
  
  // Handle quick add with keyboard
  const handleQuickAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAddToCart(1);
    }
  };

  return (
      <div 
        ref={cardRef}
        className={`
          my-auto flex flex-col bg-groceryease-surface rounded-xl overflow-hidden shadow-sm 
          transition-all duration-300 
          md:w-full desktop:hover:scale-[1.02] desktop:focus-within:scale-[1.02]
          w-full md:max-w-full aspect-[1/1.4]
          ${isSelected ? 'ring-2 ring-primary' : ''}
          hover:shadow-card-hover focus-within:shadow-card-hover
          animate-fade-in
        `}
        onClick={() => setIsSelected(!isSelected)}
        onMouseEnter={() => setIsSelected(true)}
        onMouseLeave={() => setIsSelected(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Product: ${product.name}, Price: ₱${product.price.toFixed(2)}`}
      >
        {/* Product Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-white"> 
          {product.image_url ? (
            <Image 
              src={product.image_url} 
              alt={`${product.name} product image`}
              width={300}
              height={300}
              style={{ objectFit: 'contain' }}
              className="w-full h-full p-2 transition-transform duration-300 hover:scale-105 active:scale-105"
              priority={true}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className='text-sm text-gray-500' aria-hidden="true">No Image</span>
              <span className="sr-only">No product image available for {product.name}</span>
            </div>
          )}
          
          {/* Quick add button */}
          {isSelected && (
            <div className="absolute bottom-2 right-2 flex gap-2 animate-slide-up">
              <button 
                className="
                  bg-primary text-white p-2 rounded-full 
                  shadow-md hover:bg-primary-dark focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  transition-all duration-300 hover:scale-110 active:scale-110
                "
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(1);
                }}
                onKeyDown={handleQuickAddKeyDown}
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus className="icon-sm" />
                <span className="sr-only">Add to cart</span>
              </button>
              <button 
                className="
                  bg-secondary text-primary p-2 rounded-full 
                  shadow-md hover:bg-secondary-variant focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  transition-all duration-300 hover:scale-110 active:scale-110
                "
                onClick={(e) => {
                  e.stopPropagation();
                  // Product details functionality would go here
                }}
                aria-label={`View ${product.name} details`}
              >
                <Info className="icon-sm" />
                <span className="sr-only">View details</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col p-3 flex-grow">
          <h3 className="font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]" title={product.name}>
            {product.name}
          </h3>
          
          <div className="mt-1 flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                <span aria-label={`Price: ${product.price.toFixed(2)} Philippine pesos`}>
                  ₱{product.price.toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-gray-500">{formatUnit(product.unit)}</p>
              {product.stock_quantity && product.stock_quantity < 10 && (
                <p className="text-xs text-error mt-1" aria-live="polite">
                  Only {product.stock_quantity} left
                </p>
              )}
            </div>
            
            {isSelected && (
              <button 
                className="text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(1);
                }}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="icon-md" />
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export { ProductCard };
