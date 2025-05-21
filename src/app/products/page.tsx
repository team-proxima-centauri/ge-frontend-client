'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { 
  getProducts, 
  Product, 
  User, 
  getCurrentUser, 
  isAuthenticated, 
  logout as apiLogout,
  CartItem, 
  addItemToCart, 
  getMyCart 
} from '@/services/api';
import { Header } from '@/components/Header';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
        // Keep loading true until cart is also fetched if user is logged in
        // setLoading(false); 
      }
    };

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 600px)').matches);
    };

    checkMobile();

    fetchProducts();
  }, []);

  const fetchUserCart = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const cart = await getMyCart();
        if (cart && cart.items) {
          setCartItems(cart.items);
        }
      } catch (cartError) {
        console.error('Error fetching user cart:', cartError);
        // setError('Failed to load your cart.'); // Optionally set an error for cart fetching
      }
    }
  }, []);

  useEffect(() => {
    const initUserAndCart = async () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        setCurrentUser(user);
        await fetchUserCart();
      }
      setLoading(false); // Set loading to false after user and cart are checked/fetched
    };
    initUserAndCart();
  }, [fetchUserCart]);

  const handleLoginClick = () => {
    // TODO: Implement login modal popup or navigation to login page
    console.log('Login clicked');
  };

  const handleLogoutClick = () => {
    apiLogout();
    setCurrentUser(null);
    setCartItems([]); // Clear cart items on logout
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!currentUser) {
      // TODO: Prompt user to login or handle adding to a temporary local cart
      setError('Please log in to add items to your cart.');
      return;
    }
    try {
      const addedItem = await addItemToCart(product.id, quantity);
      if (addedItem) {
        await fetchUserCart(); // Refresh cart from backend
      } else {
        setError('Failed to add item to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('An error occurred while adding the item to your cart.');
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      // Handle unauthenticated checkout
    } else {
      console.log('Proceeding to checkout with user:', currentUser);
    }
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
        onCheckout={handleCheckout}
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
