'use client';

import { Product } from '@/services/api';
import { ShoppingCart, Plus } from 'lucide-react';
import Image from 'next/image';

interface RecommendationCardProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
  isRecentlyPurchased?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  product, 
  onAddToCart,
  isRecentlyPurchased = false
}) => {
  const handleSimpleAddToCart = () => {
    onAddToCart(1);
  };

  // Format unit display
  const formatUnit = (unit: string) => {
    if (!unit) return '';
    return `per ${unit}`;
  };

  return (
      <div className="group m-auto flex flex-col bg-groceryease-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full md:w-[48vw] max-w-[250px] aspect-[1/1.5]">
        {/* Product Image */}
        <div className="relative w-full aspect-square overflow-hidden"> 
          {product.image_url ? (
            <Image 
              src={product.image_url} 
              alt={product.name} 
              width={300}
              height={300}
              style={{ objectFit: 'contain' }}
              className="w-full h-full p-2 transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className='text-sm text-gray-500'>No Image</span>
            </div>
          )}
          
          {/* Quick add button (visible on hover) */}
          <button 
            className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 duration-300 shadow-md hover:bg-primary-dark"
            onClick={handleSimpleAddToCart}
            aria-label="Quick add to cart"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          {/* Recently purchased badge */}
          {isRecentlyPurchased && (
            <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-md">
              Recently Purchased
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
              <p className="text-lg font-semibold text-gray-900">₱{product.price.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{formatUnit(product.unit)}</p>
            </div>
            
            <button 
              className="text-primary hover:text-primary-dark transition-colors"
              onClick={handleSimpleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
  );
};

export { RecommendationCard };
