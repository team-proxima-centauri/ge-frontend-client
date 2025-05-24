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
import { LoginModal } from '@/components/LoginModal';
import { ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import { Toast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

// Product Categories data
const productCategories = [
  { id: 'all', name: 'All Categories' },
  { id: 'biscuits_cookies', name: 'Biscuits & Cookies' },
  { id: 'chips_crisps', name: 'Chips & Crisps' },
  { id: 'chocolate_candy', name: 'Chocolate & Candy' },
  { id: 'condiments_spreads', name: 'Condiments & Spreads' },
  { id: 'instant_noodles', name: 'Instant Noodles' },
  { id: 'kids_drinks', name: 'Kids Drinks' },
  { id: 'milk_dairy_alternatives', name: 'Milk & Dairy Alternatives' },
  { id: 'rtd_coffee', name: 'Ready-to-Drink Coffee' },
  { id: 'soda_sparkling', name: 'Soda & Sparkling Drinks' },
  { id: 'specialty_snacks', name: 'Specialty Snacks' },
];

// Sort options data
const sortOptions = [
  { id: 'name_asc', name: 'Name: A to Z' },
  { id: 'name_desc', name: 'Name: Z to A' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
  { id: 'newest', name: 'Newest First' },
];

export default function ProductsPage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name_asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // Add back for Header component
  const [showLoginModal, setShowLoginModal] = useState(false); // For login modal
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

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
    setShowLoginModal(true);
  };
  
  const handleLoginSuccess = (loggedInUser: User) => {
    setCurrentUser(loggedInUser);
    setShowLoginModal(false);
    fetchUserCart(); // Fetch the user's cart after login
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

        // Show success toast
        setToastMessage(`Added ${product.name} to cart`);
        setShowToast(true);
      } else {
        setError('Failed to add item to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('An error occurred while adding the item to your cart.');

      setToastMessage(`Failed to add ${product.name} to cart`);
      setShowToast(true);
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      // Handle unauthenticated checkout
    } else {
      console.log('Proceeding to checkout with user:', currentUser);
      router.push('/checkout');

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
      <div className="min-h-screen bg-groceryease-bg flex items-center justify-center">
        <div className="text-xl text-primary">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-groceryease-bg flex items-center justify-center">
        <div className="text-xl text-status-error">{error}</div>
      </div>
    );
  }

  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string) => {
    const category = productCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };
  
  // Filter products based on selected category
  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-groceryease-bg">
      <Header 
        currentUser={currentUser}
        cartItems={cartItems}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
        onCheckout={handleCheckout}
        onUpdateQuantity={updateQuantity}
        onApplyFilters={() => {
          // Apply all filters
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
      
      {/* Desktop layout with sidebar and content */}
      <div className="desktop:flex pt-4">
        {/* Desktop Sidebar - Only visible on desktop */}
        <aside className={`hidden ${sidebarVisible ? 'desktop:block' : ''} sticky w-1/4 wide:w-[20%] p-4 bg-white shadow-xl border border-choco-primary/10  rounded-xl mx-4 top-24 h-[79vh] overflow-y-auto`}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary">Categories</h2>
              <div className="space-y-2">
                {productCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center w-full px-3 py-2 rounded-md text-left transition-colors
                      ${selectedCategory === category.id 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-accent-ivory hover:text-primary'}
                    `}
                  >

                    <span>{category.name}</span>
                    {selectedCategory === category.id && (
                      <ChevronRight className="ml-auto w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary">Sort By</h2>
              <select
                className="w-full p-2 border border-groceryease-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary">Price Range</h2>
              <div className="px-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={priceRange.max} 
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-sm text-groceryease-textSecondary">
                  <span>${priceRange.min}</span>
                  <span>Up to ${priceRange.max}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Collapsible sidebar toggle for desktop */}
        <button 
          className="hidden desktop:block fixed left-4 bottom-4 p-3 rounded-full bg-primary border border-white text-white shadow-lg z-20 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarVisible ? <ArrowLeft className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        </button>
        
        {/* Main Content */}
        <main className={`flex-1 p-4 ${sidebarVisible ? 'desktop:w-3/4' : 'desktop:w-full'}`}>
          {/* Mobile compact header - Only visible on mobile */}
          <div className="desktop:hidden mb-4">
            {/* Page title and product count */}
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl font-bold text-primary">Products</h1>
              <p className="text-sm text-groceryease-textSecondary">
                {sortedProducts.length} products
              </p>
            </div>
            
            {/* Simple sort dropdown */}
            <div className="flex justify-end">
              <select
                className="text-xs py-1 px-2 border border-groceryease-border rounded-md bg-white"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Desktop Page heading & product count - Only visible on desktop */}
          <div className="hidden desktop:block mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Products</h1>
            <p className="text-groceryease-textSecondary">
              {sortedProducts.length} products in {selectedCategory === 'all' ? 'all categories' : getCategoryName(selectedCategory)}
            </p>
          </div>
          
          {/* We've removed the duplicate mobile filter panel since we're using the header's filter functionality */}
          
          {/* Product Grid - Responsive and compact for mobile */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 desktop:grid-cols-3 desktop:gap-6 wide:grid-cols-4">
              {sortedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={quantity => handleAddToCart(product, quantity)}
                />
              ))}
            </div>
          ) : (
            /* Empty state when no products match filters */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-accent-ivory flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-primary">No products found</h2>
              <p className="text-groceryease-textSecondary mt-2 max-w-md">
                We couldn&apos;t find any products matching your criteria. Try adjusting your filters or categories.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSort('name_asc');
                  setPriceRange({ min: 0, max: 100 });
                }}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
      
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
