'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts, Product, User, getCurrentUser, isAuthenticated, logout as apiLogout } from '@/services/api';
import { Header } from '@/components/Header';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name_asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 600px)').matches);
    };

    checkMobile();

    fetchProducts();
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }
  }, []);

  const handleLoginClick = () => {
    // Implement login logic
  };

  const handleLogoutClick = () => {
    apiLogout();
    setCurrentUser(null);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          isSelected: false,
          productDetails: product
        }];
      }
    });
  };

  const handleCheckout = () => {
    if (!currentUser) {
      // Handle unauthenticated checkout
    } else {
      console.log('Proceeding to checkout with user:', currentUser);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-choco-bg flex items-center justify-center">
        <div className="text-xl text-choco-primary">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-choco-bg flex items-center justify-center">
        <div className="text-xl text-choco-redbtn">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-choco-bg">
      <Header 
        currentUser={currentUser}
        cartItems={cartItems}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
        onToggleItemSelection={toggleItemSelection}
        onUpdateQuantity={updateQuantity}
        onApplyFilters={() => {
          // Apply filters logic here
        }}
        onResetFilters={() => {
          setSelectedCategory('all');
          setSelectedSort('name_asc');
          setPriceRange({ min: 0, max: 100 });
        }}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        priceRange={priceRange}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSelectedSort}
        onPriceRangeChange={setPriceRange}
      />
      <div className={`flex flex-wrap w-full py-8  justify-between gap-1 gap-y-4
      ${isMobile ? 'px-4' : 'px-8'}`}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
          />
        ))}
      </div>
    </div>
  );
}
