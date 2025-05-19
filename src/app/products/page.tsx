'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, Product } from '@/lib/products/products';
import { addToCart } from '@/lib/cart/cart';
import ProductCard from '@/components/products/ProductCard';
import { useAuth } from '@/hooks/useAuth';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(product => product.category)));
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/products');
      return;
    }

    try {
      await addToCart(productId, quantity);
      // Could add a toast notification here
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Could add error toast notification here
    }
  };

  const filteredProducts = products.filter(product => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-groceryease-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-groceryease-text font-heading mb-8">Products</h1>
        
        {/* Search and Filter */}
        <div className="bg-groceryease-card rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-groceryease-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-groceryease-accent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groceryease-accent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-groceryease-card rounded-xl shadow-md p-8 text-center">
            <p className="text-groceryease-text text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
