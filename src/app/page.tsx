"use client";

import { useState, useEffect, useCallback } from "react";
import { RecommendationCard } from "@/components/reco";
import { DisplayCard } from "@/components/DisplayCard";
import { LoginModal } from '@/components/LoginModal';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import {
  getProducts,
  getMyCart,
  addItemToCart,
  Product, 
  User, 
  CartItem as ApiCartItem,
  getCurrentUser, 
  isAuthenticated, 
  logout as apiLogout 
} from '@/services/api';
import useEmblaCarousel from 'embla-carousel-react';

// We'll use the API CartItem type directly and extend it with our local properties
interface LocalCartItem extends ApiCartItem {
  isSelected: boolean;
  productDetails?: Product;
}

interface Category {
  id: string;
  name: string;
}

const productCategories: Category[] = [
  { id: 'all', name: 'All Categories' },
  { id: 'fruits', name: 'Fruits & Vegetables' },
  { id: 'meat', name: 'Meat & Seafood' },
  { id: 'dairy', name: 'Dairy & Eggs' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'pantry', name: 'Pantry Staples' },
  { id: 'frozen', name: 'Frozen Foods' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks & Sweets' },
  { id: 'household', name: 'Household' },
];

export default function Home() {
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const router = useRouter();
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name_asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState('');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    }
  });

  const [productsEmblaRef, productsEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    }
  });

  const [recentlyPurchasedEmblaRef, recentlyPurchasedEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    }
  });


  // carousel
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  
  const scrollProductsPrev = useCallback(() => productsEmblaApi?.scrollPrev(), [productsEmblaApi]);
  const scrollProductsNext = useCallback(() => productsEmblaApi?.scrollNext(), [productsEmblaApi]);

  const scrollRecentlyPurchasedPrev = useCallback(() => recentlyPurchasedEmblaApi?.scrollPrev(), [recentlyPurchasedEmblaApi]);
  const scrollRecentlyPurchasedNext = useCallback(() => recentlyPurchasedEmblaApi?.scrollNext(), [recentlyPurchasedEmblaApi]);

  // Function to fetch cart data from API
  const fetchCartData = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const cart = await getMyCart();
        if (cart && cart.items) {
          // Convert API cart items to local CartItem format
          const cartItemsFromApi = cart.items.map(item => ({
            ...item, // Spread all API CartItem properties
            isSelected: false,
            productDetails: {
              id: item.product_id,
              name: item.name,
              price: item.price,
              image_url: item.image_url,
              unit: item.unit
            } as Product
          }));
          setCartItems(cartItemsFromApi);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setErrorProducts('');
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        if (err instanceof Error) {
          setErrorProducts(err.message || 'Failed to connect to the server.');
        } else {
          setErrorProducts('An unknown error occurred while fetching products.');
        }
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
    // Also fetch cart data
    fetchCartData();
  }, [fetchCartData]);

  useEffect(() => {
    setIsAuthLoading(true);
    if (isAuthenticated()) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }
    setIsAuthLoading(false);
  }, []);
  
  // Re-fetch cart data when authentication state changes
  useEffect(() => {
    if (currentUser) {
      fetchCartData();
    }
  }, [currentUser, fetchCartData]);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogoutClick = () => {
    apiLogout();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setCurrentUser(loggedInUser);
    setShowLoginModal(false);
  };

  // This function is not currently used by the Header component, but kept for future functionality
  // It's intentionally not removed to maintain code consistency with other components

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      // Update local state immediately for better UX
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // After updating the quantity on the backend, refresh cart data
      // This ensures our local state is in sync with the backend
      await fetchCartData();
    }
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
    try {
      // Use the product and quantity parameters to add the item to the cart using the API
      await addItemToCart(product.id, quantity);
      
      // After adding to the cart, refresh cart data from the API
      // This ensures our local state is in sync with the backend
      await fetchCartData();
      
      console.log(`Added product ${product.name} (${quantity} units) to cart`);
    } catch (error) {
      console.error(`Error adding ${product.name} to cart:`, error);
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      console.log('Proceeding to checkout with user:', currentUser);
      alert('Proceeding to checkout!');
    }
  };

  if (isAuthLoading) { 
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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

      {/* MAIN CONTENT */}
      <main className="transition-all duration-300 flex-1 w-full">
        {/* Main Content Container with proper background */}
        <div className="bg-choco-bg min-h-screen pb-10">
          {/* Seasonal Specials Section */}
          {products.length > 0 && (
            <div className="flex px-6 pt-4">
              <div className="m-auto bg-gradient-to-r from-choco-card to-choco-brown/30 w-auto max-w-full rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Seasonal Specials</h2>
                <p className="text-gray-600 mb-6">Discover our limited-time offers on seasonal products</p>
                
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                  {products.slice(0, 2).map((product) => (
                    <RecommendationCard 
                      key={`special-${product.id}`} 
                      product={product}
                      onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                      isRecentlyPurchased={product.id === products[0]?.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recently Purchased Section */}
          <div className="p-6 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recently Purchased</h2>
              <div className="flex gap-2">
                <button
                  onClick={scrollRecentlyPurchasedPrev}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous items"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollRecentlyPurchasedNext}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next items"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm h-64 animate-pulse">
                    <div className="bg-gray-200 h-40 w-full"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : errorProducts ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>Error: {errorProducts}</span>
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-lg text-center">
                <p>No products found. Check back later for new arrivals!</p>
              </div>
            ) : (
              <div className="overflow-hidden" ref={recentlyPurchasedEmblaRef}>
                <div className="flex gap-4 py-1">
                  {products.slice(0, 5).map((product) => (
                    <div 
                      key={product.id}
                      className="pl-2 flex-[0_0_calc(100%-1rem)] sm:flex-[0_0_calc(50%-0.75rem)] md:flex-[0_0_calc(33.333%-1rem)] lg:flex-[0_0_calc(25%-0.75rem)]"
                    >
                      <DisplayCard 
                        product={product} 
                        onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popular Categories Section */}
          {products.length > 0 && (
            <div className="px-6 pt-4 pb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Popular Categories</h2>
                <div className="flex gap-2">
                  <button
                    onClick={scrollPrev}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Previous categories"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Next categories"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                  {productCategories.slice(1, productCategories.length).map((category) => ( 
                    <div 
                      key={category.id}
                      className="flex-[0_0_calc(50%-0.5rem)] sm:flex-[0_0_calc(33.333%-0.75rem)] md:flex-[0_0_calc(25%-0.75rem)] lg:flex-[0_0_calc(16.666%-0.75rem)] px-2 mx-auto"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-full">
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center bg-choco-greenbtn/10 group-hover:bg-choco-greenbtn/20 transition-colors">
                            <span className="text-choco-greenbtn font-medium text-lg">{category.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <h3 className="font-medium text-gray-800">{category.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>  
            </div>
          )}

          {/* Products Section */}
          <div className="px-6 pt-4 flex flex-col pb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Products</h2>
              <div className="flex gap-2">
                <button
                  onClick={scrollProductsPrev}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous products"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollProductsNext}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next products"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden py-1" ref={productsEmblaRef}>
              <div className="flex gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="pl-2 flex-[0_0_calc(100%-1rem)] sm:flex-[0_0_calc(50%-0.75rem)] md:flex-[0_0_calc(33.333%-1rem)] lg:flex-[0_0_calc(25%-0.75rem)]"
                  >
                    <DisplayCard 
                      product={product} 
                      onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center items-center py-4">
                <button onClick={() => router.push('/products')} className="bg-choco-greenbtn text-white px-4 py-1 rounded-md">
                    See More
                </button>
            </div>
          </div>
        </div>
      </main>

      {showLoginModal && (
        <LoginModal 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  );
}
