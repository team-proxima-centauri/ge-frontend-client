'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/services/api';
import { usePathname } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const pathname = usePathname();
  const [isSelected, setIsSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 600px)').matches);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div 
        className={`
          my-auto flex flex-col bg-white rounded-xl overflow-hidden shadow-sm 
          transition-all duration-300 
          ${isMobile ? 'h-[15rem] w-[45vw]' : 'w-[18vw] aspect-[1/1.5]'}
          ${isSelected ? 'ring-2 ring-choco-greenbtn' : ''}
          ${isMobile ? 'active:shadow-md' : 'hover:shadow-xl'}
        `}
        onClick={() => setIsSelected(!isSelected)}
        onMouseEnter={() => setIsSelected(true)}
        onMouseLeave={() => setIsSelected(false)}
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
              className={`
                w-full h-full transition-transform duration-300
                ${isMobile ? 'active:scale-105' : 'group-hover:scale-105'}
              `}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className='text-sm text-gray-500'>No Image</span>
            </div>
          )}
          
          {/* Quick add button */}
          {isSelected && (
            <button 
              className={`
                absolute bottom-2 right-2 bg-choco-greenbtn text-white p-2 rounded-full 
                shadow-md hover:bg-green-700 transition-all duration-300
                opacity-100
                ${isMobile ? 'active:scale-110' : ''}
              `}
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
            
            {isSelected && (
              <button 
                className="text-choco-greenbtn hover:text-green-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelected(!isSelected);
                }}
                aria-label="Show options"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export { ProductCard };
