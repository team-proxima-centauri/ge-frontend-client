import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    image_url: string;
    stock_quantity: number;
  };
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    
    try {
      setLoading(true);
      await onAddToCart(product.id, 1);
      setLoading(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-groceryease-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-40 bg-white cursor-pointer">
          <Image
            src={product.image_url || '/images/product-placeholder.svg'}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            className="p-2"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-groceryease-text hover:text-groceryease-accent transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-groceryease-textLight mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className="font-bold text-groceryease-text">₱{parseFloat(product.price.toString()).toFixed(2)}</span>
            <span className="text-xs text-groceryease-textLight ml-1">/ {product.unit}</span>
          </div>
          <button 
            className={`bg-groceryease-button text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-90 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <p className="text-xs text-amber-600 mt-1">Only {product.stock_quantity} left</p>
        )}
        {product.stock_quantity === 0 && (
          <p className="text-xs text-red-600 mt-1">Out of stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
